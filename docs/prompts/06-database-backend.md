# Prompt 06 — Database and Backend

> **Source:** Extracted verbatim from the master prompt supplied on 2026-10-20
> ("PHASE 7 — Database and Backend").

Use Prisma with SQLite for local development.

Keep the data layer structured so a later PostgreSQL migration is practical.

Create a persistent Invoice model that stores:

- Database ID.
- Invoice number.
- Business information.
- Customer information.
- Invoice dates.
- Currency.
- Line items.
- Discount type and value.
- Tax rate.
- Notes and payment instructions.
- Custom fields and visibility.
- Invoice status.
- Calculated totals.
- Creation and update timestamps.

Implement real server-side operations for:

- Creating invoices.
- Saving invoices.
- Updating invoices.
- Retrieving a single invoice.
- Listing invoices.
- Deleting invoices.
- Recalculating totals on the server.
- Validating submitted data.

Use Zod or equivalent validation on the server.

Do not use localStorage as a replacement for database persistence.

## Persistence acceptance test

1. Edit an invoice.
2. Save it.
3. Refresh the browser.
4. Open the saved invoice.
5. Verify business details, customer details, line items, custom fields, discount, tax, and totals.

The data must come from the database.

Document schema decisions, API contracts, setup, and migration instructions. Commit the phase.
