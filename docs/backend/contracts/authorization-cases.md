# Authorization cases API contract

> **Status:** Accepted — **approve semantics amendment Proposed** (ADR 0016, 2026-08-27)
>
> **Audience:** `/api/v1/authorization-cases/*` (customer JWT) and
> `/api/v1/admin/authorization-cases/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
> · UX [`../../product/ux-flows/client-authorization.md`](../../product/ux-flows/client-authorization.md)
> · [`../../product/ux-flows/admin-authorization.md`](../../product/ux-flows/admin-authorization.md)
> · ADR [`../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md`](../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)
>
> **Last verified:** 2026-08-27

Staff review of customer احراز هویت packages.

**Approve (Proposed ADR 0016):** set `User.authorized = true` and
**idempotently ensure** Tenant + OWNER membership exist (often already created
at signup). Contact OTP on `/users/me` is separate from this case and must not
set `authorized`.

**Independent of user toggle (2A):** Staff may set `authorized` via
[`users-admin.md`](./users-admin.md) without opening a case. Case approve still
sets `authorized=true` when used. Case reject / needs-info **must not** clear
`authorized === true` set by toggle or a prior approve.

**Legacy Accepted wording:** “Approve → create tenant + OWNER membership” as
the sole commercial signal. Prefer the `authorized` flag once implemented.

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
| POST | `/:id/approve` | **Proposed:** set `authorized=true`; ensure Tenant + OWNER; status `approved` |
| POST | `/:id/needs-info` | `{ reason, fieldsToFix[] }` → `needs_more_info` (does **not** clear `authorized`) |
| POST | `/:id/reject` | `{ reason }` → `rejected` (does **not** clear `authorized`) |

Decisions only allowed from `pending_review`.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Users admin (membership ≠ KYC): [`users-admin.md`](./users-admin.md)
- Errors: [`api-errors.md`](./api-errors.md)
