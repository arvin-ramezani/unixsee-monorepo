# Unixsee Technical TODO

This file records known work that does not belong in the current documentation-only refactor. Convert an item into a scoped issue or plan before implementation.

## P0: Security and Legacy Platform Cleanup

- [ ] Rotate and revoke exposed Unixsee and provider credentials found in tracked files.
- [ ] Replace all real values in `.env.example` with obvious placeholders.
- [ ] Remove or replace the obsolete `src/lib/api/wp.api.ts` client, including its hardcoded endpoint, credential, and response logging.
- [ ] Audit Git history, exported archives, CI logs, and shared copies for exposed values; coordinate history rewriting separately if required.
- [ ] Add automated secret scanning to local validation and CI.
- [ ] Inventory references to legacy WordPress clients, contracts, fixtures, snapshots, and adapters.
- [ ] Remove legacy WordPress integration code only after replacement data paths and regression coverage are ready.

## Configuration and Environments

- [ ] Define and validate the supported environment-variable schema.
- [ ] Document production environment provisioning without storing real values.
- [ ] Separate frontend-only builds from migration/deployment workflows.

## Content and Rendering

- [ ] Complete stable section identifiers.
- [ ] Define ordering and limit behavior where content collections need it.
- [ ] Guard and validate external video URLs.
- [ ] Replace temporary or duplicated page variants after verifying active imports.

## Code Quality

- [ ] Resolve the current ESLint baseline.
- [ ] Review deprecated packages and APIs.
- [ ] Consolidate duplicate constants, data locations, and legacy API directories through separate focused changes.
- [ ] Add a test runner and focused regression tests for critical public and dashboard behavior.
