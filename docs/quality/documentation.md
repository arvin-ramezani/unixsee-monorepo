# Documentation standards

> **Last verified:** 2026-08-08

## Canonical source

- Human and AI contributors treat `docs/` as canonical.
- Root `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, and `.cursor/rules/` must
  point into `docs/` instead of duplicating long product or UX detail.

## Which doc type to use

| Situation | Doc type | Location |
|---|---|---|
| Required product behavior / outcomes | Phase feature spec | `docs/product/` |
| Staff or customer journey detail | UX flow (with document control) | `docs/product/ux-flows/` |
| Short operational clarification | Product note | `docs/product/notes/` |
| Durable structural / stack decision | ADR | `docs/architecture/decisions/` |
| Engineering convention | Rule sheet | `docs/frontend/`, `docs/backend/`, `docs/agent/`, `docs/quality/` |
| Nest request/response + lifecycle wire contract | Backend API contract | `docs/backend/contracts/` (agent plane uses `docs/agent/*-api-contract.md`) |
| Repo ownership / system map | Architecture doc | `docs/architecture/` |

## Status vocabulary

Prefer one of:

| Status | Use for |
|---|---|
| Proposed | Not yet agreed |
| Draft | Actively being written; usable but unstable |
| Accepted | Binding until changed |
| Superseded | Replaced by a newer doc or ADR |

UX flows may keep their existing document-control tables and confidence
summaries. Preserve that structure when editing those files.

## Writing rules

- One concern per document.
- Link instead of copying. Prefer relative links within `docs/`.
- State phase honesty: mark stubs and unimplemented surfaces clearly.
- Do not invent API contracts, database schemas, auth providers, or scripts
  that do not exist.
- When behavior changes, update the product/UX source of truth first, then
  adjust engineering docs if structure is affected.

## ADR rules

See [`../architecture/decisions/README.md`](../architecture/decisions/README.md).

## AI-facing docs

- `AGENTS.md` defines read order and hard boundaries.
- `.cursor/rules/*.mdc` stay concise (about 50 lines) and route to these docs.
- Do not paste full UX flows into Cursor rules.
