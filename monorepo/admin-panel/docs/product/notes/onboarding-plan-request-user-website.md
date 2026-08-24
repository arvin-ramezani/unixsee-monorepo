# Onboarding operating model

## Note

How Phase 1 admin onboarding channels fit together. Not a UX or visual
spec. Details live in the linked UX flows.

Aligned with `ux-flows/admin-plan-requests.md` v0.2 (thin enablement).

## Stance

- Public site lets a customer **choose a plan** from a list (plan request).
- **External validation** of that request is out of this admin application.
- Admin **enables** the requested plan on a website; that is the commercial
  outcome for `/plan-requests` in this phase.
- The **user must already exist** before a plan request can be enabled.
  Admin create of users/tenants happens in `/users` (or inline during
  discovery assignment), not from the plan-request surface.
- Each **website has at most one active plan** at a time.
- **Agent discovery** is staff-only inventory, not plan entitlement or
  customer visibility.

## Surfaces

| Record | Admin route | UX flow |
|---|---|---|
| Plan request | `/plan-requests` | `ux-flows/admin-plan-requests.md` |
| User / tenant | `/users` | `ux-flows/admin-users.md` |
| Server / agent / discovery | `/servers` | `ux-flows/admin-servers-websites-agents.md` |
| Managed website | `/websites` | same servers/websites flow |

These are sibling queues with cross-links, not one wizard.

## Origins

| Origin | Creates | Does not create alone |
|---|---|---|
| Plan request | Chosen-plan intake for admin enablement | Auth session, user account, managed website, enrollment |
| Public signup (if enabled) | User (maybe tenant) | Plan enablement, website assignment |
| Admin create (`/users` or assignment inline) | User, tenant, owner | Website assignment, plan enablement |
| Agent discovery | Staff-only candidate | Tenant, plan, customer visibility |
| Enable plan on website | Active plan on that website | Payment settlement (Phase 1) |

## Hard separations

Keep distinct: plan request, user, tenant, discovery, assignment, enablement.

Never collapse: request→payment, signup→plan enablement, discovery→customer
site, admin create→website assignment, plan-request surface→user create.

## Related

- Paths and handoffs: `onboarding-paths-and-handoffs.md`
- Public entry sync: `phase-1-public-entry-channels.md`
- Agent sequence: `servers-agent-data-flow.md`
- Open: one-plan conflict mode (hard-block vs replace); whether requests arrive
  pre-linked to a user id
