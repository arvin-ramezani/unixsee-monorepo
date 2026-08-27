# Customer dashboard billing page — Product Requirements Document (PRD)

> **Status:** Proposed  
> **Owner:** Product, client frontend, Nest backend  
> **Surfaces:** Customer dashboard (`client/`) — primary; Nest customer read API
> (`backend/`) — data contract dependency  
> **Phase:** Phase 1 — commercial projection only (no payment)  
> **Product name:** Billing / صورتحساب  
> **Route:** `/dashboard/billing` (locale-aware: FA default unprefixed, `/en/…`)  
> **Not this PRD:** Admin renew/replace/record-terms; invoices; checkout;
> payment methods; WooCommerce/WordPress billing; per-website billing panel
> implementation detail (see §4 / §8)  
> **Audience:** Product, UX, client frontend, Nest backend, QA  
> **Last verified:** 2026-08-27

## 1. Purpose

Define how the **tenant billing page** in the customer dashboard should work:
a single place to see **agreed commercial terms and renewal/expiry dates** for
managed plans and complementary services across the tenant’s websites.

This page replaces the current **disabled sidebar stub** (`/dashboard/billing`)
with a real, Nest-backed read surface. It does **not** introduce payment,
self-serve renew, or accounting.

Aligned with Phase 1 §21, product note
[`notes/commercial-records.md`](./notes/commercial-records.md), ADR
[`0015`](../architecture/decisions/0015-nest-commercial-billing-records.md),
and API contract [`../backend/contracts/billing.md`](../backend/contracts/billing.md).

## 2. Decisions taken (do not re-litigate)

| ID | Decision | Consequence |
|---|---|---|
| D-1 | Nest owns commercial records; client is presentation-only. | Page reads Nest; no invented amounts/dates; no WordPress billing SoT. |
| D-2 | Phase 1 has **no customer payment or Renew that collects money**. | No Renew CTA that pretends to charge; copy must say online renewal is unavailable until a real payment path exists. |
| D-3 | Billing item exists only after plan/assignment **activation** (or staff record-terms). | Empty state is valid when the tenant has websites but no commercial rows yet. |
| D-4 | Default currency display preserves Nest `currency` (typically `IRR`); localization formats, does not convert. | Use locale-aware `Intl` / next-intl formatters; never invent FX. |
| D-5 | Sidebar **Billing / صورتحساب** becomes a live nav item when this page ships. | Remove `disabled: true` on the billing nav entry as part of the UI implementation. |
| D-6 | Website details keep a **website-scoped** billing panel; this page is the **tenant hub**. | Do not delete the website panel; keep both surfaces consistent with the same Nest fields. |

Source: ADR 0015; commercial-records note; Phase 1 §21; product session after Nest billing module landed (2026-08-27).

## 3. Product outcomes

- An authenticated tenant user can open **Billing** from the dashboard sidebar
  and see commercial state for their websites without opening each website.
- Each listed item shows enough to answer: **what**, **for which website**,
  **how much**, **which cycle**, **when the period ends / renews**, and
  **status** (active, paused, expired, etc.).
- Managed plans and complementary services are both visible, clearly
  distinguished.
- Users who need a commercial change can reach a **support / contact path**
  (ticket or documented help) without a fake renew button.
- Empty, loading, and error states are honest; the page never fabricates
  fixtures as production data.
- Persian RTL and English LTR reach content parity for all user-visible strings.

## 4. Non-goals (explicit exclusions)

| Excluded | Owner instead |
|---|---|
| Payment provider, checkout, card vault, invoices, receipts, tax | Deferred beyond Phase 1 commercial records (ADR 0015) |
| Customer self-serve **Renew** that advances Nest periods | Staff renew only (`POST …/billing-items/:id/renew`) |
| Customer cancel / pause / replace plan | Admin billing mutations |
| Staff record-terms / enable-plan commercial forms | Admin panel + plan-request UX |
| Full accounting, ledger, P&L charts, export to Excel | Out of Phase 1 |
| Domains product / domain renewals | Deferred domains area |
| Changing Nest creation triggers or admin renew math | [`notes/commercial-records.md`](./notes/commercial-records.md) |
| Redesigning the website-details billing panel beyond field consistency | Existing `WebsiteBillingPanel`; keep aligned, do not merge pages |
| Inventing OpenAPI schemas in this PRD beyond naming the contract gap | Implementation updates [`../backend/contracts/billing.md`](../backend/contracts/billing.md) |

## 5. Actors and trust boundary

```text
client /dashboard/billing ──customer JWT──► Nest billing (tenant-scoped read)
                                              │
                                              ▼
                                         PostgreSQL BillingItem (+ period summary)
```

| Actor | Capability | Restrictions |
|---|---|---|
| Tenant dashboard user (Phase 1: one user per tenant) | Read commercial projection for own tenant; filter/navigate to related website or service | Cannot mutate billing; cannot see other tenants |
| Future tenant members | Same read once multi-user lands | Capability filtering **Unknown** until member roles exist |
| Staff | Not this page | Use admin website billing / renew / replace |
| Anonymous | No access | Redirect to auth |

Related: ADR
[`0011`](../architecture/decisions/0011-client-nest-auth-integration.md).

## 6. Users and user needs

| ID | Need | Confidence |
|---|---|---|
| N-1 | As a store owner, I need one place to see when managed plans and specialist services renew or expire, so I can plan cash and operations without opening every website. | Inferred from Phase 1 §7 “Billing projection” + §21 |
| N-2 | As a customer, I need amounts and dates that match what Unixsee agreed, so I trust the dashboard. | Confirmed — ADR 0015 / commercial-records |
| N-3 | As a customer, I need to understand that I **cannot** renew online yet, so I do not think the product is broken when Renew is missing. | Confirmed — commercial-records stance |
| N-4 | As a customer with no active commercial rows yet, I need a clear empty state and a next step (websites / plan request / support), not a blank page. | Confirmed — UX empty-state guidance (see §12) |
| N-5 | As a customer with a commercial question, I need a path to ask Unixsee (ticket), not a dead end. | Confirmed — Phase 1 §21 customer-visible “contact/support path” |

## 7. Relationship to existing products

| Surface | Role | This PRD |
|---|---|---|
| **Dashboard Billing** `/dashboard/billing` | Tenant-wide commercial hub | **Canonical here** |
| **Website details** billing panel | Website-scoped plan commercial snapshot | Sibling; must stay field-consistent |
| Complementary services list/detail | Delivery/progress of assignments | May deep-link **to** billing rows; does not own commercial SoT |
| Plans catalog / plan request | Sales intake | Out of scope except empty-state CTAs |
| Tickets | Support for commercial questions | CTA target only |
| Admin billing | Staff create/renew/replace | Out of scope |

**Hard rules:**

- Do not present this page as “invoices” or “payments”.
- Do not show staff-only commercial state labels that confuse customers unless
  product later defines a customer-safe subset (see §9.3 / O-2).
- Do not invent Renew success UI.

## 8. Intended information architecture

### 8.1 Navigation

- Sidebar item: existing `billing` key → `/dashboard/billing`.
- On ship: enable the item (`disabled` removed); highlight active state like
  other dashboard routes.
- Breadcrumb: single segment — Billing / صورتحساب (match other list pages).

### 8.2 Page job (one primary job)

**Scan commercial commitments across my websites.** Secondary: jump to a
website or open support about billing.

### 8.3 Page composition (v1)

Prefer the **existing customer dashboard patterns** (`DashboardShell`,
`Panel`, list rows) over a marketing bento grid or finance analytics layout.

Recommended structure (top → bottom):

1. **Page header** — title + one short supporting sentence that this is
   agreed terms and renewal dates, **not** online payment.
2. **Optional summary strip** (lightweight) — counts only, e.g. active plans,
   complementary items, items due/expired soon. No charts. If counts are hard
   without an aggregate API, defer summary to a follow-up (O-3).
3. **Primary list** — commercial items grouped or filterable by kind:
   - Managed plan
   - Complementary service  
   Default sort: soonest `renewsAt` / `periodEndsAt` first, then label.
4. **Help footer / callout** — online renewal unavailable + link to open a
   ticket (or existing support entry).

### 8.4 Row content (customer-visible)

Each row must show:

| Field | Notes |
|---|---|
| Kind | Managed plan vs complementary service (localized label) |
| Label | Plan name or service title (`labelSnapshot` / plan locale name) |
| Website | Domain or website display name + link to `/dashboard/websites/:id` when id known |
| Amount + currency | Locale-formatted; preserve Nest currency |
| Interval | Monthly / quarterly / yearly / one-time (`NONE`) |
| Period start | `periodStartsAt` |
| Renew / due | Prefer `renewsAt`, else `periodEndsAt`; hide “renews” wording for `NONE` |
| Status | Customer-safe status (see §9.3) |

Optional v1 (nice-to-have, not blockers): commercial model label; link to
complementary assignment detail when `serviceAssignmentId` exists.

Period **history table** (all past renewals) is **out of v1** for the hub page;
staff and Nest keep history. Website panel may stay summary-only.

### 8.5 Filters and deep links

| Behavior | Contract |
|---|---|
| Filter by kind | Optional query `?kind=plan\|service` or tabs — **Proposed** |
| Filter by website | Optional `?websiteId=` — **Proposed** |
| Deep link from website panel | Link “View all billing” → `/dashboard/billing?websiteId=…` — **Proposed** |
| Search | Not required for v1 if list stays short |

URL should reflect filter state (shareable, back-button friendly).

## 9. Intended contract

### 9.1 Read model

Customer sees Nest commercial projection only. If Nest has no items for the
tenant, the UI shows empty — never fixtures.

### 9.2 Mutations

**None** on this page in Phase 1.

### 9.3 Status vocabulary (customer-safe)

Map Nest `BillingItemStatus` to clear customer language:

| Nest status | Customer treatment (Proposed) |
|---|---|
| `ACTIVE` | Active |
| `SCHEDULED` | Scheduled / starts later |
| `PAUSED` | Paused |
| `EXPIRED` | Expired — emphasize next to due date |
| `CANCELLED` | Cancelled (include in list only if API returns it; otherwise omit) |
| `COMPLETED` | Completed (complementary / fixed-scope) |

Whether cancelled/completed items appear on the hub is **O-1**. Website billing
read today returns active/scheduled/paused/expired for listing — keep hub
aligned with the customer API filter chosen at implementation.

`commercialState` (`ESTIMATED` … `SETTLED`): **do not show raw enum** unless
product supplies plain-language copy (O-2). Default v1: omit.

### 9.4 API dependency (contract gap)

**Confirmed today:** `GET /api/v1/websites/:id/billing` returns
`{ plan, complementaryServices }` for one website.

**Required for a clean hub (Proposed):** a tenant-scoped aggregate read, e.g.

`GET /api/v1/billing` or `GET /api/v1/me/billing`

returning items (or websites with nested items) for the caller’s tenant only.

| Approach | Verdict |
|---|---|
| New tenant aggregate endpoint | **Preferred** — one round-trip, consistent authz, stable DTO |
| Client fan-out: list websites → N× `/websites/:id/billing` | Allowed interim only if aggregate slips; document as temporary; watch latency |

Exact path/DTO belong in [`../backend/contracts/billing.md`](../backend/contracts/billing.md)
at implementation time — this PRD requires the capability, not the final OpenAPI.

### 9.5 Authz

- Requires authenticated customer with tenant access.
- Items must be tenant-scoped; cross-tenant ID probing must fail closed.

## 10. Primary flows

1. **Open billing hub** — Given a signed-in tenant user, when they choose
   Billing in the sidebar, then they see loading chrome then the hub with Nest
   data or empty/error.
2. **Scan due dates** — Given one or more items, when they scan the list, then
   they can identify the next renew/expiry date and amount without opening
   another page.
3. **Jump to website** — Given a row with a website, when they activate the
   website link, then they land on that website’s dashboard details.
4. **Ask about billing** — Given any state (including empty), when they need
   help, then they can open a ticket (or the documented support entry) with
   clear “online renewal unavailable” context.
5. **Filter (if shipped)** — Given many items, when they filter by kind or
   website, then the URL updates and the list narrows without a full app
   remount confusion.

## 11. States, failures, and recovery

| State / failure | User-visible result | System behavior | Recovery |
|---|---|---|---|
| Loading | Structure-matched skeleton (`loading.tsx`) | Server fetch in flight | Completes to ready/empty/error |
| Ready with items | List (+ optional summary) | Nest 200 with ≥1 item | — |
| Empty (no commercial rows) | Helpful empty: explain no agreed terms yet; CTA to websites and/or plan request; support note | Nest 200 with empty collection | User follows CTA |
| Empty websites entirely | Same family of empty; prefer “add/request website/plan” framing | Nest/websites empty | Onboarding paths |
| API error / unauthorized | Error panel; retry if applicable; no fake rows | Non-2xx or auth failure | Re-auth or retry |
| Partial fan-out failure (interim only) | Error or honest partial with warning — never silent drop without notice | Some website billing calls fail | Retry; prefer aggregate API |

## 12. UX and visual direction (advisory → repo-compatible)

Researched with UI/UX Pro Max (`ux` + `style` + `nextjs`/`shadcn` stacks).
Repository dashboard conventions override database aesthetics.

### 12.1 Accepted recommendations

- **Empty states** with guidance + next action (not blank white).
- **Loading skeletons** for waits (repo mandate for dashboard routes).
- **Active nav** indication for `/dashboard/billing`.
- **URL reflects filters** when filters exist.
- **Clear hierarchy**: header → optional summary → list → help callout.
- **Status readability** via text (and existing semantic tokens), not
  finance-dashboard profit/loss color systems.
- **Compose with existing shadcn/dashboard primitives**; use
  `RadialRevealLink` / `RadialRevealButton` only for button-styled CTAs per
  `client/AGENTS.md`.

### 12.2 Rejected recommendations (repo / Phase 1 conflict)

- Bento / Apple modular marketing grids as the primary layout.
- Financial dashboard charts, waterfalls, export-to-Excel, count-up money
  animations.
- Renew confirmation **dialogs** (no customer renew mutation).
- Dimensional multi-elevation card stacks that fight existing `Panel` language.

### 12.3 Accessibility and localization

- FA RTL / EN LTR with logical properties.
- Amounts, dates, and numbers via locale formatters.
- Touch targets and keyboard focus preserved on list rows and links.
- Respect reduced motion; no essential info only in animation.
- All copy in `en.json` / `fa.json` (no hardcoded Persian/English in JSX).

## 13. Data and integration boundaries

- **UI:** `client/src/app/[locale]/(dashboard)/dashboard/billing/` (+
  `loading.tsx`); feature components under `client/src/components/billing/`
  (or equivalent).
- **APIs:** Preferred tenant aggregate billing read; interim fan-out allowed.
  Existing per-website read remains for website details.
- **Entities:** `BillingItem` (+ display fields); website identity for linking.
- **Security:** Tenant isolation; no admin routes from client.
- **i18n / a11y:** next-intl; dashboard a11y conventions in
  [`../../client/docs/engineering/ui.md`](../../client/docs/engineering/ui.md).

## 14. Evidence ledger

| Claim | Level | Source | Notes |
|---|---|---|---|
| Nest owns commercial records; no Phase 1 payment | Confirmed | ADR 0015; commercial-records note | — |
| Customer website billing read exists | Confirmed | `billing.md`; `GET /websites/:id/billing` | Website-scoped only |
| Sidebar Billing is disabled stub | Observed | `client/src/lib/dashboard-data.ts` | No `billing/page.tsx` today |
| Website panel shows Nest plan summary; renew unavailable | Observed | `website-billing-panel.tsx` | Complementary not in that panel summary |
| Tenant aggregate customer API | Unknown / Proposed | This PRD §9.4 | Required for clean hub |
| Exact empty-state CTAs (plans vs websites vs tickets) | Inferred | Phase 1 onboarding + §21 | Finalize in UI copy review |
| Show cancelled/completed on hub | Unknown | O-1 | — |
| Show `commercialState` to customers | Unknown | O-2 | Default omit |

## 15. Acceptance and validation

- [ ] `/dashboard/billing` renders for an authenticated tenant (no `notFound`
      stub).
- [ ] Sidebar Billing is enabled and shows active state on this route.
- [ ] Page shows Nest-backed items or honest empty/error — no production
      fixtures.
- [ ] Managed plan and complementary rows are distinguishable.
- [ ] Amount, currency, interval, period dates, and status are visible per §8.4.
- [ ] No customer Renew control that mutates Nest or pretends payment succeeded.
- [ ] Help/callout states online renewal unavailable and offers support path.
- [ ] Website link navigates to the correct website details page when id present.
- [ ] Co-located `loading.tsx` skeleton matches layout.
- [ ] FA and EN strings exist and mirror keys; RTL/LTR layouts checked.
- [ ] Cross-tenant access cannot read another tenant’s billing (API + UI).
- [ ] Contract doc updated if aggregate endpoint is added.

**Tests/checks:** Client UI review + Nest contract/tests for any new aggregate
route. Not tested in this PRD authoring session.

## 16. Open decisions

| ID | Question | Why it matters | Owner |
|---|---|---|---|
| O-1 | Include `CANCELLED` / `COMPLETED` on the hub, or active-family only? | List noise vs audit clarity | Product |
| O-2 | Expose any `commercialState` wording to customers? | Trust vs jargon | Product |
| O-3 | Ship summary counts in v1 or list-only? | API shape / layout cost | Product + client |
| O-4 | Final aggregate path name (`/billing` vs `/me/billing` vs websites bundle) | Contract stability | Backend — **Resolved:** `GET /api/v1/billing` |
| O-5 | Default empty CTA priority: websites vs plan request vs ticket | Onboarding conversion | Product |
| O-6 | Should website billing panel also list complementary rows, or stay plan-only? | Consistency with hub | Product (out of this page’s ship blocker) |

## 17. Implementation notes for the next UI step

Ordered for the upcoming UI implementation (not part of this PRD’s deliverable):

1. Lock O-1 / O-4 with backend (or accept interim fan-out explicitly).
2. Add route + `loading.tsx` + enable nav.
3. Wire read model → list UI using dashboard `Panel` / list patterns.
4. Align field labels with website `WebsiteBillingPanel` where they overlap.
5. Add empty/error/help callout + ticket CTA.
6. Format Prettier; FA/EN messages; manual RTL pass.

Do **not** treat this PRD as authorization to invent payment UX.

## 18. Traceability

- Product / domain: [`phase-1-application-features.md`](./phase-1-application-features.md) §21;
  [`notes/commercial-records.md`](./notes/commercial-records.md)
- Decisions: [`../architecture/decisions/0015-nest-commercial-billing-records.md`](../architecture/decisions/0015-nest-commercial-billing-records.md)
- API: [`../backend/contracts/billing.md`](../backend/contracts/billing.md);
  [`../backend/contracts/websites-customer.md`](../backend/contracts/websites-customer.md)
- UX research queries: `subscription billing dashboard SaaS renewal status empty state` (domain `ux`);
  `dashboard billing list readability hierarchy` (domain `style`);
  stack checks `nextjs` / `shadcn` (skeletons, composition — limited hit rate)
- Implementation: TBD (`client/.../dashboard/billing/`, billing components)
- Sibling surface: `client/src/components/websites/website-billing-panel.tsx`
- Tests/enforcement: TBD
