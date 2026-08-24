# System overview

> **Status:** Accepted
>
> **Last verified:** 2026-08-24

## Product

Unixsee is a premium managed infrastructure and monitoring service for
WordPress and WooCommerce websites. Phase 1 product behavior is defined in
[`docs/product/phase-1-application-features.md`](../product/phase-1-application-features.md).

## Surfaces

| Surface                             | Repo folder         | Role                                                                           |
| ----------------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| Public website + customer dashboard | `client/`           | Customer-facing Next.js application                                            |
| Administrator panel                 | `admin-panel/`      | Staff workflows for operating the platform                                     |
| API and control plane               | `backend/`          | NestJS auth, persistence, orchestration, and agent control                     |
| Phase 1 VPS agent                   | `agent/`            | OLS inventory, protected site-stack probe, private visitors, outbound commands |
| Monitoring edge agent               | `monitoring-agent/` | Host/LiteSpeed monitoring (develop later)                                      |

Shared contracts and decisions live in root `docs/`. Each deployable keeps its
own implementation conventions and runbooks under `<app>/docs/`; see
[`monorepo.md`](./monorepo.md).

## Trust boundaries

```text
client ──────────────┐
                     ├──► NestJS (backend) ◄── agent / monitoring-agent
admin-panel ─────────┘                         (outbound HTTPS)
```

- NestJS is the authority for business rules, authorization, persistence, and
  agent validation.
- Edge agents communicate with NestJS only over outbound HTTPS.
- Admin and client never communicate with agents or VPS hosts directly.
- Customer website visibility follows assignment and activation rules, not raw
  discovery. See
  [`product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md).
- The two-agent boundary is accepted in
  [`decisions/0007-two-vps-agents.md`](./decisions/0007-two-vps-agents.md).

## Language and direction

Product workflows support Persian RTL and English LTR. Frontend apps are
Persian and RTL-first; shared rules live in
[`frontend/styling.md`](../frontend/styling.md), with app-specific detail in
each frontend app's local docs.

## Current phase

- `backend/` is the active NestJS control plane. Shared route targets:
  [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md).
- `agent/` is the Phase 1 VPS agent scaffold owned by
  [`../agent/prd.md`](../agent/prd.md); web-server-only scope is accepted in
  [`decisions/0014-web-server-only-agent.md`](./decisions/0014-web-server-only-agent.md).
- `monitoring-agent/` contains the existing monitoring codebase for later work.
- `client/` is active; Nest auth/JWT fetch is allowed under ADR 0011. Its
  implementation docs start at [`../../client/docs/README.md`](../../client/docs/README.md).
- `admin-panel/` is active; staff Nest auth/data is allowed under ADR 0012.
  Its implementation docs start at
  [`../../admin-panel/docs/README.md`](../../admin-panel/docs/README.md).
- Shared Next.js/Nest integration decisions are ADRs
  [`0011`](./decisions/0011-client-nest-auth-integration.md) and
  [`0012`](./decisions/0012-admin-nest-auth-integration.md); ADR 0003 is
  superseded.

## Related docs

- Documentation ownership: [`../quality/documentation.md`](../quality/documentation.md)
- Monorepo ownership: [`monorepo.md`](./monorepo.md)
- Architecture decisions: [`decisions/`](./decisions/)
- Backend route/contracts index: [`../backend/README.md`](../backend/README.md)
- Product index: [`../product/README.md`](../product/README.md)
