# Admin-panel documentation

App-local implementation rules and runbooks for the standalone Unixsee staff
Next.js deployable. Start here after [`../AGENTS.md`](../AGENTS.md).

## Task routes

| When changing…                                                           | Read                                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Select, DropdownMenu, Dialog, AlertDialog, Sheet, or component structure | [`development/components.md`](development/components.md)                                 |
| File placement or app boundary                                           | [`architecture/project.md`](architecture/project.md)                                     |
| Next.js/App Router behavior                                              | [`frontend/nextjs.md`](frontend/nextjs.md) plus installed `node_modules/next/dist/docs/` |
| Tailwind v4, tokens, Persian RTL                                         | [`frontend/styling.md`](frontend/styling.md)                                             |
| Zustand/local state                                                      | [`frontend/state.md`](frontend/state.md)                                                 |
| Fixture vs wired Nest data                                               | [`development/data.md`](development/data.md)                                             |
| Development workflow                                                     | [`development/workflow.md`](development/workflow.md)                                     |
| Validation                                                               | [`quality/validation.md`](quality/validation.md)                                         |
| Panel/agent archive deployment                                           | [`runbooks/deployment.md`](runbooks/deployment.md)                                       |

The Base UI Select rule is intentionally named at both routing layers because
it is high frequency: `SelectValue` needs visible-label children and
`SelectContent` needs `alignItemWithTrigger={false}`. Detailed behavior remains
canonical in [`development/components.md`](development/components.md).

## Monorepo-only contract routes

Ordinary app implementation should be possible from this folder alone. When a
task changes a shared product, auth, or API contract, work in the monorepo and
load:

- Admin session/data contracts: [`../../docs/frontend/admin-data-fetching.md`](../../docs/frontend/admin-data-fetching.md)
  and [`admin-domain-data-fetching.md`](../../docs/frontend/admin-domain-data-fetching.md)
- ADR 0012: [`../../docs/architecture/decisions/0012-admin-nest-auth-integration.md`](../../docs/architecture/decisions/0012-admin-nest-auth-integration.md)
- API route map/contracts: [`../../docs/backend/`](../../docs/backend/)
- Shared product/UX: [`../../docs/product/`](../../docs/product/)

Do not invent a shared contract when those sources are unavailable.

## Local product copies

Files under [`product/`](product/) support standalone deploy-repo context. In
the monorepo they are mirrors, not a second authority: update the owning root
`docs/product/` document first, then synchronize and verify the local copy.
