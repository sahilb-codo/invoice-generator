# Git Workflow

## Repository

- Branch: `main`
- Remote: `origin` → `git@sahilb-codo:sahilb-codo/invoice-generator.git` (pre-configured by the
  developer; SSH host alias `sahilb-codo`). Not modified by Claude Code.

## Who commits

Per the developer's instruction (see [prompts/00-project-setup.md](prompts/00-project-setup.md)),
**the developer creates every commit**. At the end of each phase Claude Code:

1. Runs the checks for that phase.
2. Updates the phase report and related docs.
3. Reviews `git status` / `git diff`.
4. Stops and gives the developer the files to stage and the commit message.

The commit hash is recorded in the phase report at the start of the next phase.

Rules: conventional commit messages, one coherent commit per phase, no force-push, no history
rewriting, no secrets (`.env` is git-ignored; only `.env.example` with placeholders is tracked).

## Phase ↔ document mapping

The master prompt numbers phases 0–10 starting with the Git workflow; the docs number them by
commit order:

| Doc phase              | Master prompt section | Suggested commit message                                  |
| ---------------------- | --------------------- | --------------------------------------------------------- |
| 00 Setup               | Phase 0 + Phase 1     | `chore: initialize Next.js project with tooling and docs` |
| 01 Design system       | Phase 2               | `feat: establish premium invoice design system`           |
| 02 Invoice UI          | Phase 3               | `feat: build invoice editor and live preview`             |
| 03 Calculations        | Phase 4               | `feat: implement precise invoice calculations`            |
| 04 Custom fields       | Phase 5               | `feat: add customizable invoice fields`                   |
| 05 Print / PDF         | Phase 6               | `feat: implement invoice print layout`                    |
| 06 Database            | Phase 7               | `feat: persist invoices with Prisma`                      |
| 07 Management          | Phase 8               | `feat: add invoice management`                            |
| 08 Email               | Phase 9               | `feat: integrate SMTP email delivery`                     |
| 09–10 Testing & review | Phase 10              | `test: verify invoice workflows and document setup`       |

## Commit log

| Phase | Hash      | Message                                         |
| ----- | --------- | ----------------------------------------------- |
| 00    | `8d8a17d` | `init` (project scaffold and configuration)     |
| 00    | `8972261` | `docs: add project documentation and prompts`   |
| 01    | _pending_ | `feat: establish premium invoice design system` |

## Pushing

Pushing is done by the developer (`git push -u origin main`) after verifying the remote. Push status
is reported in the final review only as actually observed.
