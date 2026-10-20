// Print / Save as PDF checks (Phase 05). Usage: npm run build && npm start, then
//   node scripts/e2e/print.e2e.mjs   (BASE=http://localhost:3000 by default; OUT=dir to keep the PDFs)
import { writeFileSync } from "node:fs";

import { launch, makeChecker } from "./cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT;
const page = await launch();
const { check, summary } = makeChecker();
const preview = `document.querySelector('[aria-label="Invoice preview"] article')`;
const visibleText = () => page.eval(`document.body.innerText`);
const displayOf = (selector) =>
  page.eval(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? getComputedStyle(el).display : 'missing'; })()`,
  );
const setMedia = (media) => page.send("Emulation.setEmulatedMedia", { media });

async function printPdf(name) {
  const { data } = await page.send("Page.printToPDF", {
    preferCSSPageSize: true,
    printBackground: false,
  });
  const pdf = Buffer.from(data, "base64");
  if (OUT) writeFileSync(`${OUT}/${name}.pdf`, pdf);
  const text = pdf.toString("latin1");
  const pages = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const box = text.match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/);
  return { pages, width: box && Number(box[1]), height: box && Number(box[2]) };
}

await page.viewport(1440, 1000);
await page.goto(BASE);
await page.waitFor(`!!${preview}`);

// 1. The button triggers window.print() (stubbed — headless Chrome has no print dialog).
await page.eval(
  `window.__prints = []; window.print = () => window.__prints.push(document.title); true`,
);
const titleBefore = await page.eval(`document.title`);
await page.click('button[aria-label="Print or save as PDF"]');
const prints = await page.eval(`window.__prints`);
check("Print button calls window.print() once", prints.length === 1);
check(
  "PDF file name comes from invoice number and customer",
  prints[0] === "Invoice INV-2026-0042 — Ava Thompson",
  prints[0],
);
await page.eval(`window.dispatchEvent(new Event('afterprint')); true`);
check("title restored after printing", (await page.eval(`document.title`)) === titleBefore);

// 2. Print media: only the invoice is visible.
await setMedia("print");
check("header hidden in print", (await displayOf("header[data-print]")) === "none");
check("editor hidden in print", (await displayOf('[aria-label="Invoice editor"]')) === "none");
check("invoice visible in print", (await displayOf('[aria-label="Invoice preview"]')) === "block");
let text = await visibleText();
check(
  "no editor controls in printed text",
  [
    "Add item",
    "Custom fields",
    "Send invoice",
    "Print / PDF",
    "Discount & tax",
    "Upload logo",
  ].every((s) => !text.includes(s)),
);
check(
  "hidden custom field not printed",
  !text.includes("Internal cost center") && !text.includes("CC-4410"),
);
check(
  "visible custom fields printed",
  text.includes("PO-77821") && text.includes("Analytics Dashboard Redesign"),
);
check("totals printed", text.includes("$8,091.39") && text.includes("$633.89"));
check(
  "document has no shadow or rounded corners in print",
  await page.eval(
    `(() => { const s = getComputedStyle(${preview}); return s.boxShadow === 'none' && s.borderRadius === '0px'; })()`,
  ),
);
check(
  "unit price column printed even at narrow page width",
  (await page.eval(
    `getComputedStyle(${preview}.querySelector('thead th:nth-child(3)')).display`,
  )) === "table-cell",
);

const single = await printPdf("invoice-1-page");
check(
  "PDF is A4 (595 × 842 pt)",
  Math.round(single.width) === 595 && Math.round(single.height) === 842,
  `${single.width} × ${single.height}`,
);
check("demo invoice fits on one page", single.pages === 1, `pages=${single.pages}`);
await setMedia("");

// 3. Mobile with the Editor tab active still prints the invoice.
await page.viewport(390, 844, true);
await page.goto(BASE);
await page.waitFor(`!!${preview}`);
check(
  "mobile screen: preview hidden behind Editor tab",
  (await displayOf('[aria-label="Invoice preview"]')) === "none",
);
await setMedia("print");
check(
  "mobile print: invoice shown, tabs hidden",
  (await displayOf('[aria-label="Invoice preview"]')) === "block" &&
    !(await visibleText()).includes("Editor"),
);
await setMedia("");

// 4. Long invoice spans multiple pages.
await page.viewport(1440, 1000);
await page.goto(BASE);
await page.waitFor(`!!${preview}`);
for (let i = 0; i < 36; i++) await page.clickText("button", "Add item");
const descIds = await page.eval(
  `[...document.querySelectorAll('input[id$="-desc"]')].map(e => '#' + e.id)`,
);
for (const [i, id] of descIds.slice(3).entries())
  await page.fill(id, `Consulting session ${i + 1} — architecture review and follow-up notes`);
await setMedia("print");
const multi = await printPdf("invoice-multi-page");
check("40-line invoice spans multiple pages", multi.pages >= 2, `pages=${multi.pages}`);
check(
  "rows and totals are protected from page breaks",
  await page.eval(
    `(() => { const tr = getComputedStyle(${preview}.querySelector('tbody tr')).breakInside; const t = getComputedStyle(${preview}.querySelector('.invoice-totals > dl')).breakInside; const tb = getComputedStyle(${preview}.querySelector('.invoice-totals')).display; const th = getComputedStyle(${preview}.querySelector('thead')).display; return tr === 'avoid' && t === 'avoid' && tb === 'block' && th === 'table-header-group'; })()`,
  ),
);
await setMedia("");

check(
  "no console errors / exceptions",
  page.errors.length === 0,
  page.errors.slice(0, 3).join(" | "),
);
await page.close();
process.exit(summary() ? 1 : 0);
