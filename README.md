# Unixsee monorepo

Unixsee is a premium managed infrastructure and monitoring service for
WordPress and WooCommerce websites.

This repository contains the NestJS control plane under `backend/`, plus
product and architecture docs for the customer/public app, administrator panel,
and VPS edge agent. Next.js apps are not scaffolded yet.

## Surfaces

| Folder | Surface |
|---|---|
| `client/` | Public website and customer dashboard (Next.js) |
| `admin-panel/` | Staff administrator panel (Next.js) |
| `backend/` | NestJS API, persistence, orchestration, agent control plane |
| `agent/` | VPS edge agent (outbound HTTPS to NestJS) |
| `docs/` | Canonical documentation |

Layout decision: [`docs/architecture/decisions/0001-flat-monorepo-layout.md`](./docs/architecture/decisions/0001-flat-monorepo-layout.md).

## Start here

1. [`docs/README.md`](./docs/README.md) — documentation map and reading order
2. [`docs/architecture/overview.md`](./docs/architecture/overview.md) — system surfaces and trust boundaries
3. [`docs/product/phase-1-application-features.md`](./docs/product/phase-1-application-features.md) — Phase 1 behavior

For NestJS work: [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md).  
For admin UI work: [`docs/product/README.md`](./docs/product/README.md).

## Current status

- Product Phase 1 and admin UX flows: documented
- Monorepo architecture and ADRs (including API audience namespaces): documented
- `backend/`: NestJS control plane present; Phase 1 module gaps documented
- `client/` / `admin-panel/` / `agent/`: not scaffolded yet
- Automated monorepo workspace tests: none yet

Do not invent unavailable scripts or claim builds pass. See
[`docs/quality/validation.md`](./docs/quality/validation.md).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

AI agents should start with [`AGENTS.md`](./AGENTS.md).
