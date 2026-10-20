# Prompt 08 — SMTP Email Integration

> **Source:** Extracted verbatim from the master prompt supplied on 2026-10-20
> ("PHASE 9 — SMTP Email Integration").

Implement actual server-side email delivery using Nodemailer.

Environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

Store these only on the server.

Create `.env.example` containing placeholder values, never real credentials.

## Email workflow

1. User saves an invoice.
2. User clicks Send Invoice.
3. The backend retrieves the saved invoice.
4. The backend validates the recipient.
5. A professional HTML email is generated.
6. The email contains invoice number, customer, total, due date, and an invoice summary or link.
7. Send the message through configured SMTP.
8. Update the invoice status to Sent only after successful delivery.
9. Show a clear success or failure notification.

If SMTP is not configured, show a useful setup message.

Do not simulate email delivery or mark an invoice Sent after a failed send.

Only send test emails to an address controlled by the developer. Never send test messages
automatically.

If attaching a PDF is practical within the time limit, implement it reliably. Otherwise, document
the limitation and provide a working invoice summary or printable link when appropriate.

Document setup, security, and limitations. Commit the phase.
