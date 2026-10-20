# Deployment

> Status: notes to be completed in Phase 10.

- No database: the app is a standard Next.js application and can be deployed to any Node.js host
  or a platform such as Vercel (`npm run build`, `npm start`).
- Set the SMTP variables from `.env.example` in the host's secret store; never commit `.env`.
- Requires Node.js ≥ 20.19.
