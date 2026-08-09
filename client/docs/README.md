# Client documentation

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-08

App-scoped docs for the Unixsee **client** Next.js surface (`client/`): public
website and customer dashboard.

Canonical product behavior, monorepo ownership, NestJS contracts, and agent
boundaries live in the monorepo `docs/` tree — do not duplicate them here.

## Monorepo sources of truth

| Concern | Read |
|---|---|
| System overview / trust boundaries | [`../../docs/architecture/overview.md`](../../docs/architecture/overview.md) |
| Folder ownership | [`../../docs/architecture/monorepo.md`](../../docs/architecture/monorepo.md) |
| Phase 1 product behavior | [`../../docs/product/phase-1-application-features.md`](../../docs/product/phase-1-application-features.md) |
| Frontend conventions (shared) | [`../../docs/frontend/README.md`](../../docs/frontend/README.md) |
| UI-only phase boundaries | [`../../docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](../../docs/architecture/decisions/0003-ui-only-phase-boundaries.md) |
| NestJS routes | [`../../docs/backend/modules-and-routes.md`](../../docs/backend/modules-and-routes.md) |

## App-scoped docs in this folder

### Engineering

- [`engineering/repository-structure.md`](engineering/repository-structure.md): file placement inside `client/`
- [`engineering/nextjs.md`](engineering/nextjs.md): App Router, data, forms, localization
- [`engineering/ui.md`](engineering/ui.md): components, Tailwind, accessibility, motion, RTL/LTR
- [`engineering/quality-and-review.md`](engineering/quality-and-review.md): local validation and review expectations

### Features, design, workflow, operations

- [`features/`](features/): client-only feature notes
- [`design/color-palette.md`](design/color-palette.md)
- [`workflow/definition-of-done.md`](workflow/definition-of-done.md)
- [`runbooks/development.md`](runbooks/development.md)
- [`runbooks/deployment.md`](runbooks/deployment.md)
- [`runbooks/staging.md`](runbooks/staging.md)
- [`runbooks/server/`](runbooks/server/): host install notes used by this app’s deploy path

## Admin panel

Staff UI belongs in monorepo `admin-panel/`, not inside this app. Do not add an
`(admin)` route group here unless a superseding ADR changes that boundary.
