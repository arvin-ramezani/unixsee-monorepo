# Phase 1 public entry channels — document sync

## Note

Product and admin UX docs were aligned with Phase 1 public entry
behaviour. This note records that sync. It is not a UX specification.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Phase 1 customer can

1. **Sign up / sign in** on the public / customer surface (auth mechanics still
   open). This creates a user account, not a tenant.
2. **Submit certifications** for احراز هویت so staff can approve a tenant
   ([`customer-authorization-and-tenant.md`](./customer-authorization-and-tenant.md)).
3. **Send a plan request** by choosing a plan from the public list — allowed
   before tenant approval, with clear messaging that certifications are
   required before managed services can be delivered. Signed-out visitors must
   verify phone **or** email with OTP; Nest creates the **user account on
   successful verify before** the request is submitted
   ([`../ux-flows/customer-public-plan-request.md`](../ux-flows/customer-public-plan-request.md)).
4. **Send a consultant / complementary-service request** (SEO, design,
   product data entry, social support, and related consultation intake) without
   blocking solely for missing certifications.

Admin docs consume these as origins and queues. They do not design the
public forms or auth journey in detail. Validation of plan requests before
admin enablement is out of this admin application.

## Admin counterparts

| Public / customer action | Admin handling | Spec |
|---|---|---|
| Signup / sign-in | Find, support; contact verification | `ux-flows/admin-users.md`, `ux-flows/client-auth.md` |
| احراز هویت certifications | Review and approve/reject tenant | `ux-flows/admin-users.md` + authorization note |
| Plan request | Review chosen plan, link customer, enable only when tenant exists (one plan per website) | `ux-flows/admin-plan-requests.md` |
| Consultant / complementary request | Intake through delivery; commercial activation still needs a tenant | `ux-flows/admin-complementary-services.md` |

## Rules kept in sync

- Signup alone does not create a tenant, enable a plan, or activate a website.
- Public plan-request OTP verify creates a **user** (and session) before the
  request is stored; it still does not create a tenant or enable a plan.
- Plan request alone is not payment success and is not enablement.
- Plan enablement requires an existing **tenant**; create/approve happens in
  `/users` (or discovery assignment return), not from `/plan-requests`.
- Request submission is not blocked solely for missing certifications;
  customer copy must state certifications are necessary for delivery.
- A website has at most **one active plan** at a time.
- Consultant request is separate from plan-request and ticket lifecycles.
- Website visibility still requires tenant assignment and activation rules
  (`ux-flows/admin-servers-websites-agents.md`).

## Related

- `customer-authorization-and-tenant.md`
- `onboarding-plan-request-user-website.md`
- `onboarding-paths-and-handoffs.md`
- `phase-1-application-features.md` §§2–3, 8, 11, 16
