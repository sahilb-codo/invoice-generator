# Environment Setup

## Prerequisites

- Node.js **≥ 20.19** (developed on Node.js 22.23.3, npm 10.9.9)
- Git

## Install

```bash
git clone <repository-url>
cd invoice-generator
npm install
cp .env.example .env   # then edit .env
```

## Environment variables

All variables are read **server-side only**. Never commit `.env`.

| Variable      | Required  | Example                               | Purpose                                                  |
| ------------- | --------- | ------------------------------------- | -------------------------------------------------------- |
| `SMTP_HOST`   | for email | `smtp.example.com`                    | SMTP server host                                         |
| `SMTP_PORT`   | for email | `587`                                 | SMTP port                                                |
| `SMTP_SECURE` | for email | `false`                               | `true` for port 465 (implicit TLS), `false` for STARTTLS |
| `SMTP_USER`   | for email | —                                     | SMTP username                                            |
| `SMTP_PASS`   | for email | —                                     | SMTP password / app password                             |
| `EMAIL_FROM`  | for email | `Your Business <billing@example.com>` | Sender address                                           |
| `APP_URL`     | for email | `http://localhost:3000`               | Base URL used in links inside emails                     |

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
| `npm run check`                   | typecheck + lint + test                       |

No database is required (persistence was descoped — see [phases/PHASE_06_DATABASE.md](phases/PHASE_06_DATABASE.md)).
