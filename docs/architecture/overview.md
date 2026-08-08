# System overview

> **Status:** Accepted
>
> **Last verified:** 2026-08-08

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
| VPS edge agent | `agent/` | Discovers and reports server/website data to NestJS |

Shared documentation lives in `docs/`. There is no shared application package
yet; see [`monorepo.md`](./monorepo.md).

## Trust boundaries

```text
client ──────────────┐
                     ├──► NestJS (backend) ◄── agent (outbound HTTPS)
admin-panel ─────────┘
```

- NestJS is the authority for business rules, authorization, persistence, and
  agent validation.
- The agent communicates with NestJS only (outbound HTTPS).
- Admin and client applications never talk to agents or VPS hosts directly.
- Website customer visibility follows assignment and activation rules, not raw
  agent discovery. Details:
  [`docs/product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md).

## Language and direction

Product workflows support Persian RTL and English LTR. Frontend apps are
Persian and RTL-first; see [`docs/frontend/styling.md`](../frontend/styling.md).

## Current phase

This repository is documentation-first. Application folders are placeholders
until scaffolding begins. UI work must follow the UI-only boundaries in
[`decisions/0003-ui-only-phase-boundaries.md`](./decisions/0003-ui-only-phase-boundaries.md)
until backend integration ADRs supersede them.

## Related docs

- Monorepo ownership: [`monorepo.md`](./monorepo.md)
- Next.js app layout: [`project.md`](./project.md)
- Architecture decisions: [`decisions/`](./decisions/)
- Product index: [`../product/README.md`](../product/README.md)
