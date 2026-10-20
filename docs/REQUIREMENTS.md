# Requirements

Checklist derived from the assessment brief. Items are ticked only after they are implemented
**and** verified; see the referenced phase report for evidence.

## Acceptance criteria

| #   | Requirement                                           | Phase | Status                       |
| --- | ----------------------------------------------------- | ----- | ---------------------------- |
| 1   | Premium, professional invoice UI                      | 01–02 | ⬜                           |
| 2   | Responsive desktop and mobile layouts                 | 01–02 | ⬜                           |
| 3   | Functional invoice editor and live preview            | 02    | ⬜                           |
| 4   | Dynamic line items (add / edit / remove)              | 02    | ⬜                           |
| 5   | Correct discount and tax sequence                     | 03    | ⬜                           |
| 6   | Mandatory $99.00 example passes                       | 03    | ⬜                           |
| 7   | Functional custom fields with visibility              | 04    | ⬜                           |
| 8   | Hidden fields excluded from print output              | 04–05 | ⬜                           |
| 9   | Working Print / Save as PDF                           | 05    | ⬜                           |
| 10  | Real persistent database storage                      | 06    | ⬜                           |
| 11  | Invoice retrieval after reload                        | 06    | ⬜                           |
| 12  | Invoice list and management                           | 07    | ⬜                           |
| 13  | Real SMTP integration when configured                 | 08    | ⬜                           |
| 14  | No fake success states                                | all   | ⬜                           |
| 15  | Tests, lint, type checks and build run and documented | 09    | ⬜                           |
| 16  | Phase-wise Git commits                                | all   | ⬜ (Phase 00 pending commit) |
| 17  | Prompt files saved in the repository                  | 00    | ✅                           |
| 18  | Phase documentation saved and committed               | all   | ⬜                           |
| 19  | README and `.env.example` included                    | 00    | ✅                           |
| 20  | No credentials or secrets committed                   | all   | ⬜ (verified per commit)     |
| 21  | GitHub push status accurately reported                | 10    | ⬜                           |
| 22  | Unfinished work clearly documented                    | 10    | ⬜                           |

## Data requirements

- **Business:** name, email, phone, address, website, optional tax registration number, optional logo.
- **Customer:** name, email, phone, billing address, optional company name.
- **Metadata:** invoice number (auto-generated, editable), issue date, due date, currency (USD only),
  optional payment terms, status (Draft / Saved / Sent).
- **Line items:** description, quantity, unit price, calculated amount.
- **Adjustments:** fixed discount, tax rate.
- **Other:** notes, payment instructions, custom fields (label, value, visible).

## Validation rules

See [CALCULATION_RULES.md](CALCULATION_RULES.md#validation).
