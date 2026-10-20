# Architecture

> Status: initial plan written in Phase 00. Sections are updated as each phase lands.

## Stack (installed in Phase 00)

| Concern       | Choice                                           | Version    |
| ------------- | ------------------------------------------------ | ---------- |
| Framework     | Next.js (App Router, Turbopack)                  | 16.4.2     |
| UI runtime    | React                                            | 19.3.0     |
| Language      | TypeScript (strict)                              | 5.x        |
| Styling       | Tailwind CSS v4 + shadcn/ui (Radix, Nova preset) | 4.x        |
| Icons         | Lucide React                                     | 1.60.0     |
| Forms         | React Hook Form + `@hookform/resolvers`          | 7.90 / 5.9 |
| Validation    | Zod                                              | 4.6.7      |
| Email         | Nodemailer (SMTP)                                | 10.1.7     |
| Tests         | Vitest                                           | 5.0.5      |
| Lint / format | ESLint 9 (`eslint-config-next`), Prettier 3      | —          |

## Planned folder structure

```
src/
  app/                   # Routes (App Router)
  components/
    ui/                  # shadcn/ui primitives
    invoice/             # Workspace, editor sections, preview
  lib/
    invoice/             # Pure domain logic: types, schema, calculations (Phase 03)
    server/              # Server-only: SMTP email (Phase 08)
docs/                    # Documentation
```

## Principles

- **Single source of truth for money:** one pure calculation module used by the client preview and
  re-run on the server before an invoice is emailed. The server never trusts client totals.
- **Validation at the boundary:** one Zod schema shared by the form and the server actions.
- **Server-only secrets:** SMTP credentials are read only in server code.
- **No database:** persistence was descoped (see [phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)); invoice state lives in the browser form.
- **Small components:** editor sections, preview and list are separate components, not one giant
  component.
