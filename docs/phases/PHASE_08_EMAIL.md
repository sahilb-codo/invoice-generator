# Phase 08 — Email Integration (Resend)

**Status:** Implemented and verified against a local fake Resend API. **Real delivery through
Resend not yet verified** — needs the developer's API key in `.env` and a test send to their own
address (see below). Committed as `c626d6c`.

Prompt: [08-email-integration.md](../prompts/08-email-integration.md)

## Objective

Send the invoice by email from the server, with validation, a clear setup message when email is
not configured, and the invoice marked **Sent** only after successful delivery.

## Change of plan: SMTP → Resend

The phase was first built with Nodemailer + SMTP (and tested against a local SMTP server: 67/67
unit/integration tests, 21/21 browser checks). Before it was committed, the developer asked to use
**Resend** instead. The SMTP transport, `SMTP_*` variables and the Nodemailer, `smtp-server` and
`mailparser` packages were removed; everything else (validation, rate limiting, email content,
dialog) was kept and re-tested with Resend.

## Features implemented

- **Send invoice** button → validates the whole form first (focuses the first error; nothing is
  sent while the invoice is invalid) → confirmation dialog with recipient (pre-filled with the
  customer email, editable), customer, amount due and due date.
- The dialog asks the server whether email is configured; if not, it lists the missing / invalid
  variable **names** (never values) and disables Send.
- **Server action `sendInvoiceEmail`** (`src/app/actions/invoice-email.ts`):
  1. validates the recipient (Zod email) and the invoice (`parseInvoice`);
  2. recalculates totals on the server (client totals are ignored);
  3. checks configuration (`RESEND_API_KEY`, `EMAIL_FROM`);
  4. rate-limits (5 sends per minute per server process);
  5. builds a professional HTML + plain-text email;
  6. sends it through the Resend SDK;
  7. returns success **only** when Resend returns an email id.
- Status changes to **Sent** only after success; success / failure toasts; failures are shown
  inside the dialog with an actionable message (invalid key, unverified sender, test-sender
  restriction, rate limit, network).
- **Email content:** invoice number, business, customer, amount due, due date, issue date, terms,
  visible custom fields (hidden ones excluded), line items, subtotal / discount / tax / total,
  payment instructions, notes, business footer; `Reply-To` = business email; all user text
  HTML-escaped. Preview: [phase-08-email.png](../screenshots/phase-08-email.png).

## Files created or modified

| File                                                             | Change                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/app/actions/invoice-email.ts`                               | New. `getEmailStatus`, `sendInvoiceEmail` server actions                        |
| `src/lib/server/email/config.ts`                                 | New. Reads/validates `RESEND_API_KEY`, `EMAIL_FROM`, optional `RESEND_BASE_URL` |
| `src/lib/server/email/resend.ts`                                 | New. Resend SDK call + error-name → message mapping                             |
| `src/lib/server/email/invoice-email.ts`                          | New. Pure HTML/text email builder                                               |
| `src/lib/server/rate-limit.ts`                                   | New. In-memory sliding-window limiter                                           |
| `src/components/invoice/send-invoice-dialog.tsx`                 | New. Button + dialog                                                            |
| `src/components/invoice/invoice-workspace.tsx`                   | Uses `SendInvoiceButton`                                                        |
| `src/lib/server/email/*.test.ts`, `tests/email-delivery.test.ts` | New tests                                                                       |
| `tests/support/fake-resend.mjs`                                  | New. Local fake Resend API (`POST /emails`)                                     |
| `tests/stubs/server-only.ts`, `vitest.config.mts`                | `server-only` alias for Vitest                                                  |
| `scripts/e2e/email.e2e.mjs`, `package.json`                      | Browser checks; `e2e:email`; `resend`, `server-only` deps                       |
| `.env.example`                                                   | `RESEND_API_KEY`, `EMAIL_FROM` (SMTP and unused `APP_URL` removed)              |

## Technical decisions

- **Server Actions** (Next.js 16) for status and send. They are public POST endpoints, so the
  action re-validates everything and never trusts client totals (per `docs/01-app/02-guides/server-actions.md`).
- **Secrets stay on the server:** `server-only` marker on server modules; the status action
  returns variable names only; logs contain the Resend error name and status code, never the key.
- **No fake success:** `ok: true` requires an id from Resend; any error → `SEND_FAILED`, status
  unchanged.
- **Rate limiting** because the app has no authentication and could otherwise be used to send
  arbitrary email; in-memory, per process.
- **Testable without real email:** the SDK's `baseUrl` option points tests at
  `tests/support/fake-resend.mjs`, which mimics Resend's success and error responses. The browser
  test sets every email variable explicitly, so a developer's real key in `.env` is never used.
- **No PDF attachment:** generating a PDF on the server would need a headless browser or a PDF
  library and a second rendering of the invoice; the email carries the full invoice summary
  instead, and the PDF is available via Print / Save as PDF.

## Commands executed

```bash
npm install server-only resend
npm install -D smtp-server @types/smtp-server mailparser @types/mailparser   # SMTP version
npm uninstall nodemailer @types/nodemailer smtp-server @types/smtp-server mailparser @types/mailparser
npm test
npm run typecheck && npm run lint && npm run build
OUT=<scratch> npm run e2e:email
node node_modules/next/dist/bin/next start -p 3123 && BASE=http://localhost:3123 npm run e2e
```

## Verification results (actual)

**Unit + integration — `npm test`: 6 files, 66/66 passed.** Email-specific:

- `config.test.ts` (5): complete config, missing names, `.env.example` placeholders = not
  configured, invalid key prefix / sender / URL, `onboarding@resend.dev` accepted.
- `invoice-email.test.ts` (7): subject, number/customer/total/due date in HTML and text, line
  items and totals, visible custom fields only, HTML escaping (`<script>` neutralised), no
  floating-point artefacts in prices.
- `tests/email-delivery.test.ts` (10) — real server action + real Resend SDK + local fake API:
  sends with `Authorization: Bearer <key>`, correct from / to / reply-to / subject / HTML / text,
  returns Resend's id; client-tampered totals ignored ($8,091.39); not configured / invalid
  recipient / invalid invoice → nothing sent; invalid API key, rejected recipient, unreachable
  API → `SEND_FAILED` and nothing reported as sent; 6th send in a minute → `RATE_LIMITED`;
  status action never contains the key.

**Browser — `npm run e2e:email`: 22/22 passed** (production build, two app instances, fake
Resend API): Draft → dialog summary ($8,091.39, Nov 19, 2026) → recipient pre-filled → send →
success toast → status **Sent** → exactly one email to the chosen recipient with the right
subject/body; invalid recipient → inline error, still Draft; rejected by Resend → error in dialog

- toast, still Draft; invalid invoice → dialog not opened, nothing sent; not configured → setup
  message listing `RESEND_API_KEY (missing)`, `EMAIL_FROM (missing)`, Send disabled; no console
  errors.

**Regression:** `npm run e2e` — 26/26, 23/23, 19/19, 19/19, 22/22; typecheck, lint, build ✅.

Screenshots: [send dialog](../screenshots/phase-08-send-dialog.png),
[sent](../screenshots/phase-08-sent.png), [not configured](../screenshots/phase-08-not-configured.png),
[email](../screenshots/phase-08-email.png).

Issues found and fixed during verification:

- First browser run: 20/21 — the test expected placeholder SMTP user/password to be listed as
  missing; the app correctly treats "no credentials" as allowed. Test fixed (SMTP version).
- Rendered email: quantity and amount columns touched (`$2,400.00 $2,400.00`) → added padding.

### Not yet verified

Real delivery through Resend's servers. `.env` currently has no `RESEND_API_KEY` / `EMAIL_FROM`
(checked by name only; values were not read out). No test email has been sent to any real
address. To verify: follow [ENVIRONMENT_SETUP.md → Setting up Resend](../ENVIRONMENT_SETUP.md#setting-up-resend)
and send to an address you control.

## Known issues

- No PDF attachment (see decisions).
- Status stays **Sent** if the invoice is edited afterwards (no persistence; re-sending is allowed).
- Rate limit is per server process (not shared across instances).
- The send endpoint has no authentication; the rate limit only slows abuse.

## Git commit

- Suggested message: `feat: integrate Resend email delivery`
- Hash: `c626d6c`

## Next phase

[Phase 09 — Testing and Quality](PHASE_09_TESTING.md)
