# Prompt 09 — Testing and Quality

> **Source:** Extracted verbatim from the master prompt supplied on 2026-10-20
> ("PHASE 10 — Testing, Quality, and Final Review", testing portion).

Run the available checks:

- Dependency installation.
- Prisma generation.
- Database migrations.
- Unit tests.
- Linting.
- TypeScript checks.
- Production build.

Fix errors where possible.

Manually verify:

- Desktop layout.
- Mobile layout.
- Invoice editing.
- Add/edit/remove line items.
- Correct calculations.
- Custom field visibility.
- Print layout.
- Database save and reload.
- Invoice list search and filters.
- Email configuration errors.
- Actual SMTP delivery when credentials are configured.
- No secrets in tracked files.

Do not claim success without executing the corresponding test.
