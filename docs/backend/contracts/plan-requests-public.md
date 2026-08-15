# Public plan requests API contract

> **Status:** Draft
>
> **Audience:** `/api/v1/public/plan-requests` helpers (account-check) and
> related public OTP / signup composition used by guest plan intake
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md) §11.2
>
> **UX:** [`../../product/ux-flows/customer-public-plan-request.md`](../../product/ux-flows/customer-public-plan-request.md) v0.4
>
> **Last verified:** 2026-08-14

## Intended contract (product)

Guest plan intake is **not** anonymous create-without-account.

1. Visitor provides **phone or email** (at least one) plus intake fields
   (website / sizing examples) on one form.
2. Nest runs OTP verification **inline** (same page) on that contact
   (`POST /api/v1/auth/otp/request` + `/verify` with `phoneNumber` **or**
   `email`, `context: LOGIN`).
3. On successful OTP for a **new** contact, Nest **creates the customer user
   immediately** and establishes a session—**before** any plan-request row.
4. The plan request is then created as an **authenticated** customer request
   (`POST /api/v1/plan-requests` — see
   [`plan-requests-customer.md`](./plan-requests-customer.md)). Example intake
   fields are serialized into `notes` until a dedicated intake DTO exists.
5. If the contact already matches a customer, do **not** create a second user;
   guide sign-in (`ACCOUNT_EXISTS` / account-check).

Creating a user on OTP does **not** complete احراز هویت. Nest may still
provision a personal tenant on OTP signup (same as other LOGIN OTP paths).

## Conflict with prior Accepted wire shape

Previous Accepted text allowed `POST /api/v1/public/plan-requests` to create a
`SUBMITTED` request with **no** user linkage and required `contactPhone` always.
That matches current Nest public create behavior (**Observed**) but is
**Conflict** with the intended guest journey above.

Until Nest is synced:

- Prefer implementing product intent (verify → create user → customer create).
- Do not treat anonymous public create as the target guest path in new work.
- Exact OTP route composition and whether any public create endpoint remains
  for edge cases is **Unknown** (backend implement task).

## Resources (current / transitional)

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

When a create path still runs match rules:

Response `409`: see shared envelope in [`api-errors.md`](./api-errors.md).

| Field | Value |
|---|---|
| `error.code` | `ACCOUNT_EXISTS` |
| `success` | `false` |

The client should guide the user to sign in and submit via
`POST /api/v1/plan-requests` (customer JWT).

### Legacy anonymous create (superseded intent)

`POST /api/v1/public/plan-requests` may still exist in Nest. It must not be
documented as the happy-path guest intake after UX v0.4. Remove or gate it when
implementation catches up.

## Related

- Customer (logged-in create — target after verify): [`plan-requests-customer.md`](./plan-requests-customer.md)
- Admin queue: [`plan-requests-admin.md`](./plan-requests-admin.md)
- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Auth OTP: Nest `/api/v1/auth/otp/*` (do not redesign in this contract)
