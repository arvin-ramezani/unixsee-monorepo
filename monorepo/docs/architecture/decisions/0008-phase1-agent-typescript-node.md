# 0008. Phase 1 VPS agent language and Nest contract ownership

> **Status:** Accepted
>
> **Date:** 2026-08-09
>
> **Related:** [`0002-stack-choices.md`](./0002-stack-choices.md),
> [`0007-two-vps-agents.md`](./0007-two-vps-agents.md)

## Context

Phase 1 needs a new outbound VPS agent under `agent/` for inventory, site stack
metadata, control-panel links, and 3-minute active visitors
([`../../agent/prd.md`](../../agent/prd.md)).

The existing NestJS `backend/src/modules/agent/` ingest shapes and
`monitoring-agent/` codebase serve the deferred monitor path. They must not be
treated as the Phase 1 product contract.

Team strength is TypeScript. Host work is I/O-bound (config/files/logs + HTTPS).

## Decision

1. Implement Phase 1 `agent/` in **TypeScript on Node.js ≥20.6 (ESM)** with
   near-zero production dependencies.
2. Treat [`../../agent/prd.md`](../../agent/prd.md) plus admin servers/agents UX
   as the product source of truth for Phase 1 payloads.
3. Redesign `/api/internal/agent/v1/{enroll,heartbeat,ingest}` request bodies for
   Phase 1 (`schemaVersion: "phase1"`). Legacy monitor-shaped ingest is
   **quarantined** (not authoritative; resume later under a follow-up ADR or
   separate namespace when `monitoring-agent/` work returns).
4. Prefer Go only if fleet install forbids Node or measured RSS exceeds an
   agreed host budget.

> **Update (ADR 0009):** Quarantined Nest monitor shapes moved to
> `backend/src/modules/monitoring-agent/` (not wired). Live Nest ownership is
> `backend/src/modules/agent/` only. See
> [`0009-nest-agent-kind-module-split.md`](./0009-nest-agent-kind-module-split.md).

## Consequences

- `agent/` ships as its own npm package (no shared `packages/` yet).
- Nest persists Phase 1 discoveries, site-stack fields, and `activeVisitors3m`
  samples for admin read models.
- Admin panel never receives long-lived agent secrets; enrollment tokens are
  one-time reveal only.
- Deep host/LiteSpeed telemetry remains deferred with `monitoring-agent/`.
