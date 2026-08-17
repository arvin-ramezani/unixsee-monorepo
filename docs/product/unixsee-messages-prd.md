# Unixsee Messages — Product Requirements Document (PRD)

> **Status:** Proposed  
> **Owner:** Product and platform engineering  
> **Surfaces:** NestJS control plane (`backend/`) + admin compose UI (`admin-panel/`) + customer dashboard (`client/`)  
> **Phase:** Phase 1 — prioritized for immediate implementation  
> **Product name:** Unixsee messages / پیام‌های یونیکسی  
> **Not this PRD:** Notifications (News) / اخبار Unixsee; website notices / اعلان‌ها; support tickets; email/SMS  
> **Audience:** Product, NestJS, admin-panel, and customer dashboard teams  
> **Last verified:** 2026-08-16

## 1. Purpose

Define **Unixsee messages** (پیام‌های یونیکسی): a **tenant-targeted**,
**one-way** channel for staff to send short titled messages to customers in the
customer dashboard, with optional attachments, links, and an optional website
context.

This is a **third** customer-facing communication product. Do not collapse it
into Notifications (News) or website notices (اعلان‌ها). See Phase 1 §18 and
this PRD §3.

## 2. Product outcomes

- Authorized staff can draft, publish, edit, and withdraw a message aimed at
  **one tenant**.
- Each message has a short title and short body in one language
  (`contentLocale`), optional file attachments, and optional links
  (external and/or in-dashboard). Admin compose surfaces the recipient’s
  preferred UI language.
- Staff may optionally **connect** the message to one customer website for
  context; the message still appears in the tenant dashboard inbox.
- Customers see unread messages as a **dismissible popup** (“got it”) on first
  relevant visit, a **sidebar unread indicator**, and a dedicated list page.
- Dismissing the popup **marks the message read**. Read state is **per user**
  and **server-backed** (cross-device).
- Today Phase 1 assumes **one user per tenant**; later tenant multi-user access
  must reuse the same message model with membership/capability rules (out of
  this PRD’s detailed UX, but not blocked by the data model).

## 3. Relationship to existing products

| Product | Persian label | Audience | Delivery | This PRD |
|---|---|---|---|---|
| **Unixsee messages** | پیام‌های یونیکسی | **One tenant** (optional website link) | Popup + inbox list + unread indicator | **Canonical here** |
| Notifications (News) | اخبار Unixsee | Platform / segment announcements | News feed (later Phase 1) | Out of scope |
| Website notices | اعلان‌ها | **One website** operational notice | Website-scoped notice/popup (later Phase 1) | Out of scope |
| Tickets | تیکت‌ها | Two-way support | Ticket thread | Out of scope |

**Hard rules:**

- Do not use Unixsee messages as a substitute for tickets or اعلان‌ها.
- Do not reuse News broadcast/scheduling semantics for this product.
- Keep admin and customer IA labels distinct from News and اعلان‌ها.

## 4. Non-goals (explicit exclusions)

| Excluded | Owner instead |
|---|---|
| Email, SMS, or push delivery | Future channel decision |
| Customer → staff replies in this channel | Tickets |
| Replacing website notices (اعلان‌ها) | Phase 1 §18.4 |
| Replacing Notifications (News) | Phase 1 §18.1 |
| Audience = all customers / plan segments / multi-tenant blast | News (later) |
| Scheduling publish for later | Out for v1 |
| Unread **count** API or numeric badge totals | Sidebar **presence** indicator only |
| Hard max length enforcement for title/body | Soft editorial guidance only |
| Staff role matrix beyond “authorized admin can compose” | Keep simple until staff-roles note is applied |
| Inventing final OpenAPI DTOs / table schemas in this PRD | Backend contracts at implementation time |

## 5. Actors and trust boundary

```text
admin-panel ──admin JWT──► NestJS messages domain
client dashboard ──customer JWT──► NestJS messages domain
                                      │
                                      ▼
                                 PostgreSQL (+ attachment storage)
```

- NestJS owns authz, persistence, publish/withdraw, read state, and attachment
  validation. Admin and client never talk to agents or VPS hosts.
- Customer visibility is **tenant-scoped**. A message for tenant A must never
  be readable by tenant B (including by ID).
- Optional `websiteId` is contextual metadata: it must belong to the target
  tenant; it does not move the message into the اعلان‌ها product.

Related: [`../architecture/overview.md`](../architecture/overview.md),
[`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md),
[`../architecture/decisions/0012-admin-nest-auth-integration.md`](../architecture/decisions/0012-admin-nest-auth-integration.md).

## 6. Actors and access

| Actor | Capability | Restrictions |
|---|---|---|
| Staff (admin panel) | Draft, publish, edit, withdraw; attach files; add links; optional website link; target one tenant | One-way only; no schedule; keep role checks simple for v1 |
| Customer (tenant dashboard user) | See published messages for own tenant; popup + list; dismiss → read; download allowed attachments; open links | Cannot reply; cannot see drafts/withdrawn (except as defined in §8.3); cannot see other tenants |
| Future tenant members | Same inbox once multi-user lands | Capability filtering **Unknown** until tenant-member roles exist |

## 7. Intended contract

### 7.1 Message content

| Field | Contract |
|---|---|
| Title | Required short title; **no** hard max length — editorial soft guidance: keep short |
| Body | Required short text; **no** hard line/character limit — soft guidance: about **two to three lines** |
| Locales | Single authored language via `contentLocale` (`fa` \| `en`). Admin shows recipient preferred `User.locale` so staff write in that language. Not bilingual News-style FA+EN pairs. |
| Attachments | Optional; **multiple** files allowed; types/size/scanning policy **Unknown** until shared attachment policy is decided (reuse tickets approach where possible) |
| Links | Optional; **many** allowed; each may be external URL or in-dashboard deep link |
| Website link | Optional single website belonging to the target tenant |
| Target | Exactly **one tenant** |

### 7.2 Admin lifecycle

| State / action | Behavior |
|---|---|
| Draft | Staff-only; never shown to customers |
| Publish | Becomes visible to the target tenant’s dashboard user(s) |
| Edit after send | Allowed; customers see updated content on next load (exact “edited” label **Unknown**) |
| Withdraw | Removes customer visibility going forward; already-read history policy **Unknown** (see §10) |
| Schedule | **Not** in v1 |

### 7.3 Customer delivery and unread

| Behavior | Contract |
|---|---|
| List page | Dedicated customer dashboard page listing messages for the tenant (empty state when none) |
| Popup | On the first time the user encounters an **unread** published message in a session/visit path, show it as a dismissible popup with primary action **“got it”** / equivalent localized label |
| Multiple unread | **Unknown** exact queueing (show one-at-a-time vs latest-only) — default recommendation: show **one** popup at a time, oldest unread first |
| Dismiss | Marks that message **read** for the current user (server-backed) |
| Sidebar | If any unread message exists, show a **presence indicator** (dot/point) on the messages nav item — **no** unread count API |
| Cross-device | Read/unread is per user account and must agree across devices |
| Website context | If a website is linked, show that context in popup and list; do not hide the message from the global messages page |

### 7.4 Tenancy now vs later

- **Now:** one user represents the tenant dashboard; that user receives the
  message and owns read state.
- **Later:** tenants may add users with accessibilities; message targeting
  remains tenant-level unless a future product decision adds per-member
  targeting. Do not hard-code “only one user forever” into Nest persistence.

## 8. Primary flows

1. **Compose draft** — Given an authorized staff user, when they create a
   message for one tenant with FA/EN title/body and optional attachments,
   links, and website, then Nest stores a draft invisible to customers.
2. **Publish** — Given a complete draft, when staff publishes, then the target
   tenant’s customer can see the message in the list and as unread.
3. **First-see popup** — Given an unread published message, when the customer
   enters the dashboard (or an agreed first-see surface), then a dismissible
   popup shows the message; sidebar shows the unread indicator.
4. **Dismiss / read** — Given the popup, when the customer chooses “got it”,
   then Nest marks the message read for that user; popup closes; indicator
   clears if no other unread remain.
5. **Inbox browse** — Given zero or more messages, when the customer opens the
   messages page, then they see the list (and can open detail / attachments /
   links). Opening from the list should mark read if still unread
   (**Confirmed** intent: unread must be clearable without only relying on
   popup).
6. **Edit / withdraw** — Given a published message, when staff edits or
   withdraws, then customer visibility follows §7.2; publish/edit/withdraw are
   auditable.

## 9. States, failures, and recovery

| State/failure | User-visible result | System behavior | Recovery |
|---|---|---|---|
| Draft incomplete (missing locale) | Staff blocked or warned | Do not publish | Complete FA+EN or explicit policy exception (**Unknown**) |
| Publish to unknown/suspended tenant | Staff error | No customer visibility | Fix target tenant |
| Attachment rejected | Staff/customer error | Reject unsafe type/size | Re-upload valid file |
| Withdraw after customer read | Message leaves active inbox per withdraw policy | Persist withdraw; keep audit | Staff cannot “un-read” customer history casually |
| Read mark fails | Popup may reappear; indicator may persist | Do not claim success | Retry mark-read |
| Customer without tenant | No messages surface or empty gated UX | No tenant-scoped fetch | Become tenant via existing احراز هویت flows |

## 10. Open decisions

| ID | Decision | Why it matters | Level |
|---|---|---|---|
| O-1 | Attachment allowed MIME types, max size, virus scan, retention | Security and storage | Unknown |
| O-2 | Multiple unread popup order (oldest-first queue vs latest only) | UX interruption | Inferred default: one-at-a-time, oldest first |
| O-3 | Whether list-open alone marks read (in addition to dismiss) | Unread consistency | Confirmed direction: yes, list/detail should clear unread |
| O-4 | Withdraw visibility for previously read messages | History honesty | Unknown |
| O-5 | “Edited” indicator for customers after staff edit | Trust | Unknown |
| O-6 | Exact first-see route(s) that trigger popup (any authenticated page vs dashboard home only) | Interruption scope | Unknown |
| O-7 | Nest module/route names vs existing `notifications` News stubs | Avoid IA/API collision | Unknown — must not silently reuse News semantics |
| O-8 | Future multi-user: all members see all tenant messages vs capability filter | Access model | Unknown (defer detail) |

## 11. Functional requirements

| ID | Requirement |
|---|---|
| UM-AUTH-1 | Only authenticated staff with admin messaging capability may create/publish/edit/withdraw. |
| UM-AUTH-2 | Only authenticated customers for the target tenant may list/read/dismiss messages for that tenant. |
| UM-AUTH-3 | Cross-tenant IDOR access must fail closed. |
| UM-ADM-1 | Staff can draft → publish without scheduling. |
| UM-ADM-2 | Staff can edit and withdraw after publish. |
| UM-ADM-3 | Staff can attach multiple files and add multiple links (external + dashboard). |
| UM-ADM-4 | Staff can optionally link one website owned by the target tenant. |
| UM-ADM-5 | Staff compose in one language (`contentLocale`); admin UI surfaces recipient preferred locale from tenant owner `User.locale`. |
| UM-CUS-1 | Customer dashboard includes a پیام‌های یونیکسی / Unixsee messages page. |
| UM-CUS-2 | Unread published messages can appear as a dismissible popup with “got it”. |
| UM-CUS-3 | Dismiss marks read server-side for that user. |
| UM-CUS-4 | Sidebar shows a presence indicator when any unread message exists (no count API). |
| UM-CUS-5 | Read state is cross-device for the same user. |
| UM-CUS-6 | Channel is one-way; no customer reply in this product. |
| UM-IA-1 | Labels remain distinct from News and اعلان‌ها in admin and customer IA. |

## 12. Non-functional requirements

| ID | Requirement |
|---|---|
| UM-NFR-1 | NestJS is the authority; Next apps are UI + approved JWT fetch only (ADRs 0011 / 0012). |
| UM-NFR-2 | Persian RTL and English LTR support the same workflows. |
| UM-NFR-3 | Publish, edit, withdraw, and read marks are durable and auditable for staff actions. |
| UM-NFR-4 | Do not invent routes that conflict with documented News `notifications` behavior; document new contracts in `docs/backend/` at implement time. |
| UM-NFR-5 | Phase honesty: do not ship a fake-success inbox; empty/error states must be real. |

## 13. Acceptance criteria

- [ ] Staff can draft and publish a single-language message to one tenant with optional attachments, links, and optional website, guided by recipient preferred locale.
- [ ] Drafts are invisible to customers; withdrawn messages are not offered as active unread.
- [ ] Customer sees list page; unread shows sidebar indicator; popup dismiss marks read cross-device.
- [ ] Another tenant cannot fetch the message by ID.
- [ ] Product is labeled Unixsee messages / پیام‌های یونیکسی and is not conflated with News or اعلان‌ها.
- [ ] No email/SMS/push, no customer reply, no schedule-publish in v1.
- [ ] Backend routes/contracts are added when implementation starts (not invented
      only in UI fixtures). UX flows:
      [`ux-flows/admin-unixsee-messages.md`](./ux-flows/admin-unixsee-messages.md),
      [`ux-flows/client-unixsee-messages.md`](./ux-flows/client-unixsee-messages.md).

## 14. Delivery notes

1. **This PRD (docs)** — Proposed contract + Phase 1 pointer.
2. **Implementation** — Nest domain + admin compose + customer popup/list/indicator; add modules/routes and contracts under `docs/backend/` when APIs stabilize.
3. **UX flows** — Admin:
   [`ux-flows/admin-unixsee-messages.md`](./ux-flows/admin-unixsee-messages.md);
   Customer:
   [`ux-flows/client-unixsee-messages.md`](./ux-flows/client-unixsee-messages.md).
4. **Later** — Tenant multi-user accessibility filtering; shared attachment policy hardening; unresolved §10 items.

## 15. Evidence ledger

| Claim | Level | Source | Notes |
|---|---|---|---|
| Third product, not News or اعلان‌ها | Confirmed | Product clarification 2026-08-16 (Q1 = B) | Keep §3 separation |
| Target = one tenant; optional website | Confirmed | Product clarification Q2 | Website is context, not اعلان‌ها |
| Dismissible popup; read on dismiss; sidebar presence only | Confirmed | Product clarification Q3/Q6 | No unread count API |
| Soft title/body guidance; single language + preferred-locale guidance; multi attach; multi links | Confirmed | Product clarification Q4 + follow-up 2026-08-16 | Prefer `User.locale` |
| Draft→publish; edit/withdraw; no schedule; one-way; simple roles | Confirmed | Product clarification Q5 | |
| Phase 1, implement now; English PRD only | Confirmed | Product clarification Q7 | |
| Email/SMS, tickets, اعلان‌ها, customer replies out | Confirmed | Product clarification Q8 | |
| Popup queueing when many unread | Unknown | — | See O-2 |
| Attachment MIME/size policy | Unknown | — | See O-1 |
| Existing Phase 1 News/اعلان‌ها remain later wave | Confirmed | [`phase-1-application-features.md`](./phase-1-application-features.md) §18 | Do not merge |

## 16. Related documents

- Phase 1 feature brief: [`phase-1-application-features.md`](./phase-1-application-features.md) (§18 pointer)
- Admin UX flow: [`ux-flows/admin-unixsee-messages.md`](./ux-flows/admin-unixsee-messages.md)
- Customer UX flow: [`ux-flows/client-unixsee-messages.md`](./ux-flows/client-unixsee-messages.md)
- Delivery waves: [`notes/phase-1-delivery-waves.md`](./notes/phase-1-delivery-waves.md)
- Product index: [`README.md`](./README.md)
- Backend route map (update at implement): [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
- Client data fetch: [`../frontend/client-data-fetching.md`](../frontend/client-data-fetching.md)
- Admin data fetch: [`../frontend/admin-data-fetching.md`](../frontend/admin-data-fetching.md)
- Customer assistant PRD (format reference only): [`customer-assistant-prd.md`](./customer-assistant-prd.md)
