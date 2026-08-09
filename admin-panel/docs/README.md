# Admin panel documentation

> **Status:** Current
>
> **Owner:** Frontend / admin UI
>
> **Last verified:** 2026-08-08

App-scoped docs for the Unixsee **admin-panel** Next.js surface: staff
workflows with fixture data in the current UI-only phase.

Canonical product behavior, UX flows, monorepo ownership, NestJS contracts, and
shared frontend conventions live in the monorepo `docs/` tree — do not
duplicate them here.

## Monorepo sources of truth

| Concern | Read |
|---|---|
| System overview / trust boundaries | [`../../docs/architecture/overview.md`](../../docs/architecture/overview.md) |
| Folder ownership | [`../../docs/architecture/monorepo.md`](../../docs/architecture/monorepo.md) |
| App layout conventions | [`../../docs/architecture/project.md`](../../docs/architecture/project.md) |
| Phase 1 product behavior | [`../../docs/product/phase-1-application-features.md`](../../docs/product/phase-1-application-features.md) |
| Admin UX flows | [`../../docs/product/README.md`](../../docs/product/README.md) |
| Shared frontend conventions | [`../../docs/frontend/README.md`](../../docs/frontend/README.md) |
| UI-only phase boundaries | [`../../docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](../../docs/architecture/decisions/0003-ui-only-phase-boundaries.md) |
| Validation expectations | [`../../docs/quality/validation.md`](../../docs/quality/validation.md) |
| NestJS routes | [`../../docs/backend/modules-and-routes.md`](../../docs/backend/modules-and-routes.md) |

## App-scoped docs in this folder

- [`development/components.md`](development/components.md): component reuse and placement in this app
- [`development/data.md`](development/data.md): fixture / dummy-data patterns
- [`development/workflow.md`](development/workflow.md): local implement → validate loop for this package

## Boundaries

- This app is staff UI only. Do not add Nest modules, Prisma ownership, or
  agent runtime here.
- Do not talk to VPS agents from the browser; NestJS is the control plane.
- Customer/public UI belongs in `client/`, not here.
