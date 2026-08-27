# Admin plan requests API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/plan-requests/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §11 · UX [`../../product/ux-flows/admin-plan-requests.md`](../../product/ux-flows/admin-plan-requests.md)
>
> **Last verified:** 2026-08-24

Staff queue for incoming plan requests. List/detail are the first wired admin
surfaces; link / enable / decline remain Nest-ready for a later UI pass.

## Status vocabulary

Persist as Prisma `PlanRequestStatus`. Admin UI may map:

| API value   | Admin UI label (FA)                 |
| ----------- | ----------------------------------- |
| `SUBMITTED` | در انتظار تکمیل (`pending`)         |
| `LINKED`    | آماده فعال‌سازی (`ready_to_enable`) |
| `ENABLED`   | فعال‌شده (`enabled`)                |
| `DECLINED`  | رد شده (`declined`)                 |

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

| Method | Path                                      | Notes                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| `POST` | `/api/v1/admin/plan-requests/:id/link`    | Body: `tenantId`, optional `linkedUserId`, `websiteId` → `LINKED`  |
| `POST` | `/api/v1/admin/plan-requests/:id/enable`  | Body: `websiteId`, optional `tenantId`, **commercial terms** (`amount`, `interval`, …), optional **`confirmUnauthorized`** (required `true` when linked principal has `authorized === false`); optional `Idempotency-Key`. Creates a `MANAGED_PLAN` billing item. See [`billing.md`](./billing.md). |

**Proposed unauthorized override (1A):** If the commercial principal’s
`authorized !== true` and `confirmUnauthorized` is missing/false, Nest returns
`403` (or agreed conflict code) without enabling. Audit records override when
accepted. See [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md).
| `POST` | `/api/v1/admin/plan-requests/:id/decline` | Body: optional `reason` → `DECLINED` (UI cancel also maps here)    |

Website picker for a linked user uses `GET /api/v1/admin/websites?userId=…`
(or `tenantId=…`).

Website options expose both `planId` and `planActivatedAt`. A linked plan is
active only when `planActivatedAt` is non-null. Enablement atomically records
the requested plan and activation timestamp. A different active plan returns
`409 CONFLICT` without updating either record; an inactive link may be replaced.
When the requested plan is already active, the request may complete without
creating or restarting the plan.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Website plan state: [`websites-admin.md`](./websites-admin.md)
- Customer create/list: [`plan-requests-customer.md`](./plan-requests-customer.md)
