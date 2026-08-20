# Backend documentation

> **Status:** Accepted
>
> **Last verified:** 2026-08-08

## Ownership

`backend/` hosts the NestJS API and control plane (package `unixsee-api`).

NestJS is responsible for:

- Authentication, sessions, and authorization (keep current JWT/OTP design)
- Persistence (PostgreSQL via Prisma)
- Business rules and orchestration
- Communication with the VPS agent
- Exposing data and mutations to `admin-panel/` and `client/`

## Trust boundary

- Agents connect to NestJS over outbound HTTPS.
- Admin and client applications talk to NestJS only — never to agents or VPS
  hosts.
- NestJS validates agent credentials and payloads before persisting data.

See [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md)
and [`../architecture/overview.md`](../architecture/overview.md).

## API style

- REST under audience namespaces (public / customer / admin / internal agent).
- Selective Socket.io (`/realtime`) for customer monitoring.
- Domain modules with separate controllers per audience — not a mega admin
  module.

Canonical map: [`modules-and-routes.md`](./modules-and-routes.md).

Audience DTO/lifecycle contracts: [`contracts/`](./contracts/) (start with
customer tickets).

ADRs:

- [`../architecture/decisions/0004-api-audience-namespaces.md`](../architecture/decisions/0004-api-audience-namespaces.md)
- [`../architecture/decisions/0005-domain-modules-multi-audience-controllers.md`](../architecture/decisions/0005-domain-modules-multi-audience-controllers.md)

## Current vs Phase 1 target

**Implemented today (keep):** `/api/v1/auth/*`, `/api/v1/users/me`,
`/api/v1/dashboard/*`, Socket.io `/realtime`, `/api/internal/agent/v1/ingest`,
plus internal metrics/uptime/health/event support.

**Add for Phase 1:** tenants, plans, plan-requests, complementary-services
(public consultant intake), servers/enrollment, discoveries, tickets,
notifications, activities, audit, operational-actions, admin overview, and
proper alerts REST. See the module map for routes and slices.

Do not invent final DTOs in UI apps; implement contracts in Nest and document
them under [`contracts/`](./contracts/) before or with the Nest change.

## Related docs

- Stack: [`../architecture/decisions/0002-stack-choices.md`](../architecture/decisions/0002-stack-choices.md)
- Agent: [`../agent/README.md`](../agent/README.md)
- Phase 1 features: [`../product/phase-1-application-features.md`](../product/phase-1-application-features.md)
- Customer assistant (deferred): [`../product/customer-assistant-prd.md`](../product/customer-assistant-prd.md),
  ADR [`0013`](../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md),
  engineering [`customer-assistant.md`](./customer-assistant.md)
- Local design notes under `backend/docs/` are secondary; where they conflict
  with monorepo ADRs or [`modules-and-routes.md`](./modules-and-routes.md), the
  monorepo docs win.
