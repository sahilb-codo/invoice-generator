# Known Limitations

Updated as phases are completed. Current state (after Phase 03 and the scope change):

- **No persistence (by decision).** The database and invoice list were removed from scope by the
  developer. Edits live only in the open tab; refreshing resets to the demo invoice. The brief's
  "persistent backend storage", "retrieval after reload" and "invoice list and management"
  requirements are therefore not implemented.
- Email is not implemented yet (Phase 08).
- Print layout was verified automatically in Chrome only; browser print headers/footers depend on
  the user's print-dialog settings.
- `npm audit` reports high-severity advisories in transitive dependencies of the scaffold
  (to be reviewed in Phase 09; `npm audit fix --force` not applied because it makes breaking
  upgrades).
- Currency is fixed to USD by the brief.
