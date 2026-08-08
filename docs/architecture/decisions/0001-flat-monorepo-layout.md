# 0001. Flat monorepo layout

> **Status:** Accepted
>
> **Date:** 2026-08-08

## Context

Unixsee has four deployable surfaces (admin panel, client, NestJS backend, VPS
agent) plus shared documentation. The repository needs a stable ownership model
before application scaffolding begins.

An `apps/` + `packages/` layout is common, but the repo already uses flat root
folders and there is no shared runtime package yet. Introducing `apps/` or
`packages/` early would add structure without a consumer.

## Decision

Keep deployables as flat root folders:

- `admin-panel/`
- `client/`
- `backend/`
- `agent/`
- `docs/`

Do not create `apps/` or `packages/` until a later ADR justifies extraction of
shared runtime code. Default shared-code policy: extract only when a second
consumer exists.

## Consequences

- Docs, scripts, and agents refer to these folder names consistently.
- Each surface stays self-contained until sharing is proven necessary.
- A future move to `apps/` / `packages/` requires a superseding ADR and a
  coordinated migration.
- Ownership details live in [`../monorepo.md`](../monorepo.md).
