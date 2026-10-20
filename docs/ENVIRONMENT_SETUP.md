# Environment Setup

## Prerequisites

- Node.js **≥ 20.19** (developed on Node.js 22.23.3, npm 10.9.9)
- Git

`better-sqlite3` is a native module. Prebuilt binaries cover common platforms; if none matches,
npm compiles it, which needs a C/C++ toolchain (on Windows: Visual Studio Build Tools).

## Install

```bash
git clone <repository-url>
cd invoice-generator
npm install
cp .env.example .env   # then edit .env
```

## Environment variables

All variables are read **server-side only**. Never commit `.env`.

| Variable       | Required  | Example                               | Purpose                                                  |
| -------------- | --------- | ------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL` | yes       | `file:./prisma/dev.db`                | SQLite file path (relative to project root)              |
| `SMTP_HOST`    | for email | `smtp.example.com`                    | SMTP server host                                         |
| `SMTP_PORT`    | for email | `587`                                 | SMTP port                                                |
| `SMTP_SECURE`  | for email | `false`                               | `true` for port 465 (implicit TLS), `false` for STARTTLS |
| `SMTP_USER`    | for email | —                                     | SMTP username                                            |
| `SMTP_PASS`    | for email | —                                     | SMTP password / app password                             |
| `EMAIL_FROM`   | for email | `Your Business <billing@example.com>` | Sender address                                           |
| `APP_URL`      | for email | `http://localhost:3000`               | Base URL used in links inside emails                     |

## Scripts

| Script                            | What it does                                  |
| --------------------------------- | --------------------------------------------- |
| `npm run dev`                     | Start the dev server on http://localhost:3000 |
| `npm run build` / `npm start`     | Production build / serve                      |
| `npm run typecheck`               | `tsc --noEmit`                                |
| `npm run lint`                    | ESLint                                        |
| `npm test`                        | Vitest (single run)                           |
| `npm run test:watch`              | Vitest watch mode                             |
| `npm run format` / `format:check` | Prettier write / check                        |
| `npm run db:generate`             | Generate the Prisma client                    |
| `npm run db:migrate`              | Create / apply development migrations         |
| `npm run db:deploy`               | Apply migrations in production                |
| `npm run db:studio`               | Open Prisma Studio                            |
| `npm run check`                   | typecheck + lint + test                       |

Database setup instructions (migrations, seeding) are added in Phase 06.
