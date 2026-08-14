# Customer authorization (احراز هویت) and tenant

## Note

Canonical clarification for the gap between **account authentication** and
**organizational authorization**. Supports Phase 1 identity, plan requests,
and admin enablement. Not a UX or visual specification.

## Stance (`Confirmed` for this phase)

1. Customers can **sign up and sign in** as they do today (OTP / contact
   verification). That creates or authenticates a **customer user account**.
2. A separate step, **احراز هویت** (organizational authorization), is required
   before Unixsee treats the customer as a commercial **tenant**.
3. In product language, **authorized ≈ became a tenant** (usable tenant record
   with owner membership). It is not the same as “signed in” or “OTP-verified
   contact.”
4. Customers submit the required **certifications / identity documents**; staff
   review them in the **admin panel** and approve (or reject) authorization.
5. Unixsee **must not sell or commercially apply** managed services until the
   customer is a tenant.
6. Customers **may still submit plan requests** (and related consultant /
   complementary intake) before authorization. Do **not** block submission only
   because certifications are missing.
7. Customer-facing copy must make clear that **certifications are necessary**
   before Unixsee can deliver paid/managed services against that request.
8. Admin workflows that **apply** commercial outcomes (especially plan
   enablement and other service-selling applyments) **must block** when the
   linked customer is not yet a tenant.

## Vocabulary

| Term | Meaning | Must not be confused with |
|---|---|---|
| Sign up / sign in | Create or authenticate a customer user session | Tenant approval |
| Contact verification | OTP / email proof that a contact works | احراز هویت |
| احراز هویت | Staff review of customer certifications leading to tenant approval | Login success |
| Tenant | Approved customer organization that can own websites and receive sold services | A lone user account |
| Plan request | Chosen-plan intake; not payment and not enablement | Selling / enablement |

## Customer path

```text
Sign up / sign in (account)
  → Optional: submit plan or consultant request (allowed without tenant)
  → Submit certifications for احراز هویت
  → Staff review in admin panel
  → Approved → tenant exists (authorized)
  → Staff may enable plans / apply sold services
```

Messaging on request surfaces (plan and consultant/complementary intake) must
state that delivery of managed/paid services waits on successful authorization,
without preventing the request itself.

## Admin path

Staff need to:

- See whether a user is only an account vs already a tenant (authorized).
- Receive and review certification submissions for احراز هویت.
- Approve authorization → create/approve the **tenant** (and owner membership
  as required by existing tenant rules).
- Reject or request better documents with a clear customer-visible next step.
- Block **important applyments** when no tenant exists yet, including at least:
  - plan-request **enablement**;
  - other commercial applyments that sell or activate paid managed service for
    that customer.

Staff-mediated **admin create / approve tenant** in `/users` remains a valid
way to establish a tenant when ops already completed identity checks outside
the customer upload UI. That path still creates a tenant; it does not skip the
rule that selling/enablement requires a tenant.

## What stays allowed without a tenant

- Sign up, sign in, contact verification, profile basics.
- Submitting a **plan request**.
- Submitting **consultant / complementary-service requests** (intake only).
- Support contact / ticket intake unless a separate policy later restricts it
  (`Unknown` for hard ticket gates).

## What must wait for a tenant

- Selling managed plans (staff **enablement** of a plan on a website).
- Treating the customer as commercially authorized for paid delivery.
- Other admin applyments that activate sold services for that customer
  (exact complementary-activation gates follow the same principle unless a
  flow explicitly allows pre-tenant consultation-only work).

## Hard separations

Keep distinct:

- account session ≠ contact verification ≠ احراز هویت ≠ tenant;
- plan/consultant **request** ≠ **enablement / sale**;
- signup alone never enables a plan or activates a website.

## Required fields for tenant authorization (`Confirmed`)

Customers must provide all of the following to complete احراز هویت and become
a tenant:

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

Document file constraints (format, size, quality), national-ID checksum rules,
and whether Shahkar/mobile-national-ID matching is automated vs staff-only
remain `Unknown` until backend/product decide.

## Open items (`Unknown`)

- Exact upload format/size/quality rules for کارت ملی photo.
- Whether mobile↔کد ملی ownership is auto-checked (e.g. Shahkar) or staff-judged.
- Customer surface placement (`/dashboard/authorization` vs profile section).
- Whether complementary **activation** (vs intake) is hard-blocked the same way
  as plan enablement in every family.
- Whether ticket creation is ever hard-blocked for non-tenant users.

## Related

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
