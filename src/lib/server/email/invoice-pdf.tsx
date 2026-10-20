import "server-only";

import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { toCents, type InvoiceTotals } from "@/lib/invoice/calculations";
import { getVisibleCustomFields } from "@/lib/invoice/custom-fields";
import { formatCents, formatDate, formatPercent, formatQuantity } from "@/lib/invoice/format";
import type { InvoiceData } from "@/lib/invoice/types";

/**
 * Server-side PDF of the invoice, attached to emails. Mirrors the on-screen / print document,
 * built from validated data and server-calculated totals. Uses the built-in Helvetica font, so
 * text is limited to the WinAnsi character set (hence "-" rather than "−" for discounts).
 */

const C = {
  navy: "#141f3d",
  muted: "#5b6478",
  border: "#e4e7ef",
  accent: "#4c4fd5",
  soft: "#eef0ff",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9.5,
    color: C.navy,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },
  band: { height: 4, backgroundColor: C.accent, marginBottom: 24 },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  h1: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  overline: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  muted: { color: C.muted },
  bold: { fontFamily: "Helvetica-Bold" },
  number: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "right" },
  th: {
    fontSize: 7.5,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: "right" },
  cPrice: { width: 72, textAlign: "right" },
  cAmount: { width: 78, textAlign: "right" },
  totals: { marginLeft: "auto", width: 210, marginTop: 10 },
  totalDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: C.soft,
    color: C.accent,
    padding: 8,
    marginTop: 6,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  pageNo: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: C.muted,
    textAlign: "right",
  },
});

/** react-pdf renders PNG and JPEG only. */
function pdfLogo(dataUrl: string): string | null {
  return /^data:image\/(png|jpeg);base64,/.test(dataUrl) ? dataUrl : null;
}

function InvoicePdf({ invoice, totals }: { invoice: InvoiceData; totals: InvoiceTotals }) {
  const { business, customer } = invoice;
  const logo = pdfLogo(business.logoDataUrl);
  const meta: [string, string][] = [
    ["Issue date", formatDate(invoice.issueDate)],
    ["Due date", formatDate(invoice.dueDate)],
    ...(invoice.paymentTerms ? [["Terms", invoice.paymentTerms] as [string, string]] : []),
    ...getVisibleCustomFields(invoice.customFields).map(
      (f) => [f.label, f.value || "-"] as [string, string],
    ),
  ];

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber}`}
      author={business.name}
      creator="InvoiceStudio"
    >
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed />

        <View style={s.between}>
          <View style={{ maxWidth: 300 }}>
            {logo ? (
              <PdfImage
                src={logo}
                style={{ maxHeight: 40, maxWidth: 140, marginBottom: 8, objectFit: "contain" }}
              />
            ) : null}
            <Text style={s.h1}>{business.name}</Text>
            {business.address ? <Text>{business.address}</Text> : null}
            <Text style={s.muted}>
              {[business.email, business.phone].filter(Boolean).join(" · ")}
            </Text>
            {business.website ? <Text style={s.muted}>{business.website}</Text> : null}
            {business.taxId ? <Text style={s.muted}>Tax ID: {business.taxId}</Text> : null}
          </View>
          <View>
            <Text style={[s.overline, { color: C.accent, textAlign: "right" }]}>Invoice</Text>
            <Text style={s.number}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={[s.between, { marginTop: 24, marginBottom: 20 }]} wrap={false}>
          <View style={{ maxWidth: 260 }}>
            <Text style={s.overline}>Bill to</Text>
            <Text style={s.bold}>{customer.name}</Text>
            {customer.company ? <Text>{customer.company}</Text> : null}
            {customer.address ? <Text>{customer.address}</Text> : null}
            {customer.email ? <Text style={s.muted}>{customer.email}</Text> : null}
            {customer.phone ? <Text style={s.muted}>{customer.phone}</Text> : null}
          </View>
          <View style={{ width: 220 }}>
            {meta.map(([label, value]) => (
              <View key={label} style={[s.between, { marginBottom: 2 }]}>
                <Text style={s.muted}>{label}</Text>
                <Text style={[s.bold, { maxWidth: 140, textAlign: "right" }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[s.row, { paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: C.navy }]}
          fixed
        >
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cPrice]}>Unit price</Text>
          <Text style={[s.th, s.cAmount]}>Amount</Text>
        </View>
        {invoice.lineItems.map((item, index) => (
          <View key={item.id} style={s.tr} wrap={false}>
            <Text style={s.cDesc}>{item.description}</Text>
            <Text style={s.cQty}>{formatQuantity(item.quantity)}</Text>
            <Text style={s.cPrice}>{formatCents(toCents(item.unitPrice))}</Text>
            <Text style={[s.cAmount, s.bold]}>
              {formatCents(totals.lineTotalsCents[index] ?? 0)}
            </Text>
          </View>
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.between}>
            <Text style={s.muted}>Subtotal</Text>
            <Text>{formatCents(totals.subtotalCents)}</Text>
          </View>
          {totals.discountCents > 0 ? (
            <View style={s.between}>
              <Text style={s.muted}>
                {invoice.discountType === "PERCENT"
                  ? `Discount (${formatPercent(invoice.discountValue)})`
                  : "Discount"}
              </Text>
              <Text>-{formatCents(totals.discountCents)}</Text>
            </View>
          ) : null}
          <View style={s.between}>
            <Text style={s.muted}>Tax ({formatPercent(invoice.taxRate)})</Text>
            <Text>{formatCents(totals.taxCents)}</Text>
          </View>
          <View style={s.totalDue}>
            <Text style={s.bold}>TOTAL DUE</Text>
            <Text style={[s.bold, { fontSize: 12 }]}>{formatCents(totals.totalCents)}</Text>
          </View>
        </View>

        {invoice.paymentInstructions || invoice.notes ? (
          <View style={s.footer} wrap={false}>
            {invoice.paymentInstructions ? (
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={s.overline}>Payment instructions</Text>
                <Text>{invoice.paymentInstructions}</Text>
              </View>
            ) : null}
            {invoice.notes ? (
              <View style={{ flex: 1 }}>
                <Text style={s.overline}>Notes</Text>
                <Text style={s.muted}>{invoice.notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text
          style={s.pageNo}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${invoice.invoiceNumber} · Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  invoice: InvoiceData,
  totals: InvoiceTotals,
): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf invoice={invoice} totals={totals} />);
}

/** Safe attachment file name, e.g. "Invoice-INV-2026-0042.pdf". */
export function invoicePdfFilename(invoiceNumber: string): string {
  const safe = invoiceNumber.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "invoice";
  return `Invoice-${safe}.pdf`;
}
