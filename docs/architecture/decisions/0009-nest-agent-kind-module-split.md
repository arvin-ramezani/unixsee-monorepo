# 0009. Nest agent-kind module split (Phase 1 live, monitoring archived)

> **Status:** Accepted
>
> **Date:** 2026-08-09
>
> **Related:** [`0007-two-vps-agents.md`](./0007-two-vps-agents.md),
> [`0008-phase1-agent-typescript-node.md`](./0008-phase1-agent-typescript-node.md)
>
> **Resolves:** Nest API-split follow-up left open in ADR 0007.

## Context

ADR 0007 keeps two VPS deployables (`agent/` and deferred `monitoring-agent/`).
ADR 0008 redesigned `/api/internal/agent/v1` for Phase 1 and quarantined
monitor-shaped ingest. Nest still mixed live Phase 1 code with legacy
monitoring DTOs and an orphaned metrics-ingest realtime path under the shared
`agent` module name.

## Decision

1. **Live Nest module** [`backend/src/modules/agent/`](../../backend/src/modules/agent/)
   owns Phase 1 inventory agent routes at `/api/internal/agent/v1` only.
2. **Archived Nest leftovers** live under
   [`backend/src/modules/monitoring-agent/`](../../backend/src/modules/monitoring-agent/)
   (DTOs/events + README). That folder is **not** imported by `AppModule` and
   exposes **no** live routes in Phase 1.
3. When monitoring work returns, register a `MonitoringAgentModule` under
   `/api/internal/monitoring-agent/v1` (separate namespace from Phase 1).
4. Future agent kinds follow `backend/src/modules/<kind>/` +
   `/api/internal/<kind>/v1`. Shared enroll/HMAC extraction stays deferred until
   a second live agent is wired.
5. Keep one `VpsNode` / `secretKey` identity per server for Phase 1; multi-kind
   credentials are a later follow-up if both agents coexist on one host.

## Consequences

- Phase 1 `agent/` edge client keeps current paths and `schemaVersion: "phase1"`.
- Monitoring batch ingest shapes and the former `metrics.ingested` event live
  only as archived reference under `monitoring-agent/`.
- Customer Socket.io names such as `monitoring:vps_tick` remain browser
  monitoring rooms, not the VPS monitoring-agent plane.
- Route map:
  [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md).
