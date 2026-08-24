# Phase 1 public entry channels — document sync

## Note

Product and admin UX docs were aligned with Phase 1 public entry
behaviour. This note records that sync. It is not a UX specification.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Phase 1 customer can

1. **Sign up** on the public / customer surface (auth mechanics still open).
2. **Send a plan request** by choosing a plan from the public list.
3. **Send a consultant / complementary-service request** (SEO, design,
   product data entry, social support, and related consultation intake).

Admin docs consume these as origins and queues. They do not design the
public forms or auth journey in detail. Validation of plan requests before
admin enablement is out of this admin application.

## Admin counterparts

| Public / customer action | Admin handling | Spec |
|---|---|---|
| Signup | Find, link, support; or admin create if missing | `ux-flows/admin-users.md` |
| Plan request | Review chosen plan, link existing user, select website, enable (one plan per website) | `ux-flows/admin-plan-requests.md` |
| Consultant / complementary request | Intake through delivery | `ux-flows/admin-complementary-services.md` |

## Rules kept in sync

- Signup alone does not enable a plan or activate a website.
- Plan request alone is not payment success and is not enablement.
- Plan enablement requires an **existing** user/tenant; create happens in
  `/users` (or discovery assignment), not from `/plan-requests`.
- A website has at most **one active plan** at a time.
- Consultant request is separate from plan-request and ticket lifecycles.
- Website visibility still requires tenant assignment and activation rules
  (`ux-flows/admin-servers-websites-agents.md`).

## Related

- `onboarding-plan-request-user-website.md`
- `onboarding-paths-and-handoffs.md`
- `phase-1-application-features.md` §§2–3, 8, 11, 16
