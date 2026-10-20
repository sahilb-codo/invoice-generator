import { describe, expect, it } from "vitest";

import { calculateTotals } from "@/lib/invoice/calculations";
import { demoInvoice } from "@/lib/invoice/demo-data";
import type { InvoiceData } from "@/lib/invoice/types";

import { buildInvoiceEmail, escapeHtml } from "./invoice-email";

const email = buildInvoiceEmail(demoInvoice, calculateTotals(demoInvoice));

describe("buildInvoiceEmail", () => {
  it("has a subject with number, business, total and due date", () => {
    expect(email.subject).toBe(
      "Invoice INV-2026-0042 from Northwind Studio — $8,091.39 due Nov 19, 2026",
    );
  });

  it("includes invoice number, customer, total and due date in HTML and text", () => {
    for (const body of [email.html, email.text]) {
      expect(body).toContain("INV-2026-0042");
      expect(body).toContain("Ava Thompson");
      expect(body).toContain("$8,091.39");
      expect(body).toContain("Nov 19, 2026");
    }
  });

  it("summarises line items and totals", () => {
    expect(email.text).toContain(
      "- Front-end implementation, Next.js (hours): 32.5 × $95.00 = $3,087.50",
    );
    expect(email.text).toContain("Subtotal: $7,707.50");
    expect(email.text).toContain("Discount: −$250.00");
    expect(email.text).toContain("Tax (8.5%): $633.89");
  });

  it("includes visible custom fields and never hidden ones", () => {
    for (const body of [email.html, email.text]) {
      expect(body).toContain("PO-77821");
      expect(body).not.toContain("Internal cost center");
      expect(body).not.toContain("CC-4410");
    }
  });

  it("escapes user-entered HTML", () => {
    const hostile: InvoiceData = {
      ...demoInvoice,
      customer: { ...demoInvoice.customer, name: '<script>alert("x")</script>' },
      notes: "<img src=x onerror=alert(1)>",
    };
    const { html } = buildInvoiceEmail(hostile, calculateTotals(hostile));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("formats prices without floating-point artefacts", () => {
    const invoice: InvoiceData = {
      ...demoInvoice,
      lineItems: [{ id: "a", description: "Widget", quantity: 1, unitPrice: 19.99 }],
      discountValue: 0,
    };
    expect(buildInvoiceEmail(invoice, calculateTotals(invoice)).text).toContain(
      "1 × $19.99 = $19.99",
    );
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
