# Design System

Defined in Phase 01. Tokens live in [`src/app/globals.css`](../src/app/globals.css); components
use them via Tailwind utilities (`bg-primary`, `text-muted-foreground`, `shadow-paper`, …).
Light theme only: invoices are business documents that print on white paper.

## Principles

- Calm, document-first UI: the invoice preview is the hero; the editor stays quiet.
- One accent colour (indigo), used for brand, primary actions, focus rings and the total.
- Neutrals are slightly cool (hue ≈ 264) so they sit with the navy text instead of looking grey.
- Restrained motion: colour/opacity transitions only; no decorative animation.
- No gradients, no random colours, no oversized cards.

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

| Token           | Use                                      |
| --------------- | ---------------------------------------- |
| `shadow-card`   | Editor section cards (barely-there lift) |
| `shadow-paper`  | Invoice document (soft, deeper drop)     |
| `shadow-header` | 1px hairline under the sticky header     |

## Typography

- **Geist Sans** (via `next/font`) for UI and documents; **Geist Mono** available as `font-mono`.
- UI body 14px (`text-sm`); labels 12px medium; section titles 14px semibold.
- Invoice document 12.5px base; invoice number 20px semibold; small-caps-style overlines
  (10.5px, uppercase, wide tracking) for section labels.
- `.numeric` utility → `tabular-nums` so money and quantities align in columns.

## Spacing and shape

- 4px grid (Tailwind spacing). Section padding 16px mobile / 20px desktop; 20px between sections.
- Radius base `0.625rem` (10px); cards `rounded-xl`, inputs/buttons `rounded-lg`, badges pill.

## Layout

| Breakpoint      | Layout                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `< lg` (1024px) | Sticky header → sticky Editor / Preview tabs → single column; 16px gutters (24px from `sm`)                                                 |
| `≥ lg`          | Editor ≈ 55% (`11fr`) and preview ≈ 45% (`9fr`), 32px gap, max width 1440px; preview is `sticky` under the header and scrolls independently |

The editor and preview are each mounted **once** (Radix Tabs with `forceMount`); below `lg` the
inactive tab is hidden with CSS, so form state is never duplicated.

## Components

| Component            | File                                          | Notes                                                                                                       |
| -------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AppHeader`          | `src/components/app/app-header.tsx`           | Logo, context slot (invoice number + status), actions slot; sticky, translucent                             |
| `Logo`               | `src/components/app/logo.tsx`                 | Indigo receipt mark + "InvoiceStudio" wordmark                                                              |
| `WorkspaceLayout`    | `src/components/invoice/workspace-layout.tsx` | Responsive editor/preview shell                                                                             |
| `FormSection`        | `src/components/invoice/form-section.tsx`     | Card with icon, title, description, optional header action                                                  |
| `FormField`          | `src/components/invoice/form-field.tsx`       | Label, optional marker, hint / error with ids for `aria-describedby`                                        |
| `StatusBadge`        | `src/components/invoice/status-badge.tsx`     | Draft (neutral), Sent (green) with icons — not colour alone                                                 |
| `InvoicePreview`     | `src/components/invoice/invoice-preview.tsx`  | The business document; renders data only, no controls                                                       |
| shadcn/ui primitives | `src/components/ui/*`                         | button, input, textarea, label, select, switch, tabs, badge, card, separator, tooltip, alert-dialog, sonner |

## Accessibility

- Visible focus: 3px ring in `ring/50` on all interactive primitives.
- Status communicated by icon + text, not colour alone.
- Form fields use `<label for>`; errors are `role="alert"`.
- Touch targets in the header are 36px (`size="lg"` buttons); tabs are 36px tall.

## Screenshots (Phase 01)

- Desktop: [screenshots/phase-01-desktop.png](screenshots/phase-01-desktop.png)
- Mobile (390px, editor tab): [screenshots/phase-01-mobile-editor.png](screenshots/phase-01-mobile-editor.png)
