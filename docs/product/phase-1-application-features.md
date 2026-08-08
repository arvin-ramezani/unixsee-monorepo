# Phase 1 Application Feature Specification

> **Status:** Proposed
>
> **Owner:** Product and architecture groups
>
> **Last verified:** 2026-08-07

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
to the managed-infrastructure offering.

## 3. Phase goals

Phase 1 must enable these complete outcomes:

- An authorized customer can access only their tenant's account and resources.
- Staff can receive a plan request, enable the chosen plan on a website for an
  existing customer, and assign managed websites to the correct customer.
- Customers can see website identity, service state, monitoring status, alerts,
  usage, and relevant operational history.
- Authorized users can request safe website operations and see their progress
  and result.
- Customers and staff can complete a support-ticket workflow with messages and
  attachments.
- Customers can request a complementary service; staff can scope, quote,
  activate, deliver, track, renew, complete, or cancel it.
- Staff can publish customer-facing operational notifications.
- Customer-visible activities and staff-only audit records provide a reliable
  history of important events.
- Customers can manage their profile, verification, password, sessions, and
  optional two-factor authentication.
- Persian RTL and English LTR experiences support the same workflows.

## 4. Phase boundaries

### 4.1 Included

- Authentication, sessions, customer tenancy, administrator authorization, and
  account security.
- Customer and tenant administration.
- Plan catalog visibility, plan requests, plan enablement on websites, and
  service activation.
- Website, server, service-assignment, and agent-assignment administration.
- Website monitoring summaries, live status, alerts, and safe operational
  actions.
- Customer dashboard aggregation.
- Tickets, conversations, attachments, assignment, and status management.
- Complementary-service requests, commercial review, assignments, usage,
  progress, and history.
- Notifications, activities, audit history, and application search.
- Customer profile and verification workflows.
- Renewal visibility and staff-managed commercial records needed by active
  plans and complementary services.

### 4.2 Deferred

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

Deferred features may appear as unavailable or coming-soon destinations, but
they must not imply that a transaction or operation is currently supported.

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
- Notification publication.
- Security-sensitive account assistance.
- Audit review and read-only oversight.

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

| Capability | Customer experience | Administrator experience | Phase priority |
| --- | --- | --- | --- |
| Access and security | Sign in, sessions, verification, 2FA | Account support and access control | Foundation |
| Dashboard overview | Tenant summary | Cross-customer operational summary | Core |
| Customers and tenants | Profile and membership visibility | Customer, tenant, and membership management | Foundation |
| Plans and onboarding | Browse and submit a plan request | Enable chosen plan on a website for an existing customer | Core |
| Websites | List and detailed service view | Create, assign, configure, suspend, and retire | Core |
| Monitoring and alerts | Health, traffic, checks, warnings | Fleet monitoring and alert handling | Core |
| Operational actions | Request allowed actions | Dispatch, observe, retry, and audit | Core |
| Tickets | Create, converse, and track | Queue, assign, reply, and resolve | Core |
| Complementary services | Request and track delivery | Scope, quote, activate, deliver, and renew | Core |
| Activities | Customer-visible timeline | Create permitted manual events and inspect history | Core |
| Notifications | Read announcements | Compose, target, schedule, and publish | Core |
| Search | Find tenant resources and destinations | Find operational and business records | Supporting |
| Profile | Manage identity and preferences | Assist with account state | Core |
| Billing projection | See renewal and commercial state | Maintain agreed commercial records | Limited |
| Domains | Coming-soon state only | No Phase 1 workflow | Deferred |

## 8. Access, identity, and sessions

### 8.1 Customer behavior

Customers need to:

- Sign in using the approved identifier and credential method.
- Complete a second-factor challenge when it is enabled.
- See and revoke active sessions or devices.
- Sign out from the current session or all sessions.
- Request and complete email or mobile verification.
- Change their password after appropriate reauthentication.
- Enable or disable two-factor authentication and manage recovery codes.
- Receive understandable, non-enumerating errors for invalid credentials,
  locked accounts, expired challenges, and rate limits.

### 8.2 Administrator behavior

Authorized staff need to:

- Find an account by safe customer identifiers.
- See whether an account is active, suspended, locked, verified, or protected
  by two-factor authentication.
- Suspend or restore access with a required reason.
- Revoke sessions after a security event.
- Start a controlled verification or two-factor recovery process.
- Review security-relevant account history.

Staff must not see passwords, one-time codes, recovery-code plaintext, refresh
tokens, or secret material. Any impersonation capability is deferred until a
separate audited security design is approved.

### 8.3 Acceptance criteria

- A user cannot access protected dashboard data without an authorized session.
- Session revocation prevents further refresh and protected requests.
- Expired and reused verification challenges are rejected.
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

A tenant represents one approved Unixsee customer organization or account. It
contains:

- Display and legal names where required.
- Primary contacts.
- Memberships and tenant roles.
- Owned websites and active services.
- Commercial and lifecycle state.
- Notes that are explicitly internal or customer-visible.

### 9.3 Administrator workflows

Staff need to:

- Create or approve a tenant during onboarding.
- Add, invite, change, or remove members.
- Assign the tenant owner with safeguards against leaving the tenant ownerless.
- Review the tenant's websites, plan requests, tickets, complementary services,
  notifications, and activities from one context.
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
payment confirmation. Validation outside the admin application may occur before
staff enablement; that validation is not an admin-panel workflow in this phase.

The customer supplies at least:

- Selected plan from the published list.
- Contact details needed to match an existing customer.
- Any website or domain hints the intake contract requires.

Broader assessment questionnaires, communication threads, and quotation steps
are out of the Phase 1 admin plan-request surface described here.

### 11.3 Request lifecycle

Recommended admin states for this phase:

`pending -> ready_to_enable -> enabled`

Terminal alternatives:

`declined` or `cancelled`

`ready_to_enable` means an existing user/tenant is linked and a target website
is selected with no unresolved one-plan conflict. Every consequential
transition records the actor, time, and reason when required.

### 11.4 Administrator plan enablement

Authorized staff need to:

- View incoming plan requests and the plan the customer chose.
- Link an **existing** user/tenant to the request (no create from this surface).
- Select the target website.
- Enforce one active plan per website.
- Enable the requested plan on that website, or decline/cancel with a reason.

User/tenant creation, server/agent enrollment, and discovery assignment remain
in their own admin flows. Plan enablement consumes those records; it does not
replace them.

### 11.5 Acceptance criteria

- Submitting a request never displays payment-success language.
- Staff cannot enable a plan request without a linked existing user/tenant.
- Staff cannot leave two active plans on the same website.
- Enabling a request makes that request’s chosen plan the website’s active plan.
- Retried enablement does not create unintended duplicate active-plan
  assignments.
- Decline and cancellation require a reason.

## 12. Websites and service assignments

### 12.1 Customer website list

Customers can view their managed websites in table and card layouts. Each item
should expose:

- Website name and domain.
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

### 12.3 Administrator website management

Staff need to:

- Create a website during onboarding.
- Assign it to exactly one tenant.
- Assign a plan, server, and operational agent or integration.
- Maintain safe metadata and approved management links.
- Change lifecycle state: provisioning, active, suspended, maintenance,
  cancelled, or retired.
- Review current monitoring, alerts, action history, tickets, and services.
- Transfer a website only through a confirmed and audited process.
- Retire records without erasing operational history.

### 12.4 Server and agent associations

The administrator UI exposes only application-level management:

- Server identity, location, capacity summary, and lifecycle state.
- Agent identity, last communication, version, and health.
- Website-to-server and website-to-agent assignments.
- Configuration validation and communication status.

Secret values and direct database or infrastructure consoles are outside the
browser application.

### 12.5 Acceptance criteria

- A customer cannot retrieve another tenant's website by changing an ID.
- Live values include their measurement times.
- Links to external consoles use approved destinations and safe new-window
  behavior.
- Assignment changes are authorized, validated, and audited.
- Retired websites no longer appear as active but retain historical records.

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
- Close a resolved ticket or request reopening under approved rules.

Recommended customer-facing states:

`submitted`, `in_progress`, `waiting_for_customer`, `resolved`, and `closed`

### 15.3 Administrator workflow

Staff can:

- Work from queues filtered by assignment, category, status, tenant, and SLA
  risk.
- Assign or transfer a ticket.
- Send a customer-visible reply.
- Add an internal note.
- Request customer information.
- Change status according to valid transitions.
- Link relevant operational records.
- Resolve or close with a resolution summary.

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

Complementary services help existing customers improve and operate their
ecommerce presence beyond managed infrastructure. They should be sold as
specialist engagements with a defined scope, commercial model, owner, and
measurable delivery state.

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
- Filters by tenant, website, service, owner, state, due date, and renewal risk.
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

## 17. Activities and audit records

### 17.1 Customer activities

Customer activities form a tenant-visible operational timeline. Examples:

- Website activated.
- Backup completed or restored.
- Cache cleared.
- Important monitoring event resolved.
- Ticket resolved.
- Complementary service activated, renewed, or completed.
- Approved onboarding milestone reached.

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
- Audit records are immutable to ordinary administrator roles.

## 18. Notifications

### 18.1 Customer experience

Notifications communicate platform, service, maintenance, security, or
customer-relevant operational information. Customers need:

- A notification list and detail view.
- Read/unread state that works across authorized devices.
- Publication time and optional expiry.
- Severity or category when it changes urgency.
- Safe links to relevant dashboard destinations.

### 18.2 Administrator experience

Authorized staff need to:

- Draft and preview Persian and English variants.
- Select category and importance.
- Target all customers, selected tenants, affected websites, plans, or other
  approved segments.
- Schedule, publish, expire, or withdraw.
- Preview the final RTL and LTR rendering.
- See delivery and read summaries where supported.

Target selection must be resolved and authorized by the backend. The editor
must warn about missing locale variants, empty audiences, invalid links, and
high-impact broadcasts.

### 18.3 Acceptance criteria

- Drafts are never visible to customers.
- Customers outside the resolved audience cannot access a notification by ID.
- Expired or withdrawn items follow an explicit visibility policy.
- Read state is user-specific and server-backed when cross-device behavior is
  promised.
- Publishing, audience changes, and withdrawal are audited.

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
services without presenting a complete accounting system.

Customer-visible commercial information may include:

- Agreed plan or service label.
- Amount and currency when approved for display.
- Billing or service period.
- Renewal or expiry date.
- Renewal state.
- Contact/support path for a commercial question.

Administrator behavior includes:

- Record the agreed amount, currency, period, and effective dates.
- Mark whether a record is estimated, quoted, agreed, invoiced externally, or
  settled when reliable.
- Start a renewal review.
- Update the next period without overwriting prior terms.
- Record cancellation or non-renewal reason.

The UI must not offer a payment or renewal action unless a real end-to-end
transaction exists.

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
- Websites and infrastructure assignments.
- Monitoring and alerts.
- Operational actions.
- Tickets.
- Complementary-service requests and assignments.
- Notifications.
- Activities and audit.
- Staff access, when the role design is approved.

Each entity detail should provide contextual links to related records. For
example, a tenant detail should connect to websites, requests, tickets, and
services; a website detail should connect to alerts, actions, activities, and
tickets.

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
- Final customer roles and administrator capability bundles.
- Definitive plan names, scope, availability, and pricing presentation.
- Plan-request acceptance and customer agreement method.
- Complementary-service quotation acceptance and commercial-record policy.
- Billing and payment integration, including whether any Phase 1 payment action
  exists.
- Notification audience rules and read-receipt requirements.
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
