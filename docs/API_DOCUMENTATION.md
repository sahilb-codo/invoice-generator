# API Documentation

> Status: no server operations yet. The only planned server endpoint is the email send action
> (Phase 08). Database CRUD was descoped (see [phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)).

The email action will validate the submitted invoice with `parseInvoice()` and recalculate totals
on the server; totals sent by the browser are ignored.
