import "server-only";

import { Resend } from "resend";

import type { EmailConfig } from "./config";

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; name: string; statusCode: number | null; message: string };

/**
 * Sends one email through the Resend API. Never throws: the SDK returns `{ data, error }`,
 * including for network failures.
 */
export async function sendWithResend(
  config: EmailConfig,
  message: { to: string; subject: string; html: string; text: string; replyTo?: string },
): Promise<SendEmailResult> {
  const resend = new Resend(
    config.apiKey,
    config.baseUrl ? { baseUrl: config.baseUrl } : undefined,
  );
  const { data, error } = await resend.emails.send({
    from: config.from,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: message.replyTo,
  });

  if (error || !data?.id) {
    return {
      ok: false,
      name: error?.name ?? "application_error",
      statusCode: error?.statusCode ?? null,
      message: describeResendError(error?.name),
    };
  }
  return { ok: true, id: data.id };
}

/** Maps Resend error names to messages that are safe and useful to show in the UI. */
export function describeResendError(name: string | undefined): string {
  switch (name) {
    case "missing_api_key":
    case "invalid_api_key":
      return "Resend rejected the API key. Check RESEND_API_KEY.";
    case "restricted_api_key":
      return "The Resend API key is not allowed to send emails. Use a key with sending access.";
    case "invalid_from_address":
      return "Resend rejected the sender. EMAIL_FROM must use a domain verified in Resend.";
    case "validation_error":
    case "invalid_parameter":
    case "missing_required_field":
      return "Resend rejected the message. With the resend.dev test sender you can only email your own Resend account address; otherwise verify your domain.";
    case "rate_limit_exceeded":
      return "Resend rate limit reached. Wait a moment and try again.";
    case "daily_quota_exceeded":
    case "monthly_quota_exceeded":
      return "The Resend sending quota has been reached.";
    default:
      return "The email could not be sent. Check your connection and try again.";
  }
}
