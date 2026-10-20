"use client";

import { get, useFormContext, type FieldPath } from "react-hook-form";

import { FormField } from "@/components/invoice/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceData } from "@/lib/invoice/types";

type InvoicePath = FieldPath<InvoiceData>;

interface BaseFieldProps {
  name: InvoicePath;
  label: string;
  optional?: boolean;
  hint?: string;
  placeholder?: string;
  className?: string;
}

/** Field ids derived from the form path, e.g. "business.name" → "business-name". */
export function fieldId(name: string): string {
  return name.replaceAll(".", "-");
}

function useFieldError(name: InvoicePath): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<InvoiceData>();
  return get(errors, name)?.message as string | undefined;
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function TextField({
  name,
  label,
  optional,
  hint,
  placeholder,
  className,
  type = "text",
  autoComplete,
  inputMode,
  list,
}: BaseFieldProps & {
  type?: "text" | "email" | "tel" | "url" | "date";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  list?: string;
}) {
  const { register } = useFormContext<InvoiceData>();
  const id = fieldId(name);
  const error = useFieldError(name);

  return (
    <FormField
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      className={className}
    >
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        list={list}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="h-9"
        {...register(name)}
      />
    </FormField>
  );
}

export function TextareaField({
  name,
  label,
  optional,
  hint,
  placeholder,
  className,
  rows = 3,
}: BaseFieldProps & { rows?: number }) {
  const { register } = useFormContext<InvoiceData>();
  const id = fieldId(name);
  const error = useFieldError(name);

  return (
    <FormField
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      className={className}
    >
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="min-h-0 resize-y"
        {...register(name)}
      />
    </FormField>
  );
}
