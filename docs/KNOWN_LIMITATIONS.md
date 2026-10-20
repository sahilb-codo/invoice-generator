# Known Limitations

Updated as phases are completed. Current state (end of Phase 00):

- Only project scaffolding exists; no invoice features are implemented yet.
- `npm audit` reports 5 high-severity advisories in transitive dependencies of the scaffold
  (to be reviewed in Phase 09; `npm audit fix --force` not applied because it makes breaking
  upgrades).
- Currency is fixed to USD by the brief.
