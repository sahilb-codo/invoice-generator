import { describe, expect, it } from "vitest";

import { calculateTotals } from "./calculations";
import { getVisibleCustomFields } from "./custom-fields";
import { demoInvoice } from "./demo-data";
import type { CustomField, InvoiceData } from "./types";

const fields: CustomField[] = [
  { id: "a", label: "Purchase Order", value: "PO-1", visible: true },
  { id: "b", label: "Internal cost center", value: "CC-9", visible: false },
  { id: "c", label: "  ", value: "orphan value", visible: true },
  { id: "d", label: "Reference", value: "", visible: true },
];

describe("getVisibleCustomFields", () => {
  it("keeps only visible fields with a label, in order", () => {
    expect(getVisibleCustomFields(fields).map((f) => f.id)).toEqual(["a", "d"]);
  });

  it("never returns hidden fields", () => {
    expect(getVisibleCustomFields(fields).some((f) => !f.visible)).toBe(false);
  });

  it("handles missing or empty lists", () => {
    expect(getVisibleCustomFields(undefined)).toEqual([]);
    expect(getVisibleCustomFields([])).toEqual([]);
  });

  it("hides the demo invoice's internal field", () => {
    const labels = getVisibleCustomFields(demoInvoice.customFields).map((f) => f.label);
    expect(labels).toEqual(["Purchase Order", "Project"]);
  });

  it("toggling visibility does not change totals", () => {
    // CalculationInput has no customFields property at all; pass whole invoices to prove that
    // the extra data is ignored.
    const allHidden: InvoiceData = {
      ...demoInvoice,
      customFields: demoInvoice.customFields.map((f) => ({ ...f, visible: false })),
    };
    const allVisible: InvoiceData = {
      ...demoInvoice,
      customFields: demoInvoice.customFields.map((f) => ({ ...f, visible: true })),
    };
    expect(calculateTotals(allHidden)).toEqual(calculateTotals(allVisible));
  });
});
