export const INVOICE_STATUSES = ["DRAFT", "SAVED", "SENT"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const DISCOUNT_TYPES = ["FIXED", "PERCENT"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export interface BusinessDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxId: string;
  /** Data URL of an uploaded logo, or empty string. */
  logoDataUrl: string;
}

export interface CustomerDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  /** Unit price in USD (dollars, up to 2 decimals). */
  unitPrice: number;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  visible: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  /** ISO date, YYYY-MM-DD */
  issueDate: string;
  /** ISO date, YYYY-MM-DD */
  dueDate: string;
  currency: "USD";
  paymentTerms: string;
  status: InvoiceStatus;
  business: BusinessDetails;
  customer: CustomerDetails;
  lineItems: LineItem[];
  discountType: DiscountType;
  /** FIXED: USD amount. PERCENT: 0–100. */
  discountValue: number;
  /** Percentage, e.g. 10 for 10%. */
  taxRate: number;
  notes: string;
  paymentInstructions: string;
  customFields: CustomField[];
}
