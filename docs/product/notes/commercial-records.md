# Commercial records (billing projection)

## Note

Phase 1 commercial records track **agreed pricing and renewal terms** for
active managed plans and complementary-service assignments. They are not
invoices, checkout, payment methods, refunds, or automated dunning.

Aligned with Phase 1 §16 and §21, ADR
[`0015-nest-commercial-billing-records.md`](../../architecture/decisions/0015-nest-commercial-billing-records.md),
and contract [`../../backend/contracts/billing.md`](../../backend/contracts/billing.md).

## Stance

- NestJS owns creation, uniqueness, renewal math, period history, and expiry.
- Admin and client display and send staff/customer actions only.
- A billing item is created **when a plan or complementary assignment becomes
  active**, not when a website is created, a plan is linked inactive, or a
  request/quotation is submitted.
- Each website has at most one **active** managed-plan billing item.
- Complementary services have independent billing items (including on external
  websites without a managed plan).
- Renewal appends a closed period row and advances dates; it never overwrites
  prior terms and never takes payment in Phase 1.
- Customer UIs must not offer Renew unless a real payment path exists.

## Creation triggers

| Trigger | Creates |
| --- | --- |
| Plan-request enablement | `MANAGED_PLAN` item + first period |
| Website create with `activatePlan: true` | Same |
| Staff activate linked plan / replace active plan | Close prior active plan item when replacing; create new |
| Service assignment create | `COMPLEMENTARY_SERVICE` item + first period |
| Staff record terms (backfill) | Item for already-active plan with no commercial row |

## Related

- Phase 1: [`../phase-1-application-features.md`](../phase-1-application-features.md) §21
- Customer dashboard billing hub PRD:
  [`../customer-dashboard-billing-prd.md`](../customer-dashboard-billing-prd.md)
- Plan enablement: [`../ux-flows/admin-plan-requests.md`](../ux-flows/admin-plan-requests.md)
- Website renew/replace: [`../ux-flows/admin-servers-websites-agents.md`](../ux-flows/admin-servers-websites-agents.md)
