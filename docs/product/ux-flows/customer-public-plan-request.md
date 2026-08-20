# UX Flow Specification

## Document control

| Field | Value |
|---|---|
| Project | Unixsee Client (public website) |
| Flow or service | Guest plan request — managed WooCommerce server |
| Version | 0.4 |
| Status | Draft |
| Date | 2026-08-14 |
| Evidence sources | Stakeholder direction 2026-08-14 (OTP verify creates account before request); `docs/product/phase-1-application-features.md` §11.2; prior v0.3 guest anonymous intake |
| Owner | Product and frontend |
| Reviewers | Product, backend, QA, accessibility |

## Authority note

**Intended contract (this version):** A visitor who is not signed in must
provide **phone or email** (at least one), **verify** that contact with OTP
**inline on the same form** (no `/otp` redirect), and Nest must **create a
customer user account immediately on successful verify**—**before** the plan
request is submitted. The form also collects website / no-website and
temporary plan-intake example fields (database size, visitors, WooCommerce).
The plan request is then sent with that account (authenticated customer create).

**Conflict with prior docs / current Nest public create:** v0.3 and
[`../../backend/contracts/plan-requests-public.md`](../../backend/contracts/plan-requests-public.md)
described anonymous `POST /api/v1/public/plan-requests` with **no** user
creation and both phone + email treated as form requirements. That wire path
is **no longer** the intended guest journey. Treat those as superseded intent
until Nest contracts and implementation are synced. Do not invent final DTOs
here.

## Executive flow summary

- **Primary user:** Visitor (not signed in) who chose a plan on the managed WooCommerce server page.
- **Goal:** Verify contact, obtain a customer account, submit a plan request so staff can review and call.
- **Secondary user:** Returning customer whose contact already exists — guided to sign in and submit from the dashboard.
- **Completion state (new contact):** Account created on OTP verify → authenticated plan request submitted → success confirmation; team will contact them.
- **Completion state (existing account):** Sign-in (toast: already have account) → `/dashboard/plans` → authenticated plan request.
- **Highest-risk failure:** Duplicate account creation; mitigated by match-before-verify and Nest uniqueness on contact.
- **Readiness:** Product intent ready; Nest/public contract sync required before treating as implemented.

## User needs

### UN-001 — Guest intake with verified account

**As a** visitor evaluating managed WooCommerce hosting  
**When** I choose a plan on the public site  
**I need to** give a phone **or** email, verify it, and then submit my request  
**So that** Unixsee has a real customer account tied to a proven contact before staff work the request—without implying payment or tenant approval.

### UN-002 — Existing account catch

**As a** returning customer who forgot I am signed out  
**When** I enter a phone or email that already belongs to my account  
**I need to** be told I already have an account and guided to sign in  
**So that** I submit from my dashboard without a duplicate account or duplicate guest intake.

## Proposed journey

```text
Plan CTA (public, signed out)
  → Form (name, phone and/or email, website optional, notes)
  → OTP challenge on the provided contact
  → Nest: verify OTP → create customer user (if new) + session
  → Submit plan request as authenticated customer
  → Success confirmation
```

Entry: plan card CTA on managed WooCommerce server `#plans` section.

Exit (new account): success after authenticated submit — team will review and call.

Exit (existing account): sign-in with account-exists toast → `/dashboard/plans` → dashboard request / checkout → success.

Out of scope: payment, guest request tracking **without** an account, user creation from the **admin** plan-request surface, selling/enablement language that implies the request is already commercially applied.

## Authorization messaging

Plan request submission is allowed before احراز هویت / tenant approval. Account
creation and contact verification are **not** احراز هویت. Surfaces must make
clear that certifications are still required before managed services can be
delivered. Do not block submit solely because certifications are missing.
Canonical rule:
[`../notes/customer-authorization-and-tenant.md`](../notes/customer-authorization-and-tenant.md).

## Contact verify and account creation

**Rule (`Confirmed` product intent):** Successful OTP verification of the
intake contact **creates** the customer user in Nest **immediately**, even if
the visitor has not yet submitted the plan request.

**Contact requirement:** At least one of **phone** or **email** is required.
Both may be collected; only the verified channel must pass OTP before submit.
Exact UX for verifying a second optional channel is **Unknown** (defer to
implement: verify primary only vs require both if both filled).

**When (early match):** After the visitor enters a usable phone, email, or
website value (blur / debounce), call account-check. If a match is found,
redirect to sign-in **before** OTP for a new account.

**When (verify):** Request OTP for the chosen contact; on success Nest creates
or authenticates the user (same trust boundary as public signup / OTP sign-in).
Contact is marked verified for that channel.

**When (submit):** Only after account + session exist, create the plan request
via the **customer** plan-request API (linked to `createdByUserId` /
`linkedUserId`). Anonymous public create without a prior verified account is
**not** the intended path.

**Match rules (unchanged spirit):**
- Normalize phone to E.164 (Iran) using the same rules as OTP login.
- Normalize email: trim + lowercase.
- Normalize website to hostname (strip scheme/`www`).
- Match if phone **or** email belongs to an existing customer, **or** website
  hostname matches an existing managed `Website.domain`.
- On match: `exists: true` / sign-in redirect; **do not** create a second user.

**Client UX:**
- On early match, redirect to sign-in (no intermediate panel).
- Account-exists toast behavior unchanged (`notice=account-exists`,
  `returnTo=/dashboard/plans`, phone prefill via session storage).
- No “continue without account” option.
- **Already logged in:** Redirect immediately to dashboard checkout for the
  selected plan (skip guest verify).

## Form fields

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | Unicode full-name validation |
| Phone | Conditional | First contact field; required until email is verified; Iran national with `+98` |
| Email | Conditional | Required until phone is verified |
| Inline OTP | Yes (one channel) | Same page; no redirect to `/otp` |
| Website | Conditional | Required unless “I don't have a website yet” |
| Database size band | Yes (example) | Placeholder intake; stored in `notes` until final fields ship |
| Monthly visitors band | Yes (example) | Placeholder intake |
| WooCommerce today | Yes (example) | yes / no / not sure |
| Description | No | Free-text appended to `notes` |

## States

| State | Trigger | Result |
|---|---|---|
| `plan_unselected` | Invalid `?plan=` | Error + back to plans |
| `session_detected` | Logged-in user | Redirect to dashboard checkout |
| `form_ready` | Guest + valid plan | Show form |
| `account_exists` | Early match | Redirect to sign-in + toast |
| `otp_pending` | OTP requested | Show OTP step |
| `account_created` | OTP verified (new contact) | User row exists; session established; form may continue to submit |
| `submitted` | Authenticated create succeeds | Success page |

## Acceptance criteria

- **AC-001:** Guest with new phone or email completes OTP → **user account exists in Nest before** plan-request create → authenticated request created → success shown.
- **AC-001b:** At least one of phone or email is required; form cannot reach OTP with both empty.
- **AC-002:** Phone matches existing customer (early check) → no new user → redirect to sign-in with account-exists toast.
- **AC-002b:** Email or managed website domain matches → same account-exists outcome before new-account OTP when possible.
- **AC-002c:** Pasting `0098…`, `+98…`, or `09…` into phone yields a consistent national value with `+98` prefix shown.
- **AC-003:** Email matches existing customer → same as AC-002.
- **AC-004:** After sign-in from this redirect → lands on `/dashboard/plans`.
- **AC-005:** Logged-in user opening guest request URL → redirected to dashboard checkout.
- **AC-006:** “No website” checkbox → `websiteDomain` omitted; request succeeds.
- **AC-007:** No payment-success language on any screen in this flow.
- **AC-008:** Request surfaces state that certifications / احراز هویت are required before managed services can be delivered, without blocking submission.
- **AC-009:** Account creation on OTP does **not** create a tenant and does **not** enable a plan.

## Analytics (documented; wiring optional)

- `plan_request_started`
- `plan_request_validation_failed`
- `plan_request_account_exists_detected`
- `plan_request_sign_in_redirected`
- `plan_request_otp_requested`
- `plan_request_otp_verified_account_created`
- `plan_request_submitted`
- `plan_request_submit_failed`

## Risks and assumptions

- **Assumption:** Phone normalization matches auth storage format (E.164).
- **Risk:** Account enumeration via public check / OTP — accepted for Phase 1; rate limiting required at Nest.
- **Assumption:** OTP verify reuses Nest auth authority (same as signup/sign-in); exact route composition is a backend contract task.
- **Conflict:** Current public create implementation may still allow anonymous intake; product intent above wins for upcoming sync work.
- **Assumption:** Exact certification-upload UI may live on dashboard / profile after submit; this flow only needs clear necessity messaging at request time.

## Related

- Admin enablement: [`admin-plan-requests.md`](./admin-plan-requests.md)
- Authorization / tenant: [`../notes/customer-authorization-and-tenant.md`](../notes/customer-authorization-and-tenant.md)
- Customer authorization UX: [`client-authorization.md`](./client-authorization.md)
- Auth UX: [`client-auth.md`](./client-auth.md)
- Public API (sync needed): [`../../backend/contracts/plan-requests-public.md`](../../backend/contracts/plan-requests-public.md)
- Customer API: [`../../backend/contracts/plan-requests-customer.md`](../../backend/contracts/plan-requests-customer.md)
- Onboarding origins: [`../notes/onboarding-plan-request-user-website.md`](../notes/onboarding-plan-request-user-website.md)
