# API Documentation

Two Server Actions in [`src/app/actions/invoice-email.ts`](../src/app/actions/invoice-email.ts).
Database CRUD was descoped (see [phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)).

Server Actions are invoked from client components and run as POST requests to the page; treat
them as public endpoints.

## `getEmailStatus(): Promise<EmailStatus>`

Reports whether email can be sent. Returns variable **names** only, never values.

```ts
type EmailStatus =
  { configured: true } | { configured: false; missing: string[]; invalid: string[] }; // e.g. ["RESEND_API_KEY"]
```

## `sendInvoiceEmail(input: { recipient: string; invoice: InvoiceData }): Promise<SendInvoiceResult>`

Order of checks: recipient (Zod email) → invoice (`parseInvoice`, same schema as the editor) →
configuration → rate limit (5 per minute per process) → send through Resend.

```ts
type SendInvoiceResult =
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
```

- Totals are recalculated from the validated invoice; any totals in the payload are ignored.
- `ok: true` only when Resend returns an email id. The client sets status **Sent** only then.
- `SEND_FAILED` messages map Resend error names to actionable text (invalid key, unverified
  sender, test-sender restriction, quota, network). Logs include the error name and HTTP status,
  never the API key.
- Payload limit: Next.js caps Server Action bodies at 1 MB; logos are limited to ~256 KB.
