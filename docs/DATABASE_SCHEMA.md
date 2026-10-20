# Database Schema

> Status: not started — models are added in Phase 06.

Baseline from Phase 00:

- Prisma 7.10.1 with `prisma.config.ts` at the project root.
- Generator `prisma-client`, output `src/generated/prisma` (git-ignored).
- Datasource: SQLite; URL from `DATABASE_URL` (default `file:./prisma/dev.db`).
- Runtime access through the `@prisma/adapter-better-sqlite3` driver adapter.
- Schema kept portable so a later PostgreSQL migration only changes the provider and adapter.
