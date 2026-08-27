# Phase 1 Application Feature Specification

> **Status:** Proposed
>
> **Owner:** Product and architecture groups
>
> **Last verified:** 2026-08-13

## 1. Purpose

This document defines the product behavior Unixsee needs for the current
application phase. It is the shared feature brief for product planning, UX
design, administrator-interface design, API design, and implementation.

The phase turns the existing customer-dashboard experience into an end-to-end
managed-service product and adds the internal workflows required to operate it.
The customer dashboard establishes the main customer concepts and desired
experience. The administrator panel must provide the corresponding staff
capabilities, while NestJS remains responsible for business rules,
authorization, persistence, orchestration, and communication with operational
systems.

This specification describes required behavior and outcomes. It intentionally
does not define final URLs, database tables, DTOs, event names, authentication
providers, or payment-provider contracts. Those details require API
specifications or architecture decisions before implementation.

## 2. Product definition

Unixsee is a premium managed infrastructure and monitoring service for
WordPress and WooCommerce websites. Its primary value is reliable managed
infrastructure, operational visibility, specialist support, and active
technical care.

The product has three application surfaces:

1. The public website introduces Unixsee and collects qualified requests.
2. The customer dashboard gives each customer visibility and access to their
   websites, services, support, and account.
3. The administrator panel gives authorized Unixsee staff the workflows needed
   to serve customers and operate the platform.

Complementary ecommerce services such as SEO, graphic design, product data
entry, and social-media support create additional revenue but remain secondary
to the managed-infrastructure offering. Customers may request these
complementary services for websites hosted outside Unixsee; that eligibility
does not imply Unixsee manages the website's server. The cross-surface product
contract is defined in
[`ux-flows/website-management-coverage.md`](./ux-flows/website-management-coverage.md).

## 3. Phase goals

Phase 1 must enable these complete outcomes across its delivery waves:

- An **`authorized`** customer (commercial flag after KYC approve **or** staff
  toggle; Tenant shell may already exist) can access only that tenant's account
  and resources.
- Sign up / sign in create or authenticate a **user** with default
  **`role = TENANT`**, a **Tenant shell**, and OWNER membership, with
  **`authorized = false`** until staff set the flag (direct toggle **or** KYC
  case approve). See
  [`notes/customer-authorization-and-tenant.md`](./notes/customer-authorization-and-tenant.md)
  and Proposed ADR
  [`0016`](../architecture/decisions/0016-customer-tenant-role-authorized-flag.md).
- Staff can receive a plan request before the customer is `authorized`, and may
  **enable** (sell/apply) while unauthorized only after AlertDialog confirm +
  Nest `confirmUnauthorized` (**1A**).
- Staff can enroll agents from servers administration; agents discover websites
  and keep admin inventory (and assigned owner dashboards) up to date.
- Customers created by admin remain contact-unverified until they sign in with
  the recorded phone or email and pass OTP; public signup creates customer
  accounts that follow the same contact-verification rules where applicable.
  Contact verification is not احراز هویت.
- Customers and staff can complete a support-ticket workflow with messages and
  attachments.
- Customers can request a complementary service for a Unixsee-managed or
  externally hosted website; staff can scope, quote, activate, deliver, track,
  renew, complete, or cancel it.
- Later in Phase 1, customers can see website identity, service state,
  monitoring status, alerts, usage, and relevant operational history.
- Later in Phase 1, authorized users can request safe website operations and
  see their progress and result.
- Staff can send **Unixsee messages** (پیام‌های یونیکسی) to a tenant’s
  dashboard (popup + inbox); see
  [`unixsee-messages-prd.md`](./unixsee-messages-prd.md).
- Later in Phase 1, staff can publish Unixsee News notifications and
  website-specific اعلان‌ها popups; customer-visible activities (including
  resolved operational incidents) and staff-only audit records provide history.
- Customers can manage their profile, verification, password, sessions, and
  optional two-factor authentication.
- Persian RTL and English LTR experiences support the same workflows.

## 4. Phase boundaries

Phase 1 is delivered in waves. Everything in §4.1 and §4.2 remains in Phase 1.
§4.3 lists work that stays out of Phase 1. Delivery sequencing detail lives in
[`notes/phase-1-delivery-waves.md`](./notes/phase-1-delivery-waves.md).

### 4.1 First-wave Phase 1 (first implementation)

- Authentication and OTP-based sign-in for customers.
- Customer and tenant administration in the admin panel.
- User origins: public signup from the web app, **public plan-request OTP
  verify** (account created on successful contact verify before the request is
  stored), or admin create. Admin-created
  accounts start **contact-unverified** until the customer signs in with the
  admin-entered phone or email and passes OTP, after which the contact is
  marked verified. Public signup creates a **Tenant shell** with
  `role=TENANT` and `authorized=false` (Proposed ADR 0016); it does **not**
  grant commercial authorization.
- احراز هویت: customers **may** submit certifications; staff may approve cases
  **or** toggle **`authorized`** on the user without opening files. Commercial
  applyments use confirm override when unauthorized. Details:
  [`notes/customer-authorization-and-tenant.md`](./notes/customer-authorization-and-tenant.md).
- Plan catalog visibility, plan requests (allowed while unauthorized), and staff
  plan enablement (confirm if unauthorized).
- Website administration in the admin panel.
- Server administration in the admin panel, including agent enrollment and
  registration. Running agents discover websites and update website inventory
  for staff and, after assignment, for the owning customer dashboard.
- Tickets, conversations, attachments, assignment, and status management.
- Complementary-service requests, commercial review, assignments, usage,
  progress, and history.
- Staff-managed commercial records needed by active plans and complementary
  services.
- **Unixsee messages (پیام‌های یونیکسی):** tenant-targeted one-way staff
  messages with popup, inbox list, and unread indicator. Canonical PRD:
  [`unixsee-messages-prd.md`](./unixsee-messages-prd.md). This is **not**
  Notifications (News) and **not** website notices (اعلان‌ها).

### 4.2 Later Phase 1 (still in scope, implement after first wave)

- Customer-visible **activities**, including operational incident outcomes that
  server teams resolve (for example high traffic detected and resolved). This
  needs a richer incident/event payload from server operations before full
  delivery.
- **اعلان‌ها (website notices):** admin-authored popups targeted at a specific
  website (for example a broken plugin causing slowdown with a required
  customer action). This is **not** the customer Notifications/News feature.
- **Notifications (News):** Unixsee news and platform announcements in the
  customer dashboard.
- Administrator **Settings**.
- Broader website monitoring summaries, live status, alerts, and safe
  operational actions beyond the inventory/assignment path already required in
  the first wave.
- Customer dashboard aggregation that depends on later activity and notice
  feeds.
- Application search and staff-only audit history surfaces that are not yet
  required for the first-wave queues.

### 4.3 Deferred beyond Phase 1

- Self-service payment checkout, payment methods, refunds, automated dunning,
  and complete invoice accounting.
- Customer-managed domain registration, transfer, DNS editing, and registrar
  integrations.
- Advanced incident automation, complex escalation policies, and predictive
  alerting.
- Per-website customer permission overrides beyond tenant membership.
- A general-purpose content-management system.
- Microservice decomposition and infrastructure implementation inside the
  frontend.
- Customer dashboard AI assistant (Nest-owned tools + PostgreSQL pgvector RAG;
  later confirmed actions). Requirements:
  [`customer-assistant-prd.md`](./customer-assistant-prd.md).

Later Phase 1 and deferred features may appear as unavailable or coming-soon
destinations, but they must not imply that a transaction or operation is
currently supported.

## 5. Actors and access model

### 5.1 Customer actors

- **Tenant owner:** Controls the customer account, membership, security-sensitive
  account actions, and commercial requests.
- **Tenant administrator:** Manages the tenant's websites, tickets, services,
  and ordinary account operations.
- **Tenant viewer:** Has read-only access to permitted tenant information and
  cannot perform mutations.

Each website belongs to one tenant. A user receives access through tenant
membership, not through an unverified website identifier. A later phase may add
per-website restrictions without changing this ownership model.

### 5.2 Staff capabilities

Administrator access must be capability-based. Role names may be configured
later, but Phase 1 needs permissions covering:

- Customer and tenant administration.
- Plan-request review and enablement.
- Provisioning and website administration.
- Monitoring and operational actions.
- Ticket support and assignment.
- Complementary-service commercial review and delivery.
- News notification publication and website-notice (اعلان‌ها) publication
  (later Phase 1).
- Security-sensitive account assistance.
- Audit review and read-only oversight.
- Administrator settings (later Phase 1).
- Staff hierarchy and operator specialties (Phase 1 **last step**) — proposed
  model in
  [`notes/admin-staff-roles-and-capabilities.md`](./notes/admin-staff-roles-and-capabilities.md).

The UI may hide or disable unavailable actions for clarity, but NestJS must
authorize every protected read and mutation. Sensitive actions must never rely
only on frontend route guards.

## 6. Shared product rules

### 6.1 Tenant isolation

- Every customer record returned by the application must be tenant-scoped.
- Identifiers supplied by a browser must be treated as untrusted.
- Lists, detail pages, search results, downloads, attachments, realtime rooms,
  and mutations must apply the same authorization rules.
- Staff access must be limited by explicit administrator capabilities.

### 6.2 State and feedback

Every data-driven screen must design for:

- Loading or progressive-loading state.
- First-use empty state.
- Filtered empty state.
- Permission-denied state.
- Temporarily unavailable state.
- Validation and conflict errors.
- Pending mutation state.
- Successful completion.
- Partial failure when one data source is unavailable.
- Stale live data with the measurement time visible.

Actions must prevent accidental duplicate submission and explain whether the
result is immediate, queued, awaiting staff review, or failed.

### 6.3 Dates, money, and locale

- Store and exchange timestamps with timezone information.
- Display dates, times, numbers, and money in the active locale.
- Preserve the original currency and amount; localization must not alter
  commercial meaning.
- Use explicit measurement times for monitoring values.
- User-facing text and errors must be available in Persian and English.
- Layout, direction, focus order, tables, charts, icons, and motion must work
  independently in RTL and LTR.

### 6.4 History and auditability

Important mutations must record the actor, target, time, result, and relevant
before/after context. Customer-visible activities and internal audit records
serve different audiences:

- **Activity:** A concise event the customer is allowed to see.
- **Audit record:** A detailed, immutable staff and security record.

Correcting history should create a correction or superseding record rather
than silently rewriting a material event.

### 6.5 Realtime behavior

REST supplies initial, structural, and historical data. Realtime delivery is
reserved for volatile values and useful transitions, including:

- Website availability and last-check time.
- Current traffic and its measurement time.
- Asynchronous action progress and result.
- Newly visible activities or notifications when immediate delivery has value.

Realtime disconnection must not make the page unusable. The UI must indicate
stale values and recover through refetch or reconnection.

## 7. Feature map

| Capability                 | Customer experience                       | Administrator experience                                                              | Phase priority                                                   |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Access and security        | Sign in, OTP verification, sessions       | Account support and access control                                                    | First-wave                                                       |
| Customers and tenants      | Profile, membership, احراز هویت status    | Create/find users; review certifications; approve tenants; contact-verification state | First-wave                                                       |
| Plans and onboarding       | Browse and submit a plan request          | Review and enable chosen plan on a website                                            | First-wave                                                       |
| Websites                   | Owner list/detail after assignment        | Create, assign, configure; inventory from discovery                                   | First-wave                                                       |
| Servers and agents         | Indirect via owned websites               | Enroll agents, review discovery, assign ownership                                     | First-wave                                                       |
| Tickets                    | Create, converse, and track               | Queue, assign, reply, and resolve                                                     | First-wave                                                       |
| Complementary services     | Request and track delivery                | Scope, quote, activate, deliver, and renew                                            | First-wave                                                       |
| Dashboard overview         | Tenant summary                            | Cross-customer operational summary                                                    | Later Phase 1 / expands with feeds                               |
| Monitoring and alerts      | Health, traffic, checks, warnings         | Fleet monitoring and alert handling                                                   | Later Phase 1 (beyond inventory)                                 |
| Operational actions        | Request allowed actions                   | Dispatch, observe, retry, and audit                                                   | Later Phase 1                                                    |
| Activities                 | Customer-visible timeline of ops outcomes | Inspect/create permitted events; log resolved incidents                               | Later Phase 1                                                    |
| Unixsee messages           | Tenant-targeted one-way inbox + popup     | Compose, publish, edit, withdraw for one tenant                                       | Phase 1 — [`unixsee-messages-prd.md`](./unixsee-messages-prd.md) |
| Website notices (اعلان‌ها) | Website-targeted popup/notice             | Compose and target a specific website                                                 | Later Phase 1                                                    |
| Notifications (News)       | Unixsee news / platform announcements     | Compose, target, schedule, and publish news                                           | Later Phase 1                                                    |
| Admin settings             | —                                         | Staff configuration and panel settings                                                | Later Phase 1                                                    |
| Search                     | Find tenant resources and destinations    | Find operational and business records                                                 | Later Phase 1 / supporting                                       |
| Profile                    | Manage identity and preferences           | Assist with account state                                                             | First-wave (verification); expands later                         |
| Billing projection         | See renewal and commercial state          | Maintain agreed commercial records                                                    | Limited / first-wave where needed for plans                      |
| Domains                    | Coming-soon state only                    | No Phase 1 workflow                                                                   | Deferred                                                         |

## 8. Access, identity, and sessions

### 8.1 Customer behavior

Customers need to:

- Sign in using the approved identifier and credential method.
- Complete OTP validation for sign-in and verification challenges.
- Complete a second-factor challenge when it is enabled.
- See and revoke active sessions or devices.
- Sign out from the current session or all sessions.
- Request and complete email or mobile verification.
- Change their password after appropriate reauthentication.
- Enable or disable two-factor authentication and manage recovery codes.
- Receive understandable, non-enumerating errors for invalid credentials,
  locked accounts, expired challenges, and rate limits.

### 8.1.1 Account origins and contact verification

Customer accounts enter the system through:

1. **Public signup** on the web app, when that channel is enabled.
2. **Public plan-request intake OTP** — when a signed-out visitor verifies
   phone or email on the plan-request form, Nest creates the customer user
   **immediately on successful OTP**, before the plan request is submitted
   (see §11.2 and
   [`ux-flows/customer-public-plan-request.md`](./ux-flows/customer-public-plan-request.md)).
3. **Admin create** in the administrator panel (or during discovery-assignment
   create-and-return), using the contact details staff enter.

Admin-created accounts are **not contact-verified** at create time. Saving a
phone or email in the admin form does not verify that contact. The customer
becomes contact-verified after they sign in with the same admin-entered phone
or email and successfully pass OTP validation. Phase 1 does not require a
separate invite token for this contact-verification path.

Public signup, plan-request OTP verify, and successful sign-in create an
authenticatable **user** with customer **`role = TENANT`** (Proposed ADR
[`0016`](../architecture/decisions/0016-customer-tenant-role-authorized-flag.md)),
a **Tenant shell**, and **OWNER membership**. They do **not** set
**`authorized = true`**. Commercial authorization is a separate flag.

### 8.1.2 Organizational authorization (احراز هویت)

Unixsee separates:

| Step                               | Outcome                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Sign up / sign in                  | Customer **user** (`role=TENANT`), Tenant shell, OWNER membership       |
| Contact verification (OTP / email) | Proven contact on that user                                             |
| احراز هویت                         | Case approve **or** direct staff toggle sets **`User.authorized = true`** |

Customers **may** submit certifications for احراز هویت. Staff may review those
materials in the admin panel and approve or reject, **or** set `authorized`
directly without opening files (**2A**). **Authorized**, in this product sense,
means **`authorized === true`**—not merely “has a tenant membership” and not
“OTP-verified contact.”

Rules for this phase:

- Staff commercial applyments **warn** when the customer is not `authorized`,
  then proceed after AlertDialog confirm + Nest `confirmUnauthorized` (**1A**).
- Customers **may still send plan requests** (and consultant / complementary
  intake) before authorization. Do not block those submissions only because
  certifications are missing.
- Case reject / needs-info must **not** clear an existing `authorized === true`.
- Admin must **not hard-block** plan enablement solely because
  `authorized === false`; use confirm override instead.
- **Later:** each tenant may add its own users (`Role.USER` + membership);
  invite UX is out of Phase 1 detail.

Canonical detail:
[`notes/customer-authorization-and-tenant.md`](./notes/customer-authorization-and-tenant.md)
(ADR 0016 Proposed).
UX flows: [`ux-flows/client-authorization.md`](./ux-flows/client-authorization.md),
[`ux-flows/admin-authorization.md`](./ux-flows/admin-authorization.md).

Required customer fields (کد ملی، تاریخ تولد، موبایل متعلق به کد ملی + OTP unless
already-verified signup mobile، ایمیل + confirm unless already-verified signup
email، استان، شهر، آدرس کامل، کد پستی، عکس کارت ملی) are listed in that note.

### 8.2 Administrator behavior

Authorized staff need to:

- Find an account by safe customer identifiers.
- See whether an account is active, suspended, locked, contact-verified, has a
  tenant shell, is **`authorized`**, or is protected by two-factor authentication.
- Create a customer with contact details that remain contact-unverified until
  OTP succeeds; optionally set `authorized` at create.
- Toggle `authorized` on user detail without requiring KYC files.
- Review احراز هویت certification submissions and approve or reject (optional
  path; reject does not clear a prior `authorized=true`).
- Suspend or restore access with a required reason.
- Revoke sessions after a security event.
- Start a controlled contact-verification or two-factor recovery process.
- Review security-relevant account history.

Staff must not see passwords, one-time codes, recovery-code plaintext, refresh
tokens, or secret material. Any impersonation capability is deferred until a
separate audited security design is approved.

### 8.3 Acceptance criteria

- A user cannot access protected dashboard data without an authorized session.
- Session revocation prevents further refresh and protected requests.
- Expired and reused verification challenges are rejected.
- Admin create leaves the account contact-unverified until OTP succeeds for
  the recorded phone or email.
- Public signup alone does not set `authorized = true` (customer may have a
  Tenant shell and OWNER membership while still unauthorized).
- Staff commercial applyments for an unauthorized customer require confirm
  override + Nest acknowledgment (**1A**); they are not silently allowed.
- Password change revokes the sessions required by the approved security
  policy.
- Customer and staff security events create audit records.
- Authentication and authorization failures do not disclose whether unrelated
  customer resources exist.

## 9. Customer and tenant administration

### 9.1 Customer account

A customer account contains identity and contact information, locale
preference, verification state, account state, and tenant memberships. The
customer profile must distinguish editable information from verified or
security-sensitive fields.

### 9.2 Tenant

A tenant is the **organization container** for a Unixsee customer account
(websites, memberships, services). Under Proposed ADR 0016, a **Tenant shell**
is created at customer signup together with OWNER membership, while
**commercial readiness** is the separate **`User.authorized`** flag set by
احراز هویت case approve **or** direct staff toggle.

- Display and legal names where required.
- Primary contacts.
- Memberships and tenant roles (`OWNER` / `ADMIN` / `VIEWER`); later, tenants
  may add invited users (`Role.USER`).
- Owned websites and active services.
- Commercial applyments prefer the signup OWNER (or agreed principal) to be
  **`authorized`**; otherwise staff use confirm override (**1A**).
- Notes that are explicitly internal or customer-visible.

### 9.3 Administrator workflows

Staff need to:

- Review customer certification submissions for احراز هویت (optional path).
- Set **`authorized = true`** via user toggle (**2A**) and/or case approve
  (ensure Tenant + OWNER); may set `authorized` at create without KYC files.
- Add, invite, change, or remove members (later: invited `Role.USER` users).
- Assign the tenant owner with safeguards against leaving the tenant ownerless.
- Review the tenant's websites, plan requests, tickets, complementary services,
  News notifications, website notices, and activities from one context.
- Record internal notes without exposing them to customers.
- Suspend a tenant while preserving records and audit history.
- Merge or transfer ownership only through a separately confirmed,
  high-risk workflow.

### 9.4 Acceptance criteria

- A website cannot belong to multiple tenants simultaneously.
- Removing a member immediately changes their effective access.
- The final owner cannot be removed without assigning another owner or closing
  the tenant through an approved process.
- Internal notes never appear in customer responses or search.
- Tenant state changes create an audit record and explain their customer impact.
- Plan enablement and other commercial applyments use confirm override when the
  linked principal is unauthorized; they still require a usable tenant shell.

## 10. Dashboard overview

### 10.1 Customer overview

The dashboard home provides a concise operational answer to: "Are my websites
healthy, and does anything need my attention?"

It should contain:

- Website summaries with identity, plan, availability, and important warning
  state.
- Counts of active websites, unresolved alerts, open tickets, and active
  complementary services where useful.
- Recent customer-visible activities.
- Recent or important notifications.
- Clear access to add a website, request support, and view all relevant items.
- A support contact path for urgent or unclear needs.

The overview should prioritize actionable information over decorative metrics.
One unavailable secondary feed must not hide the customer's operational website
state.

### 10.2 Administrator overview

The administrator home provides a prioritized operations queue rather than a
copy of the customer dashboard. Phase 1 overview surfaces these domain queues
in this order:

1. Unassigned and SLA-risk tickets.
2. Plan requests awaiting staff review or enablement.
3. Complementary-service requests submitted by customers and awaiting admin
   review.

Website monitoring, server/agent health, alerts, operational actions,
onboarding waits, and high-risk administrative changes remain owned by their
domain routes and are out of the overview home surface for this phase.
Capability-appropriate filters or saved views may narrow the visible queues.

### 10.3 Acceptance criteria

- Customer totals are tenant-scoped.
- Staff totals respect administrator permissions.
- Each actionable card links to a filtered list or relevant record.
- Stale monitoring values are visually different from healthy current values.
- Partial-data failures identify the unavailable section and allow retry.

## 11. Plans, requests, and onboarding

### 11.1 Plan catalog

Plans describe managed-infrastructure offerings. A plan record needs:

- Stable identifier and customer-facing name.
- Short positioning and suitable workload.
- Included capacity and managed-service scope.
- Optional add-ons.
- Availability and publication state.
- Pricing presentation, such as fixed starting price, price range, or
  consultation required.
- Locale-aware customer copy.

The definitive plan names and commercial terms must be approved before API and
UI implementation. Placeholder dashboard plans must not become production
products accidentally.

### 11.2 Customer plan request

Selecting a plan on the public web app creates a plan request. It is not a
payment confirmation and is not a sale. Validation outside the admin
application may occur before staff enablement; that validation is not an
admin-panel workflow in this phase.

**Unsigned visitors (intended contract):** The guest must provide **phone or
email** (at least one), complete **OTP verification** for that contact, and Nest
must **create a customer user account immediately on successful verify**—before
the plan request is submitted. The request is then created for that
authenticated user. Contact verification creates a **user**; under ADR 0016
signup/OTP also creates a **Tenant shell** + OWNER with `authorized=false`. It
does **not** set `authorized = true`.
UX: [`ux-flows/customer-public-plan-request.md`](./ux-flows/customer-public-plan-request.md).

Customers **may submit** a plan request before احراز هویت / `authorized`.
Do not block submission only because certifications are missing. The same
non-blocking stance applies to consultant-oriented intake; commercial
**applyment** uses confirm override when unauthorized.

The customer supplies at least:

- Selected plan from the published list.
- A verified phone **or** email (OTP), which establishes or matches the user
  account before submit.
- Any website or domain hints the intake contract requires.
- Contact name and optional notes as the intake UX requires.

Broader assessment questionnaires, communication threads, and quotation steps
are out of the Phase 1 admin plan-request surface described here.

### 11.3 Request lifecycle

Recommended admin states for this phase:

`pending -> ready_to_enable -> enabled`

Terminal alternatives:

`declined` or `cancelled`

`ready_to_enable` means an existing **tenant** is linked and a target website
is selected with no unresolved one-plan conflict. Prefer
**`authorized === true`** on the customer principal; when `authorized === false`,
enablement remains available after confirm override (**1A**). Every
consequential transition records the actor, time, reason when required, and
override acknowledgment when used.

### 11.4 Administrator plan enablement

Authorized staff need to:

- View incoming plan requests and the plan the customer chose.
- Link an **existing** customer; enablement additionally requires a usable
  **tenant** (no create from this surface).
- Select the target website.
- Enforce one active plan per website.
- Enable the requested plan on that website, or decline/cancel with a reason.
- When `authorized === false`, require AlertDialog confirm + Nest
  `confirmUnauthorized` before enablement (**1A**). Missing tenant shell still
  blocks; unauthorized alone does not hard-block.

User/tenant creation, احراز هویت review, server/agent enrollment, and discovery
assignment remain in their own admin flows. Plan enablement consumes those
records; it does not replace them.

### 11.5 Acceptance criteria

- Submitting a request never displays payment-success language.
- Submitting a request is allowed before the customer is a tenant; copy must
  state that certifications are required before managed services can be
  delivered.
- Unsigned public intake verifies phone or email with OTP and creates the
  customer **user** on successful verify **before** the plan request row is
  created; this creates Tenant shell + OWNER with `authorized=false` but does
  not set `authorized=true` or enable a plan.
- Staff cannot enable a plan request without a linked existing **tenant**.
- Staff cannot leave two active plans on the same website.
- Enabling a request makes that request’s chosen plan the website’s active plan.
- Retried enablement does not create unintended duplicate active-plan
  assignments.
- Decline and cancellation require a reason.

## 12. Websites and service assignments

### 12.1 Customer website list

Customers can view their tenant websites in table and card layouts. Mixed
inventories must explicitly distinguish websites whose server Unixsee manages
from websites on external infrastructure. Each item should expose:

- Website name and domain.
- Management coverage: Unixsee-managed, external infrastructure, or a
  migration-only needs-review state.
- Availability and last-check time.
- Active plan or managed-service label.
- Important alert summary.
- Backup or security summary when reliable.
- A route to the detailed view.

Filters should support website state and other meaningful dimensions without
making the default view difficult to understand.

### 12.2 Customer website details

The detailed view may include:

- Identity, domain, and customer-facing service status.
- Management coverage and a concise explanation of Unixsee's responsibility.
- Availability, last check, current traffic, and measurement timestamps.
- Active alerts.
- Storage usage and agreed quota.
- Backup status and latest successful backup.
- Security scan state.
- Managed software versions and update state.
- Server location and safe management links.
- Renewal projection and service dates.
- Allowed operational actions.

Unknown, unsupported, stale, and not-yet-measured values must be distinct from
healthy or zero values.

For an external website, managed-infrastructure fields are not applicable; they
must not be represented as unhealthy, disconnected, or zero merely because the
server is outside Unixsee.

### 12.3 Administrator website management

Staff need to:

- Create a website during onboarding, or receive it from agent discovery.
- Assign it to exactly one tenant.
- Record explicit management coverage independently from plan, server, agent,
  monitoring, and complementary-service state.
- Assign a plan, server, and operational agent or integration.
- Maintain safe metadata and approved management links.
- Change lifecycle state: provisioning, active, suspended, maintenance,
  cancelled, or retired.
- Review current monitoring, alerts, action history, tickets, and services.
- Transfer a website only through a confirmed and audited process.
- Retire records without erasing operational history.

Discovered websites update the admin websites inventory. After ownership
assignment, the owning customer can see the website on their dashboard.
Authenticated complementary-service intake may collect an external domain, but
customer submission creates only the request. Staff acceptance creates or
reuses a planless external Website only when an authorized tenant exists.
Without a tenant, the accepted request remains domain-only until authorization
reconciliation. Public intake does not create a tenant-owned Website.

### 12.4 Server and agent associations

The administrator UI exposes only application-level management:

- Server identity, location, capacity summary, and lifecycle state.
- Agent enrollment and registration from the servers surface.
- Agent identity, last communication, version, and health.
- Website discovery reported by a running agent on a managed server.
- Website-to-server and website-to-agent assignments.
- Configuration validation and communication status.

Agents do not grant plan entitlement, management coverage, or customer
visibility by themselves. Staff assignment remains the gate from discovery to
owned customer website. External websites do not require an agent/server
association and must show infrastructure telemetry as not applicable.

Secret values and direct database or infrastructure consoles are outside the
browser application.

### 12.5 Acceptance criteria

- A customer cannot retrieve another tenant's website by changing an ID.
- Live values include their measurement times.
- Links to external consoles use approved destinations and safe new-window
  behavior.
- Assignment changes are authorized, validated, and audited.
- Retired websites no longer appear as active but retain historical records.
- Plan linkage, plan activation, agent health, and complementary-service
  activation do not silently change management coverage.
- Coverage handover and offboarding are explicit, effective-dated, and audited.

## 13. Monitoring, alerts, and incidents

### 13.1 Monitoring model

Phase 1 monitoring should support:

- Availability and response checks.
- Last successful and last attempted check.
- Current traffic where available.
- Storage usage and thresholds.
- Backup recency.
- Security and managed-software checks.
- Agent communication freshness.

Every signal needs a source timestamp and a staleness policy.

### 13.2 Alerts

An alert contains:

- Severity.
- Type and concise title.
- Affected website or service.
- First detected and most recent occurrence.
- Current state.
- Customer visibility.
- Supporting details safe for the intended audience.
- Acknowledgement and resolution information.

Recommended states are `open`, `acknowledged`, `resolved`, and `suppressed`.
Suppression requires an expiry or review time and an audit reason.

### 13.3 Customer behavior

Customers see alerts that are useful and safe for them, with clear next steps.
They should not receive internal infrastructure identifiers, secrets, raw agent
payloads, or speculative diagnoses.

### 13.4 Administrator behavior

Staff need to:

- Filter fleet health by severity, state, tenant, website, server, and signal
  freshness.
- Inspect signal history and the latest safe diagnostic context.
- Acknowledge, assign, resolve, or temporarily suppress an alert.
- Link an alert to a ticket or operational action.
- Distinguish an actual healthy state from missing or stale telemetry.

### 13.5 Acceptance criteria

- Stale telemetry cannot be displayed as current health.
- Repeated equivalent signals update or group the alert according to backend
  rules rather than flooding the UI.
- Customer visibility changes are explicit and audited.
- Realtime updates are authorized for the affected tenant or staff capability.
- Resolving an alert preserves its history.

## 14. Operational actions

Phase 1 includes safe, explicitly approved actions such as clearing cache or
retrying a status check. Additional actions require their own authorization,
failure, and recovery design.

### 14.1 Action lifecycle

Recommended states:

`requested -> authorized -> queued -> running -> succeeded`

Failure alternatives:

`rejected`, `failed`, `timed_out`, or `cancelled`

Each action has an idempotency key, actor, target, request time, progress or
latest state, completion time, and safe result summary.

### 14.2 Customer behavior

- Only permitted actions appear.
- Destructive or disruptive effects are explained before confirmation.
- Pending actions cannot be accidentally submitted again.
- The customer can see whether the operation is queued, running, successful, or
  unsuccessful.
- Failure feedback gives a safe retry or support path.

### 14.3 Administrator behavior

Staff can inspect action history, retry only when safe, and see the operational
reason for rejection or failure. High-risk actions require stronger capability
checks and confirmation.

### 14.4 Acceptance criteria

- Double-clicking or retrying a request does not execute the same action twice.
- The backend checks tenant ownership and action capability before dispatch.
- Timeouts do not falsely report success.
- Every attempted action creates an audit record.
- The browser never receives agent credentials or direct agent addresses.

## 15. Support tickets

### 15.1 Ticket model

A ticket contains:

- Tenant and requesting user.
- Optional website and related service.
- Service category.
- Subject and initial description.
- Priority as determined by approved rules.
- Status, assignee, timestamps, and SLA projection where applicable.
- Customer-visible conversation.
- Attachments.
- Internal notes that are never customer-visible.
- Links to related alerts, actions, plan requests, or service assignments.

Initial service categories should cover managed servers, migration and
optimization, WooCommerce support, SEO, graphic design, product data entry, and
social-media support.

### 15.2 Customer workflow

Customers can:

- Create a ticket and optionally associate a website or service.
- Add approved attachments.
- View status and conversation history.
- Reply when the state permits.
- Close a resolved ticket; reopen a **closed** ticket under approved rules.
- If the customer does not close after resolution, the ticket auto-closes
  after a grace period (default 7 days; see
  [`notes/ticket-lifecycle-and-auto-close.md`](./notes/ticket-lifecycle-and-auto-close.md)).

Recommended customer-facing states:

`submitted`, `in_progress`, `waiting_for_customer`, `resolved`, and `closed`

Customer API enum and create/reply/close/reopen shapes:
[`../backend/contracts/tickets-customer.md`](../backend/contracts/tickets-customer.md).
Shared ticket service categories:
[`../backend/contracts/ticket-service-categories.md`](../backend/contracts/ticket-service-categories.md).

### 15.3 Administrator workflow

Staff can:

- Work from queues filtered by assignment, category, status, tenant, and SLA
  risk.
- Assign or transfer a ticket.
- Send a customer-visible reply.
- Add an internal note.
- Change status according to valid transitions.
- Link relevant operational records.
- Resolve with a resolution summary; reopen a resolved ticket to continue work
  before the customer closes or auto-close runs.
- Compose replies/notes only while the ticket is not `RESOLVED`/`CLOSED`
  (reopen first after resolve).

### 15.4 Attachments

- Validate file type, size, count, and ownership at the trusted boundary.
- Scan untrusted files before normal access.
- Use authorized, expiring download access.
- Preserve filename metadata safely without trusting it as a storage path.
- Removing access to a ticket also removes access to its attachments.

### 15.5 Acceptance criteria

- Customer users cannot read internal notes.
- Ticket and attachment access is tenant-scoped.
- Invalid state transitions are rejected consistently.
- Message submission is idempotent.
- Failed uploads do not silently create incomplete messages.
- Assignment, status, and visibility changes are audited.

## 16. Complementary services

### 16.1 Product role

Complementary services help customers improve and operate their ecommerce
presence beyond managed infrastructure. They are available for both
Unixsee-managed websites and websites on external infrastructure and should be
sold as specialist engagements with a defined scope, commercial model, owner,
and measurable delivery state. Unixsee-managed servers remain the primary
offer; complementary-service work on an external website does not include or
activate server management.

Phase 1 supports four service families:

1. SEO.
2. Graphic design.
3. Product data entry.
4. Social-media support.

The catalog must be extensible without requiring UI logic for each new service
name. Service-specific intake questions and tracking models may vary.

### 16.2 Engagement and revenue models

Unixsee can offer these commercial models:

- **Fixed-scope project:** One agreed price for a defined deliverable and
  timeline, such as an SEO audit or logo package.
- **Recurring retainer:** A monthly or agreed-period service with a recurring
  scope, such as social support or ongoing SEO.
- **Quota package:** A price for a measurable allowance, such as products
  entered, posts prepared, or design requests completed.
- **Milestone project:** A project priced as a whole or by approved milestones,
  with discovery, production, review, and delivery stages.
- **Custom quotation:** A specialist reviews an unclear or unusual request and
  proposes scope, timing, and price.
- **Additional work:** Work outside an active assignment's included scope is
  quoted separately or creates a new assignment.

Phase 1 records agreed pricing and renewal terms but does not require
self-service payment. The customer must be able to distinguish a request, a
quotation awaiting acceptance, and an active paid or contractually approved
service.

### 16.3 Service-family examples

#### SEO

Possible offers:

- Technical SEO audit as a fixed-scope project.
- Search and content assessment as a fixed project.
- Technical remediation as a milestone project.
- Ongoing SEO as a recurring retainer.

Useful intake fields include current concern, target pages or products,
technical/content preference, goals, deadline, and analytics access
requirements. Delivery may use project stages, milestones, or an agreed monthly
scope rather than a generic percentage with no explanation.

#### Graphic design

Possible offers:

- Logo or visual-identity package as a fixed project.
- Campaign or banner package as a fixed project.
- Monthly design allowance as a recurring quota.
- Social-post asset package as a quota or recurring retainer.

Useful intake fields include asset type, dimensions or channels, brand
materials, references, copy readiness, quantity, deadline, and required source
files.

#### Product data entry

Possible offers:

- Catalog import or cleanup priced per agreed batch.
- Product entry package priced by product count.
- Recurring catalog maintenance with a period quota.

Useful intake fields include approximate product count, source format, required
attributes, variations, images, categories, languages, and data-quality
concerns. Usage should report completed and agreed product counts, exceptions,
and review state.

#### Social-media support

Possible offers:

- Monthly planning and post-asset retainer.
- Campaign package as a one-time project.
- Post-production quota per month.

Useful intake fields include channels, monthly post count, campaign goals,
brand assets, approval workflow, publishing responsibility, and reporting
expectations.

### 16.4 Customer request

The request form needs:

- Service family.
- Related website.
- Preferred engagement: one-time, recurring, or not sure.
- Service-specific scope answers.
- Request title.
- Description including goal, current state, deadline, and constraints.
- Approved attachments.

A customer may select an existing managed or external Website. When no suitable
Website exists, the same field may collect a normalized external domain.
Submission stores that domain only on the request. Explicit staff acceptance
then rechecks the domain and either reuses/creates one planless external Website
for an authorized tenant or marks the accepted request
`DEFERRED_NO_TENANT`. Assignment and activation remain separate. A Unixsee
server plan, VPS, or agent is not a request prerequisite, and no complementary
transition activates one.

The UI should warn when the same website already has a pending request or
active assignment of the same type. The backend decides whether a second
request is allowed; the warning alone is not enforcement.

### 16.5 Request and quotation lifecycle

Recommended request states:

`submitted -> under_review -> needs_customer_information -> scoped ->
quoted -> accepted -> activated`

Terminal alternatives:

`withdrawn`, `declined`, `quote_rejected`, `expired`, or `cancelled`

Staff need to:

- Assign an owner or specialist.
- Review customer context and attachments.
- Ask structured follow-up questions.
- Define included and excluded scope.
- Select the commercial model.
- Record amount, currency, billing period, quota, dates, milestones, and terms
  as applicable.
- Send a customer-visible quotation summary.
- Record acceptance through an approved and auditable method.
- Create the active service assignment.

### 16.6 Active assignment

An assignment contains:

- Service family and customer-facing title.
- Tenant, website, and responsible staff.
- Engagement and commercial model.
- Agreed scope and exclusions.
- Start, expected completion, renewal, and end dates as applicable.
- Status.
- Quota or project-progress model.
- Customer-visible activity.
- Related tickets, deliverables, and commercial reference.

Recommended assignment states:

`scheduled`, `active`, `paused`, `completed`, `cancelled`, and `expired`

Pause, cancellation, and completion require a reason and effect date.

### 16.7 Usage and progress

Quota assignments specify:

- Unit, such as products, posts, or design requests.
- Total allowance.
- Used amount.
- Current service period.
- Renewal or reset date.
- Rules for overage and carryover if offered.

Project assignments specify:

- Current stage.
- Meaningful milestones and deliverables.
- Progress summary.
- Expected completion date.
- Blockers and whether customer input is required.

Progress must be based on actual delivery state. Staff should not enter an
arbitrary percentage without supporting stage or milestone information.

### 16.8 Customer experience

Customers can:

- View active services, pending requests, and service history separately.
- Filter by website and service family.
- See the website's management coverage without confusing it with the service
  assignment status.
- Understand included scope, usage, stage, dates, and next required action.
- View customer-visible activity and deliverables.
- Open a support ticket connected to the assignment.
- Request additional work.
- Withdraw an eligible request.

### 16.9 Administrator experience

Staff need:

- An intake queue for new and waiting requests.
- Commercial and specialist assignment.
- Scope and quotation editing with revision history.
- Controlled activation.
- Quota and milestone updates.
- Deliverable records and customer-visible notes.
- Renewal, expiry, pause, cancellation, and completion workflows.
- Filters by tenant, website, management coverage, service, owner, state, due
  date, and renewal risk.
- Revenue views for quoted, accepted, active recurring, completed project, and
  expiring service values.

Revenue reporting in this phase may be operational rather than accounting-grade.
It must clearly label estimated, quoted, agreed, and realized values.

### 16.10 Acceptance criteria

- A customer can submit and track a consultation request end to end.
- Staff can convert an accepted request into exactly one active assignment
  without losing request history.
- Quotation revisions preserve prior versions and acceptance evidence.
- The customer sees only customer-visible notes, scope, and commercial fields.
- Quota usage cannot become negative and cannot exceed the agreed handling
  rules silently.
- Renewal does not erase the prior service period.
- Additional work is visibly outside the existing included scope.
- Every state, price, scope, quota, and ownership change is audited.
- The four current families accept requests for external websites without an
  active Unixsee server plan, and activation never changes management coverage.

## 17. Activities and audit records

> **Delivery:** Later Phase 1. First-wave queues do not depend on a complete
> activities feed. Incident-resolution activities need richer operational data
> from the server team before full delivery.

### 17.1 Customer activities

Customer activities form a tenant-visible operational timeline on the website
owner dashboard. Examples:

- Website activated.
- Backup completed or restored.
- Cache cleared.
- Important monitoring event resolved.
- High traffic detected and later resolved by the server team.
- Ticket resolved.
- Complementary service activated, renewed, or completed.
- Approved onboarding milestone reached.

Operational incident outcomes that Unixsee server teams resolve should appear
as customer-visible activities after resolution, with enough context for the
owner to understand what happened without exposing internal tooling detail.

Each activity includes a stable ID, title, time, source or actor label, event
type, optional website/service reference, visibility, and safe metadata.

### 17.2 Administrator behavior

Staff can filter activities by tenant, website, category, actor/source, and
date. Authorized staff may create a manual customer-visible activity when a
real operational or service milestone is not generated automatically.

Manual activities must not impersonate system-generated events. Editing should
be limited; material corrections create a correction record.

### 17.3 Audit records

Audit records cover administrator mutations, customer security events,
operational actions, assignment changes, visibility changes, and failed
authorization-sensitive commands. Audit search and export must itself be
permission-controlled.

### 17.4 Acceptance criteria

- Customers cannot view another tenant's activities.
- Internal audit metadata never leaks into customer activity payloads.
- Automated events are idempotent.
- Manual and automated sources are distinguishable.
- Resolved operational incidents that are approved for customer visibility
  appear on the owner timeline without implying open incidents are editable by
  the customer.
- Audit records are immutable to ordinary administrator roles.

## 18. Notifications, website notices, and Unixsee messages

Phase 1 separates **three** customer-facing communication products. Do not
collapse them into one model or one admin queue.

| Product              | Persian label (when used) | Purpose                                                           | Delivery                                                             |
| -------------------- | ------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Unixsee messages** | پیام‌های یونیکسی          | Tenant-targeted one-way staff messages (optional website context) | Phase 1 — see [`unixsee-messages-prd.md`](./unixsee-messages-prd.md) |
| Notifications (News) | — / اخبار Unixsee         | Platform news and Unixsee announcements in the customer dashboard | Later Phase 1                                                        |
| Website notices      | اعلان‌ها                  | Admin-authored popup/notice for a **specific website**            | Later Phase 1                                                        |

### 18.0 Unixsee messages (پیام‌های یونیکسی)

Unixsee messages are **one-tenant**, staff → customer messages with short
title/body in **one** language (`contentLocale`), optional attachments and
links, optional website context, dismissible first-see popup, inbox list page,
and sidebar unread presence indicator. Admin compose shows the recipient’s
preferred `User.locale`. Full intended contract:

[`unixsee-messages-prd.md`](./unixsee-messages-prd.md)

UX flows:

- Admin:
  [`ux-flows/admin-unixsee-messages.md`](./ux-flows/admin-unixsee-messages.md)
- Customer:
  [`ux-flows/client-unixsee-messages.md`](./ux-flows/client-unixsee-messages.md)

Do not implement this feature as a reuse of News broadcast semantics or as a
replacement for اعلان‌ها or tickets.

### 18.1 Notifications (News)

Notifications communicate Unixsee news and platform, service, maintenance,
security, or customer-relevant announcements in the customer dashboard. They
are **not** the website-specific اعلان‌ها popups described in §18.4.

Customers need:

- A notification list and detail view that behaves like a news feed.
- Read/unread state that works across authorized devices.
- Publication time and optional expiry.
- Severity or category when it changes urgency.
- Safe links to relevant dashboard destinations.

### 18.2 Administrator experience for News

Authorized staff need to:

- Draft and preview Persian and English variants.
- Select category and importance.
- Target all customers, selected tenants, plans, or other approved segments.
- Schedule, publish, expire, or withdraw.
- Preview the final RTL and LTR rendering.
- See delivery and read summaries where supported.

Target selection must be resolved and authorized by the backend. The editor
must warn about missing locale variants, empty audiences, invalid links, and
high-impact broadcasts.

### 18.3 News acceptance criteria

- Drafts are never visible to customers.
- Customers outside the resolved audience cannot access a notification by ID.
- Expired or withdrawn items follow an explicit visibility policy.
- Read state is user-specific and server-backed when cross-device behavior is
  promised.
- Publishing, audience changes, and withdrawal are audited.
- News notifications are not used as substitutes for website-specific اعلان‌ها
  or Unixsee messages.

### 18.4 Website notices (اعلان‌ها)

اعلان‌ها are popup or blocking notices created by staff for a **specific
website**. Example: “Plugin X is broken and is slowing your site. Remove it to
fix the problem.”

They are operational, website-scoped messages for the website owner dashboard,
not a general Unixsee news feed.

Staff need to:

- Select exactly one website (and therefore its owning tenant context).
- Compose Persian and English copy where required.
- Choose severity and whether the notice is dismissible or must remain visible
  until resolved/withdrawn.
- Publish, update, expire, or withdraw the notice.
- See whether owners have acknowledged or dismissed it when that policy exists.

Customers need to:

- See active notices for websites they are authorized to view.
- Understand the required action without navigating an unrelated news list.
- Dismiss only when the notice policy allows dismissal.

### 18.5 Website-notice acceptance criteria

- A notice targeted at website A is never shown for website B.
- Customers without access to the website cannot open the notice by ID.
- اعلان‌ها, News, and Unixsee messages remain separately labeled in admin and
  customer IA.
- Publish, withdraw, and targeting changes are audited.

## 19. Search

### 19.1 Customer search

Customer search may include authorized websites, tickets, complementary
services, notifications, and safe destinations. Results must:

- Be tenant-scoped.
- Group or label result types.
- Support Persian and English queries where data permits.
- Avoid exposing inaccessible records through counts, suggestions, or recent
  history.
- Provide useful empty and unavailable states.

Recent destinations may be browser-local when they contain only safe route
metadata and timestamps. Invalid or no-longer-authorized destinations must be
discarded.

### 19.2 Administrator search

Administrator search is separate and may include customers, tenants, websites,
plan requests, tickets, service requests, assignments, alerts, and permitted
audit records. Results and quick actions depend on staff capabilities.

### 19.3 Acceptance criteria

- Search applies the same authorization as direct resource access.
- Internal records never appear in customer search.
- A stale recent item cannot bypass current authorization.
- Search failure does not prevent direct navigation to other application areas.

## 20. Profile and account preferences

Customers can view and update:

- Display name and approved personal details.
- Avatar under validated file rules.
- Preferred locale.
- Email and mobile number through explicit verification workflows.
- Password and two-factor settings.
- Active sessions.

Changes to verified contact fields remain pending until verification succeeds.
The UI must explain which address or number receives a challenge without
exposing sensitive information.

Authorized staff can review profile state and assist through controlled
workflows, but ordinary support staff must not silently replace verified
contact information.

### Acceptance criteria

- Invalid profile payloads are rejected at the trusted boundary.
- Contact changes do not become verified merely because the profile form saved.
- Avatar uploads are type/size validated and safely served.
- Locale changes preserve a usable localized route.
- Security-sensitive changes create audit records and appropriate user
  notifications.

## 21. Commercial and renewal projection

Phase 1 needs enough commercial data to operate active plans and complementary
services without presenting a complete accounting system. NestJS owns commercial
billing records; see
[`notes/commercial-records.md`](./notes/commercial-records.md) and ADR
[`0015`](../architecture/decisions/0015-nest-commercial-billing-records.md).

A billing item is created when a managed plan is activated or a complementary
assignment is created—not on inactive plan links or request/quotation alone.
Renewal appends period history and advances dates without payment.

Customer-visible commercial information may include:

- Agreed plan or service label.
- Amount and currency when approved for display.
- Billing or service period.
- Renewal or expiry date.
- Renewal state.
- Contact/support path for a commercial question.

Administrator behavior includes:

- Record the agreed amount, currency, period, and effective dates at activation
  (or via backfill record-terms for already-active plans).
- Mark whether a record is estimated, quoted, agreed, invoiced externally, or
  settled when reliable.
- Renew the commercial period (staff; no payment).
- Update the next period without overwriting prior terms.
- Replace the active managed plan as an explicit staff action.
- Record cancellation or non-renewal reason.

The UI must not offer a customer payment or customer renew action unless a real
end-to-end payment transaction exists. Phase 1 has **no** payment checkout.

## 22. Help and support guidance

Customers need contextual help from the dashboard:

- Clear empty-state explanations.
- Links to relevant help material.
- A route to create a support ticket.
- An urgent support-contact path when appropriate.
- Guidance for selecting a plan or complementary service.

Help links must use stable, localized destinations. Failure to load optional
help material must not block operational workflows.

## 23. Administrator panel information architecture

The final navigation depends on approved permissions, but the panel should be
designed around work queues and entities rather than mirroring customer
navigation.

Recommended primary areas:

- Overview.
- Customers and tenants.
- Plan requests and onboarding.
- Websites.
- Servers, agents, and discovery assignment.
- Tickets.
- Complementary-service requests and assignments.
- Monitoring and alerts (later Phase 1 expansion).
- Operational actions (later Phase 1).
- Notifications (News) (later Phase 1).
- Website notices / اعلان‌ها (later Phase 1).
- Activities and audit (later Phase 1).
- Settings (later Phase 1).
- Staff access, when the role design is approved (proposed:
  [`notes/admin-staff-roles-and-capabilities.md`](./notes/admin-staff-roles-and-capabilities.md);
  last Phase 1 delivery step).

Each entity detail should provide contextual links to related records. For
example, a tenant detail should connect to websites, requests, tickets, and
services; a website detail should connect to alerts, actions, activities,
اعلان‌ها, and tickets.

Administrative mutations need:

- Clear permission and availability state.
- Confirmation proportional to risk.
- Required reason for destructive or exceptional changes.
- Pending, success, and failure feedback.
- Optimistic UI only when rollback and conflict behavior are safe.
- A visible audit reference for high-impact operations.

## 24. Design requirements

Design work generated from this specification must:

- Use the existing semantic visual language and accessible primitives.
- Keep customer and administrator shells distinct.
- Design Persian RTL and English LTR intentionally.
- Cover mobile, tablet, and desktop layouts where the workflow permits.
- Avoid hover-only actions and preserve practical touch targets.
- Use tables for dense operational work only when responsive alternatives are
  defined.
- Preserve visible focus, keyboard navigation, semantic landmarks, labels, and
  error associations.
- Announce meaningful asynchronous changes.
- Respect reduced motion.
- Show realistic long names, Persian text, errors, empty states, and stale data
  rather than only ideal fixtures.
- Make status color supplemental to text and icon meaning.

For each screen, the design deliverable should identify:

1. Actor and required capability.
2. Primary user goal.
3. Data required.
4. Main and secondary actions.
5. Loading, empty, permission, stale, partial, and error states.
6. Confirmation and success behavior.
7. Mobile and bidirectional-layout behavior.
8. Accessibility notes.

## 25. Engineering requirements

- Next.js is the presentation layer for customer and administrator interfaces.
- NestJS owns application workflows, authorization, persistence, orchestration,
  and operational integrations.
- Browser code must not access PostgreSQL, infrastructure agents, or privileged
  systems directly.
- Use typed NestJS clients and validate external payloads at the integration
  boundary.
- Default to Server Components and add client boundaries only for actual
  interaction or browser behavior.
- Keep server credentials and privileged administrator calls server-only.
- Use REST for initial and historical data and realtime updates only for
  volatile state with product value.
- Prevent duplicate mutations through backend idempotency, not only disabled
  buttons.
- Return structured, translatable errors without exposing internal details.
- Validate dynamic route parameters before data access.
- Apply explicit cache and revalidation behavior.
- Preserve loading, empty, permission, stale, partial, and error states.

## 26. Cross-feature acceptance criteria

Phase 1 is functionally complete only when:

- Customer dashboard records come from authorized application contracts rather
  than production fixtures.
- Administrator workflows can produce and maintain the records shown to
  customers.
- The complete plan-request-to-active-website workflow works for the correct
  tenant.
- Tickets and complementary services work end to end for customers and staff.
- First-wave admin surfaces for websites, servers/agents, users, plan requests,
  tickets, and complementary services can produce and maintain the records
  those flows require.
- Later Phase 1 surfaces (activities, اعلان‌ها, News notifications, admin
  Settings) remain honestly unavailable until delivered and do not falsely
  appear operational. Unixsee messages follow
  [`unixsee-messages-prd.md`](./unixsee-messages-prd.md) when implemented.
- Live status and action updates recover safely from disconnects.
- No customer can access another tenant's records by changing IDs, search
  terms, attachment URLs, or realtime subscriptions.
- Every high-impact mutation has validation, authorization, idempotency where
  needed, clear feedback, and an audit record.
- Persian and English workflows pass independent responsive and accessibility
  review.
- Deferred features do not falsely appear operational.

## 27. Decisions required before implementation

The following choices must be approved in feature follow-ups or ADRs:

- Authentication provider and credential flow.
- Access-token, refresh-token, and session storage design.
- Final customer roles and administrator capability bundles (staff hierarchy
  proposal:
  [`notes/admin-staff-roles-and-capabilities.md`](./notes/admin-staff-roles-and-capabilities.md)).
- Definitive plan names, scope, availability, and pricing presentation.
- Plan-request acceptance and customer agreement method.
- Complementary-service quotation acceptance and commercial-record policy.
- Payment provider / checkout integration (deferred beyond Phase 1 commercial
  records; Phase 1 payment action: **none** — see ADR 0015).
- Notification audience rules and read-receipt requirements for News.
- Website-notice (اعلان‌ها) severity, dismissibility, and acknowledgement
  policy.
- Unixsee messages open items in
  [`unixsee-messages-prd.md`](./unixsee-messages-prd.md) §10 (attachment
  policy, multi-unread popup order, withdraw history, Nest route naming vs
  News).
- Activity payload contract for server-team incident resolutions.
- Alert severities, visibility rules, and service-level targets.
- Attachment storage, scanning, retention, and download policy.
- Metrics retention and aggregation.
- API versioning, realtime event contracts, queueing, and cache strategy.

Until these decisions are approved, implementations should preserve replaceable
boundaries and must not turn fixture assumptions into permanent contracts.

## 28. Source basis

This specification consolidates:

- The implemented customer-dashboard routes, components, states, and fixtures.
- The approved Unixsee product positioning and current project state.
- The target Next.js, NestJS, PostgreSQL, realtime, and edge-agent boundaries.
- The planned administrator-interface boundary.
- The previously described operational workflows, rewritten as application
  requirements for the current architecture.

When this document conflicts with a current architecture document, the
architecture document controls system ownership and security boundaries. When
implementation fixtures conflict with this document, fixtures are examples
rather than approved production behavior.
