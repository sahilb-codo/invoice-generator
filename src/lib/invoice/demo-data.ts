import type { InvoiceData } from "./types";

/** Realistic fictional invoice shown on first load. All names and contacts are invented. */
export const demoInvoice: InvoiceData = {
  invoiceNumber: "INV-2026-0042",
  issueDate: "2026-10-20",
  dueDate: "2026-11-19",
  currency: "USD",
  paymentTerms: "Net 30",
  status: "DRAFT",
  business: {
    name: "Northwind Studio",
    email: "billing@northwind.example",
    phone: "+1 (415) 555-0134",
    address: "500 Market Street, Suite 210\nSan Francisco, CA 94105",
    website: "northwind.example",
    taxId: "US-EIN 12-3456789",
    logoDataUrl: "",
  },
  customer: {
    name: "Ava Thompson",
    company: "Brightline Analytics Inc.",
    email: "ava.thompson@brightline.example",
    phone: "+1 (212) 555-0198",
    address: "88 Hudson Yards, Floor 14\nNew York, NY 10001",
  },
  lineItems: [
    {
      id: "li_1",
      description: "Product design sprint — discovery workshop and UX audit",
      quantity: 1,
      unitPrice: 2400,
    },
    {
      id: "li_2",
      description: "High-fidelity UI design (dashboard, 12 screens)",
      quantity: 12,
      unitPrice: 185,
    },
    {
      id: "li_3",
      description: "Front-end implementation, Next.js (hours)",
      quantity: 32.5,
      unitPrice: 95,
    },
  ],
  discountType: "FIXED",
  discountValue: 250,
  taxRate: 8.5,
  notes: "Thank you for your business. It was a pleasure working with the Brightline team.",
  paymentInstructions:
    "Bank transfer to Northwind Studio LLC\nAccount 0123456789 · Routing 021000021\nPlease include the invoice number as the payment reference.",
  customFields: [
    { id: "cf_1", label: "Purchase Order", value: "PO-77821", visible: true },
    { id: "cf_2", label: "Project", value: "Analytics Dashboard Redesign", visible: true },
    { id: "cf_3", label: "Internal cost center", value: "CC-4410", visible: false },
  ],
};
