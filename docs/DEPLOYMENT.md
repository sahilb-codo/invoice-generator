# Deployment

> Status: notes to be completed in Phase 10.

Initial considerations:

- SQLite is suitable for local development and single-instance hosting with a persistent disk.
  Serverless platforms (e.g. Vercel) have no persistent filesystem, so production there would need
  PostgreSQL (change the Prisma provider and swap the driver adapter).
- Set all variables from `.env.example` in the host's secret store; never commit `.env`.
- Run `npm run db:deploy` (prisma migrate deploy) before starting the app.
