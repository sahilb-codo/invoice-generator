import { Building2, FileText, ListOrdered, Mail, Printer, Save, UserRound } from "lucide-react";

import { AppHeader } from "@/components/app/app-header";
import { FormField } from "@/components/invoice/form-field";
import { FormSection } from "@/components/invoice/form-section";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { StatusBadge } from "@/components/invoice/status-badge";
import { WorkspaceLayout } from "@/components/invoice/workspace-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateTotals } from "@/lib/invoice/calculations";
import { demoInvoice } from "@/lib/invoice/demo-data";

// Phase 01: static design-system showcase with demo data.
// The editor is read-only until the form is wired up in Phase 02.
export default function Home() {
  const invoice = demoInvoice;
  const totals = calculateTotals(invoice);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        context={
          <>
            <span className="truncate text-sm font-medium">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </>
        }
        actions={
          <>
            <Button variant="ghost" size="lg" disabled title="Available in Phase 05">
              <Printer aria-hidden />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="lg" disabled title="Available in Phase 06">
              <Save aria-hidden />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="lg" disabled title="Available in Phase 08">
              <Mail aria-hidden />
              <span className="hidden sm:inline">Send invoice</span>
            </Button>
          </>
        }
      />

      <main className="flex-1">
        <WorkspaceLayout
          editor={
            <div className="space-y-5">
              <FormSection
                icon={FileText}
                title="Invoice details"
                description="Number, dates and payment terms."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField
                    id="invoiceNumber"
                    label="Invoice number"
                    value={invoice.invoiceNumber}
                  />
                  <ReadOnlyField
                    id="paymentTerms"
                    label="Payment terms"
                    value={invoice.paymentTerms}
                  />
                  <ReadOnlyField id="issueDate" label="Issue date" value={invoice.issueDate} />
                  <ReadOnlyField id="dueDate" label="Due date" value={invoice.dueDate} />
                </div>
              </FormSection>

              <div className="grid gap-5 xl:grid-cols-2">
                <FormSection icon={Building2} title="From" description="Your business details.">
                  <div className="grid gap-4">
                    <ReadOnlyField
                      id="businessName"
                      label="Business name"
                      value={invoice.business.name}
                    />
                    <ReadOnlyField
                      id="businessEmail"
                      label="Email"
                      value={invoice.business.email}
                    />
                  </div>
                </FormSection>
                <FormSection icon={UserRound} title="Bill to" description="Who pays this invoice.">
                  <div className="grid gap-4">
                    <ReadOnlyField
                      id="customerName"
                      label="Customer name"
                      value={invoice.customer.name}
                    />
                    <ReadOnlyField
                      id="customerEmail"
                      label="Email"
                      value={invoice.customer.email}
                    />
                  </div>
                </FormSection>
              </div>

              <FormSection
                icon={ListOrdered}
                title="Line items"
                description="Products and services."
              >
                <ul className="divide-y">
                  {invoice.lineItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                    >
                      <span className="min-w-0 truncate">{item.description}</span>
                      <span className="numeric text-muted-foreground shrink-0">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </FormSection>
            </div>
          }
          preview={<InvoicePreview invoice={invoice} totals={totals} />}
        />
      </main>
    </div>
  );
}

function ReadOnlyField({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <FormField id={id} label={label}>
      <Input id={id} value={value} readOnly className="h-9" />
    </FormField>
  );
}
