# Calculation Rules

Implementation: [`src/lib/invoice/calculations.ts`](../src/lib/invoice/calculations.ts) (engine) and
[`src/lib/invoice/schema.ts`](../src/lib/invoice/schema.ts) (validation). Tests:
[`calculations.test.ts`](../src/lib/invoice/calculations.test.ts),
[`schema.test.ts`](../src/lib/invoice/schema.test.ts).

The same engine runs in the live preview, the editor's totals breakdown and (from Phase 06) on the
server before every save or send. The server recalculates from validated inputs and never trusts
totals sent by the client (`parseInvoice` strips unknown keys such as `totals`).

## Required sequence

1. Line total = quantity × unit price.
2. Round each line total to the cent.
3. Subtotal = sum of the **rounded** line totals.
4. Discount: fixed amount, or percentage of the subtotal (rounded to the cent).
5. Taxable amount = subtotal − discount.
6. Tax = taxable amount × tax rate.
7. Round tax to the cent.
8. Grand total = taxable amount + rounded tax.

## Mandatory example

| Step                  | Value      |
| --------------------- | ---------- |
| Quantity × unit price | 2 × $50.00 |
| Line total / subtotal | $100.00    |
| Fixed discount        | $10.00     |
| Taxable amount        | $90.00     |
| Tax (10%)             | $9.00      |
| **Grand total**       | **$99.00** |

Verified by unit test (`2 × $50.00, $10.00 discount, 10% tax = $99.00`) and in the browser
(`npm run e2e:calculations`, [screenshot](screenshots/phase-03-99-example.png)).

## Number representation and rounding policy

- **Money is integer cents** (`number`, always a safe integer). Dollars are converted with
  `toCents`, which shifts the decimal point through exponent notation (`"19.99e2"`) instead of
  multiplying by 100, so `19.99 → 1999` and `1.005 → 101` exactly.
- **Quantities and rates are fixed-point with 4 decimals** (`× 10 000`), e.g. `32.5 → 325 000`,
  `8.875% → 88 750`.
- **Products use `BigInt`** (`quantity × price`, `taxable × rate`) so even
  1 000 000 × $10 000 000.00 is exact; results are converted back once they are cent-sized.
- **Rounding is half-up** (half a cent rounds up): `0.005 → 0.01`, `12.5% of $1.00 = 0.125 → 0.13`.
  Applied at exactly two points: each line total, and the tax (plus a percentage discount).
- Formatting: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` →
  `$8,091.39`; discounts shown as `−$10.00`.

### Why rounded lines are summed

`1.5 × $9.99 = $14.985` per line. Two such lines: rounding each first gives
`$14.99 + $14.99 = $29.98` (what the customer sees on each line); rounding only the sum would give
`$29.97`, and the printed lines would not add up to the subtotal.

## Validation

Shared Zod schema, used as the React Hook Form resolver in the editor and by `parseInvoice` on the
server.

| Rule                                                       | Message                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Quantity > 0, ≤ 1 000 000, ≤ 4 decimals                    | "Quantity must be greater than 0"                                      |
| Unit price ≥ 0, ≤ $10 000 000, whole cents                 | "Unit price cannot be negative" / "Use whole cents (2 decimal places)" |
| Line description required                                  | "Add a description"                                                    |
| At least 1 and at most 100 line items                      | "Add at least one line item"                                           |
| Discount ≥ 0                                               | "Discount cannot be negative"                                          |
| Fixed discount ≤ subtotal (equal is allowed → total $0.00) | "Discount cannot exceed the subtotal"                                  |
| Percentage discount 0–100%                                 | "Percentage discount must be between 0% and 100%"                      |
| Tax rate 0–100%, ≤ 4 decimals                              | "Tax rate cannot be negative"                                          |
| NaN / Infinity / empty number fields                       | rejected (`Enter a … (0 for none)`)                                    |
| Valid calendar dates; due date ≥ issue date                | "Due date cannot be before the issue date"                             |
| Business and customer name required; emails valid if given | "Customer name is required", "Enter a valid email address"             |
| Logo must be a PNG / JPG / WebP / SVG data URL ≤ ~256 KB   | "Logo must be a PNG, JPG, WebP or SVG image"                           |

Defence in depth: even if invalid numbers reach the engine (e.g. while typing), it treats
negative, `NaN` and `Infinity` inputs as 0 and clamps the discount to the subtotal, so a preview
never shows `NaN` or a negative total.

The editor validates a field when it loses focus and then live while it is being corrected
(`mode: "onTouched"`). Changing a quantity, price or the discount type re-validates the discount.

## Custom fields

Custom fields are display-only metadata. The engine's input type (`CalculationInput`) does not
include them, and a unit test confirms totals are identical with and without (visible or hidden)
custom fields, even ones labelled "Discount" or "Tax".
