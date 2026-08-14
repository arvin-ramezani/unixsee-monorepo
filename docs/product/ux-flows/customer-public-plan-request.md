# UX Flow Specification

## Document control

| Field | Value |
|---|---|
| Project | Unixsee Client (public website) |
| Flow or service | Guest plan request — managed WooCommerce server |
| Version | 0.3 |
| Status | Draft |
| Date | 2026-08-12 |
| Evidence sources | `docs/product/phase-1-application-features.md` §11.2; backend `POST /api/v1/public/plan-requests`; admin plan-request intake (`public` vs `logged_in`) |
| Owner | Product and frontend |
| Reviewers | Product, backend, QA, accessibility |

## Executive flow summary

- **Primary user:** Visitor (not signed in) who chose a plan on the managed WooCommerce server page.
- **Goal:** Submit contact details so staff can review the request and call the customer.
- **Secondary user:** Returning customer who forgot they have an account — guided to sign in and submit from the dashboard.
- **Completion state (guest):** Success page confirms submission; team will contact them.
- **Completion state (existing account):** Sign-in (toast: already have account) → `/dashboard/plans` → authenticated plan request from dashboard.
- **Highest-risk failure:** Duplicate guest intake for an existing customer; mitigated by server-side account guard.
- **Readiness:** Ready for implementation (v0.1).

## User needs

### UN-001 — Guest intake

**As a** visitor evaluating managed WooCommerce hosting  
**When** I choose a plan on the public site  
**I need to** submit my contact details in one short form  
**So that** your team can review my request and call me without creating an account or seeing payment language.

### UN-002 — Existing account catch

**As a** returning customer who forgot I am signed out  
**When** I submit a plan request with contact details that match my account  
**I need to** be told I already have an account and guided to sign in  
**So that** I can submit the request from my dashboard without creating a duplicate guest intake.

## Proposed journey

Entry: plan card CTA on managed WooCommerce server `#plans` section.

Exit (guest): guest success page — team will review and call.

Exit (existing account): sign-in (phone OTP) with account-exists toast → `/dashboard/plans` → choose plan / checkout → dashboard success.

Out of scope: payment, guest request tracking, user creation from admin plan-request surface, email OTP sign-in, selling/enablement language that implies the request is already commercially applied.

## Authorization messaging

Plan request submission is allowed before احراز هویت / tenant approval. The
guest and dashboard request surfaces must make clear that the customer needs
to send certifications so Unixsee can authorize them as a tenant and deliver
managed services. Do not block submit solely because certifications are
missing. Canonical rule:
[`../notes/customer-authorization-and-tenant.md`](../notes/customer-authorization-and-tenant.md).

## Account detection

**When (early):** After the visitor enters a usable phone, email, or website value
(on blur or after a short debounce), the client calls a public account-check
endpoint. If a match is found, redirect to sign-in **before** submit.

**When (final):** On valid form submit, server-side before creating a public plan
request (safety net).

**Match rules:**
- Normalize phone to E.164 (Iran) using the same rules as OTP login (`+98`,
  `0098`, `09…` all resolve to the same E.164 value).
- Normalize email: trim + lowercase.
- Normalize website to hostname (strip scheme/`www`).
- Match if phone **or** email belongs to an existing customer (`USER` /
  `TENANT`), **or** website hostname matches an existing managed `Website.domain`.
- Return `exists: true` from the check endpoint, or `409 ACCOUNT_EXISTS` on
  create; do not create a public request when matched.

**Client UX:**
- On early match or submit `ACCOUNT_EXISTS`, redirect immediately to sign-in
  (no intermediate panel).
- Show an informational toast on sign-in: already have an account — sign in to
  continue. Toast does not auto-dismiss (`duration: Infinity` + close button);
  `notice=account-exists` stays in the URL so refresh re-opens it. Dismiss the
  toast on successful login before navigating to `/dashboard/plans`.
- Sign-in `returnTo=/dashboard/plans` (dashboard plans list, not checkout).
- Pre-fill phone on sign-in via session storage (not URL).
- No “continue as guest” option.

**Already logged in:** Redirect immediately to dashboard checkout for the selected plan.

## Form fields

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | Unicode full-name validation |
| Phone | Yes | Iran national number with fixed `+98` prefix; paste of `0098`/`+98`/`09` normalized |
| Email | Yes | Standard email; early account check on blur/debounce |
| Website | Conditional | Required unless “I don't have a website yet” checked; early domain check |
| Description | No | Maps to `notes`; max 2000 chars |

## States

| State | Trigger | Result |
|---|---|---|
| `plan_unselected` | Invalid `?plan=` | Error + back to plans |
| `session_detected` | Logged-in user | Redirect to dashboard checkout |
| `form_ready` | Guest + valid plan | Show form |
| `account_exists` | Early match or 409 `ACCOUNT_EXISTS` | Redirect to sign-in + toast |
| `submitted` | 201 | Guest success page |

## Acceptance criteria

- **AC-001:** Guest with no matching account submits valid details → public request created → guest success shown.
- **AC-002:** Phone matches existing customer (early check or submit) → no public request → redirect to sign-in with account-exists toast.
- **AC-002b:** Email or managed website domain matches → same account-exists outcome before submit when possible.
- **AC-002c:** Pasting `0098…`, `+98…`, or `09…` into phone yields a consistent national value with `+98` prefix shown.
- **AC-003:** Email matches existing customer → same as AC-002.
- **AC-004:** After sign-in from this redirect → lands on `/dashboard/plans`.
- **AC-005:** Logged-in user opening guest request URL → redirected to dashboard checkout.
- **AC-006:** “No website” checkbox → `websiteDomain` omitted; request succeeds.
- **AC-007:** No payment-success language on any screen in this flow.
- **AC-008:** Request surfaces state that certifications / احراز هویت are required before managed services can be delivered, without blocking submission.

## Analytics (documented; wiring optional)

- `plan_request_started`
- `plan_request_validation_failed`
- `plan_request_account_exists_detected`
- `plan_request_sign_in_redirected`
- `plan_request_submitted`
- `plan_request_submit_failed`

## Risks and assumptions

- **Assumption:** Phone normalization matches auth storage format (E.164).
- **Risk:** Account enumeration via public endpoint — accepted for Phase 1; rate limiting deferred.
- **Assumption:** Exact certification-upload UI may live on dashboard / profile after submit; this flow only needs clear necessity messaging at request time.

## Related

- Admin enablement: [`admin-plan-requests.md`](./admin-plan-requests.md)
- Authorization / tenant: [`../notes/customer-authorization-and-tenant.md`](../notes/customer-authorization-and-tenant.md)
- Public API: [`../../backend/contracts/plan-requests-public.md`](../../backend/contracts/plan-requests-public.md)
