# Admin tickets API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/tickets/*` (staff JWT, `ADMIN` / `OPERATOR`)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §15.3
>
> **Lifecycle note:**
> [`../../product/notes/ticket-lifecycle-and-auto-close.md`](../../product/notes/ticket-lifecycle-and-auto-close.md)
>
> **Services:** [`ticket-service-categories.md`](./ticket-service-categories.md)
>
> **Customer counterpart:** [`tickets-customer.md`](./tickets-customer.md)
>
> **Last verified:** 2026-08-10

Staff queue contract for listing, reading (including internal notes), assigning,
requesting customer info, resolving, and posting messages.

Auth: staff access JWT + Nest `@Roles(ADMIN, OPERATOR)`. Cross-tenant. Do not
use customer `/api/v1/tickets/*` routes for staff UI.

## Status vocabulary

Same Prisma `TicketStatus` strings as the customer API:

| API value | Staff FA label | Meaning |
|---|---|---|
| `SUBMITTED` | جدید | Newly created; awaiting staff pickup |
| `IN_PROGRESS` | در حال بررسی | Staff is working the ticket |
| `WAITING_CUSTOMER` | در انتظار کاربر | Legacy / retained; no staff action sets it in Phase 1 |
| `RESOLVED` | حل شده | Staff marked resolved; auto-close pending |
| `CLOSED` | بسته‌شده | Terminal |

Admin fixtures historically used `NEW` / `WAITING_FOR_USER`. Those are
**presentation aliases only** — wire API and UI enums to the Nest values above.

## Resources

### List tickets

`GET /api/v1/admin/tickets`

| Param | Type | Notes |
|---|---|---|
| `status` | `TicketStatus` | Optional filter |
| `skip` | int ≥ 0 | Default `0` |
| `take` | int 1–100 | Default `50` |

Response `data`:

```json
{
  "items": [
    {
      "id": "uuid",
      "number": "TCK-1052",
      "subject": "…",
      "service": "WOOCOMMERCE_SUPPORT",
      "status": "SUBMITTED",
      "priority": "NORMAL",
      "tenant": { "id": "uuid", "name": "…", "status": "ACTIVE" },
      "website": { "id": "uuid", "name": "…", "domain": "…" },
      "assignee": { "id": "uuid", "fullName": "…" },
      "createdBy": { "id": "uuid", "fullName": "…" },
      "resolvedAt": null,
      "autoCloseAt": null,
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "total": 1
}
```

`website` / `assignee` may be `null`.

### Get ticket

`GET /api/v1/admin/tickets/:id`

Same fields as a list item, plus:

```json
{
  "messages": [
    {
      "id": "uuid",
      "body": "…",
      "sender": "USER",
      "isInternal": false,
      "author": { "id": "uuid", "fullName": "…" },
      "attachments": [],
      "createdAt": "…"
    },
    {
      "id": "uuid",
      "body": "Internal triage note",
      "sender": "SUPPORT",
      "isInternal": true,
      "author": { "id": "uuid", "fullName": "…" },
      "attachments": [],
      "createdAt": "…"
    }
  ],
  "attachments": []
}
```

Messages include **internal notes** (`isInternal: true`). `sender` is `USER` |
`SUPPORT`.

### Assign

`POST /api/v1/admin/tickets/:id/assign`

```json
{ "assigneeId": "uuid" }
```

When status is `SUBMITTED`, Nest also moves the ticket to `IN_PROGRESS`.

### Resolve

`POST /api/v1/admin/tickets/:id/resolve`

Sets `RESOLVED`, `resolvedAt`, and `autoCloseAt` (grace from Nest config).
Rejected when already `RESOLVED` or `CLOSED`.

### Reopen

`POST /api/v1/admin/tickets/:id/reopen`

`RESOLVED` → `IN_PROGRESS`; clears `resolvedAt` and `autoCloseAt`. Rejected
when status is not `RESOLVED` (`409`).

### Add message

`POST /api/v1/admin/tickets/:id/messages` → `201`

Allowed only while status is **not** `RESOLVED` or `CLOSED`. Staff must
**reopen** before composing further replies/notes after resolve. Admin UI locks
the composer on those statuses. See
[`../../product/notes/ticket-lifecycle-and-auto-close.md`](../../product/notes/ticket-lifecycle-and-auto-close.md).

```json
{ "body": "…", "isInternal": false, "idempotencyKey": "optional" }
```

| Field | Required | Notes |
|---|---|---|
| `body` | Yes | 1–10000 chars |
| `isInternal` | No | Default `false`; `true` = internal note (never customer-visible) |
| `idempotencyKey` | No | Reserved; admin path may ignore until parity with customer |

## Out of scope (this contract)

- Admin create ticket (customers create)
- Generic PATCH
- Attachment upload/download providers
- Transfer UI beyond assign by `assigneeId`
- Fine-grained capability matrices beyond `ADMIN` / `OPERATOR`
