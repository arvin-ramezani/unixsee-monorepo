# Backend documentation

> **Status:** Stub — NestJS is not scaffolded in this repository yet.

## Ownership

`backend/` will host the NestJS API and control plane.

NestJS is responsible for:

- Authentication, sessions, and authorization
- Persistence (PostgreSQL)
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

REST, plus selective realtime where Phase 1 product requirements need it.
Final routes, DTOs, auth providers, and event names require dedicated API
specifications — do not invent them in UI code.

## Related docs

- Stack: [`../architecture/decisions/0002-stack-choices.md`](../architecture/decisions/0002-stack-choices.md)
- Agent: [`../agent/README.md`](../agent/README.md)
- Phase 1 features: [`../product/phase-1-application-features.md`](../product/phase-1-application-features.md)
