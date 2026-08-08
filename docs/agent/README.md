# Agent documentation

> **Status:** Stub — the VPS edge agent is not scaffolded in this repository yet.

## Ownership

`agent/` will host the edge process that runs on managed VPS hosts.

## Responsibilities

- Enroll with NestJS using a staff-issued one-time enrollment token
- Discover server and website inventory
- Push monitoring and discovery payloads to NestJS over outbound HTTPS
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

## Related docs

- Backend: [`../backend/README.md`](../backend/README.md)
- Overview: [`../architecture/overview.md`](../architecture/overview.md)
- Admin servers/websites/agents UX:
  [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
