# Database Schema

**No database.** Persistence was removed from scope by the developer on 2026-10-20 (see
[phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)).

Invoice data lives only in the browser's form state (React Hook Form) for the current tab. Its
shape is the `InvoiceData` type in [`src/lib/invoice/types.ts`](../src/lib/invoice/types.ts),
validated by [`src/lib/invoice/schema.ts`](../src/lib/invoice/schema.ts).

If persistence is added later, the natural mapping is one `Invoice` row with the scalar fields as
columns, line items and custom fields as child tables (or JSON), and the server-recalculated
totals stored in integer cents.
