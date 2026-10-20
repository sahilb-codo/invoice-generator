"use client";

import { NotebookPen } from "lucide-react";

import { FormSection } from "@/components/invoice/form-section";

import { TextareaField } from "./fields";

export function NotesSection() {
  return (
    <FormSection
      icon={NotebookPen}
      title="Notes & payment"
      description="Shown at the bottom of the invoice."
    >
      <div className="grid gap-4">
        <TextareaField
          name="paymentInstructions"
          label="Payment instructions"
          optional
          rows={3}
          placeholder="Bank details, payment link or accepted methods"
        />
        <TextareaField
          name="notes"
          label="Notes"
          optional
          rows={2}
          placeholder="A thank-you note or additional terms"
        />
      </div>
    </FormSection>
  );
}
