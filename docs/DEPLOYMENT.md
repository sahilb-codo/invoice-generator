# Deployment

> Status: notes to be completed in Phase 10.

- No database: the app is a standard Next.js application and can be deployed to any Node.js host
  or a platform such as Vercel (`npm run build`, `npm start`).
- Set `RESEND_API_KEY` and `EMAIL_FROM` in the host's secret store; never commit `.env`. Use a
  sender on a domain verified in Resend.
- The send action is rate-limited in memory per instance (5/min) and has no authentication; put
  the app behind authentication before exposing it publicly.
- Requires Node.js ≥ 20.19.
