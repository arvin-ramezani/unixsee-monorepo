# Backend shared contracts

> **Status:** Accepted
>
> **Last verified:** 2026-08-24

## Ownership

`backend/` hosts the NestJS API and control plane (package `unixsee-api`).

NestJS owns:

- authentication, sessions, and authorization under the current JWT/OTP design;
- PostgreSQL persistence through Prisma;
- business rules and orchestration;
- communication with VPS agents;
- data and mutations exposed to `admin-panel/` and `client/`.

Backend-only implementation conventions and runbooks start at
[`../../backend/docs/README.md`](../../backend/docs/README.md). This root
directory owns the route and wire contracts consumed across deployables.

## Trust boundary

- Agents connect to NestJS over outbound HTTPS.
- Admin and client talk to NestJS only—never to agents or VPS hosts.
- NestJS validates agent credentials and payloads before persistence.

See [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md)
and [`../architecture/overview.md`](../architecture/overview.md).

## API style

- REST uses public, customer, admin, and internal-agent audience namespaces.
- Socket.io `/realtime` is selective customer monitoring transport.
- Domain modules use audience-specific controllers; do not create a mega admin
  module.

Canonical route/module map: [`modules-and-routes.md`](./modules-and-routes.md).

Request/response and lifecycle contracts: [`contracts/`](./contracts/).

Accepted decisions:

- [`0004-api-audience-namespaces.md`](../architecture/decisions/0004-api-audience-namespaces.md)
- [`0005-domain-modules-multi-audience-controllers.md`](../architecture/decisions/0005-domain-modules-multi-audience-controllers.md)

## Current versus Phase 1 target

Implemented today includes `/api/v1/auth/*`, `/api/v1/users/me`,
`/api/v1/dashboard/*`, Socket.io `/realtime`,
`/api/internal/agent/v1/ingest`, and internal metrics/uptime/health/event
support.

Phase 1 adds tenants, plans, plan requests, complementary services, server
enrollment/discovery, tickets, notifications, activities, audit, operational
actions, admin overview, and alerts REST. The route map identifies implemented
versus target slices.

Do not invent final DTOs in UI apps. Implement contracts in Nest and document
them under [`contracts/`](./contracts/) with the Nest change.

## Authority of local backend docs

- [`../../backend/docs/development/conventions.md`](../../backend/docs/development/conventions.md)
  is canonical for backend-only logging, typed config, scheduling, and uptime
  implementation rules.
- Historical architecture/design notes under `backend/docs/` remain secondary.
  Where they conflict with accepted ADRs, [`modules-and-routes.md`](./modules-and-routes.md),
  or [`contracts/`](./contracts/), the accepted shared contract wins.

## Related

- Stack: [`0002-stack-choices.md`](../architecture/decisions/0002-stack-choices.md)
- Agent integration: [`../agent/README.md`](../agent/README.md)
- Phase 1 product: [`../product/phase-1-application-features.md`](../product/phase-1-application-features.md)
- Deferred customer assistant: [`customer-assistant.md`](./customer-assistant.md)
