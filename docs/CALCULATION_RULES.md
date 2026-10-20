# Calculation Rules

> Status: core engine in `src/lib/invoice/calculations.ts` (added in Phase 01 so the preview can
> render totals). Validation, rounding-policy details and tests are added in Phase 03.

## Required sequence

1. Line total = quantity × unit price.
2. Round each line total to two decimal places.
3. Subtotal = sum of rounded line totals.
4. Apply the fixed discount.
5. Taxable amount = subtotal − discount.
6. Tax = taxable amount × tax rate.
7. Round tax to two decimal places.
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

## Validation

- Quantity > 0 for a valid line item.
- Unit price ≥ 0.
- Discount ≥ 0 and ≤ subtotal.
- Tax rate ≥ 0.
- Percentage discounts (if implemented) between 0% and 100%.
- Invalid values are rejected when saving or sending.
- NaN and Infinity are never produced or accepted.
- Money is formatted consistently as USD.
- Custom fields never affect totals.
