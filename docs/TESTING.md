# Testing

## Commands

```bash
npx prisma validate     # schema validity
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm test                # Vitest unit tests
npm run format:check    # Prettier
npm run build           # production build
```

## Results log

Only results from commands that were actually run are recorded here.

| Date       | Phase | Check                  | Result                        |
| ---------- | ----- | ---------------------- | ----------------------------- |
| 2026-10-20 | 00    | `npx prisma validate`  | ✅ valid                      |
| 2026-10-20 | 00    | `npm run typecheck`    | ✅ no errors                  |
| 2026-10-20 | 00    | `npm run lint`         | ✅ no errors                  |
| 2026-10-20 | 00    | `npm test`             | ✅ exit 0 — no test files yet |
| 2026-10-20 | 00    | `npm run format:check` | ✅ all files formatted        |
| 2026-10-20 | 00    | `npm run build`        | ✅ build succeeded            |

| 2026-10-20 | 01 | `npm run typecheck` | ✅ no errors |
| 2026-10-20 | 01 | `npm run lint` | ✅ no errors |
| 2026-10-20 | 01 | `npm run build` | ✅ build succeeded |
| 2026-10-20 | 01 | Desktop + mobile screenshots (headless Chrome) | ✅ layout as designed; mobile scrollWidth 390px (no overflow) |

Unit tests for the calculation engine are added in Phase 03; the manual verification checklist is
completed in Phase 09.
