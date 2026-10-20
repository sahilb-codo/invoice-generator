# Environment Setup

## Prerequisites

- Node.js **≥ 20.19** (developed on Node.js 22.23.3, npm 10.9.9)
- Git
- A [Resend](https://resend.com) account and API key (only needed to send emails)

## Install

```bash
git clone <repository-url>
cd invoice-generator
npm install
cp .env.example .env   # then edit .env
```

## Environment variables

All variables are read **server-side only** (none use the `NEXT_PUBLIC_` prefix). Never commit
`.env`.

| Variable          | Required  | Example                                     | Purpose                                                                         |
| ----------------- | --------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| `RESEND_API_KEY`  | for email | `re_…`                                      | Resend API key with sending access                                              |
| `EMAIL_FROM`      | for email | `Northwind Studio <billing@yourdomain.com>` | Sender. Its domain must be verified in Resend                                   |
| `RESEND_BASE_URL` | no        | `http://127.0.0.1:4010`                     | Overrides the Resend API URL. Used only by the automated tests (fake local API) |

Without `RESEND_API_KEY` and `EMAIL_FROM` the app still works; the Send dialog shows which
variables are missing and keeps the Send button disabled.

## Setting up Resend

1. Create an API key at <https://resend.com/api-keys> (permission: _Sending access_) and put it in
   `.env` as `RESEND_API_KEY="re_…"`.
2. Choose a sender:
   - **Quick test without a domain:** `EMAIL_FROM="Invoice Studio <onboarding@resend.dev>"`.
     Resend then only delivers to the email address of your own Resend account — send the test
     invoice to that address.
   - **Real use:** verify your domain at <https://resend.com/domains> and use an address on it,
     e.g. `EMAIL_FROM="Northwind Studio <billing@yourdomain.com>"`.
3. Restart `npm run dev` / `npm start` so the server reads the new values.
4. Click **Send invoice**, enter **your own** address and send. The status changes to **Sent**
   only after Resend accepts the message; the email also appears in the Resend dashboard (Emails).

## Scripts

| Script                            | What it does                                                |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Start the dev server on http://localhost:3000               |
| `npm run build` / `npm start`     | Production build / serve                                    |
| `npm run typecheck`               | `tsc --noEmit`                                              |
| `npm run lint`                    | ESLint                                                      |
| `npm test`                        | Vitest (single run)                                         |
| `npm run test:watch`              | Vitest watch mode                                           |
| `npm run format` / `format:check` | Prettier write / check                                      |
| `npm run e2e`                     | Browser checks (needs `npm run build` and a running server) |
| `npm run check`                   | typecheck + lint + test                                     |

No database is required (persistence was descoped — see
[phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)).
