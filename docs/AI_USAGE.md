# AI Usage

| Tool                            | Model           | Role                                                                              |
| ------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| Claude Code (VS Code extension) | Claude Opus 5.5 | Scaffolding, configuration, implementation, running checks, writing documentation |

## How it was used

- The developer supplied a master prompt (stored per phase in [prompts/](prompts/)) and asked
  Claude Code to work phase by phase, stopping after each phase so the developer could review and
  commit.
- Claude Code ran all install, build, lint, type-check and test commands in the developer's local
  workspace; results recorded in the phase reports are copied from that actual output.
- The developer reviews and commits each phase.

This file is updated if other AI tools are used later.
