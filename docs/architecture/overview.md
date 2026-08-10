# System overview

> **Status:** Accepted
>
> **Last verified:** 2026-08-09

## Product

Unixsee is a premium managed infrastructure and monitoring service for WordPress
and WooCommerce websites. Phase 1 product behavior is defined in
[`docs/product/phase-1-application-features.md`](../product/phase-1-application-features.md).

## Surfaces

| Surface | Repo folder | Role |
|---|---|---|
| Public website + customer dashboard | `client/` | Customer-facing Next.js application |
| Administrator panel | `admin-panel/` | Staff workflows for operating the platform |
| API and control plane | `backend/` | NestJS: auth, persistence, orchestration, agent control |
| Phase 1 VPS agent | `agent/` | Inventory, site stack, 3m visitors (PRD; build from scratch) |
| Monitoring edge agent | `monitoring-agent/` | Host/LiteSpeed monitoring (existing; develop later) |

Shared documentation lives in `docs/`. There is no shared application package
yet; see [`monorepo.md`](./monorepo.md).

## Trust boundaries

```text
client ──────────────┐
                     ├──► NestJS (backend) ◄── agent / monitoring-agent (outbound HTTPS)
admin-panel ─────────┘
```

- NestJS is the authority for business rules, authorization, persistence, and
  agent validation.
- Edge agents communicate with NestJS only (outbound HTTPS).
- Admin and client applications never talk to agents or VPS hosts directly.
- Website customer visibility follows assignment and activation rules, not raw
  agent discovery. Details:
  [`docs/product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md).
- Two-agent split:
  [`decisions/0007-two-vps-agents.md`](./decisions/0007-two-vps-agents.md).

## Language and direction

Product workflows support Persian RTL and English LTR. Frontend apps are
Persian and RTL-first; see [`docs/frontend/styling.md`](../frontend/styling.md).

## Current phase

- `backend/` is an active NestJS control plane. Module and route targets:
  [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md).
- `agent/` is the Phase 1 VPS agent scaffold owned by
  [`../agent/prd.md`](../agent/prd.md).
- `monitoring-agent/` holds the existing monitoring codebase for later
  development. See [`../../monitoring-agent/README.md`](../../monitoring-agent/README.md).
- `client/` is an active public + customer Next.js app (UI-first until Nest
  integration is allowed). App-scoped docs live under `client/docs/`; product
  and architecture truth stay in monorepo `docs/`.
- `admin-panel/` is an active staff Next.js app (UI-first / fixtures). App-scoped
  docs live under `admin-panel/docs/`; product UX flows stay in monorepo
  `docs/product/`.
- Follow [`decisions/0003-ui-only-phase-boundaries.md`](./decisions/0003-ui-only-phase-boundaries.md)
  for Next.js apps until a superseding integration ADR lands.
- API audience namespaces:
  [`decisions/0004-api-audience-namespaces.md`](./decisions/0004-api-audience-namespaces.md).

## Related docs

- Monorepo ownership: [`monorepo.md`](./monorepo.md)
- Next.js app layout: [`project.md`](./project.md)
- Architecture decisions: [`decisions/`](./decisions/)
- Backend modules/routes: [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
- Product index: [`../product/README.md`](../product/README.md)
