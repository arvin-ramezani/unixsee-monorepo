# Backend API contracts

> **Status:** Accepted
>
> **Last verified:** 2026-08-10

Audience-specific request/response contracts for NestJS routes. Route ownership
and namespace rules stay in
[`../modules-and-routes.md`](../modules-and-routes.md). Product behavior stays
in [`../../product/`](../../product/).

These docs are the implementation source of truth for DTOs and lifecycle rules.
UI fixtures in `client/` and `admin-panel/` must converge on these values; they
must not invent competing enums.

## Layout

```text
docs/backend/contracts/
├── README.md
├── ticket-service-categories.md   # shared ticket service taxonomy
├── tickets-customer.md            # customer dashboard ticket API
└── tickets-admin.md               # staff queue ticket API
```

## Index

| Contract | Audience | Purpose |
|---|---|---|
| [`ticket-service-categories.md`](./ticket-service-categories.md) | Shared | Canonical ticket service enum for client, admin, and Nest |
| [`tickets-customer.md`](./tickets-customer.md) | `/api/v1/tickets/*` | Customer create, list, detail, reply, attach, close, reopen |
| [`tickets-admin.md`](./tickets-admin.md) | `/api/v1/admin/tickets/*` | Staff list, detail (incl. internal notes), assign, request-info, resolve, messages |

## Writing rules

- One audience (or one shared vocabulary) per document.
- Prefer explicit lifecycle actions (`close`, `reopen`) over generic PATCH.
- Mark deferred providers (for example S3) clearly; keep the wire shape stable.
- When a contract changes persistence enums, call out the Prisma rename in the
  same doc so Nest implementation does not drift.
- Link product notes for behavioral rules that are not HTTP-shaped.

## Related

- Modules and routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Ticket lifecycle note:
  [`../../product/notes/ticket-lifecycle-and-auto-close.md`](../../product/notes/ticket-lifecycle-and-auto-close.md)
- Phase 1 tickets: [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
  §15
- Agent contract precedent: [`../../agent/phase1-api-contract.md`](../../agent/phase1-api-contract.md)
