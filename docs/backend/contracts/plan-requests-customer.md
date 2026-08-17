# Customer plan requests API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/plan-requests/*` (customer JWT)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> §11
>
> **Last verified:** 2026-08-16

Logged-in dashboard contract for creating and reading the customer’s own plan
requests.

**Product intent (2026-08-14):** Guest public intake verifies phone or email,
creates the user on OTP success, then uses **this** authenticated create path
(not anonymous public create). See
[`../../product/ux-flows/customer-public-plan-request.md`](../../product/ux-flows/customer-public-plan-request.md)
and Draft [`plan-requests-public.md`](./plan-requests-public.md).

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
| `contactPhone` | string 1–32 | one of phone/email |
| `contactEmail` | email | one of phone/email |
| `websiteDomain` | string ≤255 | no |
| `notes` | string ≤4000 | no |

At least one of `contactPhone` or `contactEmail` is required (Nest
`ValidateIf`). Guest public intake verifies the preferred channel with OTP,
then creates via this authenticated path.

`notes` may include serialized intake fields (database size, **daily**
visitors, WooCommerce today, preferred contact, optional attachment
**filenames**). Binary file upload / `storageKey` for plan requests is
deferred (same Phase 1 posture as ticket/authorization uploads); clients
must not invent a separate attachment route yet.

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
