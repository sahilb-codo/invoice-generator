"use client";

import { FileText, RefreshCw } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormField } from "@/components/invoice/form-field";
import { FormSection } from "@/components/invoice/form-section";
import { StatusBadge } from "@/components/invoice/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInvoiceNumber } from "@/lib/invoice/invoice-number";
import type { InvoiceData } from "@/lib/invoice/types";

import { TextField } from "./fields";

const PAYMENT_TERMS = ["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"];

export function InvoiceDetailsSection() {
  const { register, setValue, control } = useFormContext<InvoiceData>();
  const status = useWatch({ control, name: "status" });

  return (
    <FormSection
      icon={FileText}
      title="Invoice details"
      description="Number, dates and payment terms."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="invoiceNumber"
          label="Invoice number"
          hint="Generated automatically — edit if you use your own scheme."
        >
          <div className="flex gap-2">
            <Input
              id="invoiceNumber"
              className="h-9"
              autoComplete="off"
              aria-describedby="invoiceNumber-hint"
              {...register("invoiceNumber")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              title="Generate a new invoice number"
              aria-label="Generate a new invoice number"
              onClick={() =>
                setValue("invoiceNumber", generateInvoiceNumber(), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <RefreshCw aria-hidden />
            </Button>
          </div>
        </FormField>

        <TextField
          name="paymentTerms"
          label="Payment terms"
          optional
          placeholder="e.g. Net 30"
          list="payment-terms-options"
        />
        <datalist id="payment-terms-options">
          {PAYMENT_TERMS.map((term) => (
            <option key={term} value={term} />
          ))}
        </datalist>

        <TextField name="issueDate" label="Issue date" type="date" />
        <TextField name="dueDate" label="Due date" type="date" />

        <FormField id="currency" label="Currency">
          <Input id="currency" value="USD — US Dollar" readOnly disabled className="h-9" />
        </FormField>

        <div className="grid gap-1.5">
          <span className="text-foreground/80 text-xs font-medium">Status</span>
          <div className="flex h-9 items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-muted-foreground text-xs">Updated when you save or send.</span>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
