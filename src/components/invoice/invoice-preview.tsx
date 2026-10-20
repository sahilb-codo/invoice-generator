import { toCents, type InvoiceTotals } from "@/lib/invoice/calculations";
import { formatCents, formatDate, formatPercent, formatQuantity } from "@/lib/invoice/format";
import type { InvoiceData } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

interface InvoicePreviewProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
  className?: string;
}

/** The invoice as a business document. Renders only data — no editor controls. */
export function InvoicePreview({ invoice, totals, className }: InvoicePreviewProps) {
  const { business, customer } = invoice;
  const visibleFields = invoice.customFields.filter(
    (field) => field.visible && (field.label.trim() || field.value.trim()),
  );

  return (
    <article
      aria-label={`Invoice ${invoice.invoiceNumber}`}
      className={cn(
        "invoice-document bg-paper shadow-paper ring-foreground/[0.06] relative overflow-hidden rounded-xl text-[12.5px] leading-relaxed ring-1",
        className,
      )}
    >
      <div className="bg-primary h-1.5" aria-hidden />

      <div className="space-y-8 p-6 sm:p-9">
        {/* Header */}
        <header className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            {business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
              <img
                src={business.logoDataUrl}
                alt={`${business.name || "Business"} logo`}
                className="max-h-12 max-w-40 object-contain"
              />
            ) : null}
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                {business.name || "Your business"}
              </p>
              <AddressBlock text={business.address} />
              <p className="text-muted-foreground">
                {[business.email, business.phone].filter(Boolean).join(" · ")}
              </p>
              {business.website ? (
                <p className="text-muted-foreground">{business.website}</p>
              ) : null}
              {business.taxId ? (
                <p className="text-muted-foreground">Tax ID: {business.taxId}</p>
              ) : null}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
              Invoice
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight break-all">
              {invoice.invoiceNumber || "—"}
            </p>
          </div>
        </header>

        {/* Parties and metadata */}
        <section className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionLabel>Bill to</SectionLabel>
            <p className="font-semibold">{customer.name || "Customer name"}</p>
            {customer.company ? <p>{customer.company}</p> : null}
            <AddressBlock text={customer.address} />
            {customer.email ? <p className="text-muted-foreground">{customer.email}</p> : null}
            {customer.phone ? <p className="text-muted-foreground">{customer.phone}</p> : null}
          </div>

          <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1.5">
            <MetaRow label="Issue date" value={formatDate(invoice.issueDate)} />
            <MetaRow label="Due date" value={formatDate(invoice.dueDate)} />
            {invoice.paymentTerms ? <MetaRow label="Terms" value={invoice.paymentTerms} /> : null}
            {visibleFields.map((field) => (
              <MetaRow key={field.id} label={field.label} value={field.value} />
            ))}
          </dl>
        </section>

        {/* Line items */}
        <section>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-muted-foreground border-foreground/80 border-b text-[10.5px] tracking-wider uppercase">
                <th scope="col" className="py-2 pr-3 text-left font-semibold">
                  Description
                </th>
                <th scope="col" className="w-12 px-2 py-2 text-right font-semibold sm:w-16">
                  Qty
                </th>
                <th
                  scope="col"
                  className="hidden w-24 px-2 py-2 text-right font-semibold sm:table-cell"
                >
                  Unit price
                </th>
                <th scope="col" className="w-24 py-2 pl-2 text-right font-semibold sm:w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted-foreground py-6 text-center">
                    No line items yet.
                  </td>
                </tr>
              ) : (
                invoice.lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b align-top">
                    <td className="py-2.5 pr-3 break-words">
                      {item.description || (
                        <span className="text-muted-foreground">Untitled item</span>
                      )}
                      <span className="text-muted-foreground block sm:hidden">
                        {formatCents(toCents(item.unitPrice))} each
                      </span>
                    </td>
                    <td className="numeric px-2 py-2.5 text-right">
                      {formatQuantity(item.quantity)}
                    </td>
                    <td className="numeric hidden px-2 py-2.5 text-right sm:table-cell">
                      {formatCents(toCents(item.unitPrice))}
                    </td>
                    <td className="numeric py-2.5 pl-2 text-right font-medium">
                      {formatCents(totals.lineTotalsCents[index] ?? 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="invoice-totals mt-4 flex justify-end">
            <dl className="numeric w-full max-w-72 space-y-1.5">
              <TotalRow label="Subtotal" value={formatCents(totals.subtotalCents)} />
              {totals.discountCents > 0 ? (
                <TotalRow
                  label={
                    invoice.discountType === "PERCENT"
                      ? `Discount (${formatPercent(invoice.discountValue)})`
                      : "Discount"
                  }
                  value={`−${formatCents(totals.discountCents)}`}
                />
              ) : null}
              <TotalRow
                label={`Tax (${formatPercent(invoice.taxRate)})`}
                value={formatCents(totals.taxCents)}
              />
              <div className="bg-accent text-accent-foreground mt-3 flex items-baseline justify-between rounded-lg px-3 py-2.5">
                <dt className="text-xs font-semibold tracking-wide uppercase">Total due</dt>
                <dd className="text-lg font-semibold tracking-tight">
                  {formatCents(totals.totalCents)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Footer */}
        {invoice.notes || invoice.paymentInstructions ? (
          <footer className="invoice-footer grid gap-5 border-t pt-6 sm:grid-cols-2">
            {invoice.paymentInstructions ? (
              <div>
                <SectionLabel>Payment instructions</SectionLabel>
                <p className="whitespace-pre-line">{invoice.paymentInstructions}</p>
              </div>
            ) : null}
            {invoice.notes ? (
              <div>
                <SectionLabel>Notes</SectionLabel>
                <p className="text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            ) : null}
          </footer>
        ) : null}
      </div>
    </article>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-1.5 text-[10.5px] font-semibold tracking-wider uppercase">
      {children}
    </p>
  );
}

function AddressBlock({ text }: { text: string }) {
  return text ? <p className="whitespace-pre-line">{text}</p> : null;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium break-words">{value || "—"}</dd>
    </>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
