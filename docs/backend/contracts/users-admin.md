# Admin users API contract

> **Status:** Accepted — **vocabulary amendment Proposed** (ADR 0016, 2026-08-27)
>
> **Audience:** `/api/v1/admin/users/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
> · UX [`../../product/ux-flows/admin-users.md`](../../product/ux-flows/admin-users.md)
> · ADR [`../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md`](../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)
>
> **Last verified:** 2026-08-27

Staff directory for **customer** accounts (`role` ∈ `TENANT` | `USER`). Staff
roles (`ADMIN` | `OPERATOR`) are excluded from the list.

- `TENANT` — public signup / org-owner customer accounts (default at signup once
  ADR 0016 is implemented).
- `USER` — reserved for **invited members** under a tenant (future multi-user).

## Authorization vocabulary (careful)

**Proposed product rule (ADR 0016):** commercial **`authorized`** is an
explicit boolean on `User` (default `false`). It is **not** the same as
“has membership” or “OTP-verified.”

| Signal | Meaning | Must not mean |
|---|---|---|
| `role = TENANT` | Customer org-owner account type | Already commercially authorized |
| `authorized = true` | Staff toggle **or** KYC case approve | Contact OTP alone; membership alone |
| Has ≥1 membership | Belongs to a Tenant organization (shell may exist at signup) | `authorized` |
| `role = USER` | Invited member (future) | Public signup default |

**Legacy Accepted shorthand (superseded by ADR 0016 Proposed):**
“authorized ≈ became a tenant (membership).” Do not use that heuristic in new
UI or gates once `authorized` ships.

**This contract does not expose** national ID, address package fields, or
national-ID card images. Those belong to
[`authorization-cases.md`](./authorization-cases.md) and must never appear on
the users list.

## Resources

### List customers

`GET /api/v1/admin/users?search&skip&take`

- Filters to customer roles only.
- Each item includes membership summaries (`tenant.id`, `tenant.name`,
  `tenant.displayName`, `tenant.status`, membership `role`) and
  `_count.websites` / `_count.memberships`.
- **Proposed:** each item also exposes `authorized: boolean` and uses signup
  default `role = TENANT` for new accounts.
- Omits `password` and `hashedRt`.

Response `200` data shape:

```ts
{
  items: AdminUserListItem[];
  total: number;
}
```

### Get customer

`GET /api/v1/admin/users/:id`

Includes `memberships.tenant`. Same omit rules. Do not attach ID-document
binaries or authorization package fields here. **Proposed:** include
`authorized`.

### Mutations (existing)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/admin/users` | Create customer account (**Proposed:** `role=TENANT`, `authorized=false` by default, Tenant shell + OWNER; body may set `authorized=true` for ops exception without KYC files) |
| `PATCH` | `/api/v1/admin/users/:id` | Profile/role/locale; **Proposed:** may set `authorized` boolean (**2A** independent toggle — does **not** approve/close authorization cases) |
| `POST` | `/api/v1/admin/users/:id/suspend` | Required `reason`; clears refresh session |
| `POST` | `/api/v1/admin/users/:id/restore` | Required `reason`; clears suspension |
| `POST` | `/api/v1/admin/users/:id/revoke-sessions` | Required `reason`; clears refresh session |
| `POST` | `/api/v1/admin/users/:id/start-recovery` | Required `reason`; OTP to verified contact only; never returns secrets; clears refresh session |

**Proposed `authorized` toggle (2A):** Changing `authorized` is audited
(actor, previous/next value, time). It does not mutate authorization-case
status. Revoking commercial readiness uses this field (set `false`), not case
reject.

**Commercial applyments:** When Nest commercial mutations target a principal
with `authorized === false`, clients must send `confirmUnauthorized: true`
(see plan-requests, websites, billing, complementary assignment contracts).
UI shows AlertDialog first (**1A**).

Admin user payloads include `hasActiveSession: boolean` (derived; hash never
returned). `phoneVerifiedAt` / `emailVerifiedAt` remain available for recovery
eligibility.

Suspend / restore / revoke / recovery responses return the updated admin user
shape (same omit rules). Start-recovery wraps `{ channel, delivered, user }`
where `channel` is `phone` | `email`.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Tenants: [`../modules-and-routes.md`](../modules-and-routes.md) (Tenants section)
- Errors: [`api-errors.md`](./api-errors.md)
- Product note: [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
- Authorization cases: [`authorization-cases.md`](./authorization-cases.md)
