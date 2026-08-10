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
| Work on NestJS | [`backend/README.md`](./backend/README.md) → [`backend/modules-and-routes.md`](./backend/modules-and-routes.md) |
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
├── backend/          NestJS ownership, modules, and route map
├── agent/            Edge agent ownership and ops pointers
├── product/          Phase 1 features, notes, admin UX flows
└── quality/          Validation and documentation standards
```

## Reading order for new contributors

1. [`architecture/overview.md`](./architecture/overview.md)
2. [`architecture/monorepo.md`](./architecture/monorepo.md)
3. [`architecture/decisions/0003-ui-only-phase-boundaries.md`](./architecture/decisions/0003-ui-only-phase-boundaries.md)
4. [`product/phase-1-application-features.md`](./product/phase-1-application-features.md) (as needed)
5. Surface-specific docs for the work you are doing

## Rules of the docs

- Product behavior lives under `product/`.
- Engineering structure and conventions live under `architecture/`, `frontend/`,
  `backend/`, and `agent/` (plus `monitoring-agent/` for the later monitor).
- Cursor rules and `AGENTS.md` point here; they must not become a second source
  of truth. See [`quality/documentation.md`](./quality/documentation.md).
