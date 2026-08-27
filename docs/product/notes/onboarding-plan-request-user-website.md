# Onboarding operating model

## Note

How Phase 1 admin onboarding channels fit together. Not a UX or visual
spec. Details live in the linked UX flows.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Stance

- Public site lets a customer **choose a plan** from a list (plan request).
- Plan request submission is allowed **before** احراز هویت /
  **`authorized = true`**;
  customer copy should still explain certifications support delivery readiness.
  See
  [`customer-authorization-and-tenant.md`](./customer-authorization-and-tenant.md).
- **External validation** of that request is out of this admin application.
- Admin **enables** the requested plan on a website; that is the commercial
  outcome for `/plan-requests` in this phase.
- Enablement prefers an **`authorized`** customer (Proposed ADR
  [`0016`](../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)).
  When `authorized === false`, staff may still enable after **AlertDialog
  confirm** + Nest `confirmUnauthorized` (**1A**). Authorization is set via
  direct user toggle (**2A**) and/or KYC case approve in `/users`.
- Public signup defaults to **`role = TENANT`**, creates a **Tenant shell** +
  OWNER membership, and leaves **`authorized = false`** until staff toggle or
  case approve.
- Linking a plan to a website does not start it. Activation is explicit and
  records a start timestamp; discovery and ordinary assignment create inactive
  links.
- Each **website has at most one active plan** at a time.
- **Agent discovery** is staff-only inventory, not plan entitlement or
  customer visibility.

## Surfaces

| Record                     | Admin route      | UX flow                                     |
| -------------------------- | ---------------- | ------------------------------------------- |
| Plan request               | `/plan-requests` | `ux-flows/admin-plan-requests.md`           |
| User / tenant / احراز هویت | `/users`         | `ux-flows/admin-users.md`                   |
| Server / agent / discovery | `/servers`       | `ux-flows/admin-servers-websites-agents.md` |
| Managed website            | `/websites`      | same servers/websites flow                  |
| User ↔ website visibility  | `/users/[id]`, `/websites/[id]` | `ux-flows/admin-user-website-visibility.md` |

These are sibling queues with cross-links, not one wizard.

## Origins

| Origin                                                 | Creates                                                                        | Does not create alone                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Plan request (after OTP)                               | Chosen-plan intake for admin enablement; request linked to existing user       | Tenant, managed website, enrollment, sale   |
| Public plan-request OTP verify                         | Customer **user** (`role=TENANT`) + verified contact + session; Tenant shell + OWNER; `authorized=false` | Commercial authorization, plan enablement |
| Public signup (if enabled)                             | Same as above (`role=TENANT`, Tenant shell, `authorized=false`) | Commercial authorization, plan enablement |
| احراز هویت approval                                    | Sets `authorized=true` (ensures Tenant + OWNER); cases stay independent of direct toggle | Plan enablement by itself |
| Admin create / toggle `authorized` (`/users`)          | User and/or tenant, owner; may set `authorized` without KYC files (**2A**) | Website assignment, plan enablement |
| Agent discovery                                        | Staff-only candidate                                                           | Tenant, plan, customer visibility           |
| Enable plan on website                                 | Active plan on that website                                                    | Payment settlement (Phase 1)                |

## Hard separations

Keep distinct: plan request, user, احراز هویت, tenant, discovery, assignment,
enablement.

Never collapse: request→payment, signup→tenant, signup→plan enablement,
discovery→customer site, **admin** plan-request surface→user create,
request submission→sale.

Public plan-request **OTP verify** is an allowed user-origin (account before
request). The **admin** `/plan-requests` surface still must not create users;
link the user that already exists from intake or `/users`.

## Related

- Authorization note: `customer-authorization-and-tenant.md`
- Paths and handoffs: `onboarding-paths-and-handoffs.md`
- Public entry sync: `phase-1-public-entry-channels.md`
- Public plan-request UX: `../ux-flows/customer-public-plan-request.md`
- Agent sequence: `servers-agent-data-flow.md`
- Active-plan conflict mode is a hard block; exact certification document set
  and Nest sync for guest verify-then-create remain open (see public contract
  Draft note).
