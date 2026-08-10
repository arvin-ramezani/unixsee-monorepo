# Onboarding paths and handoffs

## Note

Companion to `onboarding-plan-request-user-website.md`. Describes staff paths
and what must survive cross-flow handoffs. Not a UX specification.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Path A — Request-led enablement

```text
Public plan choice
  → External validation (out of this app)
  → درخواست‌های پلن: review chosen plan
  → Link existing user/tenant (must already exist)
  → Select target website
  → Enable plan (one active plan per website)
```

If the user does not exist yet, resolve identity in `/users` first, then return
and link. Do not create the user from the plan-request surface.

## Path B — Discovery-led website ownership

```text
Create server → enroll agent → discover websites
  → تخصیص وب‌سایت کشف‌شده
  → Find existing tenant or inline create in users/assignment flow
  → Select plan (prefer chosen plan from a linked enabled/ready request when present)
  → Assign → website follows assignment/activation rules
```

Discovery still does not grant plan entitlement by itself. Prefer a linked
plan request’s chosen plan when one is ready to enable or already enabled for
that context.

## Path C — Existing customer, new plan on a website

```text
Plan request for a known user / website context
  → Link existing user if needed
  → Select the website
  → Enable (block or replace per one-plan policy)
  → Keep request and website plan history
```

## Handoffs

| From | To | Preserve |
|---|---|---|
| Plan request | Users | Contacts, chosen plan, domain hints (read-only); resume same request after identity exists |
| Plan request | Website select / enable | Chosen plan, linked tenant/user, target website |
| Users | Plan request | Existing match, account state, owner membership |
| Discovery | Website assign | Domain, server/agent, unassigned status |
| Assign / enable | Website ops | Website id, tenant, active plan, lifecycle |

## Rule

Plan-request state and enablement stay in `/plan-requests`.
Identity stays in `/users`.
Enrollment, discovery, and website inventory stay in servers/websites.
User create is never owned by the plan-request surface in this phase.
