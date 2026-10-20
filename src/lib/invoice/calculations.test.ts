import { describe, expect, it } from "vitest";

import {
  calculateTotals,
  discountCents,
  lineTotalCents,
  taxCents,
  toCents,
  toScaledInt,
  type CalculationInput,
} from "./calculations";
import { demoInvoice } from "./demo-data";
import { formatCents } from "./format";

function totals(
  lineItems: CalculationInput["lineItems"],
  discountValue = 0,
  taxRate = 0,
  discountType: CalculationInput["discountType"] = "FIXED",
) {
  return calculateTotals({ lineItems, discountType, discountValue, taxRate });
}

describe("calculateTotals — mandatory example", () => {
  it("2 × $50.00, $10.00 discount, 10% tax = $99.00", () => {
    const result = totals([{ quantity: 2, unitPrice: 50 }], 10, 10);
    expect(result).toEqual({
      lineTotalsCents: [10_000],
      subtotalCents: 10_000,
      discountCents: 1_000,
      taxableCents: 9_000,
      taxCents: 900,
      totalCents: 9_900,
    });
    expect(formatCents(result.totalCents)).toBe("$99.00");
  });
});

describe("calculateTotals — sequence", () => {
  it("sums multiple items", () => {
    // 3 × 19.99 = 59.97; 1 × 250 = 250.00; 0.5 × 80 = 40.00 → 349.97
    // tax 7.25% of 349.97 = 25.372825 → 25.37; total 375.34
    const result = totals(
      [
        { quantity: 3, unitPrice: 19.99 },
        { quantity: 1, unitPrice: 250 },
        { quantity: 0.5, unitPrice: 80 },
      ],
      0,
      7.25,
    );
    expect(result.lineTotalsCents).toEqual([5_997, 25_000, 4_000]);
    expect(result.subtotalCents).toBe(34_997);
    expect(result.taxCents).toBe(2_537);
    expect(result.totalCents).toBe(37_534);
  });

  it("applies tax to the discounted amount, not the subtotal", () => {
    const result = totals([{ quantity: 1, unitPrice: 200 }], 50, 10);
    expect(result.taxableCents).toBe(15_000);
    expect(result.taxCents).toBe(1_500); // 10% of 150, not of 200
    expect(result.totalCents).toBe(16_500);
  });

  it("matches the demo invoice", () => {
    // 2,400.00 + 2,220.00 + 3,087.50 = 7,707.50; − 250 = 7,457.50; 8.5% = 633.8875 → 633.89
    const result = calculateTotals(demoInvoice);
    expect(result.subtotalCents).toBe(770_750);
    expect(result.taxCents).toBe(63_389);
    expect(result.totalCents).toBe(809_139);
  });
});

describe("rounding", () => {
  it("rounds each line to the cent before summing", () => {
    // 1.5 × 9.99 = 14.985 → 14.99 per line. Rounded lines sum to 29.98;
    // rounding only the unrounded sum (29.97) would give a different subtotal.
    const result = totals([
      { quantity: 1.5, unitPrice: 9.99 },
      { quantity: 1.5, unitPrice: 9.99 },
    ]);
    expect(result.lineTotalsCents).toEqual([1_499, 1_499]);
    expect(result.subtotalCents).toBe(2_998);
  });

  it("rounds half-up at exactly half a cent", () => {
    expect(lineTotalCents(0.5, 0.01)).toBe(1); // 0.005 → 0.01
    expect(taxCents(100, 12.5)).toBe(13); // 12.5% of $1.00 = 0.125 → 0.13
    expect(taxCents(10_005, 7.5)).toBe(750); // 7.5% of 100.05 = 7.50375 → 7.50
  });

  it("is immune to binary floating-point error", () => {
    expect(
      totals([
        { quantity: 1, unitPrice: 0.1 },
        { quantity: 1, unitPrice: 0.2 },
      ]).subtotalCents,
    ).toBe(30);
    expect(lineTotalCents(1.15, 19.99)).toBe(2_299); // 22.9885 (float gives 22.988499…)
    expect(toCents(19.99)).toBe(1_999); // 19.99 * 100 = 1998.9999999999998 in floating point
    expect(toScaledInt(1.005, 2)).toBe(101); // 1.005 * 100 = 100.49999999999999 in floating point
  });

  it("handles large values exactly", () => {
    // 1,000,000 × $10,000,000.00 = $10 trillion = 1e15 cents (BigInt intermediate)
    expect(lineTotalCents(1_000_000, 10_000_000)).toBe(1e15);
    expect(taxCents(1e15, 8.875)).toBe(88_750_000_000_000);
  });
});

describe("discount and tax edge cases", () => {
  it("zero discount", () => {
    const result = totals([{ quantity: 2, unitPrice: 50 }], 0, 10);
    expect(result.discountCents).toBe(0);
    expect(result.taxableCents).toBe(10_000);
    expect(result.totalCents).toBe(11_000);
  });

  it("zero tax", () => {
    const result = totals([{ quantity: 2, unitPrice: 50 }], 10, 0);
    expect(result.taxCents).toBe(0);
    expect(result.totalCents).toBe(9_000);
  });

  it("discount equal to subtotal gives a zero total", () => {
    const result = totals([{ quantity: 2, unitPrice: 50 }], 100, 10);
    expect(result.discountCents).toBe(10_000);
    expect(result.taxableCents).toBe(0);
    expect(result.taxCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("discount greater than subtotal never produces a negative total", () => {
    // Rejected by validation (see schema.test.ts); the engine clamps so previews stay sane.
    const result = totals([{ quantity: 1, unitPrice: 50 }], 80, 10);
    expect(discountCents(5_000, "FIXED", 80)).toBe(8_000);
    expect(result.discountCents).toBe(5_000);
    expect(result.totalCents).toBe(0);
  });

  it("percentage discount", () => {
    const result = totals([{ quantity: 2, unitPrice: 50 }], 10, 10, "PERCENT");
    expect(result.discountCents).toBe(1_000);
    expect(result.totalCents).toBe(9_900);
    expect(discountCents(999, "PERCENT", 12.5)).toBe(125); // 124.875 → 125
    expect(discountCents(10_000, "PERCENT", 100)).toBe(10_000);
  });

  it("negative values never reduce totals below zero or add money", () => {
    // Rejected by validation; the engine treats them as zero.
    expect(lineTotalCents(-2, 50)).toBe(0);
    expect(lineTotalCents(2, -50)).toBe(0);
    expect(discountCents(10_000, "FIXED", -10)).toBe(0);
    expect(taxCents(10_000, -10)).toBe(0);
    const result = totals(
      [
        { quantity: -2, unitPrice: 50 },
        { quantity: 1, unitPrice: 10 },
      ],
      -5,
      -10,
    );
    expect(result).toMatchObject({
      subtotalCents: 1_000,
      discountCents: 0,
      taxCents: 0,
      totalCents: 1_000,
    });
  });

  it("NaN and Infinity never leak into totals", () => {
    const result = totals(
      [
        { quantity: Number.NaN, unitPrice: 50 },
        { quantity: 1, unitPrice: Number.POSITIVE_INFINITY },
        { quantity: 1, unitPrice: 10 },
      ],
      Number.NaN,
      Number.POSITIVE_INFINITY,
    );
    expect(Object.values(result).flat().every(Number.isFinite)).toBe(true);
    expect(result.subtotalCents).toBe(1_000);
    expect(result.totalCents).toBe(1_000);
  });

  it("no line items gives all zeros", () => {
    expect(totals([], 0, 10)).toMatchObject({ subtotalCents: 0, taxCents: 0, totalCents: 0 });
  });
});

describe("custom fields", () => {
  it("do not affect totals, whether visible or hidden", () => {
    const base = { ...demoInvoice, customFields: [] };
    const withFields = {
      ...demoInvoice,
      customFields: [
        { id: "a", label: "Discount", value: "100", visible: true },
        { id: "b", label: "Tax", value: "50%", visible: false },
        { id: "c", label: "Amount", value: "-999", visible: true },
      ],
    };
    expect(calculateTotals(withFields)).toEqual(calculateTotals(base));
  });
});
