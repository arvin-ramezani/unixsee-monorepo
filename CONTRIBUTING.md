# Contributing

## Current workflow

This monorepo is documentation-first. Prefer improving canonical docs before
scaffolding application code unless you are explicitly starting an app.

1. Read [`docs/README.md`](./docs/README.md) and the architecture overview.
2. Find the owning folder in [`docs/architecture/monorepo.md`](./docs/architecture/monorepo.md).
3. Update or add the correct doc type (see
   [`docs/quality/documentation.md`](./docs/quality/documentation.md)).
4. Keep Cursor rules and `AGENTS.md` as thin pointers — do not duplicate long
   product/UX text there.

## Where changes go

| Change | Put it in |
|---|---|
| Product behavior | `docs/product/` |
| Admin UX journey | `docs/product/ux-flows/` |
| Structural / stack decision | ADR under `docs/architecture/decisions/` |
| Frontend conventions | `docs/frontend/` |
| Admin UI code (when scaffolded) | `admin-panel/` |
| Customer / public UI code | `client/` |
| API / business rules | `backend/` |
| Edge agent | `agent/` |

## Phase boundaries

Until a superseding ADR lands, Next.js work is UI-only. Do not add NestJS
integration, database access, authentication, authorization, or agent/VPS
calls from admin or client apps. See
[`docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](./docs/architecture/decisions/0003-ui-only-phase-boundaries.md).

## Validation

- Do not invent lint/build/test scripts that do not exist.
- Never claim validation passed unless it actually ran.
- Follow [`docs/quality/validation.md`](./docs/quality/validation.md).

## Dependencies

Do not add dependencies unless required. Prefer existing dependencies and
native platform capabilities once apps are scaffolded.

## Documentation quality

- Prefer relative links within `docs/`.
- Mark stubs and unimplemented surfaces clearly.
- Preserve document-control tables and confidence summaries in UX flow specs.
- Use ADRs for durable structural decisions, not for routine features.
