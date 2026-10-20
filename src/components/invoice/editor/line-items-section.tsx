"use client";

import { ListOrdered, Plus, Trash2 } from "lucide-react";
import { get, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FormSection } from "@/components/invoice/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createId } from "@/lib/id";
import { lineTotalCents } from "@/lib/invoice/calculations";
import { formatCents } from "@/lib/invoice/format";
import type { InvoiceData } from "@/lib/invoice/types";

const LINE_FIELDS = ["description", "quantity", "unitPrice"] as const;

export function LineItemsSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InvoiceData>();
  // keyName "key": our items already have a persistent `id` that must not be overwritten.
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems", keyName: "key" });
  const items = useWatch({ control, name: "lineItems" });
  const listError: string | undefined =
    errors.lineItems?.root?.message ?? errors.lineItems?.message;

  function addItem() {
    append(
      { id: createId("li"), description: "", quantity: 1, unitPrice: 0 },
      { shouldFocus: true, focusName: `lineItems.${fields.length}.description` },
    );
  }

  return (
    <FormSection
      icon={ListOrdered}
      title="Line items"
      description="Products and services on this invoice."
      action={
        <Button type="button" variant="outline" size="lg" onClick={addItem}>
          <Plus aria-hidden />
          Add item
        </Button>
      }
    >
      <div className="@container">
        {fields.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            No line items yet. Add the first product or service.
          </div>
        ) : (
          <>
            {/* Column labels (wide containers only) */}
            <div
              className="text-muted-foreground hidden grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_6.5rem_2.25rem] gap-3 px-1 pb-2 text-xs font-medium @xl:grid"
              aria-hidden
            >
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            <ol className="space-y-3 @xl:space-y-2">
              {fields.map((field, index) => {
                const item = items?.[index];
                const amount = item ? lineTotalCents(item.quantity, item.unitPrice) : 0;
                const label = `Line ${index + 1}`;
                const ids = {
                  description: `li-${field.key}-desc`,
                  quantity: `li-${field.key}-qty`,
                  unitPrice: `li-${field.key}-price`,
                  error: `li-${field.key}-error`,
                };
                const rowErrors = LINE_FIELDS.map(
                  (name) =>
                    get(errors, `lineItems.${index}.${name}`)?.message as string | undefined,
                );
                const invalid = (name: (typeof LINE_FIELDS)[number]) =>
                  rowErrors[LINE_FIELDS.indexOf(name)]
                    ? { "aria-invalid": true, "aria-describedby": ids.error }
                    : {};

                return (
                  <li
                    key={field.key}
                    className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-end gap-2 rounded-lg border p-3 @xl:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem_6.5rem_2.25rem] @xl:gap-3 @xl:border-0 @xl:p-1"
                  >
                    <div className="col-span-3 @xl:col-span-1">
                      <label htmlFor={ids.description} className="sr-only">
                        {label} description
                      </label>
                      <Input
                        id={ids.description}
                        placeholder="Description"
                        className="h-9"
                        {...invalid("description")}
                        {...register(`lineItems.${index}.description`)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={ids.quantity}
                        className="text-muted-foreground mb-1 block text-xs @xl:sr-only"
                      >
                        Qty<span className="sr-only"> for {label.toLowerCase()}</span>
                      </label>
                      <Input
                        id={ids.quantity}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        className="numeric h-9 text-right"
                        {...invalid("quantity")}
                        {...register(`lineItems.${index}.quantity`, {
                          valueAsNumber: true,
                          deps: ["discountValue"],
                        })}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={ids.unitPrice}
                        className="text-muted-foreground mb-1 block text-xs @xl:sr-only"
                      >
                        Unit price<span className="sr-only"> for {label.toLowerCase()}</span>
                      </label>
                      <div className="relative">
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm">
                          $
                        </span>
                        <Input
                          id={ids.unitPrice}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          className="numeric h-9 pl-6 text-right"
                          {...invalid("unitPrice")}
                          {...register(`lineItems.${index}.unitPrice`, {
                            valueAsNumber: true,
                            deps: ["discountValue"],
                          })}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-muted-foreground mb-1 block text-xs @xl:hidden">
                        Amount
                      </span>
                      <output
                        aria-label={`${label} amount`}
                        className="numeric flex h-9 items-center justify-end text-sm font-medium"
                      >
                        {formatCents(amount)}
                      </output>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      className="text-muted-foreground hover:text-destructive col-start-4 row-start-1 justify-self-end @xl:col-start-5"
                      aria-label={`Remove ${label.toLowerCase()}`}
                      title="Remove item"
                      onClick={() => remove(index)}
                    >
                      <Trash2 aria-hidden />
                    </Button>

                    {rowErrors.some(Boolean) ? (
                      <p
                        id={ids.error}
                        role="alert"
                        className="text-destructive col-span-full text-xs"
                      >
                        {rowErrors.filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </>
        )}
        {listError ? (
          <p role="alert" className="text-destructive mt-3 text-xs">
            {listError}
          </p>
        ) : null}
      </div>
    </FormSection>
  );
}
