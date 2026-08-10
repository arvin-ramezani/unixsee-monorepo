# Ticket lifecycle and auto-close

> **Status:** Accepted
>
> **Last verified:** 2026-08-10
>
> **Related:** Phase 1 §15,
> [`../../backend/contracts/tickets-customer.md`](../../backend/contracts/tickets-customer.md)

Short product clarification for customer ticket states after resolution.

## Default status

A newly created customer ticket is **submitted** (`SUBMITTED`). Customer FA
label: **ارسال‌شده** (client fixture `submitted`).

Staff queues may still show this state as “جدید” (`NEW` in admin fixtures); that
is a presentation label for the same lifecycle state, not a separate status on
the customer API.

## After resolution

When staff marks a ticket **resolved**, the customer may:

1. **Reopen** — returns the ticket to active work (`IN_PROGRESS`) so they can
   add latest details.
2. **Close** — confirms the resolution and ends the conversation (`CLOSED`).

## Grace period auto-close

If the customer takes neither action, the system **auto-closes** the ticket
after a grace period.

| Setting | Value |
|---|---|
| Default grace | **7 days** after `resolvedAt` |
| Allowed product range | 5–7 days |
| Config | Nest typed config (not hardcoded in UI) |

Auto-close is a system transition `RESOLVED` → `CLOSED`. It does not reopen
history rewriting; it is audited like other status changes.

## Out of scope here

- Staff assignment, internal notes, and SLA projections (Phase 1 §15.3).
- Exact notification copy for “ticket will auto-close on …”.
