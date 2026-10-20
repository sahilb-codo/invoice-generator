// Custom field checks (Phase 04). Usage: npm run build && npm start, then
//   node scripts/e2e/custom-fields.e2e.mjs   (BASE=http://localhost:3000 by default; OUT=dir for screenshots)
import { launch, makeChecker } from "./cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT;
const page = await launch();
const { check, summary } = makeChecker();
const preview = `document.querySelector('[aria-label="Invoice preview"] article')`;
const previewText = () => page.eval(`${preview}?.innerText ?? ''`);
const bodyHas = (text) => page.eval(`document.body.innerText.includes(${JSON.stringify(text)})`);
const fieldIds = () =>
  page.eval(
    `[...document.querySelectorAll('input[id^="cf-"][id$="-label"]')].map(e => '#' + e.id)`,
  );
const toggle = (label) => page.click(`button[aria-label="Show ${label} on invoice"]`);
const TOTAL = "$8,091.39";

await page.viewport(1440, 1000);
await page.goto(BASE);
await page.waitFor(`!!${preview}`);

let t = await previewText();
check(
  "visible demo fields shown",
  t.includes("PO-77821") && t.includes("Analytics Dashboard Redesign"),
);
check("hidden demo field not shown", !t.includes("Internal cost center") && !t.includes("CC-4410"));
check("editor marks hidden field", await bodyHas("Hidden"));

await toggle("Internal cost center");
t = await previewText();
check(
  "show: hidden field appears in preview",
  t.includes("Internal cost center") && t.includes("CC-4410"),
);
await toggle("Internal cost center");
t = await previewText();
check("hide again: field removed from preview", !t.includes("CC-4410"));

await toggle("Purchase Order");
check("hide visible field removes it from preview", !(await previewText()).includes("PO-77821"));
await toggle("Purchase Order");
check("show it again", (await previewText()).includes("PO-77821"));

let ids = await fieldIds();
await page.fill(ids[1], "Project name");
await page.fill(ids[1].replace("-label", "-value"), "Brightline v2");
t = await previewText();
check(
  "edit label and value updates preview",
  t.includes("Project name") && t.includes("Brightline v2"),
);

await page.clickText("button", "Add field");
ids = await fieldIds();
const focused = await page.eval(`'#' + document.activeElement?.id`);
check(
  "Add field appends a row and focuses its label",
  ids.length === 4 && focused === ids[3],
  focused,
);
await page.fill(ids[3], "Department");
await page.fill(ids[3].replace("-label", "-value"), "Design");
t = await previewText();
check("new field appears in preview", t.includes("Department") && t.includes("Design"));
check(
  "suggestion for a used label is hidden",
  !(await page.eval(
    `[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Department')`,
  )),
);

await page.clickText("button", "Reference");
ids = await fieldIds();
const focused2 = await page.eval(`'#' + document.activeElement?.id`);
check(
  "suggestion adds a labelled field and focuses its value",
  ids.length === 5 &&
    focused2 === ids[4].replace("-label", "-value") &&
    (await page.eval(`document.querySelector(${JSON.stringify(ids[4])}).value`)) === "Reference",
);
await page.fill(ids[4].replace("-label", "-value"), "REF-9");
check("suggested field appears in preview", (await previewText()).includes("REF-9"));

await page.fill(ids[3], "");
check("empty label shows a validation error", await bodyHas("Add a label"));
check("field without a label is not printed", !(await previewText()).includes("Design"));
await page.fill(ids[3], "Department");

await page.click('button[aria-label="Remove Department"]');
ids = await fieldIds();
t = await previewText();
check("remove deletes row and preview entry", ids.length === 4 && !t.includes("Design"));

check("totals unchanged by custom field edits", (await previewText()).includes(TOTAL));

if (OUT) {
  await page.eval(
    `[...document.querySelectorAll('h2')].find(h => h.textContent === 'Custom fields').scrollIntoView({ block: "start" }); window.scrollBy(0, -80)`,
  );
  await page.sleep(200);
  await page.screenshot(OUT + "/p04-custom-fields.png");
}

await page.viewport(390, 844, true);
await page.goto(BASE);
await page.waitFor(`!!${preview}`);
await page.clickText("button", "Add field");
const sw = await page.eval(`document.documentElement.scrollWidth`);
check("mobile: no horizontal overflow", sw <= 390, `scrollWidth=${sw}`);
if (OUT) {
  await page.eval(
    `[...document.querySelectorAll('h2')].find(h => h.textContent === 'Custom fields').scrollIntoView({ block: "start" }); window.scrollBy(0, -110)`,
  );
  await page.sleep(200);
  await page.screenshot(OUT + "/p04-custom-fields-mobile.png");
}

check(
  "no console errors / exceptions",
  page.errors.length === 0,
  page.errors.slice(0, 3).join(" | "),
);
await page.close();
process.exit(summary() ? 1 : 0);
