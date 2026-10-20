# Phase 07 — Invoice Management

**Status:** ❌ Removed from scope by the developer (2026-10-20). Not implemented.

Prompt: [07-invoice-management.md](../prompts/07-invoice-management.md)

## Decision

An invoice list (search, filter, open, delete) needs stored invoices. When the database was
removed (see [Phase 06](PHASE_06_DATABASE.md)), Claude Code asked whether to drop this phase or
keep a browser-only list in `localStorage`. The developer chose: **"Phase 07 pan kadhi nakho"**
(remove Phase 07 as well).

The app is therefore a single-invoice tool: edit → preview → print / save as PDF → email.
