# Authorization cases API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/authorization-cases/*` (customer JWT) and
> `/api/v1/admin/authorization-cases/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
> · UX [`../../product/ux-flows/client-authorization.md`](../../product/ux-flows/client-authorization.md)
> · [`../../product/ux-flows/admin-authorization.md`](../../product/ux-flows/admin-authorization.md)
>
> **Last verified:** 2026-08-13

Staff review of customer احراز هویت packages. **Approve → create tenant + OWNER
membership.** Contact OTP on `/users/me` is separate from this case.

## Status values (API snake_case)

`draft` | `pending_review` | `needs_more_info` | `rejected` | `approved`

## Contact challenge values

`unverified` | `pending` | `verified` | `skipped_already_verified`

## Customer

### Get mine

`GET /authorization-cases/me` → case DTO or `null`.

### Save draft

`PUT /authorization-cases/me/draft` — body = package fields. Locked when
`pending_review` or `approved` (`AUTHORIZATION_LOCKED`).

### Submit

`POST /authorization-cases/me/submit` — same body; requires complete package
(`AUTHORIZATION_INCOMPLETE` otherwise). Sets `pending_review`.

Package body:

```ts
{
  nationalId: string;
  birthDate: string;
  mobile: string;
  mobileChallenge: ContactChallengeApi;
  mobileBelongsToNationalId: boolean;
  email: string;
  emailChallenge: ContactChallengeApi;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  nationalIdCardFileName?: string | null;
  attestedTruthful: boolean;
}
```

National-ID card **binary upload is deferred**; filename only for Phase 1.

## Admin

### List

`GET /admin/authorization-cases?status&skip&take` — excludes `draft` by default.
Each item includes user summary + package (no OTP secrets).

### Get / decide

| Method | Path | Effect |
|---|---|---|
| GET | `/:id` | Full case |
| POST | `/:id/approve` | Tenant + OWNER; status `approved` |
| POST | `/:id/needs-info` | `{ reason, fieldsToFix[] }` → `needs_more_info` |
| POST | `/:id/reject` | `{ reason }` → `rejected` |

Decisions only allowed from `pending_review`.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Users admin (membership ≠ KYC): [`users-admin.md`](./users-admin.md)
- Errors: [`api-errors.md`](./api-errors.md)
