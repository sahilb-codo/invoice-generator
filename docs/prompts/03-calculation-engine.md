# Prompt 03 — Financial Calculation Engine

> **Source:** Extracted verbatim from the master prompt supplied on 2026-10-20
> ("PHASE 4 — Financial Calculation Engine").

Implement all calculation logic in a dedicated reusable TypeScript module.

Do not duplicate calculations across UI components or trust client-calculated totals on the server.

## Required calculation sequence

1. Calculate each line: quantity × unit price.
2. Round each line total to two decimal places.
3. Sum the rounded line totals.
4. Apply the fixed discount.
5. Calculate taxable amount: subtotal − discount.
6. Calculate tax on the discounted amount.
7. Round tax to two decimal places.
8. Add taxable amount and rounded tax to produce the grand total.

Use integer cents or an appropriately robust decimal-safe strategy.

Example:

- Quantity: 2.
- Unit price: $50.00.
- Line total: $100.00.
- Subtotal: $100.00.
- Fixed discount: $10.00.
- Taxable amount: $90.00.
- Tax rate: 10%.
- Tax amount: $9.00.
- Grand total: **$99.00**.

This result is mandatory.

## Validation

- Quantity must be greater than zero for a valid line item.
- Unit price must be zero or greater.
- Discount must be zero or greater.
- Discount cannot exceed subtotal.
- Tax rate must be zero or greater.
- Percentage discounts, if implemented, must be between 0% and 100%.
- Reject invalid values when saving or sending.
- Prevent NaN and Infinity.
- Format monetary values consistently as USD.

Add unit tests for:

- The $99.00 example.
- Multiple items.
- Rounding fractional cents.
- Zero discount.
- Zero tax.
- Discount equal to subtotal.
- Negative values.
- Discount greater than subtotal.
- Custom fields not affecting totals.

Document the rounding policy and commit the phase.
