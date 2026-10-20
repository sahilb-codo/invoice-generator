# Phase 09 — Testing and Quality

**Status:** Complete. Awaiting the developer's commit (together with Phase 10).

Prompt: [09-testing-quality.md](../prompts/09-testing-quality.md)

## Automated checks (run 2026-10-20, 17:56–18:01 IST, on commit `c626d6c` + this phase's changes)

| Check                            | Command                                                      | Result                   |
| -------------------------------- | ------------------------------------------------------------ | ------------------------ |
| Dependency install               | `npm install` (after moving `shadcn` CLI to devDependencies) | ✅                       |
| TypeScript                       | `npm run typecheck`                                          | ✅ no errors             |
| Lint                             | `npm run lint`                                               | ✅ no errors or warnings |
| Formatting                       | `npm run format:check`                                       | ✅                       |
| Unit + integration               | `npm test`                                                   | ✅ 6 files, **66/66**    |
| Production build                 | `npm run build`                                              | ✅                       |
| Browser: editor                  | `npm run e2e:editor`                                         | ✅ 26/26                 |
| Browser: calculations            | `npm run e2e:calculations`                                   | ✅ 23/23                 |
| Browser: custom fields           | `npm run e2e:custom-fields`                                  | ✅ 19/19                 |
| Browser: print / PDF             | `npm run e2e:print`                                          | ✅ 19/19                 |
| Browser: email (fake Resend API) | `npm run e2e:email`                                          | ✅ 22/22                 |
| Production dependency audit      | `npm audit --omit=dev`                                       | ✅ 0 vulnerabilities     |
| Secrets in tracked files         | `git ls-files` + grep for keys; `.env` tracked?              | ✅ none; `.env` ignored  |

Prisma generation and database migrations from the original prompt are **not applicable**
(database descoped — Phase 06).

## Manual-verification checklist (from the prompt)

Covered by the automated browser runs and screenshots above, in headless Chrome:

| Item                                | How verified                                       | Result                                                                    |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Desktop layout                      | 1440px screenshots, phases 01–05                   | ✅                                                                        |
| Mobile layout                       | 390px viewport, `scrollWidth` = 390 in every suite | ✅                                                                        |
| Invoice editing                     | `e2e:editor`                                       | ✅                                                                        |
| Add / edit / remove line items      | `e2e:editor`                                       | ✅                                                                        |
| Correct calculations                | unit tests + `e2e:calculations` ($99.00)           | ✅                                                                        |
| Custom field visibility             | `e2e:custom-fields`, `e2e:print`, email tests      | ✅                                                                        |
| Print layout                        | `e2e:print` + inspected PDFs in `docs/samples/`    | ✅                                                                        |
| Database save and reload            | —                                                  | ➖ descoped                                                               |
| Invoice list search and filters     | —                                                  | ➖ descoped                                                               |
| Email configuration errors          | `e2e:email`, `config.test.ts`                      | ✅                                                                        |
| Real email delivery when configured | —                                                  | ⏳ **not run**: `.env` has no Resend key; no email sent to a real address |
| No secrets in tracked files         | grep + `git ls-files`                              | ✅                                                                        |

A human pass in a real (non-headless) browser was not performed by Claude Code.

## Change made in this phase

- `npm audit` reported 9 high-severity advisories, all in development tooling (`eslint-config-next`
  → `fast-glob`/`micromatch`/`braces`, and the `shadcn` CLI). The `shadcn` CLI had been installed
  by `shadcn init` as a runtime dependency; it was moved to **devDependencies** (its CSS import
  still resolves at build time). Result: `npm audit --omit=dev` → 0. The remaining dev-only
  advisories were not force-fixed because `npm audit fix --force` would apply breaking upgrades.

## Git commit

Committed together with Phase 10 (see [PHASE_10_FINAL_REVIEW.md](PHASE_10_FINAL_REVIEW.md)).
