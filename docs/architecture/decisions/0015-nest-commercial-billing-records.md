# ADR 0015: Nest-owned commercial billing records

- Status: Accepted
- Date: 2026-08-27
- Owners: Backend, Product, Admin, Client

## Context

Phase 1 needs agreed amounts, billing intervals, and renewal dates for managed
plans and complementary services without a payment provider. Website activation
and service assignments already exist in Nest, but commercial fields lived only
in admin/client fixtures. An older design note suggested WordPress/WooCommerce
own billing; that conflicts with Nest as the control-plane authority.

## Decision

NestJS owns commercial billing records in PostgreSQL:

- `BillingItem` — current agreement for a managed plan or complementary
  assignment on a website.
- `BillingPeriodRow` — append-only period history so renewals do not erase
  prior terms.

Creation happens in the same transaction as plan activation or service
assignment activation. Staff renew, replace-plan, cancel/complete, and
record-terms are Nest mutations. Customers get read-only website billing.
Phase 1 does **not** integrate a payment provider, invoices, or customer
self-service renew that collects money.

Do not use WordPress as the billing source of truth.

## Consequences

- Plan enablement and assignment create require commercial terms (`amount`,
  `interval`, etc.).
- Admin fixture renew/replace must call Nest.
- Client must stop inventing billing dates/amounts.
- Deferred Phase 1 payment checkout remains out of scope until a later ADR.

## Related

- Product note: [`../../product/notes/commercial-records.md`](../../product/notes/commercial-records.md)
- Contract: [`../../backend/contracts/billing.md`](../../backend/contracts/billing.md)
