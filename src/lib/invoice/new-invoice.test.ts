import { describe, expect, it } from "vitest";

import { createBlankInvoice } from "./new-invoice";
import { parseInvoice } from "./schema";

describe("createBlankInvoice", () => {
  const invoice = createBlankInvoice(new Date(2026, 9, 20));

  it("fills only the values the app decides itself", () => {
    expect(invoice.invoiceNumber).toMatch(/^INV-20261020-[A-Z2-9]{4}$/);
    expect(invoice.issueDate).toBe("2026-10-20");
    expect(invoice.dueDate).toBe("2026-11-19");
    expect(invoice.status).toBe("DRAFT");
  });

  it("leaves every business, customer and content field empty", () => {
    expect(Object.values(invoice.business).every((value) => value === "")).toBe(true);
    expect(Object.values(invoice.customer).every((value) => value === "")).toBe(true);
    expect(invoice.lineItems).toHaveLength(1);
    expect(invoice.lineItems[0]).toMatchObject({ description: "", quantity: 1, unitPrice: 0 });
    expect(invoice).toMatchObject({
      paymentTerms: "",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      paymentInstructions: "",
      customFields: [],
    });
  });

  it("rolls the due date over month and year ends", () => {
    expect(createBlankInvoice(new Date(2026, 11, 15)).dueDate).toBe("2027-01-14");
  });

  it("asks the user for the required details before it can be sent", () => {
    const result = parseInvoice(invoice);
    expect(result.success).toBe(false);
    const errors = result.success ? {} : result.fieldErrors;
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(["business.name", "customer.name", "lineItems.0.description"]),
    );
    expect(errors).not.toHaveProperty("invoiceNumber");
    expect(errors).not.toHaveProperty("issueDate");
    expect(errors).not.toHaveProperty("dueDate");
  });
});
