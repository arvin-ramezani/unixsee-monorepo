# Unixsee monorepo

Unixsee is a premium managed infrastructure and monitoring service for
WordPress and WooCommerce websites.

This repository contains the NestJS control plane under `backend/`, two VPS
edge agents (`agent/` for Phase 1, `monitoring-agent/` later), plus product and
architecture docs for the customer/public app and administrator panel.

## Surfaces

| Folder | Surface |
|---|---|
| `client/` | Public website and customer dashboard (Next.js) |
| `admin-panel/` | Staff administrator panel (Next.js) |
| `backend/` | NestJS API, persistence, orchestration, agent control plane |
| `agent/` | Phase 1 VPS agent (new; inventory / site stack / 3m visitors) |
| `monitoring-agent/` | Monitoring edge agent (existing; develop later) |
| `docs/` | Canonical documentation |

Layout decision: [`docs/architecture/decisions/0001-flat-monorepo-layout.md`](./docs/architecture/decisions/0001-flat-monorepo-layout.md).  
Two agents: [`docs/architecture/decisions/0007-two-vps-agents.md`](./docs/architecture/decisions/0007-two-vps-agents.md).

## Start here

1. [`docs/README.md`](./docs/README.md) — documentation map and reading order
2. [`docs/architecture/overview.md`](./docs/architecture/overview.md) — system surfaces and trust boundaries
3. [`docs/product/phase-1-application-features.md`](./docs/product/phase-1-application-features.md) — Phase 1 behavior

For NestJS work: [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md).  
For Phase 1 agent work: [`docs/agent/prd.md`](./docs/agent/prd.md) and [`agent/README.md`](./agent/README.md).  
For monitoring-agent (later): [`monitoring-agent/README.md`](./monitoring-agent/README.md).  
For admin UI work: [`docs/product/README.md`](./docs/product/README.md).

## Current status

- Product Phase 1 and admin UX flows: documented
- Monorepo architecture and ADRs (including API audience namespaces): documented
- `backend/`: NestJS control plane present; Phase 1 module gaps documented
- `agent/`: Phase 1 VPS agent scaffold (PRD-owned; implement from scratch)
- `monitoring-agent/`: existing monitoring agent present; develop later
- `client/`: public website + customer dashboard Next.js app present
- `admin-panel/`: staff Next.js app present (UI-first / fixture data)
- Automated monorepo workspace tests: none yet

Do not invent unavailable scripts or claim builds pass. See
[`docs/quality/validation.md`](./docs/quality/validation.md).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

AI agents should start with [`AGENTS.md`](./AGENTS.md).
