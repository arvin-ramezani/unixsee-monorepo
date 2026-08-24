# Admin plan requests API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/plan-requests/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §11 · UX [`../../product/ux-flows/admin-plan-requests.md`](../../product/ux-flows/admin-plan-requests.md)
>
> **Last verified:** 2026-08-11

Staff queue for incoming plan requests. List/detail are the first wired admin
surfaces; link / enable / decline remain Nest-ready for a later UI pass.

## Status vocabulary

Persist as Prisma `PlanRequestStatus`. Admin UI may map:

| API value | Admin UI label (FA) |
|---|---|
| `SUBMITTED` | در انتظار تکمیل (`pending`) |
| `LINKED` | آماده فعال‌سازی (`ready_to_enable`) |
| `ENABLED` | فعال‌شده (`enabled`) |
| `DECLINED` | رد شده (`declined`) |

There is no Nest `CANCELLED` status in Phase 1.

## Resources

### List plan requests

`GET /api/v1/admin/plan-requests?status&skip&take`

Optional `status` filter (`SUBMITTED` \| `LINKED` \| `ENABLED` \| `DECLINED`).

Response `200` data shape:

```ts
{
  items: PlanRequestAdmin[];
  total: number;
}
```

Each item includes relations: `plan`, `tenant`, `website`, `linkedUser` (nullable).

### Get plan request

`GET /api/v1/admin/plan-requests/:id`

Includes `plan`, `tenant`, `website`, `linkedUser`.

### Link / enable / decline

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/admin/plan-requests/:id/link` | Body: `tenantId`, optional `linkedUserId`, `websiteId` → `LINKED` |
| `POST` | `/api/v1/admin/plan-requests/:id/enable` | Body: `websiteId`, optional `tenantId`; optional `Idempotency-Key` |
| `POST` | `/api/v1/admin/plan-requests/:id/decline` | Body: optional `reason` → `DECLINED` (UI cancel also maps here) |

Website picker for a linked user uses `GET /api/v1/admin/websites?userId=…`
(or `tenantId=…`).

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Customer create/list: [`plan-requests-customer.md`](./plan-requests-customer.md)
