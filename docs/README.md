# Unixsee documentation

Canonical docs for the Unixsee monorepo. Application code will live in flat root
folders; this tree is the source of truth for product behavior, architecture,
and engineering conventions.

## Start here

| You want to… | Read |
|---|---|
| Understand the system | [`architecture/overview.md`](./architecture/overview.md) |
| Know which folder owns what | [`architecture/monorepo.md`](./architecture/monorepo.md) |
| Implement admin UI | [`product/README.md`](./product/README.md) → Phase 1 → matching UX flow → [`frontend/README.md`](./frontend/README.md) |
| Plan client Nest auth / data fetching | [`frontend/client-data-fetching.md`](./frontend/client-data-fetching.md) + [`frontend/client-domain-data-fetching.md`](./frontend/client-domain-data-fetching.md) + ADRs [`0010`](./architecture/decisions/0010-client-hybrid-auth-data-fetching.md) / [`0011`](./architecture/decisions/0011-client-nest-auth-integration.md) |
| Plan admin Nest auth / data fetching | [`frontend/admin-data-fetching.md`](./frontend/admin-data-fetching.md) + [`frontend/admin-domain-data-fetching.md`](./frontend/admin-domain-data-fetching.md) + ADRs [`0010`](./architecture/decisions/0010-client-hybrid-auth-data-fetching.md) / [`0012`](./architecture/decisions/0012-admin-nest-auth-integration.md) |
| Work on NestJS | [`backend/README.md`](./backend/README.md) → [`backend/modules-and-routes.md`](./backend/modules-and-routes.md) → [`backend/contracts/`](./backend/contracts/) |
| Work on the Phase 1 VPS agent | [`agent/README.md`](./agent/README.md) + [`agent/setup.md`](./agent/setup.md) + [`prd.md`](./agent/prd.md) |
| Work on monitoring-agent (later) | [`../monitoring-agent/README.md`](../monitoring-agent/README.md) |
| Change product behavior | [`product/phase-1-application-features.md`](./product/phase-1-application-features.md) and [`quality/documentation.md`](./quality/documentation.md) |
| Git / PR / Cursor review workflow | [`quality/git-and-pr-workflow.md`](./quality/git-and-pr-workflow.md) |
| Record a structural decision | [`architecture/decisions/`](./architecture/decisions/) |

## Map

```text
docs/
├── architecture/     System overview, monorepo ownership, ADRs, Next.js layout
├── frontend/         Conventions for admin-panel and client Next.js apps
├── backend/          NestJS ownership, modules, route map, API contracts
├── agent/            Edge agent ownership and ops pointers
├── product/          Phase 1 features, notes, admin UX flows
└── quality/          Validation and documentation standards
```

## Reading order for new contributors

1. [`architecture/overview.md`](./architecture/overview.md)
2. [`architecture/monorepo.md`](./architecture/monorepo.md)
3. [`architecture/decisions/0011-client-nest-auth-integration.md`](./architecture/decisions/0011-client-nest-auth-integration.md) (`client/` Nest auth)
4. [`architecture/decisions/0012-admin-nest-auth-integration.md`](./architecture/decisions/0012-admin-nest-auth-integration.md) (`admin-panel/` Nest auth)
5. [`product/phase-1-application-features.md`](./product/phase-1-application-features.md) (as needed)
6. Surface-specific docs for the work you are doing

## Rules of the docs

- Product behavior lives under `product/`.
- Engineering structure and conventions live under `architecture/`, `frontend/`,
  `backend/`, and `agent/` (plus `monitoring-agent/` for the later monitor).
- Cursor rules and `AGENTS.md` point here; they must not become a second source
  of truth. See [`quality/documentation.md`](./quality/documentation.md).
