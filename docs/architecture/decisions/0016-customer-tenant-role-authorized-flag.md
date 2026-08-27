# ADR 0016: Customer role TENANT + explicit authorized flag

> **Status:** Accepted  
> **Date:** 2026-08-27  
> **Amended:** 2026-08-27 (1A confirm-override; 2A independent toggle; implemented)
> **Owners:** Product, Backend, Client, Admin  
> **Amends product stance in:**  
> [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)  
> **Related:** Phase 1 §8–9; contracts `users-admin.md`, `authorization-cases.md`

## Context

Phase 1 already separates **account authentication** from **organizational
authorization (احراز هویت)**. The Accepted shorthand was
**authorized ≈ became a tenant** (usable `Tenant` + OWNER membership).

That conflates three ideas staff and product now need separate:

1. **Audience role** — customer vs staff (`Role`).
2. **Organization container** — `Tenant` + `Membership` (needed so a tenant can
   later add its own users).
3. **Commercial authorization** — whether Unixsee treats the customer as
   commercially ready (`User.authorized`), with staff able to override for
   applyments via confirmed exception.

Prisma already has `Role.TENANT` and `Role.USER`, but public signup still
defaults to `USER`, and there is no dedicated `authorized` column. Product
direction (2026-08-27): signup customers should default to **TENANT**, carry an
explicit **authorized** flag, and later support multi-user membership under
that tenant. Staff may set `authorized` without KYC files, and may apply
commercial outcomes for unauthorized customers after an AlertDialog confirm.

## Decision (Proposed)

### 1. Signup default role

Public signup and other customer-account origins (including plan-request OTP
account creation) create users with:

- `role = TENANT` (not `USER`)

Staff roles remain `ADMIN` | `OPERATOR` only.

`Role.USER` is reserved for **invited members** of an existing tenant (future
multi-user), not for the initial public signup account.

### 2. Explicit `authorized` on User

Add a persisted customer flag (name **`authorized`**, boolean, default
`false`) on `User`:

| `authorized` | Meaning |
|---|---|
| `false` | Account may sign in, submit plan/consultant requests, and submit احراز هویت; commercial applyments require staff **confirm override** |
| `true` | احراز هویت approved **or** staff set the flag directly; commercial applyments proceed without the unauthorized confirm |

Contact OTP verification remains a separate concept and must **not** set
`authorized`.

### 3. Tenant shell at signup

On customer signup (role `TENANT`):

- Create a **Tenant** organization shell, and
- Create **OWNER** membership for that user,

even while `authorized = false`.

This gives a stable org container so the product can later add users under the
same tenant without waiting for KYC. Commercial readiness uses **`authorized`**,
not “membership exists.”

### 4. Two ways to set `authorized = true`

#### 4a. Direct admin toggle (2A — independent)

Staff may set `User.authorized` on the user record (create or detail) **without**
opening authorization files or cases. Cases are **not** auto-approved or closed.
Revoking commercial readiness also uses this toggle (or a dedicated revoke).

#### 4b. Authorization case approve

Staff approve of an authorization case:

- Sets `User.authorized = true` for the OWNER (signup) user.
- Ensures Tenant + OWNER membership exist (idempotent if already created at
  signup).
- Does **not** change `role` away from `TENANT`.

**Reject / needs-more-info** update case status only. They **must not** clear
`authorized === true` that was set by toggle or a prior approve (stale-case
footgun). Staff who need to revoke use the toggle.

### 5. Commercial applyments — confirm override (1A)

When the linked customer OWNER (commercial principal) has
`authorized !== true`, admin commercial applyments:

- Show an **AlertDialog** confirmation in admin UI.
- Nest rejects the mutation **unless** the request includes an explicit staff
  override acknowledgment (e.g. `confirmUnauthorized: true`).
- Audit actor, target, action, `authorized` at time, and override flag.

Applyments that require this gate include at least: plan-request enable;
website create with `activatePlan`; record/replace plan terms; complementary
assignment; discovery assign; website transfer to unauthorized target; billing
renew. Website create **without** activate, tenant shell, membership edits,
quotations, and KYC approve itself do **not** use this override modal.

Customer **intake** (plan/consultant requests, KYC submit) stays allowed while
unauthorized and is **not** gated on `authorized`.

### 6. Future multi-user (direction only)

Later, a tenant OWNER (or tenant ADMIN membership) may invite additional users:

- Invited accounts use `role = USER` (or remain TBD if product prefers another
  label).
- They join via `Membership` (`ADMIN` | `VIEWER` | …).
- Whether invited users store their own `authorized` flag or inherit the
  tenant’s commercial readiness is **Unknown** until that feature is designed;
  Phase 1 commercial principal remains the signup OWNER’s `authorized` (or a
  future tenant-level flag if introduced).

### 7. Admin and API signals

Replace the list/detail heuristic “has membership ⇒ authorized” with:

- Show `role`
- Show `authorized` (editable by staff independently of KYC cases)
- Show memberships / tenant as organization linkage
- Show authorization **case** status separately when a package exists

## Consequences

- Product note, Phase 1 §8, users-admin, and authorization-case contracts must
  describe **authorized** as the commercial flag; membership alone is not
  enough; commercial applyments use **confirm override**, not hard-block.
- Schema/migration (implementation follow-up): default `role` → `TENANT` for
  customer creates; add `authorized Boolean @default(false)`; signup
  transaction creates Tenant + OWNER membership.
- Backfill strategy for existing rows is an implementation concern: propose
  membership + prior APPROVED case ⇒ `authorized=true`, else `false`
  (`Unknown` until ops confirms).
- Observed code today (`Role` default `USER`, no `authorized` column, hard
  membership heuristics) is **Conflict** with this Proposed ADR until
  implementation lands.

## Non-goals

- Implementing the migration or signup code in this ADR.
- Redefining staff `ADMIN` / `OPERATOR` auth.
- Shipping tenant invite/multi-user UX in the same change as the flag.
- Auto-syncing authorization cases when the direct toggle flips.

## Related

- Product note (canonical vocabulary + flow inventory after this ADR is Accepted):
  [`../../product/notes/customer-authorization-and-tenant.md`](../../product/notes/customer-authorization-and-tenant.md)
- Contracts: [`../../backend/contracts/users-admin.md`](../../backend/contracts/users-admin.md),
  [`../../backend/contracts/authorization-cases.md`](../../backend/contracts/authorization-cases.md)
- UX: client/admin authorization flows
