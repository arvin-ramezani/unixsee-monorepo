# Agent documentation

> **Status:** Active — VPS edge agent lives in `agent/` (unixsee-monitor-agent).

## Ownership

`agent/` hosts the edge process that runs on managed VPS hosts (DirectAdmin + OpenLiteSpeed WordPress / WooCommerce fleets).

## Responsibilities

- Enroll with NestJS using a staff-issued one-time enrollment token (`POST /api/internal/agent/v1/enroll`)
- Discover server and website inventory (OLS active routes, DirectAdmin domains/subdomains/pointers, optional filesystem fallbacks)
- Push monitoring and discovery payloads to NestJS over outbound HTTPS (`/ingest`, `/heartbeat`)
- Remain unreachable from admin/client UIs

## Trust boundary

```text
agent ──outbound HTTPS──► NestJS (backend)
```

- The agent never exposes a control API to browsers.
- NestJS validates the agent and persists accepted data.
- Admin assignment and plan enablement happen after NestJS has trustworthy
  records — not from raw discovery alone.

Details: [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md).

## Install / ops

See the agent package README: [`../../agent/README.md`](../../agent/README.md).

## Related docs

- Backend modules/routes:
  [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
  (agent ingest/enroll under `/api/internal/agent/v1`)
- Backend index: [`../backend/README.md`](../backend/README.md)
- Overview: [`../architecture/overview.md`](../architecture/overview.md)
- Admin servers/websites/agents UX:
  [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
