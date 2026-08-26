# Unixsee monorepo agent guide

Use this file for repository-wide boundaries and routing only. Shared product,
architecture, API, and operational contracts live under [`docs/`](./docs/).
Each deployable owns its implementation conventions under `<app>/docs/` and
routes to them from `<app>/AGENTS.md`.

## Read order

Read only the context relevant to the task:

1. [`docs/architecture/overview.md`](./docs/architecture/overview.md)
2. [`docs/architecture/monorepo.md`](./docs/architecture/monorepo.md)
3. The target app's `AGENTS.md` and documentation index:
   - Admin: [`admin-panel/AGENTS.md`](./admin-panel/AGENTS.md) →
     [`admin-panel/docs/README.md`](./admin-panel/docs/README.md)
   - Client: [`client/AGENTS.md`](./client/AGENTS.md) →
     [`client/docs/README.md`](./client/docs/README.md)
   - Backend: [`backend/AGENTS.md`](./backend/AGENTS.md) →
     [`backend/docs/README.md`](./backend/docs/README.md)
   - VPS agent: [`docs/agent/README.md`](./docs/agent/README.md)
   - Monitoring agent: [`monitoring-agent/README.md`](./monitoring-agent/README.md)
4. Shared product or contract docs only when the task crosses an app boundary.

For admin product work, also read the matching flow under
[`docs/product/ux-flows/`](./docs/product/ux-flows/).

## High-frequency routes

| When changing…                                              | Read first                                                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Select, DropdownMenu, Dialog, AlertDialog, or Sheet   | [`admin-panel/docs/development/components.md`](./admin-panel/docs/development/components.md)                                                                              |
| Client buttons or button links                              | [`client/AGENTS.md`](./client/AGENTS.md#high-frequency-ui-rules) → [`client/docs/engineering/ui.md`](./client/docs/engineering/ui.md)                                                               |
| Client dashboard page layout                                | [`client/docs/engineering/ui.md`](./client/docs/engineering/ui.md#customer-dashboard-loading-skeletons)                                                                   |
| Next.js fetch, cache, Server Actions, routing, or streaming | Target app's installed `node_modules/next/dist/docs/` plus its local Next.js doc                                                                                          |
| Client Nest auth/data                                       | [`docs/frontend/client-data-fetching.md`](./docs/frontend/client-data-fetching.md) and [`client-domain-data-fetching.md`](./docs/frontend/client-domain-data-fetching.md) |
| Admin Nest auth/data                                        | [`docs/frontend/admin-data-fetching.md`](./docs/frontend/admin-data-fetching.md) and [`admin-domain-data-fetching.md`](./docs/frontend/admin-domain-data-fetching.md)     |
| Nest modules, routes, or DTOs                               | [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md) and [`docs/backend/contracts/`](./docs/backend/contracts/)                                   |

## Repository layout

- `admin-panel/` — staff Next.js UI
- `client/` — customer/public Next.js UI
- `backend/` — NestJS control plane
- `agent/` — Phase 1 VPS agent
- `monitoring-agent/` — monitoring edge agent (later development)
- `docs/` — shared monorepo contracts and navigation

Do not introduce `apps/` or `packages/` without an accepted ADR.

## Hard boundaries

- The backend base URL already ends in `/api/v1`. Fetch helpers receive only
  the path after that prefix: use `/admin/tickets`, never `/v1/admin/tickets`.
- NestJS owns auth, persistence, business rules, orchestration, and agent
  validation. Admin and client never access agents, VPS hosts, or databases
  directly.
- Do not invent routes or DTOs that conflict with
  [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md).
- Do not redesign authentication. Follow ADR
  [`0011`](./docs/architecture/decisions/0011-client-nest-auth-integration.md)
  for client and ADR
  [`0012`](./docs/architecture/decisions/0012-admin-nest-auth-integration.md)
  for admin.
- Do not treat deferred Phase 1 features as shipped or invent unavailable
  scripts, dependencies, or validation results.
- Preserve unrelated changes and keep changes inside the owning deployable.

## Repository analysis

Use `graphify-out/graph.json` first for dependency, relationship, or impact
questions: `graphify query`, then `graphify path` or `graphify explain` as
needed. Repository docs override Graphify when they conflict. After structural
code changes, run `graphify update .`.

## Documentation and validation

- Follow [`docs/quality/documentation.md`](./docs/quality/documentation.md).
- Put shared contracts in root `docs/`; put app implementation conventions in
  that app's `docs/`. Link to the canonical owner instead of copying it.
- Keep `AGENTS.md` and `.cursor/rules` as compact routing surfaces that name
  high-frequency rules.
- Format every touched Prettier-supported file with the nearest project config,
  then run Prettier `--check` on the same explicit file list.

## Deploy repositories

For “sync/update main repos,” follow
[`docs/quality/deployment-remotes.md`](./docs/quality/deployment-remotes.md).
Never repoint the root `origin`; deploy repos are separate clones.
