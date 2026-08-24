# Admin websites API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/websites/*` (staff JWT + ADMIN/OPERATOR)
>
> **Last verified:** 2026-08-24

Staff website creation and assignment keep plan linkage separate from plan
activation.

## Plan lifecycle

`Website.planId` means a plan is linked or assigned to the website.
`Website.planActivatedAt` is the start marker:

| State              | `planId` | `planActivatedAt` |
| ------------------ | -------- | ----------------- |
| No plan            | `null`   | `null`            |
| Linked, not active | plan ID  | `null`            |
| Active             | plan ID  | timestamp         |

Linking or assigning a plan must not start it implicitly. Existing plan links
created before this field was introduced are backfilled as active to preserve
their previous meaning.

## Create website

`POST /api/v1/admin/websites`

Body:

```ts
{
  tenantId: string;
  domain: string;
  displayName?: string;
  vpsNodeId?: string;
  userId?: string;
  planId?: string;
  activatePlan?: boolean; // defaults to false; valid only with planId
}
```

- Omitting `planId` creates a planless website.
- Providing `planId` without `activatePlan: true` creates an inactive link.
- `activatePlan: true` records `planActivatedAt` at creation time.
- `activatePlan: true` without `planId` returns validation error.

## Assign website

`POST /api/v1/admin/websites/:id/assign`

When assignment supplies a `planId`, the plan is linked with
`planActivatedAt: null`. Discovery assignment follows the same rule.

## Activation

Plan-request enablement is the standard activation action. It records the
requested `planId` and `planActivatedAt` atomically with the enabled request.
An already-active different plan returns `409 CONFLICT`; it is never replaced
automatically. An inactive linked plan may be replaced by the requested plan
because no plan has started yet.

## Related

- Plan requests: [`plan-requests-admin.md`](./plan-requests-admin.md)
- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
