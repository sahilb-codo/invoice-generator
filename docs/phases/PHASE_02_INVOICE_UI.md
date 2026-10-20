# Phase 02 — Invoice Editor and Live Preview

**Status:** Complete. Committed as `d2912c8`.

Prompt: [02-invoice-ui.md](../prompts/02-invoice-ui.md)

## Objective

Make every invoice field editable and reflect each edit immediately in the live preview.

## Features implemented

- **Business details:** name, email, phone, address, website, optional tax registration number,
  optional logo (PNG / JPG / WebP / SVG, ≤ 256 KB, stored as a data URL, replace / remove).
- **Customer details:** name, optional company, email, optional phone, billing address.
- **Invoice metadata:** invoice number (pre-filled, editable, regenerate button producing
  `INV-YYYYMMDD-XXXX`), issue date, due date, payment terms (free text with suggestions),
  currency fixed to USD (read-only), status badge (Draft / Saved / Sent — set by save/send later).
- **Line items:** description, quantity, unit price, calculated amount; add (focuses the new row),
  edit, remove; empty state when no items.
- **Notes and payment instructions.**
- **Live preview:** the whole document, header invoice number and status update on every keystroke.
- No emails are sent; Print / Save / Send stay disabled until their phases.

## Files created or modified

| File                                                                              | Change                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/components/invoice/invoice-workspace.tsx`                                    | New. Owns the React Hook Form state; header context + live preview subscribe via `useWatch` |
| `src/components/invoice/editor/fields.tsx`                                        | New. `TextField` / `TextareaField` bound to form paths, errors and `aria-describedby` wired |
| `src/components/invoice/editor/invoice-details-section.tsx`                       | New                                                                                         |
| `src/components/invoice/editor/party-sections.tsx`                                | New. Business ("From") and customer ("Bill to") sections                                    |
| `src/components/invoice/editor/logo-upload.tsx`                                   | New. Type/size checks, data URL, inline errors                                              |
| `src/components/invoice/editor/line-items-section.tsx`                            | New. `useFieldArray`; container-query layout (card rows when narrow, table row when wide)   |
| `src/components/invoice/editor/notes-section.tsx`                                 | New                                                                                         |
| `src/components/invoice/workspace-skeleton.tsx`                                   | New. Suspense fallback                                                                      |
| `src/app/page.tsx`                                                                | Renders the workspace inside `<Suspense>`                                                   |
| `src/components/invoice/workspace-layout.tsx`                                     | Tab change scrolls to top                                                                   |
| `src/components/invoice/form-field.tsx`                                           | `content-start` so neighbouring fields align when one has a hint                            |
| `src/components/invoice/invoice-preview.tsx`                                      | Quantities via `formatQuantity` (no `NaN` while a field is empty)                           |
| `src/lib/id.ts`, `src/lib/invoice/invoice-number.ts`, `src/lib/invoice/format.ts` | Id helper, invoice-number generator, `formatQuantity`                                       |
| `scripts/e2e/cdp.mjs`, `scripts/e2e/editor.e2e.mjs`, `package.json`               | Browser verification script + `npm run e2e:editor`                                          |

## Technical decisions

- **One form, many subscribers.** `useForm` lives in `InvoiceWorkspace`; sections use
  `useFormContext`. The preview and header use `useWatch`, so typing re-renders the preview
  subtree, not every editor section.
- **Line amounts come from the calculation module** (`lineTotalCents`), never computed in JSX.
- **`useFieldArray` with `keyName: "key"`** so React Hook Form does not overwrite the items'
  persistent `id` (needed for saving in Phase 06).
- **Suspense around the workspace.** `next build` failed with
  `Route "/": Next.js encountered the unstable value crypto.randomUUID() in a Client Component`.
  The call comes from React Hook Form's `useFieldArray` key generation. Following the Next.js 16
  guidance (`blocking-prerender-crypto-client`), the workspace is rendered inside `<Suspense>` with
  a skeleton fallback, so it renders per request instead of in the static prerender.
- **`createId`** falls back to `Math.random` because `crypto.randomUUID` is unavailable on plain
  HTTP LAN addresses (non-secure context).
- **Logo as data URL (≤ 256 KB)** keeps persistence a single row with no file storage; SVGs are
  rendered through `<img>`, where scripts do not execute.
- **Validation messages** are wired (`aria-invalid`, error text) but the schema arrives in
  Phase 03; in this phase invalid numbers are tolerated and render as `—` / `$0.00`.

## Commands executed

```bash
npm run format && npm run typecheck && npm run lint
npm run build            # failed once (crypto.randomUUID during prerender) → fixed with Suspense
node node_modules/next/dist/bin/next start -p 3123
BASE=http://localhost:3123 npm run e2e:editor
```

## Verification results (actual)

`npm run e2e:editor` against the production build (headless Chrome via CDP): **26/26 passed**.

| Check                                                                                                                         | Result |
| ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| Demo invoice renders                                                                                                          | ✅     |
| Business name / optional tax ID (cleared → hidden) update preview                                                             | ✅     |
| Customer name, company, email, multi-line address update preview                                                              | ✅     |
| Issue / due date and terms update preview (formatted "Dec 1, 2026")                                                           | ✅     |
| Manual invoice number edit → preview and header                                                                               | ✅     |
| Regenerate invoice number → `INV-20261020-6BMU` format, preview updated                                                       | ✅     |
| Line 1 set to 2 × $50 → amount **$100.00** in editor and preview                                                              | ✅     |
| Add item → 4 rows, new description focused; 3 × $10.50 = **$31.50**                                                           | ✅     |
| Remove item 2 → row and preview line gone                                                                                     | ✅     |
| Totals follow edits: subtotal $3,219.00 − $250 = $2,969.00; tax 8.5% = $252.37 (252.365 rounded half-up); total **$3,221.37** | ✅     |
| Empty quantity → preview shows `—`, never `NaN`                                                                               | ✅     |
| Notes and payment instructions update preview                                                                                 | ✅     |
| 300 KB logo rejected with message; 1×1 PNG shown in preview; Remove clears it                                                 | ✅     |
| Removing all items shows empty states (editor and preview)                                                                    | ✅     |
| Mobile 390px: no horizontal overflow (editor and preview, `scrollWidth` 390)                                                  | ✅     |
| Mobile: Preview tab shows live edits; tab switch scrolls to top (`scrollY` 0)                                                 | ✅     |
| No console errors or uncaught exceptions                                                                                      | ✅     |
| `npm run typecheck`, `npm run lint`, `npm run build`                                                                          | ✅     |

Issues found during verification and fixed in this phase:

- Desktop: the hint under "Invoice number" stretched its grid row and pushed the "Payment terms"
  input down → `content-start` on `FormField`.
- Mobile: line-item description was only two-thirds wide → 4-column mobile grid with the remove
  button in an `auto` column.
- Mobile: switching tabs kept the previous scroll offset → scroll to top on tab change.

Screenshots: [desktop](../screenshots/phase-02-desktop.png),
[mobile editor](../screenshots/phase-02-mobile-editor.png),
[mobile preview](../screenshots/phase-02-mobile-preview.png).

## Known issues

- No field validation yet (Phase 03): e.g. negative quantity, due date before issue date.
- Discount and tax are not editable yet (Phase 03); custom fields not editable yet (Phase 04).
- Native date inputs display in the browser's locale format (e.g. `20-10-2026`); the stored value
  and the preview are locale-independent.

## Git commit

- Suggested message: `feat: build invoice editor and live preview`
- Hash: `d2912c8`

## Next phase

[Phase 03 — Financial Calculation Engine](PHASE_03_CALCULATIONS.md)
