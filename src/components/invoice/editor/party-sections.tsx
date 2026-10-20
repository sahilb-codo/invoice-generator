"use client";

import { Building2, UserRound } from "lucide-react";

import { FormSection } from "@/components/invoice/form-section";

import { TextareaField, TextField } from "./fields";
import { LogoUpload } from "./logo-upload";

export function BusinessSection() {
  return (
    <FormSection icon={Building2} title="From" description="Your business details.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="business.name"
          label="Business name"
          autoComplete="organization"
          className="sm:col-span-2"
        />
        <TextField name="business.email" label="Email" type="email" autoComplete="email" />
        <TextField name="business.phone" label="Phone" type="tel" autoComplete="tel" />
        <TextareaField name="business.address" label="Address" rows={2} className="sm:col-span-2" />
        <TextField name="business.website" label="Website" optional inputMode="url" />
        <TextField name="business.taxId" label="Tax registration no." optional />
        <div className="sm:col-span-2">
          <LogoUpload />
        </div>
      </div>
    </FormSection>
  );
}

export function CustomerSection() {
  return (
    <FormSection icon={UserRound} title="Bill to" description="Who pays this invoice.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="customer.name" label="Customer name" autoComplete="off" />
        <TextField name="customer.company" label="Company" optional autoComplete="off" />
        <TextField name="customer.email" label="Email" type="email" autoComplete="off" />
        <TextField name="customer.phone" label="Phone" type="tel" optional autoComplete="off" />
        <TextareaField
          name="customer.address"
          label="Billing address"
          rows={2}
          className="sm:col-span-2"
        />
      </div>
    </FormSection>
  );
}
