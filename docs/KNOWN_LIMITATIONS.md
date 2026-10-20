# Known Limitations

Updated as phases are completed. Current state (after Phase 03 and the scope change):

- **No persistence (by decision).** The database and invoice list were removed from scope by the
  developer. Edits live only in the open tab; refreshing resets to the demo invoice. The brief's
  "persistent backend storage", "retrieval after reload" and "invoice list and management"
  requirements are therefore not implemented.
- **Email (Resend):** verified against a local fake Resend API; real delivery needs
  `RESEND_API_KEY` / `EMAIL_FROM` in `.env` and has not been tested yet. No PDF attachment (the
  email contains the full summary; PDF via Print). Status stays Sent after later edits. The send
  action has no authentication and an in-memory per-process rate limit (5/min).
- With the `onboarding@resend.dev` test sender, Resend only delivers to the Resend account
  owner's address; customers need a verified domain.
- Print layout was verified automatically in Chrome only; browser print headers/footers depend on
  the user's print-dialog settings.
- `npm audit` still reports high-severity advisories in **development tooling only**
  (`eslint-config-next`, `shadcn` CLI → `fast-glob`/`micromatch`/`braces`); production audit is clean.
- Verified in headless Chrome only; no manual pass in Firefox/Safari.
- Currency is fixed to USD by the brief.
