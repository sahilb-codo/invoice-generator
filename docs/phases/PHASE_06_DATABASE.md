# Phase 06 — Database and Backend

**Status:** ❌ Removed from scope by the developer (2026-10-20). Not implemented.

Prompt: [06-database-backend.md](../prompts/06-database-backend.md)

## Decision

After Phase 03 the developer instructed (original in Gujarati, translated):

> "There is no need for database and backend work — we don't need to store anything. If a backend
> is needed for email in the future, keep it; otherwise remove the 6th phase."

## What changed

- Removed Prisma, `@prisma/client`, `@prisma/adapter-better-sqlite3`, `better-sqlite3` and `dotenv`
  (dotenv was only used by the Prisma config; Next.js loads `.env` itself).
- Deleted `prisma.config.ts` and `prisma/schema.prisma`; removed `db:*` scripts,
  `DATABASE_URL` from `.env.example`, and the Prisma entries in `.gitignore` / `.prettierignore`.
- Removed the "Saved" invoice status and the disabled Save button — nothing is saved any more.
  Status is now Draft → Sent.
- **Kept:** server-side code for email (Phase 08). The shared `parseInvoice()` validation and
  server-side recalculation (Phase 03) will be used by the email server action, so the server
  still never trusts client-calculated totals.

## Consequences

- Invoices exist only in the open browser tab; refreshing the page resets to the demo invoice.
- The brief's requirements "persistent backend storage", "invoice retrieval after reload" and
  "hidden fields stay hidden after saving and reloading" are **not met by design**; see
  [KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md).

## Git commit

- Suggested message: `chore: remove database layer and descope invoice management`
- Hash: `7bd136d`
