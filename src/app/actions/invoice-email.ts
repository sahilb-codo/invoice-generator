"use server";

import { z } from "zod";

import { parseInvoice } from "@/lib/invoice/schema";
import { readEmailConfig } from "@/lib/server/email/config";
import { buildInvoiceEmail } from "@/lib/server/email/invoice-email";
import { sendWithResend } from "@/lib/server/email/resend";
import { createRateLimiter } from "@/lib/server/rate-limit";

/**
 * Server actions for emailing an invoice through Resend. These are public POST endpoints: every
 * input is validated here, totals are recalculated on the server, and nothing is reported as sent
 * unless Resend accepted the message and returned an email id.
 */

export type EmailStatus =
  { configured: true } | { configured: false; missing: string[]; invalid: string[] };

export type SendInvoiceResult =
  | { ok: true; recipient: string; emailId: string; sentAt: string; totalCents: number }
  | { ok: false; code: "INVALID_INVOICE"; message: string; fieldErrors: Record<string, string> }
  | { ok: false; code: "INVALID_RECIPIENT"; message: string }
  | {
      ok: false;
      code: "EMAIL_NOT_CONFIGURED";
      message: string;
      missing: string[];
      invalid: string[];
    }
  | { ok: false; code: "RATE_LIMITED"; message: string }
  | { ok: false; code: "SEND_FAILED"; message: string };

const sendLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

const requestSchema = z.object({
  recipient: z.string().trim().pipe(z.email()),
  invoice: z.unknown(),
});

export async function getEmailStatus(): Promise<EmailStatus> {
  const result = readEmailConfig();
  // Only report variable names — never values.
  return result.ok
    ? { configured: true }
    : { configured: false, missing: result.missing, invalid: result.invalid };
}

export async function sendInvoiceEmail(input: unknown): Promise<SendInvoiceResult> {
  const request = requestSchema.safeParse(input);
  if (!request.success) {
    return {
      ok: false,
      code: "INVALID_RECIPIENT",
      message: "Enter a valid recipient email address.",
    };
  }

  const parsed = parseInvoice(request.data.invoice);
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INVOICE",
      message: "The invoice has invalid fields. Fix them and try again.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const email = readEmailConfig();
  if (!email.ok) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "Email is not configured on the server.",
      missing: email.missing,
      invalid: email.invalid,
    };
  }

  if (!sendLimiter.take()) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: "Too many emails sent in a short time. Wait a minute and try again.",
    };
  }

  const recipient = request.data.recipient;
  const content = buildInvoiceEmail(parsed.invoice, parsed.totals);
  const result = await sendWithResend(email.config, {
    to: recipient,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo: parsed.invoice.business.email || undefined,
  });

  if (!result.ok) {
    // Log the error name and status for the developer; never the API key.
    console.error("[sendInvoiceEmail] Resend send failed", {
      name: result.name,
      statusCode: result.statusCode,
    });
    return { ok: false, code: "SEND_FAILED", message: result.message };
  }

  return {
    ok: true,
    recipient,
    emailId: result.id,
    sentAt: new Date().toISOString(),
    totalCents: parsed.totals.totalCents,
  };
}
