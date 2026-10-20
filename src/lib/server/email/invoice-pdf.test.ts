import { writeFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { calculateTotals } from "@/lib/invoice/calculations";
import { demoInvoice } from "@/lib/invoice/demo-data";
import type { InvoiceData } from "@/lib/invoice/types";

import { invoicePdfFilename, renderInvoicePdf } from "./invoice-pdf";

const pageCount = (pdf: Buffer) =>
  (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

describe("renderInvoicePdf", () => {
  it("renders a one-page A4 PDF for the demo invoice", async () => {
    const pdf = await renderInvoicePdf(demoInvoice, calculateTotals(demoInvoice));
    // Set PDF_OUT=<file> to inspect the result.
    if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT, pdf);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pageCount(pdf)).toBe(1);
    expect(pdf.toString("latin1")).toMatch(/\/MediaBox \[0 0 595\.2\d* 841\.8\d*\]/);
  });

  it("continues onto more pages for long invoices", async () => {
    const invoice: InvoiceData = {
      ...demoInvoice,
      lineItems: Array.from({ length: 60 }, (_, i) => ({
        id: `li_${i}`,
        description: `Consulting session ${i + 1}`,
        quantity: 1,
        unitPrice: 100,
      })),
    };
    const pdf = await renderInvoicePdf(invoice, calculateTotals(invoice));
    expect(pageCount(pdf)).toBeGreaterThan(1);
  });

  it("does not fail on unsupported logo formats (SVG / WebP are skipped)", async () => {
    const invoice: InvoiceData = {
      ...demoInvoice,
      business: { ...demoInvoice.business, logoDataUrl: "data:image/svg+xml;base64,PHN2Zy8+" },
    };
    const pdf = await renderInvoicePdf(invoice, calculateTotals(invoice));
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});

describe("invoicePdfFilename", () => {
  it("builds a safe file name", () => {
    expect(invoicePdfFilename("INV-2026-0042")).toBe("Invoice-INV-2026-0042.pdf");
    expect(invoicePdfFilename("../evil/ name")).toBe("Invoice-..-evil-name.pdf");
    expect(invoicePdfFilename("///")).toBe("Invoice-invoice.pdf");
  });
});
