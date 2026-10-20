"use client";

import { Eye, EyeOff, Plus, Tags, Trash2 } from "lucide-react";
import { Controller, get, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FormSection } from "@/components/invoice/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createId } from "@/lib/id";
import { CUSTOM_FIELD_SUGGESTIONS } from "@/lib/invoice/custom-fields";
import type { InvoiceData } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

const MAX_FIELDS = 20;

export function CustomFieldsSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InvoiceData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
    keyName: "key",
  });
  const values = useWatch({ control, name: "customFields" });
  const usedLabels = new Set((values ?? []).map((field) => field.label.trim().toLowerCase()));
  const suggestions = CUSTOM_FIELD_SUGGESTIONS.filter(
    (label) => !usedLabels.has(label.toLowerCase()),
  );
  const atLimit = fields.length >= MAX_FIELDS;

  function addField(label = "") {
    append(
      { id: createId("cf"), label, value: "", visible: true },
      {
        shouldFocus: true,
        focusName: `customFields.${fields.length}.${label ? "value" : "label"}`,
      },
    );
  }

  return (
    <FormSection
      id="section-fields"
      icon={Tags}
      title="Custom fields"
      description="Extra details such as a PO number. Hidden fields are kept but never printed."
      action={
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => addField()}
          disabled={atLimit}
        >
          <Plus aria-hidden />
          Add field
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-sm">
          No custom fields. Add one, or start from a suggestion below.
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => {
            const visible = values?.[index]?.visible ?? true;
            const labelText = values?.[index]?.label?.trim() || `Field ${index + 1}`;
            const labelError = get(errors, `customFields.${index}.label`)?.message as
              string | undefined;
            const valueError = get(errors, `customFields.${index}.value`)?.message as
              string | undefined;
            const ids = {
              label: `cf-${field.id}-label`,
              value: `cf-${field.id}-value`,
              toggle: `cf-${field.id}-visible`,
              error: `cf-${field.id}-error`,
            };

            return (
              <li
                key={field.key}
                data-visible={visible}
                className={cn(
                  "bg-muted/25 grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-2 rounded-xl border p-3 transition-colors sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-end",
                  !visible && "bg-muted/60 border-dashed",
                )}
              >
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={ids.label} className="text-muted-foreground mb-1 block text-xs">
                    Label
                  </label>
                  <Input
                    id={ids.label}
                    placeholder="e.g. Purchase Order"
                    className="h-9"
                    aria-invalid={labelError ? true : undefined}
                    aria-describedby={labelError ? ids.error : undefined}
                    {...register(`customFields.${index}.label`)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={ids.value} className="text-muted-foreground mb-1 block text-xs">
                    Value
                  </label>
                  <Input
                    id={ids.value}
                    placeholder="e.g. PO-1042"
                    className="h-9"
                    aria-invalid={valueError ? true : undefined}
                    aria-describedby={valueError ? ids.error : undefined}
                    {...register(`customFields.${index}.value`)}
                  />
                </div>

                <div className="col-span-2 -mb-1 flex h-9 items-center justify-end gap-1 self-end sm:col-span-1 sm:mb-0">
                  <Controller
                    control={control}
                    name={`customFields.${index}.visible`}
                    render={({ field: toggle }) => (
                      <label
                        htmlFor={ids.toggle}
                        className="hover:bg-muted flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2"
                        title={visible ? "Shown on the invoice" : "Hidden from the invoice"}
                      >
                        <Switch
                          id={ids.toggle}
                          checked={toggle.value}
                          onCheckedChange={toggle.onChange}
                          onBlur={toggle.onBlur}
                          ref={toggle.ref}
                          aria-label={`Show ${labelText} on invoice`}
                        />
                        {visible ? (
                          <Eye className="text-muted-foreground size-4" aria-hidden />
                        ) : (
                          <EyeOff className="text-muted-foreground size-4" aria-hidden />
                        )}
                        <span className="text-muted-foreground w-12 text-xs">
                          {visible ? "Shown" : "Hidden"}
                        </span>
                      </label>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${labelText}`}
                    title="Remove field"
                    onClick={() => remove(index)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>

                {labelError || valueError ? (
                  <p id={ids.error} role="alert" className="text-destructive col-span-full text-xs">
                    {[labelError, valueError].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {suggestions.length > 0 && !atLimit ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Suggestions:</span>
          {suggestions.map((label) => (
            <Button
              key={label}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addField(label)}
            >
              <Plus aria-hidden />
              {label}
            </Button>
          ))}
        </div>
      ) : null}
    </FormSection>
  );
}
