# Time Log

Times are IST (UTC+05:30), taken from the shell clock during the session (`date` output).
Budget: 3 hours.

| Phase                        | Start | End   | Duration | Notes                                                                 |
| ---------------------------- | ----- | ----- | -------- | --------------------------------------------------------------------- |
| 00 Setup                     | 16:18 | 16:30 | ~12 min  | Scaffold, dependencies, tooling, docs skeleton                        |
| 01 Design system             | 16:30 | 16:40 | ~10 min  | Tokens, shell, preview, screenshots, docs                             |
| 02 Invoice UI                | 16:41 | 16:51 | ~10 min  | Editor sections, line items, logo, e2e script, fixes                  |
| 03 Calculations              | 16:52 | 16:58 | ~6 min   | Schema, 39 unit tests, discount & tax UI, e2e                         |
| Scope change (06/07)         | 17:00 | 17:04 | ~4 min   | Remove Prisma/SQLite, Saved status, update docs                       |
| 04 Custom fields             | 17:06 | 17:10 | ~4 min   | Section, helper + tests, e2e, mobile fix                              |
| 05 Print / PDF               | 17:11 | 17:19 | ~8 min   | Print stylesheet, button, PDF checks, page-break fix                  |
| 08 Email (SMTP, then Resend) | 17:27 | 17:42 | ~15 min  | SMTP version built + tested, switched to Resend on request, re-tested |
| 09–10 Testing & review       | 17:56 | 18:03 | ~7 min   | Full checks, audit fix, final docs                                    |

**Running total:** ~76 min (16:18–18:03 wall clock; gaps were waiting for the developer's commits)

Developer review / commit time between phases is not included unless noted.
