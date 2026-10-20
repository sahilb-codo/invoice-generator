import "server-only";

/**
 * Resend settings, read from server-side environment variables only (never NEXT_PUBLIC_*).
 * See .env.example and docs/ENVIRONMENT_SETUP.md.
 */
export interface EmailConfig {
  apiKey: string;
  /** Sender, e.g. "Northwind Studio <billing@yourdomain.com>" — the domain must be verified in Resend. */
  from: string;
  /** Override of the Resend API URL. Only used by tests to point at a local fake API. */
  baseUrl?: string;
}

export type EmailConfigResult =
  { ok: true; config: EmailConfig } | { ok: false; missing: string[]; invalid: string[] };

/** Values copied from .env.example count as "not configured". */
const PLACEHOLDERS = new Set(["re_your_api_key", "Your Business <billing@example.com>"]);

type Env = Record<string, string | undefined>;

function read(env: Env, key: string): string {
  const value = env[key]?.trim() ?? "";
  return PLACEHOLDERS.has(value) ? "" : value;
}

export function readEmailConfig(env: Env = process.env): EmailConfigResult {
  const apiKey = read(env, "RESEND_API_KEY");
  const from = read(env, "EMAIL_FROM");
  const baseUrl = read(env, "RESEND_BASE_URL");

  const missing: string[] = [];
  const invalid: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  else if (!apiKey.startsWith("re_")) invalid.push("RESEND_API_KEY");
  if (!from) missing.push("EMAIL_FROM");
  else if (!/@[^\s@>]+\.[^\s@>]+/.test(from)) invalid.push("EMAIL_FROM");
  if (baseUrl && !URL.canParse(baseUrl)) invalid.push("RESEND_BASE_URL");

  if (missing.length || invalid.length) return { ok: false, missing, invalid };
  return { ok: true, config: { apiKey, from, baseUrl: baseUrl || undefined } };
}
