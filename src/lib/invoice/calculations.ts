import type { DiscountType, LineItem } from "./types";

/**
 * Invoice calculation engine — the single source of truth for money.
 * Used by the live preview and re-run on the server before saving or sending.
 *
 * All arithmetic is done on integers (cents, and fixed-point scaled
 * quantities/rates) so that floating-point error cannot leak into totals.
 * Rounding is half-up (away from zero for positive amounts).
 * See docs/CALCULATION_RULES.md.
 */

/** Quantities and rates are kept with up to 4 decimal places. */
const SCALE = 10_000;

export interface CalculationInput {
  lineItems: Pick<LineItem, "quantity" | "unitPrice">[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
}

export interface InvoiceTotals {
  lineTotalsCents: number[];
  subtotalCents: number;
  discountCents: number;
  taxableCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Converts a decimal number to an integer scaled by 10^decimals, rounding half-up.
 * Uses exponent notation to avoid binary artefacts (1.005 * 100 = 100.49999…).
 */
export function toScaledInt(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  const text = String(value);
  const shifted = text.includes("e") ? value * 10 ** decimals : Number(`${text}e${decimals}`);
  return Math.sign(shifted) * Math.round(Math.abs(shifted));
}

/** Dollars → integer cents. */
export function toCents(dollars: number): number {
  return toScaledInt(dollars, 2);
}

/** Integer division of a non-negative bigint, rounding half-up. */
function divRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator * BigInt(2) + denominator) / (denominator * BigInt(2));
}

/** Line total in cents: quantity × unit price, rounded to the cent. */
export function lineTotalCents(quantity: number, unitPrice: number): number {
  const qty = toScaledInt(quantity, 4);
  const price = toCents(unitPrice);
  if (qty <= 0 || price <= 0) return 0;
  return Number(divRoundHalfUp(BigInt(qty) * BigInt(price), BigInt(SCALE)));
}

/** Discount in cents, before any validation against the subtotal. */
export function discountCents(
  subtotalCents: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (!(discountValue > 0)) return 0;
  if (discountType === "PERCENT") {
    const rate = toScaledInt(discountValue, 4); // percent × 10^4
    return Number(divRoundHalfUp(BigInt(subtotalCents) * BigInt(rate), BigInt(100 * SCALE)));
  }
  return toCents(discountValue);
}

/** Tax in cents on the taxable amount, rounded to the cent. */
export function taxCents(taxableCents: number, taxRate: number): number {
  if (!(taxRate > 0) || taxableCents <= 0) return 0;
  const rate = toScaledInt(taxRate, 4); // percent × 10^4
  return Number(divRoundHalfUp(BigInt(taxableCents) * BigInt(rate), BigInt(100 * SCALE)));
}

/**
 * Required sequence:
 * 1–3. round each line, then sum → subtotal
 * 4–5. subtract discount → taxable amount
 * 6–7. tax on the taxable amount, rounded
 * 8.   total = taxable amount + tax
 */
export function calculateTotals(input: CalculationInput): InvoiceTotals {
  const lineTotals = input.lineItems.map((item) => lineTotalCents(item.quantity, item.unitPrice));
  const subtotal = lineTotals.reduce((sum, cents) => sum + cents, 0);
  // Clamp for display; validation rejects a discount larger than the subtotal.
  const discount = Math.min(
    discountCents(subtotal, input.discountType, input.discountValue),
    subtotal,
  );
  const taxable = subtotal - discount;
  const tax = taxCents(taxable, input.taxRate);

  return {
    lineTotalsCents: lineTotals,
    subtotalCents: subtotal,
    discountCents: discount,
    taxableCents: taxable,
    taxCents: tax,
    totalCents: taxable + tax,
  };
}
