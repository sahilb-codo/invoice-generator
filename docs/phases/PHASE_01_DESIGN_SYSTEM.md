# Phase 01 — Premium Design System

**Status:** Complete. Awaiting the developer's commit.

Prompt: [01-design-system.md](../prompts/01-design-system.md)

## Objective

Establish design tokens, reusable UI components and the responsive application shell (header,
55/45 editor + sticky preview on desktop, tabs on mobile), shown with realistic demo data.

## Scope of work

- Colour, elevation and typography tokens (indigo accent, navy text, cool neutrals).
- shadcn/ui primitives added for upcoming phases.
- App shell components: header, logo, status badge, responsive workspace layout, form section and
  form field.
- The invoice document component (`InvoicePreview`) rendering the demo invoice.
- Demo data and typed invoice model.
- Home page assembling the shell with a **read-only** editor (wired up in Phase 02).

## Files created or modified

| File                                                                                                 | Change                                                                                                        |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                                                                | Replaced default neutral theme with project tokens (colours, `--paper`, success/warning, shadows, `.numeric`) |
| `src/app/layout.tsx`                                                                                 | Title, `<Toaster />` mounted                                                                                  |
| `src/app/page.tsx`                                                                                   | Workspace with demo invoice, read-only editor sections, header actions (disabled)                             |
| `src/components/app/{logo,app-header}.tsx`                                                           | New                                                                                                           |
| `src/components/invoice/{workspace-layout,form-section,form-field,status-badge,invoice-preview}.tsx` | New                                                                                                           |
| `src/components/ui/*`                                                                                | shadcn: input, label, textarea, badge, tabs, separator, card, switch, select, tooltip, sonner, alert-dialog   |
| `src/lib/invoice/types.ts`                                                                           | Invoice data model (`InvoiceData`, statuses, discount types)                                                  |
| `src/lib/invoice/demo-data.ts`                                                                       | Fictional demo invoice (Northwind Studio → Brightline Analytics)                                              |
| `src/lib/invoice/format.ts`                                                                          | USD, date (UTC calendar dates) and percent formatting                                                         |
| `src/lib/invoice/calculations.ts`                                                                    | Core integer-cents calculation (see decisions)                                                                |
| `docs/DESIGN_SYSTEM.md`, `docs/screenshots/*`                                                        | Design documentation and screenshots                                                                          |

## Technical decisions

- **Calculation module pulled forward (supporting change).** The preview cannot render amounts
  without totals, and the brief forbids computing them inside UI components. The core
  `calculateTotals` (integer cents, BigInt for products, half-up rounding, required sequence) was
  therefore added now. Phase 03 adds validation rules, edge-case handling, unit tests and the
  rounding-policy documentation.
- **Single mount for editor and preview.** Radix Tabs with `forceMount` + CSS hiding below `lg`,
  so the Phase 02 form is never rendered twice.
- **Light theme only.** `next-themes` (pulled in by shadcn's Sonner) was removed and the toaster
  fixed to `theme="light"`.
- **Dates are calendar strings** (`YYYY-MM-DD`) formatted in UTC to avoid server/browser time-zone
  drift and hydration mismatches.
- **Header actions** (Print / Save / Send) are rendered **disabled** with a `title` naming the phase
  that implements them — no fake behaviour.
- `alert-dialog` install: shadcn prompted to overwrite `button.tsx`; answered **no** to keep the
  existing file.

## Commands executed

```bash
npx shadcn@4.22.1 add input label textarea badge tabs separator card switch sonner alert-dialog select tooltip --yes
echo n | npx shadcn@4.22.1 add alert-dialog
npm uninstall next-themes
npm run format && npm run typecheck && npm run lint && npm run build
npx next start -p 3123          # + headless Chrome screenshots
```

## Verification results (actual)

| Check                                                          | Result                                                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                            | ✅ no errors                                                                                                                                                   |
| `npm run lint`                                                 | ✅ no errors                                                                                                                                                   |
| `npm run build`                                                | ✅ `/` prerendered as static                                                                                                                                   |
| Desktop 1440px screenshot (headless Chrome, production server) | ✅ header with logo, invoice number, Draft badge, actions; editor ≈55% left, preview ≈45% right                                                                |
| Mobile 390px (iframe in headless Chrome)                       | ✅ single column, Editor/Preview tabs; `documentElement.scrollWidth` = **390** (no horizontal overflow)                                                        |
| Mobile Preview tab                                             | ✅ switching to Preview shows the document; table collapses unit price under the description                                                                   |
| Demo totals                                                    | ✅ $2,400.00 + $2,220.00 + $3,087.50 = $7,707.50; − $250.00 = $7,457.50; tax 8.5% = $633.89 (633.8875 rounded); total **$8,091.39** — matches hand calculation |
| Hidden custom field                                            | ✅ "Internal cost center" (visible: false) does not appear in the preview                                                                                      |
| Token contrast                                                 | ✅ all text pairs ≥ 4.5:1 (computed; table in DESIGN_SYSTEM.md)                                                                                                |

Note: the developer's already-running `next dev` server (port 3002) served stale CSS from before
the token change; the production build serves the new tokens. Restarting `npm run dev` fixes it.

## Known issues

- Editor inputs are read-only in this phase (intentional; Phase 02).
- No print stylesheet yet (Phase 05).

## Remaining work

Phase 02 — wire the editor (React Hook Form + Zod), live preview, line items, logo upload.

## Git commit

- Suggested message: `feat: establish premium invoice design system`
- Hash: _to be recorded at the start of Phase 02_

## Next phase

[Phase 02 — Invoice Editor and Live Preview](PHASE_02_INVOICE_UI.md)
