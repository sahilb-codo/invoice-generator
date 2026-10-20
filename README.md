# Invoice Generator

A customizable, browser-based invoice generator: edit an invoice with a live preview, print or save
it as PDF, persist it to a database, manage invoices from a list, and email them over SMTP.

> **Status:** Phases 00–03 (setup, design system, editor + live preview, calculations) complete. Features are added phase by phase — see
> [docs/phases/](docs/phases/) for what is actually implemented and verified.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui ·
Lucide React · React Hook Form · Zod 4 · Prisma 7 + SQLite (better-sqlite3 adapter) · Nodemailer ·
Vitest · ESLint · Prettier

## Getting started

```bash
npm install
cp .env.example .env      # adjust values; never commit .env
npm run dev               # http://localhost:3000
```

Requires Node.js ≥ 20.19. Full details: [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md).

## Scripts

| Command                       | Purpose                       |
| ----------------------------- | ----------------------------- |
| `npm run dev`                 | Development server            |
| `npm run build` / `npm start` | Production build / serve      |
| `npm run typecheck`           | TypeScript check              |
| `npm run lint`                | ESLint                        |
| `npm test`                    | Unit tests (Vitest)           |
| `npm run format`              | Prettier                      |
| `npm run db:migrate`          | Prisma development migrations |
| `npm run check`               | typecheck + lint + test       |

## Environment variables

See [.env.example](.env.example) and the reference table in
[docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md#environment-variables). SMTP credentials
are used server-side only.

## Documentation

- [Documentation index](docs/README.md)
- [Architecture](docs/ARCHITECTURE.md) · [Calculation rules](docs/CALCULATION_RULES.md) ·
  [Database schema](docs/DATABASE_SCHEMA.md) · [API](docs/API_DOCUMENTATION.md)
- [Testing](docs/TESTING.md) · [Deployment](docs/DEPLOYMENT.md) ·
  [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Git workflow](docs/GIT_WORKFLOW.md) · [AI usage](docs/AI_USAGE.md) · [Time log](docs/TIME_LOG.md)
- Phase prompts: [docs/prompts/](docs/prompts/) · Phase reports: [docs/phases/](docs/phases/)
