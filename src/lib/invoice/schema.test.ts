import { describe, expect, it } from "vitest";

import { demoInvoice } from "./demo-data";
import { hasAtMostDecimals, invoiceSchema, parseInvoice } from "./schema";
import type { InvoiceData } from "./types";

function errorsFor(patch: Partial<InvoiceData>) {
  const result = parseInvoice({ ...demoInvoice, ...patch });
  return result.success ? {} : result.fieldErrors;
}

function withItems(...items: Partial<InvoiceData["lineItems"][number]>[]): Partial<InvoiceData> {
  return {
    lineItems: items.map((item, i) => ({
      id: `li_${i}`,
      description: "Item",
      quantity: 1,
      unitPrice: 0,
      ...item,
    })),
  };
}

describe("invoiceSchema", () => {
  it("accepts the demo invoice", () => {
    expect(invoiceSchema.safeParse(demoInvoice).success).toBe(true);
  });

  it("accepts the mandatory $99.00 example", () => {
    const result = parseInvoice({
      ...demoInvoice,
      ...withItems({ quantity: 2, unitPrice: 50 }),
      discountType: "FIXED",
      discountValue: 10,
      taxRate: 10,
    });
    expect(result.success && result.totals.totalCents).toBe(9_900);
  });

  it("rejects quantity of zero or below", () => {
    expect(errorsFor(withItems({ quantity: 0 }))["lineItems.0.quantity"]).toBe(
      "Quantity must be greater than 0",
    );
    expect(errorsFor(withItems({ quantity: -1 }))["lineItems.0.quantity"]).toBe(
      "Quantity must be greater than 0",
    );
  });

  it("rejects negative unit price but allows zero", () => {
    expect(errorsFor(withItems({ unitPrice: -0.01 }))["lineItems.0.unitPrice"]).toBe(
      "Unit price cannot be negative",
    );
    expect(errorsFor({ ...withItems({ unitPrice: 0 }), discountValue: 0 })).toEqual({});
  });

  it("rejects fractional cents in prices", () => {
    expect(errorsFor(withItems({ unitPrice: 19.999 }))["lineItems.0.unitPrice"]).toBe(
      "Use whole cents (2 decimal places)",
    );
  });

  it("rejects NaN and Infinity", () => {
    expect(errorsFor(withItems({ quantity: Number.NaN }))["lineItems.0.quantity"]).toBeDefined();
    expect(
      errorsFor(withItems({ unitPrice: Number.POSITIVE_INFINITY }))["lineItems.0.unitPrice"],
    ).toBeDefined();
    expect(errorsFor({ taxRate: Number.NaN }).taxRate).toBeDefined();
    expect(errorsFor({ discountValue: Number.NEGATIVE_INFINITY }).discountValue).toBeDefined();
  });

  it("rejects negative discount and tax", () => {
    expect(errorsFor({ discountValue: -1 }).discountValue).toBe("Discount cannot be negative");
    expect(errorsFor({ taxRate: -1 }).taxRate).toBe("Tax rate cannot be negative");
  });

  it("allows a discount equal to the subtotal", () => {
    expect(errorsFor({ ...withItems({ quantity: 2, unitPrice: 50 }), discountValue: 100 })).toEqual(
      {},
    );
  });

  it("rejects a discount greater than the subtotal", () => {
    expect(
      errorsFor({ ...withItems({ quantity: 2, unitPrice: 50 }), discountValue: 100.01 })
        .discountValue,
    ).toBe("Discount cannot exceed the subtotal");
  });

  it("limits percentage discounts to 0–100%", () => {
    expect(errorsFor({ discountType: "PERCENT", discountValue: 100 })).toEqual({});
    expect(errorsFor({ discountType: "PERCENT", discountValue: 100.5 }).discountValue).toBe(
      "Percentage discount must be between 0% and 100%",
    );
  });

  it("requires at least one line item with a description", () => {
    expect(errorsFor({ lineItems: [] }).lineItems).toBe("Add at least one line item");
    expect(errorsFor(withItems({ description: "  " }))["lineItems.0.description"]).toBe(
      "Add a description",
    );
  });

  it("rejects a due date before the issue date and impossible dates", () => {
    expect(errorsFor({ issueDate: "2026-10-20", dueDate: "2026-10-19" }).dueDate).toBe(
      "Due date cannot be before the issue date",
    );
    expect(errorsFor({ dueDate: "2026-02-30" }).dueDate).toBe("Enter a valid due date");
  });

  it("validates required names and email format", () => {
    const errors = parseInvoice({
      ...demoInvoice,
      business: { ...demoInvoice.business, name: " " },
      customer: { ...demoInvoice.customer, name: "", email: "not-an-email" },
    });
    expect(errors.success).toBe(false);
    if (!errors.success) {
      expect(errors.fieldErrors["business.name"]).toBe("Business name is required");
      expect(errors.fieldErrors["customer.name"]).toBe("Customer name is required");
      expect(errors.fieldErrors["customer.email"]).toBe("Enter a valid email address");
    }
  });

  it("rejects non-image logos", () => {
    const result = parseInvoice({
      ...demoInvoice,
      business: { ...demoInvoice.business, logoDataUrl: "data:text/html;base64,PHNjcmlwdD4=" },
    });
    expect(!result.success && result.fieldErrors["business.logoDataUrl"]).toBe(
      "Logo must be a PNG, JPG, WebP or SVG image",
    );
  });
});

describe("parseInvoice", () => {
  it("recalculates totals and ignores client-supplied totals", () => {
    const tampered = { ...demoInvoice, totals: { totalCents: 1 }, totalCents: 1 };
    const result = parseInvoice(tampered);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.totals.totalCents).toBe(809_139);
      expect("totals" in result.invoice).toBe(false);
    }
  });

  it("keeps hidden custom fields and their visibility", () => {
    const result = parseInvoice(demoInvoice);
    expect(
      result.success && result.invoice.customFields.find((f) => f.id === "cf_3")?.visible,
    ).toBe(false);
  });
});

describe("hasAtMostDecimals", () => {
  it.each([
    [19.99, 2, true],
    [19.999, 2, false],
    [0.1, 2, true],
    [1_000_000, 4, true],
    [32.5, 4, true],
    [0.00001, 4, false],
  ])("%d with ≤ %d decimals → %s", (value, decimals, expected) => {
    expect(hasAtMostDecimals(value, decimals)).toBe(expected);
  });
});
