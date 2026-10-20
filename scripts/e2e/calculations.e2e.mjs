// Calculation + validation checks through the UI (Phase 03). Usage: npm run build && npm start, then
//   node scripts/e2e/calculations.e2e.mjs   (BASE=http://localhost:3000 by default; OUT=dir for a screenshot)
import { launch, makeChecker } from "./cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT;
const page = await launch();
const { check, summary } = makeChecker();
const preview = `document.querySelector('[aria-label="Invoice preview"] article')`;
const previewText = () => page.eval(`${preview}?.innerText ?? ''`);
const breakdown = () =>
  page.eval(`document.querySelector('[aria-label="Totals breakdown"]').innerText`);
const bodyHas = (text) => page.eval(`document.body.innerText.includes(${JSON.stringify(text)})`);
const qtyIds = () =>
  page.eval(`[...document.querySelectorAll('input[id$="-qty"]')].map(e => '#' + e.id)`);

await page.viewport(1440, 1000);
await page.goto(`${BASE}/?demo`);
await page.waitFor(`!!${preview}`);

// Mandatory example: 2 × $50, $10 discount, 10% tax → $99.00
await page.click('button[aria-label="Remove line 3"]');
await page.click('button[aria-label="Remove line 2"]');
let [qty] = await qtyIds();
await page.fill(qty, "2");
await page.fill(qty.replace("-qty", "-price"), "50");
await page.fill("#discountValue", "10");
await page.fill("#taxRate", "10");
let b = await breakdown();
check(
  "breakdown follows the required sequence",
  ["$100.00", "−$10.00", "$90.00", "$9.00", "$99.00"].every((s) => b.includes(s)),
  b.replace(/\n/g, " | "),
);
let t = await previewText();
check("preview total is $99.00", t.includes("$99.00") && t.includes("Tax (10%)"));
if (OUT) {
  await page.eval(
    `document.querySelector('[aria-label="Totals breakdown"]').scrollIntoView({ block: "center" })`,
  );
  await page.screenshot(OUT + "/p03-99-example.png");
}

// Discount greater than subtotal
await page.fill("#discountValue", "150");
check("discount > subtotal shows an error", await bodyHas("Discount cannot exceed the subtotal"));
check("total never goes negative", (await previewText()).includes("$0.00"));
await page.fill("#discountValue", "100");
check(
  "discount = subtotal is accepted (total $0.00)",
  !(await bodyHas("Discount cannot exceed the subtotal")),
);

// Changing a line item re-validates the discount (deps)
await page.fill(qty, "1");
check(
  "lowering quantity re-validates discount",
  await bodyHas("Discount cannot exceed the subtotal"),
);
await page.fill(qty, "2");
await page.fill("#discountValue", "10");
check("error clears after correction", !(await bodyHas("Discount cannot exceed the subtotal")));

// Percentage discount
await page.click('input[name="discountType"][value="PERCENT"]');
check("percent mode shows % discount label", await bodyHas("Discount (%)"));
b = await breakdown();
check("10% of $100 → total $99.00", b.includes("Discount (10%)") && b.includes("$99.00"));
await page.fill("#discountValue", "150");
check(
  "percent > 100 shows an error",
  await bodyHas("Percentage discount must be between 0% and 100%"),
);
await page.fill("#discountValue", "10");
await page.click('input[name="discountType"][value="FIXED"]');

// Line item validation
await page.fill(qty, "0");
check("quantity 0 shows an error", await bodyHas("Quantity must be greater than 0"));
check(
  "invalid quantity input is marked aria-invalid",
  await page.eval(
    `document.querySelector(${JSON.stringify(qty)}).getAttribute('aria-invalid') === 'true'`,
  ),
);
await page.fill(qty, "-3");
check("negative quantity shows an error", await bodyHas("Quantity must be greater than 0"));
await page.fill(qty, "2");
await page.fill(qty.replace("-qty", "-price"), "-5");
check("negative unit price shows an error", await bodyHas("Unit price cannot be negative"));
await page.fill(qty.replace("-qty", "-price"), "19.999");
check("fractional cents rejected", await bodyHas("Use whole cents (2 decimal places)"));
await page.fill(qty.replace("-qty", "-price"), "50");
await page.fill("#taxRate", "-1");
check("negative tax rate shows an error", await bodyHas("Tax rate cannot be negative"));
await page.fill("#taxRate", "");
check(
  "empty tax rate shows an error, preview has no NaN",
  (await bodyHas("Enter a tax rate (0 for none)")) && !(await previewText()).includes("NaN"),
);
await page.fill("#taxRate", "10");

// Other fields
await page.fill("#dueDate", "2026-10-01");
check(
  "due date before issue date shows an error",
  await bodyHas("Due date cannot be before the issue date"),
);
await page.fill("#dueDate", "2026-11-19");
await page.fill("#customer-email", "not-an-email");
check("invalid email shows an error", await bodyHas("Enter a valid email address"));
await page.fill("#customer-email", "ava@example.com");
await page.fill("#customer-name", "");
check("empty customer name shows an error", await bodyHas("Customer name is required"));
await page.fill("#customer-name", "Ava Thompson");

const remainingErrors = await page.eval(
  `[...document.querySelectorAll('[role="alert"]')].map(e => e.textContent).filter(Boolean)`,
);
check(
  "all errors cleared after corrections",
  remainingErrors.length === 0,
  remainingErrors.join(" | "),
);
check("final total still $99.00", (await previewText()).includes("$99.00"));
check(
  "no console errors / exceptions",
  page.errors.length === 0,
  page.errors.slice(0, 3).join(" | "),
);

await page.close();
process.exit(summary() ? 1 : 0);
