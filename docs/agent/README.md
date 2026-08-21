# Agent documentation

Unixsee keeps two edge-agent concerns separate:

| Deployable | Purpose | Status |
|---|---|---|
| [`agent/`](../../agent/README.md) | OLS inventory, protected site-stack probe, private 3m/24h traffic, outbound refresh commands | Phase 1 v0.2 implemented |
| [`monitoring-agent/`](../../monitoring-agent/README.md) | Broader host/LiteSpeed monitoring | Deferred |

Both communicate outbound to NestJS. Admin and client browsers never receive
agent credentials or connect to VPS hosts.

## Phase 1 v0.2 boundary

The runtime agent reads only its own state, installer-selected OLS routing
configuration, and approved access logs. DirectAdmin and WordPress admin links
are manual admin-owned fields. The privileged installer provisions the
loopback-only PHP probe; the Node service has no DirectAdmin, site-root,
machine-ID, `/proc`, or child-process access.

The agent reports:

- complete debounced OLS vhost inventory;
- WordPress/PHP/Imagick through the protected site runtime;
- exact 180-second visitors and a local bounded-HLL 24-hour estimate;
- terminal results for the single allowlisted `REFRESH_SITE_STACK` command.

## Canonical references

- Accepted PRD: [`prd.md`](./prd.md)
- API contract: [`phase1-api-contract.md`](./phase1-api-contract.md)
- Setup and rollout: [`setup.md`](./setup.md)
- Boundary ADR: [`../architecture/decisions/0014-web-server-only-agent.md`](../architecture/decisions/0014-web-server-only-agent.md)
- Two-agent ADR: [`../architecture/decisions/0007-two-vps-agents.md`](../architecture/decisions/0007-two-vps-agents.md)
- Admin UX: [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
