# 0003. UI-only phase boundaries

> **Status:** Superseded
>
> **Date:** 2026-08-08
>
> **Superseded by:** [0011](./0011-client-nest-auth-integration.md)

## Context

The monorepo is documentation-first. Application folders are empty placeholders.
Admin UX flows and Phase 1 product specs are ready enough to guide UI work, but
NestJS APIs, auth providers, and persistence contracts are not finalized.

Implementing premature API, database, or auth wiring would invent contracts that
product and architecture have deliberately deferred.

## Decision

Until a superseding ADR or explicit integration specification lands:

- Next.js apps (`admin-panel/`, `client/`) may be built as UI-only surfaces.
- Do not add NestJS integration, database access, authentication,
  authorization, or backend services inside those apps.
- Do not have admin or client talk to agents or VPS hosts.
- Mock or static data used for UI prototypes must not be presented as live
  platform data.
- Deferred Phase 1 features may appear as unavailable or coming-soon
  destinations, but must not imply supported transactions.

## Consequences

- UI structure follows [`../project.md`](../project.md).
- Backend and agent folders remain unimplemented until scaffolding work begins.
- Agents and contributors must not invent API routes, DTOs, or auth flows and
  claim they are approved.
- When integration begins, supersede or amend this ADR and update
  [`../../quality/validation.md`](../../quality/validation.md).

## Supersession

Replaced by [0011](./0011-client-nest-auth-integration.md): `client/` may wire
Nest auth and customer JWT fetches; `admin-panel/` remains UI-only until its own
ADR; UIs still never talk to agents or VPS hosts.
