# Onboarding paths and handoffs

## Note

Companion to `onboarding-plan-request-user-website.md`. Describes staff paths
and what must survive cross-flow handoffs. Not a UX specification.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Path A — Request-led enablement

```text
Public plan choice
  → Guest OTP on phone or email → Nest creates user account (if new) + session
  → Authenticated plan request submit (linked user)
  → External validation (out of this app)
  → درخواست‌های پلن: review chosen plan
  → Link existing user if needed; require tenant (احراز هویت approved or staff-created)
  → Select target website
  → Enable plan (one active plan per website)
```

Guest intake **must** create or authenticate the user on OTP verify **before**
the plan request is stored. If staff later see a request without a linked user,
treat that as legacy/conflict data until Nest sync completes—not as the
intended path.

If the user exists but is **not yet a tenant**, complete احراز هویت (or staff
approve tenant) before enablement. Do not create the user from the **admin**
plan-request surface. Do not enable without a tenant.

Plan / consultant **request submission** may happen before tenant approval;
customer messaging must state that certifications are required for delivery.
Canonical rule:
[`customer-authorization-and-tenant.md`](./customer-authorization-and-tenant.md).

## Path B — Discovery-led website ownership

```text
Create server → enroll agent → discover websites
  → تخصیص وب‌سایت کشف‌شده
  → Find existing tenant or create-and-return via `/users/new`
  → Select plan (prefer chosen plan from a linked enabled/ready request when present)
  → Assign → website follows assignment/activation rules
```

Discovery still does not grant plan entitlement by itself. Prefer a linked
plan request’s chosen plan when one is ready to enable or already enabled for
that context. Assignment that activates managed ownership still requires a
**tenant**.

## Path C — Existing customer, new plan on a website

```text
Plan request for a known user / website context
  → Link existing user if needed
  → Confirm tenant exists (احراز هویت complete)
  → Select the website
  → Enable (block or replace per one-plan policy)
  → Keep request and website plan history
```

## Handoffs

| From | To | Preserve |
|---|---|---|
| Plan request | Users / احراز هویت | Contacts, chosen plan, domain hints (read-only); resume same request after tenant exists |
| Plan request | Website select / enable | Chosen plan, linked tenant/user, target website |
| Users | Plan request | Existing match, account state, tenant/authorization state, owner membership |
| Discovery | Website assign | Domain, server/agent, unassigned status |
| Assign / enable | Website ops | Website id, tenant, active plan, lifecycle |

## Rule

Plan-request state and enablement stay in `/plan-requests`.
Identity and احراز هویت stay in `/users` (admin) and Nest auth (public OTP).
Enrollment, discovery, and website inventory stay in servers/websites.
**Admin** user create is never owned by the plan-request surface in this phase.
Public guest plan-request **OTP verify** may create the user before submit.
Commercial enablement waits on a tenant.
