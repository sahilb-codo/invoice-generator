"use client";

import { Percent } from "lucide-react";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSection } from "@/components/invoice/form-section";
import { calculateTotals } from "@/lib/invoice/calculations";
import { formatCents, formatPercent } from "@/lib/invoice/format";
import type { DiscountType, InvoiceData } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

import { NumberField } from "./fields";

const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "FIXED", label: "Amount ($)" },
  { value: "PERCENT", label: "Percent (%)" },
];

export function AdjustmentsSection() {
  const { register, control } = useFormContext<InvoiceData>();
  const [lineItems, discountType, discountValue, taxRate] = useWatch({
    control,
    name: ["lineItems", "discountType", "discountValue", "taxRate"],
  });
  const totals = useMemo(
    () => calculateTotals({ lineItems: lineItems ?? [], discountType, discountValue, taxRate }),
    [lineItems, discountType, discountValue, taxRate],
  );

  return (
    <FormSection
      icon={Percent}
      title="Discount & tax"
      description="Discount is applied first; tax is charged on the discounted amount."
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <fieldset className="grid gap-1.5 sm:col-span-2">
            <legend className="text-foreground/80 mb-1.5 text-xs font-medium">Discount type</legend>
            <div className="bg-muted inline-grid w-full grid-cols-2 rounded-lg p-[3px] sm:w-fit">
              {DISCOUNT_OPTIONS.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    value={option.value}
                    className="peer sr-only"
                    {...register("discountType", { deps: ["discountValue"] })}
                  />
                  <span
                    className={cn(
                      "text-foreground/60 hover:text-foreground flex h-8 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                      "peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm",
                      "peer-focus-visible:ring-ring/50 peer-focus-visible:ring-3",
                    )}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <NumberField
            name="discountValue"
            label={discountType === "PERCENT" ? "Discount (%)" : "Discount amount"}
            prefix={discountType === "PERCENT" ? undefined : "$"}
            suffix={discountType === "PERCENT" ? "%" : undefined}
            step={discountType === "PERCENT" ? "any" : "0.01"}
          />
          <NumberField name="taxRate" label="Tax rate" suffix="%" />
        </div>

        <dl
          aria-label="Totals breakdown"
          className="bg-muted/50 numeric grid content-start gap-1.5 rounded-lg border p-4 text-sm"
        >
          <BreakdownRow label="Subtotal" value={formatCents(totals.subtotalCents)} />
          <BreakdownRow
            label={
              discountType === "PERCENT" ? `Discount (${formatPercent(discountValue)})` : "Discount"
            }
            value={`−${formatCents(totals.discountCents)}`}
          />
          <BreakdownRow label="Taxable amount" value={formatCents(totals.taxableCents)} />
          <BreakdownRow
            label={`Tax (${formatPercent(taxRate)})`}
            value={formatCents(totals.taxCents)}
          />
          <div className="mt-1.5 flex items-baseline justify-between border-t pt-2.5">
            <dt className="font-semibold">Total</dt>
            <dd className="text-primary text-base font-semibold">
              {formatCents(totals.totalCents)}
            </dd>
          </div>
        </dl>
      </div>
    </FormSection>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
