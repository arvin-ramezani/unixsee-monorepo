# Billing (commercial records) API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/billing-items/*`, `/api/v1/websites/:id/billing`
>
> **Product:** [`../../product/notes/commercial-records.md`](../../product/notes/commercial-records.md)
> · Phase 1 §21 · ADR
> [`../../architecture/decisions/0015-nest-commercial-billing-records.md`](../../architecture/decisions/0015-nest-commercial-billing-records.md)
>
> **Last verified:** 2026-08-27

Nest-owned agreed commercial/renewal state. Not invoices or payment.

## Vocabulary

Persist as Prisma enums:

| Field | Values |
| --- | --- |
| `kind` | `MANAGED_PLAN` \| `COMPLEMENTARY_SERVICE` |
| `interval` | `MONTHLY` \| `QUARTERLY` \| `YEARLY` \| `NONE` |
| `status` | `SCHEDULED` \| `ACTIVE` \| `PAUSED` \| `EXPIRED` \| `CANCELLED` \| `COMPLETED` |
| `commercialState` | `ESTIMATED` \| `QUOTED` \| `AGREED` \| `INVOICED_EXTERNALLY` \| `SETTLED` |
| `commercialModel` | `FIXED_SCOPE` \| `RECURRING_RETAINER` \| `QUOTA_PACKAGE` \| `MILESTONE_PROJECT` \| `CUSTOM_QUOTE` |
| Period `reason` | `ACTIVATION` \| `RENEWAL` \| `PLAN_REPLACEMENT` \| `ADJUSTMENT` |

Default currency: `IRR`. Recurring models require a non-`NONE` interval.
`FIXED_SCOPE` / `MILESTONE_PROJECT` use `NONE` and cannot renew.

## Creation (side effects)

Commercial terms are required when:

- `POST /api/v1/admin/plan-requests/:id/enable`
- `POST /api/v1/admin/websites` with `activatePlan: true`
- `POST /api/v1/admin/service-assignments`

Shared commercial body fields:

```ts
{
  amount: number; // Decimal(12,2)
  currency?: string; // default IRR
  interval: "MONTHLY" | "QUARTERLY" | "YEARLY" | "NONE";
  periodStartsAt?: string; // ISO; default now
  commercialModel?: // plans default RECURRING_RETAINER
    | "FIXED_SCOPE"
    | "RECURRING_RETAINER"
    | "QUOTA_PACKAGE"
    | "MILESTONE_PROJECT"
    | "CUSTOM_QUOTE";
  commercialState?: // default AGREED
    | "ESTIMATED"
    | "QUOTED"
    | "AGREED"
    | "INVOICED_EXTERNALLY"
    | "SETTLED";
}
```

At most one **active** `MANAGED_PLAN` item per website. Complementary items are
independent. Inactive plan links and quotations alone create nothing.

## Admin resources

### List by website

`GET /api/v1/admin/websites/:websiteId/billing-items`

Returns `{ items: BillingItemAdmin[] }` including period history summary.

### Get item

`GET /api/v1/admin/billing-items/:id`

### Record terms (backfill)

`POST /api/v1/admin/websites/:websiteId/billing-items/record-plan-terms`

Body: commercial fields + optional `planId` (defaults to website active plan).
Creates a `MANAGED_PLAN` item when the website already has an active plan and
no active billing item. Returns `409` if an active plan item already exists or
the website has no active plan.

### Renew

`POST /api/v1/admin/billing-items/:id/renew`

Optional body: `{ amount?: number, confirmUnauthorized?: boolean }`. Optional
`Idempotency-Key`.

Rejects when `interval === NONE` or status is not `ACTIVE`. Appends a period
row for the closing window, advances `periodStartsAt` / `renewsAt` by 1 / 3 /
12 months (UTC calendar months). Does not take payment or change `Website.planId`.
**Proposed (1A):** when the commercial principal has `authorized === false`,
require `confirmUnauthorized: true`.

### Replace managed plan

`POST /api/v1/admin/websites/:websiteId/billing-items/replace-plan`

Body: `{ planId: string }` + commercial fields + optional
`confirmUnauthorized`. Optional `Idempotency-Key`.

Closes the current active `MANAGED_PLAN` item, updates `Website.planId` /
`planActivatedAt`, creates a new item + period with reason
`PLAN_REPLACEMENT`. **Proposed (1A):** unauthorized principal requires
`confirmUnauthorized: true`.

### Record plan terms

`POST /api/v1/admin/websites/:id/billing-items/record-plan-terms` — same
unauthorized override rule when creating the first commercial record.

### Cancel / complete / pause

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/admin/billing-items/:id/cancel` | Body: `reason`, optional `effectAt` |
| `POST` | `/api/v1/admin/billing-items/:id/complete` | Body: optional `reason`, `effectAt` |
| `POST` | `/api/v1/admin/billing-items/:id/pause` | Body: `reason`, optional `effectAt` |

## Customer resources

### Tenant billing hub

`GET /api/v1/billing`

Tenant-scoped aggregate for the customer dashboard. Optional query:

- `kind` — `MANAGED_PLAN` \| `COMPLEMENTARY_SERVICE`
- `websiteId` — UUID; asserts website membership before filtering

Response:

```ts
{
  items: BillingItemCustomerHub[]; // includes website { id, domain, displayName }
}
```

Statuses included: `ACTIVE`, `SCHEDULED`, `PAUSED`, `EXPIRED` (same family as
website billing). Sorted by soonest `renewsAt` / `periodEndsAt`. No customer
mutations.

### Website billing

`GET /api/v1/websites/:id/billing`

Tenant-scoped. Response:

```ts
{
  plan: BillingItemCustomer | null;
  complementaryServices: BillingItemCustomer[];
}
```

No customer renew/payment mutation in Phase 1.

## Expiry

A Nest scheduled job marks `ACTIVE` items with `renewsAt` / `periodEndsAt` in
the past as `EXPIRED` without deleting period history.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Plan enablement: [`plan-requests-admin.md`](./plan-requests-admin.md)
- Website activation: [`websites-admin.md`](./websites-admin.md)
