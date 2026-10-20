import { createId } from "@/lib/id";

import { generateInvoiceNumber } from "./invoice-number";
import type { InvoiceData } from "./types";

/** Days between the issue date and the default due date. */
export const DEFAULT_DUE_DAYS = 30;

/** "YYYY-MM-DD" in local time, the format used by date inputs. */
function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * A new, empty invoice for the user to fill in. Only values the app can decide on its own are
 * set: a generated number, today's issue date, a due date 30 days later and one empty line.
 */
export function createBlankInvoice(today: Date = new Date()): InvoiceData {
  const due = new Date(today);
  due.setDate(due.getDate() + DEFAULT_DUE_DAYS);

  return {
    invoiceNumber: generateInvoiceNumber(today),
    issueDate: toDateInput(today),
    dueDate: toDateInput(due),
    currency: "USD",
    paymentTerms: "",
    status: "DRAFT",
    business: {
      name: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      taxId: "",
      logoDataUrl: "",
    },
    customer: { name: "", company: "", email: "", phone: "", address: "" },
    lineItems: [{ id: createId("li"), description: "", quantity: 1, unitPrice: 0 }],
    discountType: "FIXED",
    discountValue: 0,
    taxRate: 0,
    notes: "",
    paymentInstructions: "",
    customFields: [],
  };
}
