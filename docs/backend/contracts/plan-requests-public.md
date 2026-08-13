# Public plan requests API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/public/plan-requests` (no auth)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md) §11.2
>
> **UX:** [`../../product/ux-flows/customer-public-plan-request.md`](../../product/ux-flows/customer-public-plan-request.md)
>
> **Last verified:** 2026-08-12

Anonymous intake for plan requests from the public website. Creates a
`SUBMITTED` request with no user/tenant linkage. Not a payment confirmation.

## Resources

### Create plan request

`POST /api/v1/public/plan-requests`

Body:

| Field | Type | Required |
|---|---|---|
| `planId` | UUID | yes (published plan) |
| `contactName` | string 1–200 | yes |
| `contactPhone` | string 1–32 | yes |
| `contactEmail` | email | no |
| `websiteDomain` | string ≤255 | no |
| `notes` | string ≤2000 | no |

Response `201`: plan request including `plan` relation.

### Early account check

`POST /api/v1/public/plan-requests/account-check`

Body (all optional; at least one should be sent):

| Field | Type | Required |
|---|---|---|
| `contactPhone` | string ≤32 | no |
| `contactEmail` | email | no |
| `websiteDomain` | string ≤255 | no |

Response `200`:

| Field | Type | Meaning |
|---|---|---|
| `exists` | boolean | Whether a customer identity match was found |
| `matchedBy` | `"phone" \| "email" \| "website" \| null` | Which field matched first |

Match order: phone → email → managed website domain (hostname, no `www`).

### Account guard

Before create, the service runs the same match rules as the early check.

Response `409`: see shared envelope in [`api-errors.md`](./api-errors.md).

| Field | Value |
|---|---|
| `error.code` | `ACCOUNT_EXISTS` |
| `success` | `false` |

The client should guide the user to sign in and submit via
`POST /api/v1/plan-requests` (customer JWT) from the dashboard checkout flow.

## Related

- Customer (logged-in): [`plan-requests-customer.md`](./plan-requests-customer.md)
- Admin queue: [`plan-requests-admin.md`](./plan-requests-admin.md)
- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
