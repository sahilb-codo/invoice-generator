// Editor + live preview checks (Phase 02). Usage: npm run build && npm start, then
//   node scripts/e2e/editor.e2e.mjs        (BASE=http://localhost:3000 by default; OUT=dir for screenshots)
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { launch, makeChecker } from "./cdp.mjs";

// Fixtures: a 1×1 PNG and a 300 KB file to exercise the logo size limit.
const fixtures = mkdtempSync(join(tmpdir(), "invoice-e2e-"));
const smallLogo = join(fixtures, "logo.png");
const bigLogo = join(fixtures, "big.png");
writeFileSync(
  smallLogo,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  ),
);
const big = Buffer.alloc(300 * 1024);
Buffer.from("89504e470d0a1a0a", "hex").copy(big);
writeFileSync(bigLogo, big);

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT;
const page = await launch();
const { check, summary } = makeChecker();
const preview = `document.querySelector('[aria-label="Invoice preview"] article')`;
const previewText = () => page.eval(`${preview}?.innerText ?? ''`);

await page.viewport(1440, 1000);

// The default page is a blank invoice for the user to fill in.
await page.goto(BASE);
await page.waitFor(`!!${preview}`);
const blank = await page.eval(`(() => {
  const value = (id) => document.getElementById(id)?.value;
  const fields = ["business-name", "business-email", "business-address", "customer-name", "customer-email", "customer-address", "paymentInstructions", "notes"];
  return {
    filled: fields.filter((id) => value(id) !== ""),
    number: value("invoiceNumber"),
    issue: value("issueDate"),
    due: value("dueDate"),
    rows: document.querySelectorAll('[aria-label="Invoice editor"] ol > li').length,
    description: document.querySelector('[aria-label="Invoice editor"] ol > li input')?.value,
    customFields: document.querySelectorAll('[id^="cf-"][id$="-label"]').length,
  };
})()`);
check(
  "default page: business, customer and notes are empty",
  blank.filled.length === 0,
  blank.filled.join(", "),
);
check(
  "default page: invoice number generated",
  /^INV-\d{8}-[A-Z2-9]{4}$/.test(blank.number),
  blank.number,
);
check(
  "default page: issue date today, due date set",
  /^\d{4}-\d{2}-\d{2}$/.test(blank.issue) && blank.due > blank.issue,
  `${blank.issue} → ${blank.due}`,
);
check(
  "default page: one empty line item, no custom fields",
  blank.rows === 1 && blank.description === "" && blank.customFields === 0,
);
check("default page: no sample data in preview", !(await previewText()).includes("Northwind"));

await page.goto(`${BASE}/?demo`);
await page.waitFor(`!!${preview}`);
check("workspace renders with demo invoice", (await previewText()).includes("Northwind Studio"));
const duplicateIds = await page.eval(
  `(() => { const seen = new Set(), dup = []; for (const el of document.querySelectorAll('[id]')) { if (seen.has(el.id)) dup.push(el.id); seen.add(el.id); } return dup; })()`,
);
check("no duplicate element ids", duplicateIds.length === 0, duplicateIds.join(", "));
const sections = await page.eval(
  `[...document.querySelectorAll('nav[aria-label="Invoice sections"] a')].map(a => !!document.querySelector(a.getAttribute('href')))`,
);
check("section nav links all resolve", sections.length === 6 && sections.every(Boolean));

// Jumping from the first to the last section highlights only the target, not every section
// passed during the smooth scroll.
const highlighted = await page.eval(`new Promise((resolve) => {
  const seen = new Set();
  const current = () => document.querySelector('nav[aria-label="Invoice sections"] a[aria-current]')?.textContent;
  document.querySelector('nav[aria-label="Invoice sections"] a[href="#section-notes"]').click();
  const timer = setInterval(() => seen.add(current()), 16);
  setTimeout(() => { clearInterval(timer); seen.add(current()); resolve([...seen]); }, 1600);
})`);
check(
  "section jump highlights only the target",
  highlighted.length === 1 && highlighted[0] === "6Notes",
  highlighted.join(" | "),
);
// Notes is the last section, so the page may hit the bottom before its top reaches the header.
const jump = await page.eval(`({
  top: document.getElementById('section-notes').getBoundingClientRect().top,
  atBottom: innerHeight + scrollY >= document.documentElement.scrollHeight - 4,
})`);
check(
  "section jump scrolls to the section",
  jump.top < 400 || (jump.atBottom && jump.top < 1000), // 1000 = viewport height
  `top=${Math.round(jump.top)} atBottom=${jump.atBottom}`,
);
await page.eval(`window.scrollTo({ top: 0 }); true`);
await page.sleep(300);

await page.fill("#business-name", "Acme Consulting LLC");
check("business name updates preview", (await previewText()).includes("Acme Consulting LLC"));
await page.fill("#business-taxId", "");
check("clearing optional tax id hides it in preview", !(await previewText()).includes("Tax ID"));
await page.fill("#customer-name", "Jordan Lee");
await page.fill("#customer-company", "Lee & Partners");
await page.fill("#customer-email", "jordan@lee.example");
await page.fill("#customer-address", "1 Main St\nAustin, TX 78701");
let t = await previewText();
check(
  "customer details update preview",
  ["Jordan Lee", "Lee & Partners", "jordan@lee.example", "Austin, TX 78701"].every((s) =>
    t.includes(s),
  ),
);

await page.fill("#issueDate", "2026-12-01");
await page.fill("#dueDate", "2026-12-31");
await page.fill("#paymentTerms", "Net 15");
t = await previewText();
check(
  "dates and terms update preview",
  t.includes("Dec 1, 2026") && t.includes("Dec 31, 2026") && t.includes("Net 15"),
);

await page.fill("#invoiceNumber", "ACME-001");
check(
  "manual invoice number edit",
  (await previewText()).includes("ACME-001") &&
    (await page.eval(`document.querySelector('header').innerText.includes('ACME-001')`)),
);
await page.click('button[aria-label="Generate a new invoice number"]');
const num = await page.eval(`document.querySelector('#invoiceNumber').value`);
check(
  "regenerate invoice number",
  /^INV-\d{8}-[A-Z2-9]{4}$/.test(num) && (await previewText()).includes(num),
  num,
);

// Line items
const rows = () =>
  page.eval(`document.querySelectorAll('[aria-label="Invoice editor"] ol > li').length`);
const qtyIds = () =>
  page.eval(
    `[...document.querySelectorAll('[aria-label="Invoice editor"] ol > li input[type=number][id$="-qty"]')].map(e => e.id)`,
  );
check("3 demo line items", (await rows()) === 3);
let ids = await qtyIds();
await page.fill("#" + ids[0], "2");
await page.fill("#" + ids[0].replace("-qty", "-price"), "50");
const amount0 = await page.eval(
  `document.querySelector('[aria-label="Line 1 amount"]').textContent`,
);
check("line amount = qty × price (2 × $50 = $100.00)", amount0 === "$100.00", amount0);
check("preview row shows $100.00", (await previewText()).includes("$100.00"));

await page.clickText("button", "Add item");
check("add item appends a row", (await rows()) === 4);
const focused = await page.eval(`document.activeElement?.id ?? ''`);
check("new row description is focused", focused.endsWith("-desc"), focused);
ids = await qtyIds();
await page.fill("#" + ids[3].replace("-qty", "-desc"), "Hosting (annual)");
await page.fill("#" + ids[3], "3");
await page.fill("#" + ids[3].replace("-qty", "-price"), "10.5");
t = await previewText();
check(
  "new item appears in preview with $31.50",
  t.includes("Hosting (annual)") && t.includes("$31.50"),
);

await page.click('button[aria-label="Remove line 2"]');
t = await previewText();
check(
  "remove item deletes row and preview line",
  (await rows()) === 3 && !t.includes("High-fidelity UI design"),
);

// Subtotal: 100 + 3087.50 + 31.50 = 3219.00 ; discount 250 ; taxable 2969.00 ; tax 8.5% = 252.365 → 252.37 ; total 3221.37
check(
  "preview totals follow edits (subtotal $3,219.00, total $3,221.37)",
  t.includes("$3,219.00") && t.includes("$3,221.37"),
);

ids = await qtyIds();
await page.fill("#" + ids[0], "");
t = await previewText();
check("empty quantity shows — and no NaN", !t.includes("NaN") && t.includes("—"));
await page.fill("#" + ids[0], "2");

await page.fill("#notes", "Paid within 15 days please.");
await page.fill("#paymentInstructions", "IBAN DE00 1234");
t = await previewText();
check(
  "notes and payment instructions update preview",
  t.includes("Paid within 15 days please.") && t.includes("IBAN DE00 1234"),
);

// Logo upload
await page.setFiles("input[type=file]", [bigLogo]);
check(
  "oversized logo rejected with message",
  await page.eval(`document.body.innerText.includes('Logo must be 256 KB or smaller.')`),
);
await page.setFiles("input[type=file]", [smallLogo]);
check(
  "logo upload shows in preview",
  await page.eval(`!!${preview}.querySelector('img[src^="data:image/png"]')`),
);
await page.clickText("button", "Remove");
check("logo remove clears preview", await page.eval(`!${preview}.querySelector('img')`));

// Remove all items → empty state
for (let i = await rows(); i > 0; i--) await page.click('button[aria-label="Remove line 1"]');
t = await previewText();
check(
  "empty state when no items",
  (await page.eval(
    `document.body.innerText.includes('No line items yet. Add the first product or service.')`,
  )) && t.includes("No line items yet."),
);
await page.clickText("button", "Add item");

if (OUT) {
  await page.goto(`${BASE}/?demo`);
  await page.waitFor(`!!${preview}`);
  await page.screenshot(OUT + "/p02-desktop.png");
}

// Mobile
await page.viewport(390, 844, true);
await page.goto(`${BASE}/?demo`);
await page.waitFor(`!!${preview}`);
const sw = await page.eval(`document.documentElement.scrollWidth`);
check("mobile: no horizontal overflow", sw <= 390, `scrollWidth=${sw}`);
if (OUT) await page.screenshot(OUT + "/p02-mobile-editor.png", true);
await page.fill("#customer-name", "Mobile Tester");
await page.eval("window.scrollTo(0, 1500)");
await page.tap('[role="tab"]', "Preview");
const visible = await page.eval(
  `(() => { const r = ${preview}.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()`,
);
check(
  "mobile: Preview tab shows live edits",
  visible && (await previewText()).includes("Mobile Tester"),
);
const sw2 = await page.eval(`document.documentElement.scrollWidth`);
check("mobile preview: no horizontal overflow", sw2 <= 390, `scrollWidth=${sw2}`);
check(
  "mobile: switching tabs scrolls to top",
  (await page.eval("window.scrollY")) === 0,
  "scrollY=" + (await page.eval("window.scrollY")),
);
if (OUT) await page.screenshot(OUT + "/p02-mobile-preview.png", true);

check(
  "no console errors / exceptions",
  page.errors.length === 0,
  page.errors.slice(0, 3).join(" | "),
);
await page.close();
process.exit(summary() ? 1 : 0);
