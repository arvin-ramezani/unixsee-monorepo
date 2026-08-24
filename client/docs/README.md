# Client documentation

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-24

App-local implementation rules, feature notes, and runbooks for the standalone
Unixsee public/customer Next.js deployable. Start here after
[`../AGENTS.md`](../AGENTS.md).

## Task routes

| When changing…                                       | Read                                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| File placement or app boundary                       | [`engineering/repository-structure.md`](engineering/repository-structure.md)                   |
| Next.js, routing, data, forms, or localization       | [`engineering/nextjs.md`](engineering/nextjs.md) plus installed `node_modules/next/dist/docs/` |
| Components, Tailwind, accessibility, motion, RTL/LTR | [`engineering/ui.md`](engineering/ui.md)                                                       |
| Dashboard page or loading layout                     | [`engineering/ui.md`](engineering/ui.md#customer-dashboard-loading-skeletons)                  |
| Review and validation                                | [`engineering/quality-and-review.md`](engineering/quality-and-review.md)                       |
| Client-only feature notes                            | [`features/README.md`](features/README.md)                                                     |
| Local development/deployment                         | [`runbooks/`](runbooks/)                                                                       |
| Definition of done                                   | [`workflow/definition-of-done.md`](workflow/definition-of-done.md)                             |

The dashboard skeleton rule is intentionally named at both routing layers
because it is high frequency. The detailed UI document remains canonical.

## App-local scope

- `engineering/` owns client implementation conventions.
- `features/` owns client-only behavior notes that do not redefine shared
  product contracts.
- `design/` owns client presentation references.
- `runbooks/` and `workflow/` own client operations and delivery practices.

Staff UI belongs in `admin-panel/`. Do not add an `(admin)` route group here
unless an accepted monorepo decision changes that boundary.

## Monorepo-only contract routes

Ordinary app implementation should be possible from this folder alone. When a
task changes a shared product, auth, or API contract, work in the monorepo and
load:

- Client session/data contracts: [`../../docs/frontend/client-data-fetching.md`](../../docs/frontend/client-data-fetching.md)
  and [`client-domain-data-fetching.md`](../../docs/frontend/client-domain-data-fetching.md)
- ADRs [`0010`](../../docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md)
  and [`0011`](../../docs/architecture/decisions/0011-client-nest-auth-integration.md)
- API route map/contracts: [`../../docs/backend/`](../../docs/backend/)
- Shared product behavior: [`../../docs/product/`](../../docs/product/)

Do not invent a shared contract when those sources are unavailable.
