# Admin users API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/users/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
> · UX [`../../product/ux-flows/admin-users.md`](../../product/ux-flows/admin-users.md)
>
> **Last verified:** 2026-08-15

Staff directory for **customer** accounts (`role` ∈ `USER` | `TENANT`). Staff
roles (`ADMIN` | `OPERATOR`) are excluded from the list.

## Authorization vocabulary (careful)

Product rule: **authorized ≈ became a tenant** (usable tenant + membership).

| Signal | Meaning | Must not mean |
|---|---|---|
| Has ≥1 membership | Customer is a tenant / organizationally authorized | Contact OTP verified alone |
| No membership | Not yet a commercial tenant | “Pending KYC package” (see authorization-cases) |

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
binaries or authorization package fields here.

### Mutations (existing)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/admin/users` | Create customer account (tenant create is separate) |
| `PATCH` | `/api/v1/admin/users/:id` | Profile/role/locale |
| `POST` | `/api/v1/admin/users/:id/suspend` | Required `reason`; clears refresh session |
| `POST` | `/api/v1/admin/users/:id/restore` | Required `reason`; clears suspension |
| `POST` | `/api/v1/admin/users/:id/revoke-sessions` | Required `reason`; clears refresh session |
| `POST` | `/api/v1/admin/users/:id/start-recovery` | Required `reason`; OTP to verified contact only; never returns secrets; clears refresh session |

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
