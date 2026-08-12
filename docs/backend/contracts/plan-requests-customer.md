# Customer plan requests API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/plan-requests/*` (customer JWT)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §11
>
> **Last verified:** 2026-08-11

Logged-in dashboard contract for creating and reading the customer’s own plan
requests. Public anonymous intake remains on
`POST /api/v1/public/plan-requests`.

Auth: customer access JWT. Create always sets `createdByUserId` and
`linkedUserId` to the caller. When the caller has tenant memberships, the
first accessible `tenantId` is stored; status stays `SUBMITTED` until staff
selects a website / completes link-enablement.

## Status vocabulary

| API value | Meaning |
|---|---|
| `SUBMITTED` | Intake received; awaiting staff |
| `LINKED` | User/tenant (and usually website) linked |
| `ENABLED` | Chosen plan enabled on a website |
| `DECLINED` | Staff declined |

## Resources

### Create plan request

`POST /api/v1/plan-requests`

Body:

| Field | Type | Required |
|---|---|---|
| `planId` | UUID | yes (published plan) |
| `contactName` | string 1–200 | yes |
| `contactPhone` | string 1–32 | yes |
| `contactEmail` | email | no |
| `websiteDomain` | string ≤255 | no |
| `notes` | string ≤2000 | no |

Response `201`: plan request including `plan` relation. Not a payment
confirmation.

### List own plan requests

`GET /api/v1/plan-requests?skip&take`

Returns requests whose `tenantId` is in the caller’s accessible tenants.

### Get own plan request

`GET /api/v1/plan-requests/:id`

404 when missing or not tenant-accessible.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Admin queue: [`plan-requests-admin.md`](./plan-requests-admin.md)
