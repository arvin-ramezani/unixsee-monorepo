# 0005. Domain modules with multi-audience controllers

> **Status:** Accepted
>
> **Date:** 2026-08-08

## Context

Phase 1 needs many admin, customer, and public endpoints. A single `AdminModule`
(or UI-page-shaped modules) tends to become a god module and duplicates
business rules. NestJS already groups some capabilities (`auth`, `dashboard`,
`agent`, `alerts`); Phase 1 gaps should follow the same modular-monolith style.

## Decision

- Organize NestJS code by **business capability** (for example `plan-requests`,
  `tickets`, `servers`), not by frontend app.
- Prefer **one domain module** with **separate controllers** per audience
  (public / customer / admin) that share application services.
- Do **not** create a mega `AdminModule` that owns unrelated domains.
- Keep authentication in the existing `auth` module; do not redesign login for
  admin.
- Export shared services from domain modules so `dashboard` and `realtime`
  depend on module exports instead of re-registering the same providers.

Lifecycle mutations use explicit action routes when clearer than overloaded
`PATCH` (for example `POST .../enable`, `POST .../assign`, `POST .../decline`).

## Consequences

- Admin path prefix comes from controllers (`v1/admin/...`), not from a single
  admin package of every feature.
- Historical notes in `backend/docs/modules-apis.md` that prescribe a top-level
  `admin` mega-module are superseded by this ADR for new work.
- Full target map and delivery slices:
  [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md).
