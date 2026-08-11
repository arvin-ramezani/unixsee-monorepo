# Agent guide

This file orients AI agents working in the Unixsee monorepo. Canonical detail
lives under `docs/` — read docs instead of inventing structure or product
behavior.

## Mandatory read order

Before making changes, read in this order as relevant to the task:

1. [`docs/architecture/overview.md`](./docs/architecture/overview.md)
2. [`docs/architecture/monorepo.md`](./docs/architecture/monorepo.md)
3. Surface docs for the work:
   - Frontend: [`docs/frontend/README.md`](./docs/frontend/README.md) and
     [`docs/frontend/nextjs.md`](./docs/frontend/nextjs.md) (version-matched
     Next.js docs under each app’s `node_modules/next/dist/docs/`)
   - Client auth session / Nest data fetching:
     [`docs/frontend/client-data-fetching.md`](./docs/frontend/client-data-fetching.md)
     (Layer 1) and
     [`docs/frontend/client-domain-data-fetching.md`](./docs/frontend/client-domain-data-fetching.md)
     (Layer 2), plus ADRs [`0010`](./docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md) /
     [`0011`](./docs/architecture/decisions/0011-client-nest-auth-integration.md)
   - Backend: [`docs/backend/README.md`](./docs/backend/README.md),
  [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md),
  and [`docs/backend/contracts/`](./docs/backend/contracts/) when changing APIs
   - Agent: [`docs/agent/README.md`](./docs/agent/README.md)
4. Product: [`docs/product/phase-1-application-features.md`](./docs/product/phase-1-application-features.md)
5. Matching UX flow under [`docs/product/ux-flows/`](./docs/product/ux-flows/) when doing admin UI

Also respect [`docs/architecture/decisions/0011-client-nest-auth-integration.md`](./docs/architecture/decisions/0011-client-nest-auth-integration.md) for `client/` Nest auth/data-fetch (supersedes ADR 0003), and backend ADRs [`0004`](./docs/architecture/decisions/0004-api-audience-namespaces.md) / [`0005`](./docs/architecture/decisions/0005-domain-modules-multi-audience-controllers.md) when changing Nest routes or modules. `admin-panel/` remains UI-only until its own ADR.

## Repository layout

Flat deployables at repo root (no `apps/` / `packages/` yet):

- `admin-panel/` — staff Next.js UI
- `client/` — customer / public Next.js UI
- `backend/` — NestJS (active control plane)
- `agent/` — Phase 1 VPS agent (new; see `docs/agent/prd.md`)
- `monitoring-agent/` — monitoring edge agent (existing; develop later)
- `docs/` — canonical documentation

## Hard boundaries

- Do not invent NestJS routes or DTOs that conflict with
  [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md).
- Do not redesign authentication; extend role/capability checks on `/admin` instead.
- Do not add API, database, auth, or backend services inside Next.js apps except
  where an Accepted ADR allows it (`client/` Nest auth/JWT fetch: ADR 0011).
  `admin-panel/` remains UI-only until its own ADR.
- Admin and client never talk to agents or VPS hosts; NestJS is the control
  plane.
- Do not invent unavailable npm/pnpm scripts or claim lint/build/tests passed
  unless they actually ran.
- Do not treat deferred Phase 1 features as shipped.
- Do not rewrite large product/UX specs unless fixing a factual conflict; prefer
  indexes and cross-links.
- Keep `.cursor/rules` thin; put lasting detail in `docs/`.

## Cursor rules

| Rule | When it applies |
|---|---|
| [`.cursor/rules/monorepo.mdc`](./.cursor/rules/monorepo.mdc) | Always |
| [`.cursor/rules/frontend-next.mdc`](./.cursor/rules/frontend-next.mdc) | `admin-panel/**`, `client/**` |
| [`.cursor/rules/backend-nestjs.mdc`](./.cursor/rules/backend-nestjs.mdc) | `backend/**` |
| [`.cursor/rules/docs-product.mdc`](./.cursor/rules/docs-product.mdc) | `docs/product/**` |

## Documentation standards

[`docs/quality/documentation.md`](./docs/quality/documentation.md)
