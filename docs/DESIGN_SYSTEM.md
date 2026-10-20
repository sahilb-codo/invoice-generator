# Design System

Defined in Phase 01. Tokens live in [`src/app/globals.css`](../src/app/globals.css); components
use them via Tailwind utilities (`bg-primary`, `text-muted-foreground`, `shadow-paper`, …).
Light theme only: invoices are business documents that print on white paper.

## Principles

- Calm, document-first UI: the invoice preview is the hero; the editor stays quiet.
- One accent colour (indigo), used for brand, primary actions, focus rings and the total.
- Neutrals are slightly cool (hue ≈ 264) so they sit with the navy text instead of looking grey.
- Restrained motion: colour/opacity transitions only; no decorative animation.
- No loud gradients (only the faint canvas wash and the section-header tint), no random colours, no oversized cards.

## Colour tokens

| Token                                    | Value (OKLCH)                        | Use                                   |
| ---------------------------------------- | ------------------------------------ | ------------------------------------- |
| `--background`                           | `0.982 0.004 264`                    | App canvas (soft neutral)             |
| `--card`, `--popover`, `--paper`         | `1 0 0`                              | Cards, menus, the invoice document    |
| `--foreground`                           | `0.24 0.05 266`                      | Deep navy text                        |
| `--muted-foreground`                     | `0.5 0.03 264`                       | Secondary text, labels                |
| `--primary` / `--ring`                   | `0.51 0.2 276`                       | Indigo accent, primary buttons, focus |
| `--primary-foreground`                   | `0.99 0.004 276`                     | Text on primary                       |
| `--accent` / `--accent-foreground`       | `0.96 0.022 276` / `0.43 0.19 276`   | Indigo tint surfaces (icons, total)   |
| `--secondary` / `--secondary-foreground` | `0.962 0.006 264` / `0.3 0.05 266`   | Neutral chips, Draft badge            |
| `--muted`                                | `0.965 0.005 264`                    | Subtle fills                          |
| `--border` / `--input`                   | `0.915 0.008 264` / `0.885 0.01 264` | Hairlines / form control borders      |
| `--destructive`                          | `0.56 0.2 25`                        | Errors, delete                        |
| `--success` / `--success-soft`           | `0.52 0.12 160` / `0.96 0.035 160`   | Sent status                           |
| `--warning` / `--warning-soft`           | `0.55 0.13 70` / `0.97 0.04 85`      | Configuration warnings (e.g. email)   |

### Contrast (WCAG 2.x, computed from the OKLCH values)

| Pair                                      | Ratio         |
| ----------------------------------------- | ------------- |
| foreground on white / on background       | 16.52 / 15.69 |
| muted-foreground on white / on background | 6.01 / 5.70   |
| primary-foreground on primary             | 5.99          |
| primary on white                          | 6.16          |
| accent-foreground on accent               | 7.74          |
| secondary-foreground on secondary         | 12.26         |
| success on success-soft                   | 4.66          |
| destructive on white                      | 5.15          |

All pairs meet AA (≥ 4.5:1) for normal-size text.

## Elevation

| Token           | Use                                  |
| --------------- | ------------------------------------ |
| `shadow-card`   | Editor section cards and section nav |
| `shadow-paper`  | Invoice document (soft, deeper drop) |
| `shadow-header` | 1px hairline under the sticky header |

## Typography

- **Geist Sans** (via `next/font`) for UI and documents; **Geist Mono** available as `font-mono`.
- UI body 14px (`text-sm`); labels 12px medium; section titles 14px semibold.
- Invoice document 12.5px base; invoice number 20px semibold; small-caps-style overlines
  (10.5px, uppercase, wide tracking) for section labels.
- `.numeric` utility → `tabular-nums` so money and quantities align in columns.

## Spacing and shape

- 4px grid (Tailwind spacing). Section padding 16px mobile / 24px desktop; 20px / 24px between sections.
- Radius base `0.625rem` (10px); cards `rounded-2xl`, inputs/buttons `rounded-lg`, badges pill.

## Layout

| Breakpoint      | Layout                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `< lg` (1024px) | Sticky header → sticky Editor / Preview tabs → single column; 16px gutters (24px from `sm`)                                                 |
| `≥ lg`          | Editor ≈ 55% (`11fr`) and preview ≈ 45% (`9fr`), 32px gap, max width 1440px; preview is `sticky` under the header and scrolls independently |

The editor and preview are each mounted **once** (Radix Tabs with `forceMount`); below `lg` the
inactive tab is hidden with CSS, so form state is never duplicated.

## Components

| Component            | File                                           | Notes                                                                                                       |
| -------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AppHeader`          | `src/components/app/app-header.tsx`            | Logo, context slot (invoice number + status), actions slot; sticky, translucent                             |
| `Logo`               | `src/components/app/logo.tsx`                  | Indigo receipt mark + "InvoiceStudio" wordmark                                                              |
| `WorkspaceLayout`    | `src/components/invoice/workspace-layout.tsx`  | Responsive editor/preview shell                                                                             |
| `FormSection`        | `src/components/invoice/form-section.tsx`      | Card with tinted header: step number, icon, title, description, optional header action                      |
| `EditorNav`          | `src/components/invoice/editor/editor-nav.tsx` | Jump links to the 6 editor sections; highlights the current one                                             |
| `FormField`          | `src/components/invoice/form-field.tsx`        | Label, optional marker, hint / error with ids for `aria-describedby`                                        |
| `StatusBadge`        | `src/components/invoice/status-badge.tsx`      | Draft (neutral), Sent (green) with icons — not colour alone                                                 |
| `InvoicePreview`     | `src/components/invoice/invoice-preview.tsx`   | The business document; renders data only, no controls                                                       |
| shadcn/ui primitives | `src/components/ui/*`                          | button, input, textarea, label, select, switch, tabs, badge, card, separator, tooltip, alert-dialog, sonner |

## Accessibility

- Visible focus: 3px ring in `ring/50` on all interactive primitives.
- Status communicated by icon + text, not colour alone.
- Form fields use `<label for>`; errors are `role="alert"`.
- Touch targets in the header are 36px (`size="lg"` buttons); tabs are 36px tall.

## UI refresh (after Phase 10)

Requested by the developer: sections were hard to tell apart (white cards on a near-white canvas,
identical quiet headers). Changes:

- **Canvas** `--background` darkened to `0.968 0.007 264` and given one faint indigo radial wash
  at the top (the only gradient besides section headers; print resets the body to white).
  Contrast on the new canvas: foreground 15.06:1, muted text 5.47:1 (AA); on the desk, muted
  text is 4.96:1 (the desk shows no text besides the paper).
- **Cards** `rounded-2xl` with a 1px `ring-foreground/[0.07]` edge and a deeper `shadow-card`.
- **Section headers** (`FormSection`): tinted `accent → card` band, solid indigo 40px icon tile,
  a "Step N of 6" overline, 15px title. Step numbers come from
  `src/components/invoice/editor/sections.ts`, the single list of sections.
- **From & Bill to** is one section (`PartiesSection`): business and customer side by side with a
  divider when the section is at least 672px wide (container query), stacked otherwise; each
  party has a small sub-heading. Fields carry example placeholders.
- **Section nav** (`EditorNav`): chips 1–6 that jump to each section (smooth scroll unless the
  user prefers reduced motion) and highlight the section being edited. Sticky under the header
  on desktop. Anchors are `section-*` so they never collide with form field ids. One indigo pill
  slides between chips (300ms, off for reduced motion). During a jump the highlight stays on the
  target until the scroll ends (`scrollend`, 1.2s fallback) instead of passing every section on
  the way; the active chip is scrolled into view when the bar overflows (mobile).
- **Panel headings**: "Invoice editor" and "Live preview" (desktop; the tabs label them on
  mobile).
- **Preview desk**: the paper sits on a `--desk` (`0.935 0.012 266`) surface; `print.css`
  removes its background, padding and radius.
- **Line items**: uppercase column header bar, row dividers with hover, and an item count +
  subtotal footer. **Discount & tax** breakdown uses the indigo tint with a larger total.
- **Fix**: line-item and custom-field DOM ids used React Hook Form's random `useFieldArray` keys,
  which differ between server and client (hydration warning, the dev "1 Issue" badge). They now
  use each row's own stable `id`.
- **Blank start**: the page opens an empty invoice (`createBlankInvoice` in
  `src/lib/invoice/new-invoice.ts`): generated number, today's issue date, due date +30 days, one
  empty line, no custom fields. The sample invoice is at `/?demo`. A zero discount now reads
  `$0.00` instead of `−$0.00`.

Screenshots: [blank invoice](screenshots/ui-blank-invoice.png),
[From & Bill to](screenshots/ui-parties-section.png), [desktop](screenshots/ui-refresh-desktop.png),
[section nav after jumping to Line items](screenshots/ui-refresh-section-nav.png),
[mobile](screenshots/ui-refresh-mobile.png).

## Screenshots (Phase 01)

- Desktop: [screenshots/phase-01-desktop.png](screenshots/phase-01-desktop.png)
- Mobile (390px, editor tab): [screenshots/phase-01-mobile-editor.png](screenshots/phase-01-mobile-editor.png)
