# Ticket lifecycle and auto-close

> **Status:** Accepted
>
> **Last verified:** 2026-08-11
>
> **Related:** Phase 1 §15,
> [`../../backend/contracts/tickets-customer.md`](../../backend/contracts/tickets-customer.md),
> [`../../backend/contracts/tickets-admin.md`](../../backend/contracts/tickets-admin.md)

Short product clarification for ticket states after resolution.

## Default status

A newly created customer ticket is **submitted** (`SUBMITTED`). Customer FA
label: **ارسال‌شده** (client fixture `submitted`).

Staff queues may still show this state as “جدید” (`NEW` in admin fixtures); that
is a presentation label for the same lifecycle state, not a separate status on
the customer API.

## After resolution

When staff marks a ticket **resolved**:

### Customer

1. **Close** — confirms the resolution (`RESOLVED` → `CLOSED`). Primary CTA
   while resolved.
2. **Reply** — still allowed while `RESOLVED` (not yet `CLOSED`).
3. **Reopen** — only after the ticket is **`CLOSED`**
   (`CLOSED` → `IN_PROGRESS`).

### Staff

1. **Reopen** — `POST /api/v1/admin/tickets/:id/reopen` (`RESOLVED` →
   `IN_PROGRESS`; clears `resolvedAt` / `autoCloseAt`) so staff can compose
   again without waiting for customer close.
2. **Compose lock** — staff cannot send customer-visible replies or internal
   notes while `RESOLVED` or `CLOSED`. Reopen first, then compose.
3. Closing remains customer/auto-close owned in Phase 1 (no admin close route
   here).

| Actor | `RESOLVED` reply | `CLOSED` reply | Close (`RESOLVED`) | Reopen |
|---|---|---|---|---|
| Customer | Allowed | Blocked | Yes | From `CLOSED` only |
| Staff | Blocked until reopen | Blocked | No | From `RESOLVED` (`/admin/.../reopen`) |

## Grace period auto-close

If the customer does not close, the system **auto-closes** the ticket after a
grace period.

| Setting | Value |
|---|---|
| Default grace | **7 days** after `resolvedAt` |
| Allowed product range | 5–7 days |
| Config | Nest typed config (not hardcoded in UI) |

Auto-close is a system transition `RESOLVED` → `CLOSED`. After close (manual or
auto), the customer may reopen.

## Out of scope here

- SLA projections (Phase 1 §15.3).
- Exact notification copy for “ticket will auto-close on …”.
- Auto-reopen on staff public reply (explicit reopen is required instead).
