# Phase 04 — Custom Fields

**Status:** Complete. Awaiting the developer's commit.

Prompt: [04-custom-fields.md](../prompts/04-custom-fields.md)

## Objective

Let users add, edit, hide, show and remove custom fields; only visible fields appear on the
invoice, and custom fields never affect totals.

## Features implemented

- **Custom fields section** in the editor: label + value inputs, a visibility switch
  ("Shown" / "Hidden" with eye icon — not colour alone), remove button.
- **Add field** (focuses the new label) and one-click **suggestions** — Purchase Order, Project,
  Department, Reference — that disappear once a field with that label exists (focuses the value).
- Hidden rows are visually de-emphasised (dashed border, muted background) but stay editable.
- Validation: label required, ≤ 60 chars; value ≤ 200 chars; max 20 fields (schema from Phase 03).
- Preview shows only visible fields **with a label**, in the invoice metadata block.

## Files created or modified

| File                                                      | Change                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/lib/invoice/custom-fields.ts`                        | New. `getVisibleCustomFields()` (single rule for preview, print and email) and suggestions |
| `src/lib/invoice/custom-fields.test.ts`                   | New. 5 tests                                                                               |
| `src/components/invoice/editor/custom-fields-section.tsx` | New. `useFieldArray` + `Controller`-wrapped Radix `Switch`                                 |
| `src/components/invoice/invoice-preview.tsx`              | Uses `getVisibleCustomFields`                                                              |
| `src/components/invoice/invoice-workspace.tsx`            | Adds the section                                                                           |
| `scripts/e2e/custom-fields.e2e.mjs`, `package.json`       | Browser checks; `e2e:custom-fields`, `e2e` runs all suites                                 |

## Technical decisions

- **One visibility rule** in `lib/invoice/custom-fields.ts`, so the print layout (Phase 05) and
  email (Phase 08) cannot drift from the preview.
- A visible field with an empty label is not rendered (it would print a value with no
  explanation) and is flagged by validation.
- **Custom fields are structurally excluded from totals:** `CalculationInput` has no
  `customFields` property. TypeScript even rejected a test that passed them in an object literal;
  the test now passes whole invoices to prove extra data is ignored.
- Hidden fields stay in the form data (and in any email payload validation) but are never rendered.
  "Remain hidden after saving and reloading" is not applicable — persistence was descoped.

## Commands executed

```bash
npm test                     # 44/44 (after fixing a test typing error, see below)
npm run format && npm run typecheck && npm run lint && npm run build
node node_modules/next/dist/bin/next start -p 3123
BASE=http://localhost:3123 npm run e2e:custom-fields   # 19/19
BASE=http://localhost:3123 npm run e2e                 # 26/26, 23/23, 19/19
```

## Verification results (actual)

- **Unit tests:** 3 files, **44/44 passed** (5 new): visible-only filtering, hidden never
  returned, empty lists, demo invoice hides "Internal cost center", visibility toggles do not
  change totals.
- **Browser (`e2e:custom-fields`, production build): 19/19 passed** — demo hidden field absent
  from preview; show → appears; hide → disappears (also for a visible field); label/value edits
  update preview; Add field focuses the label; suggestion adds a labelled field, focuses the value
  and the used suggestion disappears; empty label shows "Add a label" and is not printed; remove
  deletes row and preview entry; total stays **$8,091.39** throughout; mobile 390px has no
  horizontal overflow; no console errors.
- **Regression:** `e2e:editor` 26/26, `e2e:calculations` 23/23; typecheck, lint, build ✅.

Issues found and fixed:

- `tsc` error in the new test (`customFields` does not exist in `CalculationInput`) — fixed the
  test; the error confirms custom fields cannot reach the calculation.
- Mobile screenshot showed a cramped value input next to the toggle → value spans the full width
  on small screens, controls on their own row.

Screenshots: [desktop](../screenshots/phase-04-custom-fields.png),
[mobile](../screenshots/phase-04-custom-fields-mobile.png).

## Known issues

- Print exclusion of hidden fields is verified in Phase 05 (print stylesheet).
- Field order cannot be changed (add/remove only).

## Git commit

- Suggested message: `feat: add customizable invoice fields`
- Hash: _to be recorded at the start of Phase 05_

## Next phase

[Phase 05 — Print and Save as PDF](PHASE_05_PRINT_PDF.md)
