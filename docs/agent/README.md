# Agent documentation

> **Status:** Active — two VPS edge deployables (see ADR 0007).

Unixsee runs **two** agents on managed VPS hosts. They share the same trust
boundary (outbound HTTPS to NestJS only) but different product scopes and
delivery timing.

## Deployables

| Folder | Package intent | Phase | Spec |
|---|---|---|---|
| [`agent/`](../../agent/README.md) | Phase 1 VPS agent (inventory, site stack, 3m active visitors) | **This phase — build from scratch** | [`prd.md`](./prd.md) |
| [`monitoring-agent/`](../../monitoring-agent/README.md) | Host / LiteSpeed monitoring agent (existing code) | **Later** | Package README until a monitoring PRD exists |

## Trust boundary

```text
agent ─────────────── outbound HTTPS ──► NestJS (backend)
monitoring-agent ──── outbound HTTPS ──► NestJS (backend)
                                              │
                             admin-panel / client ◄┘
```

- Neither agent exposes a control API to browsers.
- NestJS validates agents and persists accepted data.
- Admin assignment and plan enablement happen after NestJS has trustworthy
  records — not from raw discovery alone.

Details: [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md).

## Phase 1 agent (`agent/`)

Build from scratch against [`prd.md`](./prd.md) and
[`phase1-api-contract.md`](./phase1-api-contract.md) (ADR 0008):

- Enroll + heartbeat connectivity
- Website discovery (OLS + DirectAdmin)
- Per-site stack/links (DirectAdmin URL, WP admin, WP/PHP/Imagick, update status)
- Active visitors (3-minute unique IPs from `/var/log/httpd/domains/{domain}.log`)
- Does **not** own public uptime/online-down or server location

**Setup (token + clone + run):** [`setup.md`](./setup.md) — start here to install
on a VPS.

Package notes: [`../../agent/README.md`](../../agent/README.md).

## Monitoring agent (`monitoring-agent/`)

Existing monitor codebase. Continue later for deeper host resource and LiteSpeed
telemetry work. Do not treat it as the Phase 1 PRD implementation target.

Install/ops: [`../../monitoring-agent/README.md`](../../monitoring-agent/README.md).

## Related docs

- **Setup (token + run):** [`setup.md`](./setup.md)
- **Panel host for install assets:** [`../../admin-panel/docs/runbooks/deployment.md`](../../admin-panel/docs/runbooks/deployment.md)
  (`unixsee-agent.tar.gz` must be published; not in Git)
- Phase 1 agent API contract: [`phase1-api-contract.md`](./phase1-api-contract.md)
- Two-agent ADR: [`../architecture/decisions/0007-two-vps-agents.md`](../architecture/decisions/0007-two-vps-agents.md)
- Agent language ADR: [`../architecture/decisions/0008-phase1-agent-typescript-node.md`](../architecture/decisions/0008-phase1-agent-typescript-node.md)
- Rename history: [`../architecture/decisions/0006-rename-agent-to-monitoring-agent.md`](../architecture/decisions/0006-rename-agent-to-monitoring-agent.md)
- Backend modules/routes: [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
- Overview: [`../architecture/overview.md`](../architecture/overview.md)
- Admin servers/websites/agents UX:
  [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
