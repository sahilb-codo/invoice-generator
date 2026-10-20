"use client";

import { Building2, UserRound, Users, type LucideIcon } from "lucide-react";

import { FormSection } from "@/components/invoice/form-section";
import { cn } from "@/lib/utils";

import { TextareaField, TextField } from "./fields";
import { LogoUpload } from "./logo-upload";

/**
 * Business ("From") and customer ("Bill to") side by side when the section is wide enough,
 * stacked otherwise. Inside each party the fields use two columns only when stacked.
 */
const FULL_ROW = "@md:col-span-2 @2xl:col-span-1";

export function PartiesSection() {
  return (
    <FormSection
      id="section-parties"
      icon={Users}
      title="From & Bill to"
      description="Your business details and the customer who pays this invoice."
    >
      <div className="@container">
        <div className="grid gap-6 @2xl:grid-cols-2 @2xl:gap-0">
          <Party icon={Building2} title="From" description="Your business" className="@2xl:pr-6">
            <TextField
              name="business.name"
              label="Business name"
              autoComplete="organization"
              placeholder="e.g. Northwind Studio"
              className={FULL_ROW}
            />
            <TextField
              name="business.email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="billing@yourcompany.com"
            />
            <TextField
              name="business.phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 000-0000"
            />
            <TextareaField
              name="business.address"
              label="Address"
              rows={2}
              placeholder={"Street, suite\nCity, state, postal code"}
              className={FULL_ROW}
            />
            <TextField
              name="business.website"
              label="Website"
              optional
              inputMode="url"
              placeholder="yourcompany.com"
            />
            <TextField
              name="business.taxId"
              label="Tax registration no."
              optional
              placeholder="e.g. EIN or VAT number"
            />
            <div className={FULL_ROW}>
              <LogoUpload />
            </div>
          </Party>

          <Party
            icon={UserRound}
            title="Bill to"
            description="Who pays this invoice"
            className="border-t pt-6 @2xl:border-t-0 @2xl:border-l @2xl:pt-0 @2xl:pl-6"
          >
            <TextField
              name="customer.name"
              label="Customer name"
              autoComplete="off"
              placeholder="e.g. Ava Thompson"
            />
            <TextField
              name="customer.company"
              label="Company"
              optional
              autoComplete="off"
              placeholder="Customer's company"
            />
            <TextField
              name="customer.email"
              label="Email"
              type="email"
              autoComplete="off"
              placeholder="customer@example.com"
            />
            <TextField
              name="customer.phone"
              label="Phone"
              type="tel"
              optional
              autoComplete="off"
              placeholder="+1 (555) 000-0000"
            />
            <TextareaField
              name="customer.address"
              label="Billing address"
              rows={2}
              placeholder={"Street, suite\nCity, state, postal code"}
              className={FULL_ROW}
            />
          </Party>
        </div>
      </div>
    </FormSection>
  );
}

function Party({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="bg-accent text-accent-foreground grid size-8 shrink-0 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm leading-5 font-semibold">{title}</h3>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 @md:grid-cols-2 @2xl:grid-cols-1">{children}</div>
    </div>
  );
}
