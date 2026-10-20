# Prompt 00 — Project Setup

> **Source:** Extracted from the master prompt supplied by the developer on 2026-10-20
> ("PHASE 0 — Mandatory Project and Git Workflow" summarised; "PHASE 1 — Technology Stack and
> Project Setup" verbatim). An additional instruction given during implementation is recorded at the
> bottom.

## Objective

Inspect the workspace, establish the documentation-first workflow, and set up the Next.js project.

## Prompt (master prompt, Phase 0 — summary of mandatory rules)

- Inspect the current working directory, Git branch, working tree, remotes, package files and
  project structure before making changes.
- Do not delete, reset, overwrite or discard existing user work. Never display credentials found in
  environment files.
- Create the `docs/` structure (overview, requirements, architecture, design system, database
  schema, API, calculation rules, testing, environment setup, deployment, Git workflow, AI usage,
  time log, known limitations, `prompts/`, `phases/`) and a root README linking to it.
- Each phase gets its own Markdown file (objective, scope, features, files, decisions, commands,
  actual results, known issues, remaining work, commit hash, next phase).
- One conventional commit per completed phase; stage only that phase's files; never force-push or
  commit secrets.

## Prompt (master prompt, Phase 1 — verbatim)

Use:

- Next.js with App Router.
- TypeScript in strict mode.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- React Hook Form and Zod.
- Prisma ORM.
- SQLite for straightforward local development.
- Nodemailer with SMTP.
- A suitable test framework such as Vitest.
- ESLint and the project's supported formatting tools.

Use compatible, current stable package versions.

Create a modular architecture with reusable components and server-side business logic.

Requirements:

- Set up the project.
- Configure TypeScript and linting.
- Install required dependencies.
- Configure the database and Prisma.
- Create `.env.example` with placeholders only.
- Configure `.gitignore`.
- Create root README and initial documentation.
- Add useful development scripts.
- Run the initial checks.
- Create the setup phase commit.

Do not implement the complete application in one giant component.

## Additional instruction during implementation

The developer added (original in Gujarati, translated):

> "After the Next.js setup, stop and tell me to commit. Then, step by step, tell me to commit at
> every step, and give me the commit message each time you stop. Please start."

**Effect:** Claude Code does not run `git commit` itself. At the end of each phase it stops, and the
developer creates the commit using the provided message. The resulting hash is recorded in the
phase document at the start of the following phase.
