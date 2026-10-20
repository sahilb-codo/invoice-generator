import { z } from "zod";

import {
  calculateTotals,
  discountCents,
  lineTotalCents,
  toScaledInt,
  type InvoiceTotals,
} from "./calculations";
import { DISCOUNT_TYPES, INVOICE_STATUSES, type InvoiceData } from "./types";

/**
 * Validation rules shared by the editor (React Hook Form resolver) and the server.
 * See docs/CALCULATION_RULES.md#validation.
 */

const MAX_QUANTITY = 1_000_000;
const MAX_UNIT_PRICE = 10_000_000; // $10M per unit
const MAX_LINE_ITEMS = 100;
/** Data URL of a ≤ 256 KB image is ≈ 350k characters once base64-encoded. */
const MAX_LOGO_LENGTH = 360_000;

/**
 * True when `value` has at most `decimals` decimal places
 * (compares rounding at `decimals` with rounding at 3 extra places; stays within safe integers).
 */
export function hasAtMostDecimals(value: number, decimals: number): boolean {
  return toScaledInt(value, decimals) * 1000 === toScaledInt(value, decimals + 3);
}

const optionalText = (max: number) => z.string().trim().max(max, `Use at most ${max} characters`);

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address",
  );

export const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().min(1, "Add a description").max(500, "Use at most 500 characters"),
  quantity: z
    .number({ error: "Enter a quantity" })
    .gt(0, "Quantity must be greater than 0")
    .max(MAX_QUANTITY, "Quantity is too large")
    .refine((value) => hasAtMostDecimals(value, 4), "Use at most 4 decimal places"),
  unitPrice: z
    .number({ error: "Enter a unit price" })
    .min(0, "Unit price cannot be negative")
    .max(MAX_UNIT_PRICE, "Unit price is too large")
    .refine((value) => hasAtMostDecimals(value, 2), "Use whole cents (2 decimal places)"),
});

export const customFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Add a label").max(60, "Use at most 60 characters"),
  value: optionalText(200),
  visible: z.boolean(),
});

export const invoiceSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1, "Invoice number is required")
      .max(40, "Use at most 40 characters"),
    issueDate: z.iso.date("Enter a valid issue date"),
    dueDate: z.iso.date("Enter a valid due date"),
    currency: z.literal("USD"),
    paymentTerms: optionalText(60),
    status: z.enum(INVOICE_STATUSES),
    business: z.object({
      name: z.string().trim().min(1, "Business name is required").max(120),
      email: optionalEmail,
      phone: optionalText(40),
      address: optionalText(300),
      website: optionalText(120),
      taxId: optionalText(60),
      logoDataUrl: z
        .string()
        .max(MAX_LOGO_LENGTH, "Logo is too large")
        .refine(
          (value) => value === "" || /^data:image\/(png|jpeg|webp|svg\+xml);base64,/.test(value),
          "Logo must be a PNG, JPG, WebP or SVG image",
        ),
    }),
    customer: z.object({
      name: z.string().trim().min(1, "Customer name is required").max(120),
      company: optionalText(120),
      email: optionalEmail,
      phone: optionalText(40),
      address: optionalText(300),
    }),
    lineItems: z
      .array(lineItemSchema)
      .min(1, "Add at least one line item")
      .max(MAX_LINE_ITEMS, `Use at most ${MAX_LINE_ITEMS} line items`),
    discountType: z.enum(DISCOUNT_TYPES),
    discountValue: z
      .number({ error: "Enter a discount (0 for none)" })
      .min(0, "Discount cannot be negative"),
    taxRate: z
      .number({ error: "Enter a tax rate (0 for none)" })
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100%")
      .refine((value) => hasAtMostDecimals(value, 4), "Use at most 4 decimal places"),
    notes: optionalText(2000),
    paymentInstructions: optionalText(2000),
    customFields: z.array(customFieldSchema).max(20, "Use at most 20 custom fields"),
  })
  .superRefine((invoice, ctx) => {
    if (invoice.dueDate < invoice.issueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due date cannot be before the issue date",
      });
    }

    if (invoice.discountType === "PERCENT") {
      if (invoice.discountValue > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["discountValue"],
          message: "Percentage discount must be between 0% and 100%",
        });
      } else if (!hasAtMostDecimals(invoice.discountValue, 4)) {
        ctx.addIssue({
          code: "custom",
          path: ["discountValue"],
          message: "Use at most 4 decimal places",
        });
      }
      return;
    }

    if (!hasAtMostDecimals(invoice.discountValue, 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Use whole cents (2 decimal places)",
      });
      return;
    }
    const subtotal = invoice.lineItems.reduce(
      (sum, item) => sum + lineTotalCents(item.quantity, item.unitPrice),
      0,
    );
    if (discountCents(subtotal, "FIXED", invoice.discountValue) > subtotal) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Discount cannot exceed the subtotal",
      });
    }
  });

export type InvoiceInput = z.input<typeof invoiceSchema>;

export type ParseInvoiceResult =
  | { success: true; invoice: InvoiceData; totals: InvoiceTotals }
  | { success: false; fieldErrors: Record<string, string> };

/**
 * Validates untrusted invoice data (e.g. a server action payload) and recalculates totals from the
 * validated values. Client-supplied totals are never used.
 */
export function parseInvoice(input: unknown): ParseInvoiceResult {
  const result = invoiceSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_form";
      fieldErrors[key] ??= issue.message;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, invoice: result.data, totals: calculateTotals(result.data) };
}
