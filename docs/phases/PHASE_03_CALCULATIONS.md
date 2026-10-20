# Phase 03 — Financial Calculation Engine

**Status:** Complete. Awaiting the developer's commit.

Prompt: [03-calculation-engine.md](../prompts/03-calculation-engine.md)

## Objective

A single, tested calculation module with the required discount → tax sequence, decimal-safe
arithmetic, and validation that rejects invalid values.

## Features implemented

- Calculation engine (core added in Phase 01 for the preview) now fully covered by unit tests.
- Shared Zod validation schema (`invoiceSchema`) + `parseInvoice()` for the server (validates and
  recalculates totals, ignores client totals).
- Editor uses the schema as its React Hook Form resolver; errors are shown inline with
  `aria-invalid` / `role="alert"`.
- New **Discount & tax** section: fixed amount or percentage discount, tax rate, and a live
  breakdown (subtotal → discount → taxable amount → tax → total).
- Line-item rows show their validation errors; quantity/price changes re-validate the discount.

## Files created or modified

| File                                                                      | Change                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/lib/invoice/schema.ts`                                               | New. Validation rules, `parseInvoice`, `hasAtMostDecimals`               |
| `src/lib/invoice/calculations.test.ts`                                    | New. 17 tests                                                            |
| `src/lib/invoice/schema.test.ts`                                          | New. 22 tests                                                            |
| `src/components/invoice/editor/adjustments-section.tsx`                   | New. Discount type toggle, discount, tax, breakdown                      |
| `src/components/invoice/editor/fields.tsx`                                | `NumberField` (prefix/suffix, `valueAsNumber`, `deps`)                   |
| `src/components/invoice/editor/line-items-section.tsx`                    | Row errors, list error, `deps: ["discountValue"]`                        |
| `src/components/invoice/invoice-workspace.tsx`                            | `zodResolver(invoiceSchema)`, `mode: "onTouched"`, adjustments section   |
| `vitest.config.ts` → `vitest.config.mts`                                  | Removes Vite's "ESM syntax in a CommonJS file" warning                   |
| `scripts/e2e/calculations.e2e.mjs`, `scripts/e2e/cdp.mjs`, `package.json` | UI validation checks; focus emulation; `e2e`, `e2e:calculations` scripts |
| `docs/CALCULATION_RULES.md`                                               | Rounding policy and validation rules                                     |

## Technical decisions

- **Integer cents + 4-decimal fixed point + BigInt products**, half-up rounding — detailed in
  [CALCULATION_RULES.md](../CALCULATION_RULES.md#number-representation-and-rounding-policy).
- **Validation separate from arithmetic.** The schema rejects bad input; the engine additionally
  treats invalid numbers as 0 and clamps the discount, so the live preview can never show `NaN`
  or a negative total while the user is typing.
- **Discount ≤ subtotal check reuses the engine** (`lineTotalCents`, `discountCents`) rather than
  re-implementing the arithmetic.
- **Percentage discount implemented** (brief: optional, 0–100%).
- **Tax rate capped at 100%** as a sanity limit (brief only requires ≥ 0).
- **Unit prices must be whole cents**; quantities and rates allow up to 4 decimals.
- **Headless focus:** the e2e harness enables CDP focus emulation; without it, blur events never
  fire in an unfocused headless page and `onTouched` validation cannot be exercised.

## Commands executed

```bash
npm test                                    # 1st run: 38/39 — test fixture bug (see below)
npm test                                    # 39/39
npm run format && npm run typecheck && npm run lint && npm run build
node node_modules/next/dist/bin/next start -p 3123
BASE=http://localhost:3123 npm run e2e:calculations   # 1st run 10/23 — harness had no focus emulation
BASE=http://localhost:3123 npm run e2e:calculations   # 23/23
BASE=http://localhost:3123 npm run e2e:editor         # 26/26 (regression)
```

## Verification results (actual)

**Unit tests — `npm test`: 2 files, 39/39 passed.** Coverage of the brief's list:

| Required case                     | Test                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $99.00 example                    | `2 × $50.00, $10.00 discount, 10% tax = $99.00` (all intermediate values asserted)                                                                          |
| Multiple items                    | `sums multiple items` (3 lines, 7.25% tax → $375.34)                                                                                                        |
| Rounding fractional cents         | `rounds each line to the cent before summing`, `rounds half-up…`, `is immune to binary floating-point error`, `handles large values exactly`                |
| Zero discount / zero tax          | `zero discount`, `zero tax`                                                                                                                                 |
| Discount equal to subtotal        | engine → $0.00; schema accepts                                                                                                                              |
| Negative values                   | engine treats as 0; schema rejects quantity ≤ 0, negative price, discount, tax                                                                              |
| Discount greater than subtotal    | engine clamps (never negative); schema rejects ("Discount cannot exceed the subtotal")                                                                      |
| Custom fields don't affect totals | identical totals with/without visible and hidden fields                                                                                                     |
| Extra                             | percentage discount, NaN/Infinity, no items, invalid dates, due < issue, emails, logo type, client totals ignored, hidden custom field visibility preserved |

**Browser — `npm run e2e:calculations`: 23/23 passed** (production build, headless Chrome):
breakdown shows `$100.00 → −$10.00 → $90.00 → $9.00 → $99.00` and the preview total is $99.00;
errors appear for discount > subtotal, percent > 100, quantity 0 / negative, negative price,
fractional cents, negative or empty tax, due date before issue date, invalid email and empty
customer name; lowering a quantity re-validates the discount; all errors clear after correction;
no console errors. `npm run e2e:editor` still **26/26**.

Failures during development (fixed):

- `schema.test.ts` "allows zero unit price" failed because the demo invoice's $250 discount
  exceeded a $0 subtotal — the schema was right; the test now sets the discount to 0.
- The first e2e run showed no validation errors because headless Chrome never fired blur events;
  fixed in the harness (`Emulation.setFocusEmulationEnabled`), not in the app.

## Known issues

- Validation messages appear after a field is touched; a full-form check happens on Save (Phase 06).
- Due date is not auto-derived from payment terms (both are free inputs).

## Git commit

- Suggested message: `feat: implement precise invoice calculations`
- Hash: _to be recorded at the start of Phase 04_

## Next phase

[Phase 04 — Custom Fields](PHASE_04_CUSTOM_FIELDS.md)
