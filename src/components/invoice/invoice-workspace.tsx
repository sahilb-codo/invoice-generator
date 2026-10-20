"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Printer } from "lucide-react";
import { useMemo } from "react";
import { FormProvider, useForm, useWatch, type Control } from "react-hook-form";

import { AppHeader } from "@/components/app/app-header";
import { AdjustmentsSection } from "@/components/invoice/editor/adjustments-section";
import { InvoiceDetailsSection } from "@/components/invoice/editor/invoice-details-section";
import { LineItemsSection } from "@/components/invoice/editor/line-items-section";
import { NotesSection } from "@/components/invoice/editor/notes-section";
import { BusinessSection, CustomerSection } from "@/components/invoice/editor/party-sections";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { StatusBadge } from "@/components/invoice/status-badge";
import { WorkspaceLayout } from "@/components/invoice/workspace-layout";
import { Button } from "@/components/ui/button";
import { calculateTotals } from "@/lib/invoice/calculations";
import { invoiceSchema } from "@/lib/invoice/schema";
import type { InvoiceData } from "@/lib/invoice/types";

interface InvoiceWorkspaceProps {
  initialInvoice: InvoiceData;
}

/** Owns the invoice form state; the editor writes to it and the preview reads from it. */
export function InvoiceWorkspace({ initialInvoice }: InvoiceWorkspaceProps) {
  const form = useForm<InvoiceData>({
    defaultValues: initialInvoice,
    resolver: zodResolver(invoiceSchema),
    // Validate a field when it loses focus, then live while it is being corrected.
    mode: "onTouched",
  });

  return (
    <FormProvider {...form}>
      <div className="flex min-h-dvh flex-col">
        <AppHeader
          context={<HeaderContext control={form.control} />}
          actions={
            <>
              <Button variant="ghost" size="lg" disabled title="Available in Phase 05">
                <Printer aria-hidden />
                <span className="hidden sm:inline">Print</span>
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
              <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-5">
                <InvoiceDetailsSection />
                <div className="grid gap-5 2xl:grid-cols-2">
                  <BusinessSection />
                  <CustomerSection />
                </div>
                <LineItemsSection />
                <AdjustmentsSection />
                <NotesSection />
              </form>
            }
            preview={<LivePreview control={form.control} />}
          />
        </main>
      </div>
    </FormProvider>
  );
}

function HeaderContext({ control }: { control: Control<InvoiceData> }) {
  const [invoiceNumber, status] = useWatch({ control, name: ["invoiceNumber", "status"] });
  return (
    <>
      <span className="truncate text-sm font-medium">{invoiceNumber || "Untitled invoice"}</span>
      <StatusBadge status={status} />
    </>
  );
}

/** Re-renders on every edit; only this subtree updates, not the whole editor. */
function LivePreview({ control }: { control: Control<InvoiceData> }) {
  const invoice = useWatch({ control }) as InvoiceData;
  const totals = useMemo(() => calculateTotals(invoice), [invoice]);
  return <InvoicePreview invoice={invoice} totals={totals} />;
}
