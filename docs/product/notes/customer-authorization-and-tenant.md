# Customer authorization (احراز هویت) and tenant

## Note

Canonical clarification for the gap between **account authentication**,
**organization membership**, and **commercial authorization**. Supports Phase 1
identity, plan requests, and admin enablement. Not a UX or visual specification.

> **Authority status:** Product stance below is aligned with Accepted ADR
> [`0016`](../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)
> (2026-08-27, **1A confirm-override** and **2A independent toggle**). Run the
> `authorized` migration before relying on runtime behavior. Older “authorized ≈
> membership” wording remains superseded.

## Stance (`Proposed` → binding when ADR 0016 is Accepted)

1. Customers can **sign up and sign in** (OTP / contact verification). That
   creates or authenticates a **customer user account**.
2. Public customer signup (and plan-request OTP account creation) sets
   **`role = TENANT`** by default. Staff roles stay `ADMIN` | `OPERATOR`.
   `Role.USER` is reserved for **later invited members** of a tenant.
3. Signup also creates a **Tenant shell** and **OWNER membership** for that
   user, even before commercial authorization. Membership means “belongs to an
   organization,” not “commercially ready.”
4. A boolean **`User.authorized`** (default `false`) is the commercial
   readiness flag. **Authorized** means `authorized === true` after staff KYC
   approve **or** a direct staff toggle—**not** merely “has a tenant
   membership” and **not** “OTP-verified contact.”
5. Customers **may** submit certifications / identity documents; staff may
   review them and approve or reject. This path is **optional** for setting
   `authorized`.
6. On **case approve**: set `authorized = true` (idempotently ensure Tenant +
   OWNER). Case reject / needs-more-info update case status only and **must
   not** clear `authorized === true` set by toggle or a prior approve. Revoke
   commercial readiness via the user toggle.
7. Staff may set / clear **`authorized` on the user record** without opening
   KYC files or cases (**2A**). Cases are not auto-approved or closed.
8. Customers **may still submit plan requests** (and related consultant /
   complementary intake) while `authorized === false`. Do **not** block
   submission only because certifications are missing.
9. Customer-facing copy should still explain that certifications support
   delivery readiness; they are not a hard prerequisite for staff applyments.
10. Admin workflows that **apply** commercial outcomes **warn** when the linked
    customer is not yet `authorized`, then proceed after AlertDialog confirm
    and Nest `confirmUnauthorized` acknowledgment (**1A**). They do **not**
    hard-block solely because `authorized === false`.
11. **Later:** each tenant may add its own users (`Role.USER` + membership).
    Invite UX and whether members inherit commercial readiness are out of Phase 1
    detail (`Unknown` until designed).

## Vocabulary

| Term | Meaning | Must not be confused with |
|---|---|---|
| Sign up / sign in | Create or authenticate a customer user session | Commercial authorization |
| `Role.TENANT` | Default customer **signup** account type (org owner path) | Staff admin; invited member |
| `Role.USER` | Future **invited member** under a tenant | Public signup default |
| Contact verification | OTP / email proof that a contact works | احراز هویت / `authorized` |
| Tenant shell | Organization record + memberships (may exist before KYC) | “Commercially ready” |
| Membership | User ↔ tenant link (`OWNER` / `ADMIN` / `VIEWER`) | `authorized` flag |
| `User.authorized` | Commercial readiness flag | Session; contact OTP; role; case status |
| Direct toggle (2A) | Staff sets `authorized` without KYC files | Case approve |
| احراز هویت case | Optional package review → may set `authorized = true` | Login success; required for every authorize |
| Confirm override (1A) | Staff AlertDialog + Nest ack to apply while unauthorized | Hard-block |
| Plan request | Chosen-plan intake; not payment and not enablement | Selling / enablement |

## Customer path

```text
Sign up / sign in
  → User(role=TENANT, authorized=false) + Tenant shell + OWNER membership
  —or— public plan-request OTP verify (same account outcome)
  → Optional: submit plan or consultant request (allowed while unauthorized)
  → Optional: submit certifications for احراز هویت
  → Staff may: (a) toggle authorized on user, and/or (b) approve KYC case
  → Staff may enable / assign / renew with confirm if still unauthorized
  → Later: tenant adds member users (Role.USER + membership)
```

## Admin path

Staff need to:

- See **role**, **`authorized`**, **memberships/tenant**, and **case status** as
  distinct signals.
- Toggle `authorized` on user create/detail without opening KYC (**2A**).
- Optionally review certification submissions; approve → `authorized = true`.
- Reject or request better documents without clearing an existing
  `authorized === true`.
- On commercial applyments when `authorized === false`: AlertDialog confirm +
  Nest `confirmUnauthorized` + audit (**1A**).

## Flow inventory

### Customer — always allowed while `authorized === false`

| Flow | Behavior |
|---|---|
| Sign up / sign in | `TENANT` + shell; dashboard accessible |
| Profile / contact verify | OTP only; never sets `authorized` |
| Submit plan request | Allowed |
| Submit complementary / consultant intake | Allowed (intake only) |
| Submit KYC package | Optional; does not set `authorized` on submit |
| View websites / billing (membership-scoped) | Allowed reads |
| Tickets / support | Allowed unless later policy (`Unknown`) |

### Admin — set / clear authorization

| Flow | Behavior |
|---|---|
| User list/detail show `authorized` | Distinct from role and membership |
| Toggle `authorized` | Flag only; cases unchanged; audit who/when |
| Create user | Default `TENANT` + shell + `authorized=false`; may set `true` at create |
| Case approve | Sets `authorized=true`; ensure Tenant+OWNER |
| Case reject / needs-info | Case status only; does **not** clear `authorized=true` |
| Ensure personal tenant | Always allowed; not a commercial gate |

### Admin — commercial applyments (confirm if unauthorized)

| Flow | Confirm if unauthorized? |
|---|---|
| Plan-request **enable** | Yes |
| Website create with **`activatePlan: true`** | Yes |
| Website create **without** activate | No |
| Record plan terms / replace plan | Yes |
| Complementary **assignment** (creates billing) | Yes |
| Discovery **assign** to tenant | Yes |
| Website **transfer** to unauthorized target | Yes |
| Billing **renew** period | Yes |
| Plan-request **link** / decline | No |
| Complementary quotation / accept without assignment | No (Yes only if accept materializes website ownership) |
| Tenant create / membership edit | No |
| KYC approve itself | No (sets authorized; has its own confirm) |

### Nest enforcement (intended)

- Commercial endpoints reject unauthorized applyments unless
  `confirmUnauthorized: true` (or named equivalent).
- Audit: actor, target user/tenant, action, `authorized` at time, override flag.
- Do **not** gate customer intake endpoints on `authorized`.

## Easy-to-miss rules

1. Admin may create a user with `authorized=true` at create (ops exception; no KYC).
2. Direct toggle and KYC case are independent; no forced sync.
3. Case reject does not undo a prior toggle.
4. Website create without plan needs no unauthorized confirm; activate/terms do.
5. Discovery assign confirms even though plan enablement stays on plan-requests.
6. Renew / replace / transfer confirm when the commercial principal is unauthorized.
7. Backfill proposal: membership + prior APPROVED case ⇒ `authorized=true`, else
   `false` (`Unknown` until ops confirms).
8. Customer billing hub / website reads are not gated on `authorized`.
9. Only `ADMIN` / `OPERATOR` may toggle or override.

## Hard separations

Keep distinct:

- account session ≠ contact verification ≠ `authorized` ≠ tenant membership ≠
  case status;
- `Role.TENANT` ≠ “already commercially authorized”;
- plan/consultant **request** ≠ **enablement / sale**;
- signup alone never enables a plan or activates a website;
- hard-block ≠ confirm override (Phase 1 uses confirm override for staff
  applyments).

## Required fields for tenant authorization (`Confirmed` field set)

When customers use the **KYC package** path, they must provide:

| Field (FA) | Meaning | Notes |
|---|---|---|
| کد ملی | Iranian national ID | Required |
| تاریخ تولد | Date of birth | Required |
| شماره موبایل متعلق به همان کد ملی | Mobile number belonging to that national ID | Required |
| تأیید موبایل با OTP | Mobile OTP confirmation | Required unless this mobile is already the signup mobile **and** already contact-verified |
| ایمیل | Email address | Required |
| تأیید ایمیل | Email confirmation | Required unless this email is already the signup email **and** already contact-verified |
| استان | Province | Required |
| شهر | City | Required |
| آدرس کامل | Full street address | Required |
| کد پستی | Postal code | Required |
| عکس از کارت ملی | Photo of national ID card | Required upload |

**Skip re-verification rule (`Confirmed`):** If the customer reuses the same
mobile or email they already signed up with, and that contact is already
verified on the account, do **not** require another OTP / email confirmation
for that contact during احراز هویت. Changing to a different mobile or email
requires fresh verification of the new value.

These fields are **not** required for the direct admin toggle path.

Document file constraints (format, size, quality), national-ID checksum rules,
and whether Shahkar/mobile-national-ID matching is automated vs staff-only
remain `Unknown` until backend/product decide.

## Open items (`Unknown`)

- Exact upload format/size/quality rules for کارت ملی photo.
- Whether mobile↔کد ملی ownership is auto-checked (e.g. Shahkar) or staff-judged.
- Customer surface placement (`/dashboard/authorization` vs profile section).
- Whether ticket creation is ever restricted for unauthorized users.
- Invite/multi-user UX; whether invited `Role.USER` accounts store their own
  `authorized` or inherit the OWNER/tenant commercial state.
- Final backfill mapping for existing production users when the column ships.

## Current state vs intended contract

| Topic | Observed (code today) | Intended (this note + ADR 0016 Proposed) |
|---|---|---|
| Signup default role | `USER` | `TENANT` |
| `authorized` column | Missing | Required boolean, default `false` |
| Tenant at signup | Often created with signup paths | Tenant shell + OWNER at signup |
| Set authorized | Case approve ≈ tenant only | Toggle **or** case approve |
| Commercial gate | Membership / soft signals | Confirm override when `authorized === false` |

## Related

- ADR: [`../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md`](../../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)
- Phase brief: [`../phase-1-application-features.md`](../phase-1-application-features.md) §§8–9, 11
- Client UX: [`../ux-flows/client-authorization.md`](../ux-flows/client-authorization.md)
- Admin UX: [`../ux-flows/admin-authorization.md`](../ux-flows/admin-authorization.md)
- Onboarding model: [`onboarding-plan-request-user-website.md`](./onboarding-plan-request-user-website.md)
- Paths: [`onboarding-paths-and-handoffs.md`](./onboarding-paths-and-handoffs.md)
- Public entry: [`phase-1-public-entry-channels.md`](./phase-1-public-entry-channels.md)
- Admin users: [`../ux-flows/admin-users.md`](../ux-flows/admin-users.md)
- Admin plan requests: [`../ux-flows/admin-plan-requests.md`](../ux-flows/admin-plan-requests.md)
- Client auth: [`../ux-flows/client-auth.md`](../ux-flows/client-auth.md)
- Public plan request: [`../ux-flows/customer-public-plan-request.md`](../ux-flows/customer-public-plan-request.md)
- Contracts: [`../../backend/contracts/users-admin.md`](../../backend/contracts/users-admin.md),
  [`../../backend/contracts/authorization-cases.md`](../../backend/contracts/authorization-cases.md)
