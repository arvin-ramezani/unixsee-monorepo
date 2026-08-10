# 0007. Two VPS agents: Phase 1 `agent/` and deferred `monitoring-agent/`

> **Status:** Accepted
>
> **Date:** 2026-08-09
>
> **Related:** [`0006-rename-agent-to-monitoring-agent.md`](./0006-rename-agent-to-monitoring-agent.md)

## Context

Unixsee needs edge processes on each managed VPS, but not one catch-all binary
for every concern.

- The existing codebase under `monitoring-agent/` (formerly `agent/`) is a
  host/LiteSpeed telemetry-oriented monitor. It will be developed **later**.
- Phase 1 needs a **new** agent built from scratch for inventory, site stack
  metadata, control-panel links, and short-window active visitors, as defined
  in [`../../agent/prd.md`](../../agent/prd.md).

## Decision

Maintain **two** root deployables:

| Folder | Role | Phase |
|---|---|---|
| `agent/` | Phase 1 VPS agent (new; PRD-owned; build from scratch) | First-wave / this phase |
| `monitoring-agent/` | Monitoring agent (existing code; deeper host/LiteSpeed telemetry) | Later |

Both remain outbound-HTTPS-only to NestJS. Admin/client never talk to either
agent directly.

NestJS may use separate internal route namespaces or shared agent-plane
patterns; exact API split is a backend follow-up and must not invent conflicting
contracts against [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md)
without an explicit update.

> **Update (ADR 0009):** Nest live plane is `backend/src/modules/agent/` at
> `/api/internal/agent/v1`. Monitoring leftovers are archived under
> `backend/src/modules/monitoring-agent/` (not wired). Future resume uses
> `/api/internal/monitoring-agent/v1`. See
> [`0009-nest-agent-kind-module-split.md`](./0009-nest-agent-kind-module-split.md).

## Consequences

- Product PRD under `docs/agent/prd.md` applies to **`agent/` only**.
- `monitoring-agent/` docs stay package-local until a monitoring PRD exists.
- Monorepo ownership lists both folders.
- Do not merge the two codebases without a superseding ADR.
