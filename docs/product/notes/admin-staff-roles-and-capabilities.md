# Feature Analysis: Admin staff roles and operator capabilities

**Feature:** Staff hierarchy — main ADMIN, sub-admins, specialty OPERATORs  
**Slug / path:** [`admin-staff-roles-and-capabilities.md`](./admin-staff-roles-and-capabilities.md)  
**Phase:** Phase 1 — **last delivery step** (after core ops surfaces)  
**Status:** Proposed  
**Evidence:** Confirmed (coarse Nest `ADMIN`/`OPERATOR` + Phase 1 §5.2) / Inferred (sub-admin + specialty matrix from product request) / Unknown (exact capability strings, CTO encoding)

---

## Summary

Staff need a managed hierarchy in `admin-panel/`: one **main ADMIN**, **sub-admins** who can provision **OPERATORs**, and OPERATORs scoped to specialties (design, server, data entry, development for Phase 1). Access must support both **different** specialty scopes and **higher** privilege tiers (e.g. a CTO-class operator above peer operators). Nest remains the authorization authority; the UI only reflects what Nest allows.

## Scope

- **In:**
  - Product model for staff tiers + operator specialties (Phase 1 set below).
  - Admin UI surface to invite/create/manage staff under policy (add OPERATORs; main ADMIN manages sub-admins).
  - Capability model that combines **scope (different)** and **rank (higher)**.
  - Nest-owned enforcement on `/api/v1/admin/*` (extend role/capability checks; do not redesign JWT/auth transport).
  - Honest permission-denied / capability-locked UI in `admin-panel/`.
- **Out (Phase 1):**
  - Customer/tenant `MembershipRole` changes (`OWNER`/`ADMIN`/`VIEWER`).
  - Impersonation of customers.
  - Inventing Nest routes that conflict with [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md).
  - Full Settings mega-panel unrelated to staff access.
  - Sharing auth modules with `client/` via a package.
- **Depends on:**
  - Staff session / Nest gate already authorized ([ADR 0012](../../architecture/decisions/0012-admin-nest-auth-integration.md)).
  - Resolution of Phase 1 §27 “administrator capability bundles” (this note proposes the shape).
  - Schema/API extension beyond today’s coarse `Role.ADMIN` | `Role.OPERATOR` — *Unknown* exact persistence (new enum values vs capability table).

## Actors & Roles

| Role (product) | Type | Notes |
|---|---|---|
| Main ADMIN | Admin | Exactly **one** bootstrap principal for the org. Full staff-admin powers. Can create/manage sub-admins and OPERATORs. |
| Sub-admin | Sub-admin | Elevated staff below main ADMIN. **Can add OPERATORs**; cannot replace or demote main ADMIN (*Inferred*). Capability set is a strict subset of main ADMIN unless an explicit grant says otherwise. |
| OPERATOR — design | Operator | Specialty scope: design / creative ops surfaces (*Inferred* mapping to complementary design workflows). |
| OPERATOR — server | Operator | Specialty scope: servers, agents, discovery, infrastructure ops. |
| OPERATOR — data entry | Operator | Specialty scope: product/data-entry complementary work and related tickets. |
| OPERATOR — development | Operator | Specialty scope: development-oriented support / delivery tasks. |
| CTO-class operator | Operator (higher + different) | Example of an operator that is **both** higher-ranked than peer OPERATORs **and** differently scoped (cross-specialty or platform-wide ops). Exact encoding TBD — see Open Questions. |

**Confirmed today in code:** Prisma `Role` = `ADMIN` | `OPERATOR` | `TENANT` | `USER`. Staff shell gate = `ADMIN` | `OPERATOR` only. No sub-admin, specialty, or rank fields yet.

## Access Model

Two orthogonal axes (both required):

1. **Different (specialty / domain scope)** — which product areas a principal may act in.
2. **Higher (privilege rank)** — within or across scopes, who may authorize riskier actions, manage lower staff, or override.

```text
Main ADMIN (rank: apex; scope: all staff domains)
  └── Sub-admin (rank: high; scope: configured staff domains)
        └── OPERATOR (rank: base | elevated e.g. CTO-class; scope: specialty set)
              specialties (Phase 1): design | server | data-entry | development
```

### Illustrative matrix (Proposed — not Confirmed Nest codes)

| Capability | Main ADMIN | Sub-admin | OPERATOR (specialty) | CTO-class OPERATOR |
|---|---|---|---|---|
| Sign in to admin-panel | Y | Y | Y | Y |
| Manage main ADMIN account | Self / break-glass only (*Unknown*) | N | N | N |
| Create / suspend sub-admins | Y | N | N | N |
| Create / suspend OPERATORs | Y | Y (within policy) | N | N (*Unknown* if CTO may) |
| Assign operator specialty | Y | Y | N | N |
| Customer / tenant admin | Y | Configurable | Only if specialty+grant | If grant |
| Servers / agents / discovery | Y | Configurable | server (+grant) | If grant |
| Tickets queue (assign/resolve) | Y | Configurable | Specialty-linked categories (*Unknown*) | If grant |
| Complementary: design / data-entry | Y | Configurable | Matching specialty | If grant |
| Audit / security recovery | Y | Limited (*Unknown*) | N by default | Elevated if grant |
| Override lower-rank staff action | Y | Over OPERATORs only | N | Over base OPERATORs if grant |

**Rules of thumb (Proposed):**

- Denying a specialty **hides/disables** UI for that domain; Nest still returns `403` on forced calls.
- **Higher** never implies **all different** scopes unless explicitly granted (CTO may be multi-scope without being main ADMIN).
- Sub-admin cannot escalate themselves to main ADMIN.

## Primary Flows

1. **Bootstrap main ADMIN** — Given a fresh control plane, When the first staff ADMIN exists, Then no second “main ADMIN” can be created through normal UI (*Inferred*; break-glass TBD).
2. **Main ADMIN creates sub-admin** — Given main ADMIN, When they submit create-staff with type sub-admin, Then Nest persists staff principal + grants; UI lists them under Staff access.
3. **Sub-admin adds OPERATOR** — Given sub-admin with `staff.operators.create`, When they create an OPERATOR with specialty ∈ {design, server, data-entry, development}, Then Nest rejects unknown specialties and unauthorized creators.
4. **Specialty-limited ops** — Given a server OPERATOR, When they open design-only surfaces, Then UI is capability-locked and Nest denies mutations.
5. **Higher + different (CTO-class)** — Given a CTO-class OPERATOR, When they act across granted specialties or elevated actions, Then Nest checks **rank and scope**; peer OPERATORs remain blocked.

## Surfaces

- **UI / apps:** `admin-panel/` — Staff access page (Phase 1 IA §23 “Staff access, when the role design is approved”). Customer `/users` flow stays customer/tenant admin ([`../ux-flows/admin-users.md`](../ux-flows/admin-users.md)).
- **APIs / services:** Nest `/api/v1/admin/*` + staff user admin endpoints — *Unknown* exact paths until contract; extend capability checks rather than redesigning auth (ADR 0012 / AGENTS hard boundaries).
- **Data:** Extend beyond coarse `Role` — *Unknown*: dedicated `StaffCapability` / specialty enum / rank field vs packing into claims. Prefer Nest DB as source of truth; JWTs stay thin (`sub` + DB load) as today.

## Delivery timing

Treat as **last Phase 1 step**: ship after websites, servers/agents, users, tickets, complementary services, and plan requests are usable. Recorded in [`phase-1-delivery-waves.md`](./phase-1-delivery-waves.md). Do not pretend Settings or staff-access UI is live before this lands.

## Open Questions

- How is **main ADMIN** uniqueness enforced (DB constraint, seed flag, config)? — *prevents dual apex*
- Is **sub-admin** a new `Role` value, an `ADMIN` with fewer capabilities, or a separate staff type table? — *schema + Nest guards*
- Exact Nest **capability string catalog** and mapping from specialties to Phase 1 domains (§5.2 list)? — *closes U-001 in admin-users*
- Is **CTO** a fifth specialty, a **rank** overlay on any specialty, or a fixed multi-scope bundle? — *higher vs different encoding*
- May sub-admins create other sub-admins? Default **N** (*Inferred*).
- May CTO-class create OPERATORs? Default **N** unless grant (*Unknown*).
- Persian IA labels for Staff access nav / page? — *UX flow follow-up*
- Invite-by-email vs admin-set password vs OTP bootstrap for new staff? — *auth UX; do not redesign Nest login contracts*

## Traceability

- Implementation: TBD (`admin-panel/` Staff access UI; `backend/` staff capability module)
- Tests: TBD (Nest capability matrix; admin UI permission states)
- Related docs:
  - Phase 1 §5.2 / §6.1 / §23 / §27 — [`../phase-1-application-features.md`](../phase-1-application-features.md)
  - Admin users capability gap U-001 — [`../ux-flows/admin-users.md`](../ux-flows/admin-users.md)
  - Delivery waves — [`phase-1-delivery-waves.md`](./phase-1-delivery-waves.md)
  - Staff Nest auth — [ADR 0012](../../architecture/decisions/0012-admin-nest-auth-integration.md)
  - Coarse roles today — [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md)

## Strategy note

Repo uses **centralized product notes** (not `docs/04-features/`). This FA is the product source for staff hierarchy. When implementation starts: add UX flow `ux-flows/admin-staff-access.md`, then Nest contract under `docs/backend/contracts/`, and only write an ADR if persistence/trust boundaries change beyond “extend capability checks on `/admin`”.
