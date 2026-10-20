import { toCents, type InvoiceTotals } from "@/lib/invoice/calculations";
import { getVisibleCustomFields } from "@/lib/invoice/custom-fields";
import { formatCents, formatDate, formatPercent, formatQuantity } from "@/lib/invoice/format";
import type { InvoiceData } from "@/lib/invoice/types";

/**
 * Builds the invoice email (HTML + plain text) from validated data and server-calculated totals.
 * Pure function: no I/O, so it is unit-tested directly.
 * Hidden custom fields are excluded with the same rule as the preview and print layout.
 */
export interface InvoiceEmail {
  subject: string;
  html: string;
  text: string;
}

const COLORS = {
  navy: "#141f3d",
  muted: "#5b6478",
  border: "#e4e7ef",
  accent: "#4c4fd5",
  accentSoft: "#eef0ff",
  canvas: "#f6f7fb",
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Escapes and keeps line breaks from multi-line fields (addresses, notes). */
function multiline(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

export function buildInvoiceEmail(invoice: InvoiceData, totals: InvoiceTotals): InvoiceEmail {
  const { business, customer } = invoice;
  const total = formatCents(totals.totalCents);
  const dueDate = formatDate(invoice.dueDate);
  const customFields = getVisibleCustomFields(invoice.customFields);
  const greetingName = customer.name.trim() || "there";
  const subject = `Invoice ${invoice.invoiceNumber} from ${business.name} — ${total} due ${dueDate}`;

  const summaryRows: [string, string][] = [
    ["Invoice number", invoice.invoiceNumber],
    ["Issue date", formatDate(invoice.issueDate)],
    ["Due date", dueDate],
    ...(invoice.paymentTerms ? [["Terms", invoice.paymentTerms] as [string, string]] : []),
    ...customFields.map((field) => [field.label, field.value || "—"] as [string, string]),
  ];

  const discountLabel =
    invoice.discountType === "PERCENT"
      ? `Discount (${formatPercent(invoice.discountValue)})`
      : "Discount";
  const totalRows: [string, string][] = [
    ["Subtotal", formatCents(totals.subtotalCents)],
    ...(totals.discountCents > 0
      ? [[discountLabel, `−${formatCents(totals.discountCents)}`] as [string, string]]
      : []),
    [`Tax (${formatPercent(invoice.taxRate)})`, formatCents(totals.taxCents)],
  ];

  const td = `padding:8px 0;border-bottom:1px solid ${COLORS.border};vertical-align:top;`;
  const lineRows = invoice.lineItems
    .map(
      (item, index) => `<tr>
        <td style="${td}">${escapeHtml(item.description)}</td>
        <td style="${td}padding-left:16px;text-align:right;white-space:nowrap;">${escapeHtml(formatQuantity(item.quantity))} × ${escapeHtml(formatCents(toCents(item.unitPrice)))}</td>
        <td style="${td}padding-left:16px;text-align:right;white-space:nowrap;font-weight:600;">${escapeHtml(formatCents(totals.lineTotalsCents[index] ?? 0))}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:${COLORS.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.navy};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
    <tr><td style="height:6px;background:${COLORS.accent};"></td></tr>
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.accent};font-weight:600;">Invoice ${escapeHtml(invoice.invoiceNumber)}</p>
      <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;">${escapeHtml(business.name)}</h1>
    </td></tr>
    <tr><td style="padding:16px 28px 0;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">Hi ${escapeHtml(greetingName)},</p>
      <p style="margin:0;">Please find the details of invoice <strong>${escapeHtml(invoice.invoiceNumber)}</strong> below. The amount of <strong>${escapeHtml(total)}</strong> is due on <strong>${escapeHtml(dueDate)}</strong>.</p>
    </td></tr>
    <tr><td style="padding:20px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.accentSoft};border-radius:10px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.accent};font-weight:600;">Amount due</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${COLORS.accent};">${escapeHtml(total)}</p>
          <p style="margin:2px 0 0;font-size:13px;color:${COLORS.muted};">Due ${escapeHtml(dueDate)}</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr>
          <td style="vertical-align:top;padding-right:12px;width:50%;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};font-weight:600;">Billed to</p>
            <p style="margin:0;font-weight:600;">${escapeHtml(customer.name)}</p>
            ${customer.company ? `<p style="margin:0;">${escapeHtml(customer.company)}</p>` : ""}
            ${customer.address ? `<p style="margin:0;color:${COLORS.muted};">${multiline(customer.address)}</p>` : ""}
          </td>
          <td style="vertical-align:top;width:50%;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              ${summaryRows
                .map(
                  ([label, value]) =>
                    `<tr><td style="padding:2px 0;color:${COLORS.muted};">${escapeHtml(label)}</td><td style="padding:2px 0;text-align:right;font-weight:600;">${escapeHtml(value)}</td></tr>`,
                )
                .join("")}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
        <tr>
          <th align="left" style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};border-bottom:2px solid ${COLORS.navy};">Description</th>
          <th align="right" style="padding:0 0 8px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};border-bottom:2px solid ${COLORS.navy};">Qty × price</th>
          <th align="right" style="padding:0 0 8px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};border-bottom:2px solid ${COLORS.navy};">Amount</th>
        </tr>
        ${lineRows}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 0 auto;font-size:14px;min-width:240px;">
        ${totalRows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:3px 16px 3px 0;color:${COLORS.muted};">${escapeHtml(label)}</td><td style="padding:3px 0;text-align:right;">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
        <tr><td style="padding:8px 16px 0 0;font-weight:700;border-top:1px solid ${COLORS.border};">Total due</td><td style="padding:8px 0 0;text-align:right;font-weight:700;color:${COLORS.accent};border-top:1px solid ${COLORS.border};">${escapeHtml(total)}</td></tr>
      </table>
    </td></tr>
    ${
      invoice.paymentInstructions
        ? `<tr><td style="padding:24px 28px 0;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${COLORS.muted};font-weight:600;">How to pay</p>
      <p style="margin:0;">${multiline(invoice.paymentInstructions)}</p>
    </td></tr>`
        : ""
    }
    ${
      invoice.notes
        ? `<tr><td style="padding:16px 28px 0;font-size:14px;line-height:1.6;color:${COLORS.muted};">${multiline(invoice.notes)}</td></tr>`
        : ""
    }
    <tr><td style="padding:28px;font-size:12px;line-height:1.6;color:${COLORS.muted};">
      <p style="margin:0;font-weight:600;color:${COLORS.navy};">${escapeHtml(business.name)}</p>
      ${business.address ? `<p style="margin:0;">${multiline(business.address)}</p>` : ""}
      <p style="margin:0;">${escapeHtml([business.email, business.phone, business.website].filter(Boolean).join(" · "))}</p>
      ${business.taxId ? `<p style="margin:0;">Tax ID: ${escapeHtml(business.taxId)}</p>` : ""}
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${greetingName},`,
    "",
    `Invoice ${invoice.invoiceNumber} from ${business.name}`,
    `Amount due: ${total}`,
    `Due date: ${dueDate}`,
    "",
    ...summaryRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Items:",
    ...invoice.lineItems.map(
      (item, index) =>
        `- ${item.description}: ${formatQuantity(item.quantity)} × ${formatCents(toCents(item.unitPrice))} = ${formatCents(totals.lineTotalsCents[index] ?? 0)}`,
    ),
    "",
    ...totalRows.map(([label, value]) => `${label}: ${value}`),
    `Total due: ${total}`,
    ...(invoice.paymentInstructions ? ["", "How to pay:", invoice.paymentInstructions] : []),
    ...(invoice.notes ? ["", invoice.notes] : []),
    "",
    "—",
    business.name,
    [business.email, business.phone, business.website].filter(Boolean).join(" · "),
  ].join("\n");

  return { subject, html, text };
}
