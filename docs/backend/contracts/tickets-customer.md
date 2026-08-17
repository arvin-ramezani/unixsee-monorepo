# Customer tickets API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/tickets/*` (tenant JWT)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §15
>
> **Lifecycle note:**
> [`../../product/notes/ticket-lifecycle-and-auto-close.md`](../../product/notes/ticket-lifecycle-and-auto-close.md)
>
> **Services:** [`ticket-service-categories.md`](./ticket-service-categories.md)
>
> **Last verified:** 2026-08-11

Customer dashboard contract for listing, creating, reading, replying to, and
closing/reopening support tickets. Matches the create form fields in
`client/.../dashboard/tickets/new` and the resolved actions in ticket detail.

Auth: customer access JWT + **tenant membership** on every read/write. Never
return internal notes (`isInternal: true`) on this audience.

## Status vocabulary

Persist as Prisma `TicketStatus`. Customer API returns the same enum strings.

| API value | Customer FA label | Meaning |
|---|---|---|
| `SUBMITTED` | ارسال‌شده | Newly created; awaiting staff pickup |
| `IN_PROGRESS` | در حال انجام | Staff is working the ticket |
| `WAITING_CUSTOMER` | منتظر پاسخ شما | Legacy / retained status; no staff action sets it in Phase 1 |
| `RESOLVED` | حل‌شده | Staff marked resolved; customer may close (or auto-close) |
| `CLOSED` | بسته‌شده | Terminal until customer reopens; no replies while closed |

### Default on create

New tickets start as **`SUBMITTED`** (customer label **ارسال‌شده**).

Alignment with existing fixtures / schema:

| Source | Current value | Contract |
|---|---|---|
| Client fixture | `submitted` → «ارسال‌شده» | `SUBMITTED` |
| Admin fixture | `NEW` → «جدید» | Same state as `SUBMITTED` (staff queue label) |
| Prisma today | `OPEN` `@default(OPEN)` | Rename to `SUBMITTED` `@default(SUBMITTED)` during Nest implementation |

Do not expose admin fixture `NEW` on the customer API.

### Customer transitions

```text
SUBMITTED ──► IN_PROGRESS ──► RESOLVED ──► CLOSED
                                │              │
                                │              └── reopen ──► IN_PROGRESS
                                └── (customer close or auto-close)
```

`WAITING_CUSTOMER` may still appear on existing rows. A customer reply while
`WAITING_CUSTOMER` moves the ticket to `IN_PROGRESS`. There is **no** staff
`request-info` action in Phase 1.

Customer-initiated actions only:

| From | Action | To |
|---|---|---|
| `RESOLVED` | `POST .../close` | `CLOSED` |
| `RESOLVED` | auto-close job (no action) | `CLOSED` after grace period |
| `CLOSED` | `POST .../reopen` | `IN_PROGRESS` |

Staff-driven transitions (`SUBMITTED` → `IN_PROGRESS` on assign, mark
`RESOLVED`, staff reopen from `RESOLVED`) belong to
[`tickets-admin.md`](./tickets-admin.md).

Replies are allowed when status is not `CLOSED`.

## Resources

### List ticket services

`GET /api/v1/tickets/services`

See [`ticket-service-categories.md`](./ticket-service-categories.md).

### List tickets

`GET /api/v1/tickets`

Query (Phase 1 minimum):

| Param | Type | Notes |
|---|---|---|
| `status` | `TicketStatus` \| repeatable | Optional filter |
| `service` | `TicketServiceCategory` | Optional |
| `websiteId` | UUID | Optional; tenant-scoped |
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
      "status": "WAITING_CUSTOMER",
      "website": {
        "id": "uuid",
        "name": "Greenario Store",
        "domain": "greenario.com"
      },
      "unread": false,
      "lastActivityAt": "2026-07-19T15:20:00.000Z",
      "lastActor": "SUPPORT",
      "createdAt": "2026-07-18T08:14:00.000Z",
      "updatedAt": "2026-07-19T15:20:00.000Z"
    }
  ],
  "total": 1
}
```

`website` may be `null`. `number` is a stable human-facing code (implementation
may derive from a sequence; shape is opaque string).

### Create ticket

`POST /api/v1/tickets` → `201`

Body mirrors the customer new-ticket form:

```json
{
  "service": "WOOCOMMERCE_SUPPORT",
  "websiteId": "uuid-or-omit",
  "subject": "خرابی صفحه پرداخت",
  "description": "حداقل بیست نویسه توضیح…",
  "attachments": [
    {
      "fileName": "payment-error.png",
      "contentType": "image/png",
      "sizeBytes": 842000,
      "storageKey": "tickets/pending/…"
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `service` | Yes | `TicketServiceCategory` |
| `websiteId` | No | Optional for every service; when present must belong to the ticket tenant and be accessible to the caller |
| `subject` | Yes | 1–300 chars, trimmed non-empty |
| `description` | Yes | 20–10000 chars (matches client validation) |
| `attachments` | No | 0–N; see Attachments |

Server behavior:

1. Resolve tenant (explicit membership / primary tenant policy already used by Nest).
2. Validate website rules and access.
3. Create ticket with `status: SUBMITTED`.
4. Create the first customer-visible message from `description` (`isInternal: false`).
5. Attach validated attachment rows when `storageKey` values are present.
6. Return the created ticket detail shape (same as get).

Do **not** accept customer-supplied `status`, `priority`, or `assigneeId` on
create in Phase 1. Priority remains server-owned (`NORMAL` default until staff
rules exist).

### Get ticket

`GET /api/v1/tickets/:id`

Response `data` includes messages (customer-visible only) and attachments:

```json
{
  "id": "uuid",
  "number": "TCK-1052",
  "subject": "…",
  "service": "WOOCOMMERCE_SUPPORT",
  "status": "RESOLVED",
  "website": { "id": "uuid", "name": "…", "domain": "…" },
  "resolvedAt": "2026-07-17T10:28:00.000Z",
  "autoCloseAt": "2026-07-24T10:28:00.000Z",
  "createdAt": "…",
  "updatedAt": "…",
  "messages": [
    {
      "id": "uuid",
      "body": "…",
      "sender": "USER",
      "author": { "id": "uuid", "fullName": "…" },
      "attachments": [],
      "createdAt": "…"
    }
  ],
  "attachments": []
}
```

`resolvedAt` / `autoCloseAt` are present when status is `RESOLVED` (and may
remain on `CLOSED` for history). `autoCloseAt = resolvedAt + grace period`.

Message `sender`: `USER` | `SUPPORT` (map staff authors to `SUPPORT`; never
leak staff role enums beyond that).

### Add message

`POST /api/v1/tickets/:id/messages` → `201`

```json
{ "body": "…", "idempotencyKey": "optional-client-key" }
```

Rejected when status is `CLOSED`. When status is `WAITING_CUSTOMER`, transition
to `IN_PROGRESS` after a successful customer message. When `idempotencyKey` is
present, retries with the same ticket + key return the original message and do
not create a duplicate row.

### Attachments

`POST /api/v1/tickets/:id/attachments` → `201`

```json
{
  "fileName": "log.txt",
  "contentType": "text/plain",
  "sizeBytes": 1200,
  "storageKey": "tickets/{ticketId}/…"
}
```

**Object storage provider:** Nest `StorageModule` (Supabase). Attachment HTTP
upload/signing routes are still deferred:

- Keep this wire shape (`storageKey` opaque).
- Nest validates name/type/size/count/ownership at the trusted boundary.
- Upload/signing endpoints may be added later without changing ticket create
  fields; prefer `storageKey` issued by a future upload-intent route that calls
  `StorageService`.
- Failed uploads must not leave orphan incomplete messages.

Ticket-scoped attachment list remains on get/create responses. Removing ticket
access removes attachment access (Phase 1 §15.4).

### Close (customer)

`POST /api/v1/tickets/:id/close` → `200`

Allowed only from `RESOLVED` → `CLOSED`. Clears pending auto-close.

### Reopen (customer)

`POST /api/v1/tickets/:id/reopen` → `200`

Allowed only from `CLOSED` → `IN_PROGRESS`. Clears `resolvedAt` /
`autoCloseAt`. Customer should add a follow-up message with latest details (UI
copy); the reopen action itself does not require a body in Phase 1, but clients
may immediately call `POST .../messages`.

### Auto-close

When staff sets `RESOLVED`, Nest records `resolvedAt` and schedules auto-close
after **7 days** (configurable grace; product range 5–7). If the customer does
not close first, a scheduled job sets `CLOSED`. After close (manual or auto),
the customer may reopen.

Details:
[`../../product/notes/ticket-lifecycle-and-auto-close.md`](../../product/notes/ticket-lifecycle-and-auto-close.md).

## Errors

Follow [`api-errors.md`](./api-errors.md): stable `error.code` on every failure;
client maps codes to `ApiErrors` i18n (EN/FA). Reject invalid transitions
consistently (do not no-op).

## Persistence notes

Implemented in Nest against this contract:

1. Prisma `TicketServiceCategory` and `TicketStatus.SUBMITTED` (replaces app use of `OPEN`).
2. Required `service`, unique human `number`, `resolvedAt`, `autoCloseAt` on `Ticket`.
3. Customer create uses `service` + `description` (+ optional `websiteId` + attachments).
4. Customer `close` / `reopen` routes and scheduled auto-close worker.
5. Minimal admin `POST /api/v1/admin/tickets/:id/resolve` to enter `RESOLVED`.

PG may still retain unused enum value `OPEN` after migration; the Prisma schema and Nest code do not expose it.

Admin assign/message routes remain as sketched in
[`../modules-and-routes.md`](../modules-and-routes.md); their detailed contract
is out of scope for this document.
