# Project Overview

A browser-based, customizable **Invoice Generator** built for a full-stack developer assessment.

Users edit an invoice (business, customer, metadata, line items, discount, tax, custom fields) and
see a live preview. The invoice can be printed / saved as PDF through the browser and emailed
through a real SMTP server.

## Assessment constraints

- Maximum development time: 3 hours.
- Deliverables: public GitHub repository URL and a Loom / unlisted YouTube walkthrough.
- A partially completed but honestly documented implementation is acceptable.

## Scope changes

| Date                        | Change                                                                                          | Decided by                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 2026-10-20 (after Phase 03) | **Database removed** (Phase 06): "we don't need to store anything"; backend kept only for email | Developer                                    |
| 2026-10-20 (after Phase 03) | **Invoice management removed** (Phase 07): an invoice list needs storage                        | Developer (answer to Claude Code's question) |

Details: [phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md),
[phases/PHASE_07_INVOICE_MANAGEMENT.md](phases/PHASE_07_INVOICE_MANAGEMENT.md).

## Priorities (from the brief, adjusted)

1. Project setup and Git
2. Premium invoice UI
3. Correct calculations
4. Custom fields
5. Print functionality
6. ~~Database persistence~~ — descoped
7. Email integration (server-side)
8. Testing and documentation

Progress is tracked in [REQUIREMENTS.md](REQUIREMENTS.md) and the [phase reports](phases/).
