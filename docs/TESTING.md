# Testing

## Commands

```bash
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm test                # Vitest unit tests
npm run format:check    # Prettier
npm run build           # production build
npm run e2e              # all browser checks against a running server (BASE=http://localhost:3000)
```

## Results log

Only results from commands that were actually run are recorded here.

| Date       | Phase | Check                                                      | Result                                                          |
| ---------- | ----- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| 2026-10-20 | 00    | `npx prisma validate`                                      | ✅ valid                                                        |
| 2026-10-20 | 00    | `npm run typecheck`                                        | ✅ no errors                                                    |
| 2026-10-20 | 00    | `npm run lint`                                             | ✅ no errors                                                    |
| 2026-10-20 | 00    | `npm test`                                                 | ✅ exit 0 — no test files yet                                   |
| 2026-10-20 | 00    | `npm run format:check`                                     | ✅ all files formatted                                          |
| 2026-10-20 | 00    | `npm run build`                                            | ✅ build succeeded                                              |
| 2026-10-20 | 01    | `npm run typecheck`                                        | ✅ no errors                                                    |
| 2026-10-20 | 01    | `npm run lint`                                             | ✅ no errors                                                    |
| 2026-10-20 | 01    | `npm run build`                                            | ✅ build succeeded                                              |
| 2026-10-20 | 01    | Desktop + mobile screenshots (headless Chrome)             | ✅ layout as designed; mobile scrollWidth 390px (no overflow)   |
| 2026-10-20 | 02    | `npm run typecheck` / `lint` / `build`                     | ✅                                                              |
| 2026-10-20 | 02    | `npm run e2e:editor` (headless Chrome, production build)   | ✅ 26/26 checks                                                 |
| 2026-10-20 | 03    | `npm test`                                                 | ✅ 2 files, 39/39 tests                                         |
| 2026-10-20 | 03    | `npm run e2e:calculations`                                 | ✅ 23/23 checks                                                 |
| 2026-10-20 | 03    | `npm run e2e:editor` (regression)                          | ✅ 26/26 checks                                                 |
| 2026-10-20 | 03    | `npm run typecheck` / `lint` / `build`                     | ✅                                                              |
| 2026-10-20 | 04    | `npm test`                                                 | ✅ 3 files, 44/44 tests                                         |
| 2026-10-20 | 04    | `npm run e2e` (editor, calculations, custom fields)        | ✅ 26/26, 23/23, 19/19                                          |
| 2026-10-20 | 04    | `npm run typecheck` / `lint` / `build`                     | ✅                                                              |
| 2026-10-20 | 05    | `npm run e2e:print` (incl. Chrome `printToPDF`)            | ✅ 19/19 — A4, demo 1 page, 40 lines 3 pages                    |
| 2026-10-20 | 05    | `npm run e2e` (all suites)                                 | ✅ 26/26, 23/23, 19/19, 19/19                                   |
| 2026-10-20 | 05    | `npm test` / `typecheck` / `lint` / `build`                | ✅ 44/44                                                        |
| 2026-10-20 | 08    | `npm test` (SMTP version, superseded)                      | ✅ 67/67                                                        |
| 2026-10-20 | 08    | `npm run e2e:email` (SMTP version, superseded)             | ✅ 21/21 after fixing a test expectation                        |
| 2026-10-20 | 08    | `npm test` (Resend, fake local API)                        | ✅ 6 files, 66/66                                               |
| 2026-10-20 | 08    | `npm run e2e:email` (Resend, fake local API)               | ✅ 22/22                                                        |
| 2026-10-20 | 08    | `npm run e2e` (all suites)                                 | ✅ 26/26, 23/23, 19/19, 19/19, 22/22                            |
| 2026-10-20 | 08    | Real Resend delivery                                       | ⏳ not run — no key in `.env` yet                               |
| 2026-10-20 | 09    | typecheck / lint / format / build                          | ✅                                                              |
| 2026-10-20 | 09    | `npm test`                                                 | ✅ 66/66                                                        |
| 2026-10-20 | 09    | `npm run e2e` (5 suites)                                   | ✅ 26, 23, 19, 19, 22 — 109/109                                 |
| 2026-10-20 | 09    | `npm audit --omit=dev`                                     | ✅ 0 vulnerabilities                                            |
| 2026-10-20 | 08+   | PDF attachment: `npm test` / `e2e:email`                   | ✅ 70/70, 23/23                                                 |
| 2026-10-20 | UI    | UI refresh: typecheck / lint / format / build / `npm test` | ✅ 70/70                                                        |
| 2026-10-20 | UI    | UI refresh: `npm run e2e` (5 suites, production build)     | ✅ 28, 23, 19, 19, 23 — 112/112 (2 new: unique ids, nav links)  |
| 2026-10-20 | UI    | Merged From/Bill to + blank start: `npm test`              | ✅ 74/74 (4 new: blank invoice)                                 |
| 2026-10-20 | UI    | Merged From/Bill to + blank start: `npm run e2e`           | ✅ 33, 23, 19, 19, 23 — 117/117 (5 new: blank default page)     |
| 2026-10-20 | UI    | Section nav jump fix: `npm run e2e`                        | ✅ 35, 23, 19, 19, 23 — 119/119 (2 new: jump highlight, scroll) |

## Browser (e2e) checks

`scripts/e2e/` drives headless Chrome through the DevTools Protocol (Node 22 built-in WebSocket,
no extra dependencies). Start the app (`npm run build && npm start`), then run
`npm run e2e` (or `e2e:editor` / `e2e:calculations` / `e2e:custom-fields` / `e2e:print` / `e2e:email`).
The suites open the sample invoice at `/?demo`; `e2e:editor` also checks that `/` starts blank.
`page.goto` waits for the new document's load event and then for `#invoiceNumber` to be filled
(React Hook Form fills inputs only after hydration).
`e2e:email` starts its own app instances and a fake Resend API (`tests/support/fake-resend.mjs`),
so it never sends real email or uses the key in `.env`. Set `CHROME_PATH` if Chrome/Edge is not in a standard location and `OUT=<dir>`
to save screenshots.

## Unit tests

`src/lib/invoice/calculations.test.ts` and `schema.test.ts` cover every case required by the brief;
the mapping is in [phases/PHASE_03_CALCULATIONS.md](phases/PHASE_03_CALCULATIONS.md#verification-results-actual).

Manual-verification checklist: [phases/PHASE_09_TESTING.md](phases/PHASE_09_TESTING.md).
