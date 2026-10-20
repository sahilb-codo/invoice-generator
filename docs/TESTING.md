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

| Date       | Phase | Check                                                    | Result                                                        |
| ---------- | ----- | -------------------------------------------------------- | ------------------------------------------------------------- |
| 2026-10-20 | 00    | `npx prisma validate`                                    | ✅ valid                                                      |
| 2026-10-20 | 00    | `npm run typecheck`                                      | ✅ no errors                                                  |
| 2026-10-20 | 00    | `npm run lint`                                           | ✅ no errors                                                  |
| 2026-10-20 | 00    | `npm test`                                               | ✅ exit 0 — no test files yet                                 |
| 2026-10-20 | 00    | `npm run format:check`                                   | ✅ all files formatted                                        |
| 2026-10-20 | 00    | `npm run build`                                          | ✅ build succeeded                                            |
| 2026-10-20 | 01    | `npm run typecheck`                                      | ✅ no errors                                                  |
| 2026-10-20 | 01    | `npm run lint`                                           | ✅ no errors                                                  |
| 2026-10-20 | 01    | `npm run build`                                          | ✅ build succeeded                                            |
| 2026-10-20 | 01    | Desktop + mobile screenshots (headless Chrome)           | ✅ layout as designed; mobile scrollWidth 390px (no overflow) |
| 2026-10-20 | 02    | `npm run typecheck` / `lint` / `build`                   | ✅                                                            |
| 2026-10-20 | 02    | `npm run e2e:editor` (headless Chrome, production build) | ✅ 26/26 checks                                               |
| 2026-10-20 | 03    | `npm test`                                               | ✅ 2 files, 39/39 tests                                       |
| 2026-10-20 | 03    | `npm run e2e:calculations`                               | ✅ 23/23 checks                                               |
| 2026-10-20 | 03    | `npm run e2e:editor` (regression)                        | ✅ 26/26 checks                                               |
| 2026-10-20 | 03    | `npm run typecheck` / `lint` / `build`                   | ✅                                                            |
| 2026-10-20 | 04    | `npm test`                                               | ✅ 3 files, 44/44 tests                                       |
| 2026-10-20 | 04    | `npm run e2e` (editor, calculations, custom fields)      | ✅ 26/26, 23/23, 19/19                                        |
| 2026-10-20 | 04    | `npm run typecheck` / `lint` / `build`                   | ✅                                                            |

## Browser (e2e) checks

`scripts/e2e/` drives headless Chrome through the DevTools Protocol (Node 22 built-in WebSocket,
no extra dependencies). Start the app (`npm run build && npm start`), then run
`npm run e2e` (or `e2e:editor` / `e2e:calculations` / `e2e:custom-fields`). Set `CHROME_PATH` if Chrome/Edge is not in a standard location and `OUT=<dir>`
to save screenshots.

## Unit tests

`src/lib/invoice/calculations.test.ts` and `schema.test.ts` cover every case required by the brief;
the mapping is in [phases/PHASE_03_CALCULATIONS.md](phases/PHASE_03_CALCULATIONS.md#verification-results-actual).

The manual verification checklist is completed in Phase 09.
