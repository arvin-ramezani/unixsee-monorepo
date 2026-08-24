# 0006. Rename edge deployable to `monitoring-agent/`

> **Status:** Accepted
>
> **Date:** 2026-08-09
>
> **Supersedes:** Partial path naming in [`0001-flat-monorepo-layout.md`](./0001-flat-monorepo-layout.md)
> (layout shape unchanged; folder name updated)

## Context

The VPS edge process was rooted at `agent/`. That name collided with Cursor
guidance naming and with a separate Phase 1 product agent. The existing
codebase was moved to `monitoring-agent/` so a new Phase 1 `agent/` can be
built from scratch under [`../../agent/prd.md`](../../agent/prd.md). See also
[`0007-two-vps-agents.md`](./0007-two-vps-agents.md).

## Decision

Rename the root deployable from `agent/` to `monitoring-agent/`.

Keep:

- NestJS agent plane routes under `/api/internal/agent/v1/...`
- Canonical product/engineering docs under `docs/agent/`
- npm package name `unixsee-monitor-agent` unless a later change renames it

Flat monorepo layout remains: no `apps/` / `packages/` without a further ADR.

## Consequences

- Historical source that lived at `agent/` now lives at `monitoring-agent/`.
- Phase 1 product agent work does **not** continue in this folder; see
  [`0007-two-vps-agents.md`](./0007-two-vps-agents.md) and the new `agent/`
  deployable owned by [`../../agent/prd.md`](../../agent/prd.md).
- NestJS `/api/internal/agent/v1/...` may still serve monitoring enrollment
  until backend splits audiences; do not assume one binary owns that namespace
  forever.
- Install/run for this package: `cd monitoring-agent`.
