# Ticket service categories

> **Status:** Accepted
>
> **Last verified:** 2026-08-11
>
> **Used by:** [`tickets-customer.md`](./tickets-customer.md), customer new-ticket
> form, admin ticket queues, Nest `tickets` module

Canonical service taxonomy for support tickets. This is **not** the commercial
complementary-service catalog (`ServiceCatalogItem`). Ticket services classify
the support request; complementary catalog items sell scoped engagements.

## Enum (API / Prisma)

Wire values are `SCREAMING_SNAKE_CASE`. Persist as Prisma enum
`TicketServiceCategory`.

| Value | English | Persian (customer UI) |
|---|---|---|
| `MANAGED_SERVER` | Managed server | سرور مدیریت‌شده |
| `MIGRATION_OPTIMIZATION` | Migration and optimization | انتقال و بهینه‌سازی |
| `WOOCOMMERCE_SUPPORT` | WooCommerce support | پشتیبانی تخصصی ووکامرس |
| `SEO` | SEO | سئو |
| `GRAPHIC_DESIGN` | Graphic design | طراحی گرافیک |
| `PRODUCT_DATA_ENTRY` | Product data entry | ورود اطلاعات محصول |
| `SOCIAL_MEDIA_SUPPORT` | Social media support | پشتیبانی شبکه‌های اجتماعی |

## Client / fixture aliases

Dashboard fixtures currently use snake_case. Map 1:1:

| API | Client fixture (`TicketService`) | Admin fixture (`TICKET_SERVICE`) |
|---|---|---|
| `MANAGED_SERVER` | `managed_server` | `MANAGED_SERVER` |
| `MIGRATION_OPTIMIZATION` | `migration_optimization` | `MIGRATION_OPTIMIZATION` |
| `WOOCOMMERCE_SUPPORT` | `woocommerce_support` | `WOOCOMMERCE_SUPPORT` |
| `SEO` | `seo` | `SEO` |
| `GRAPHIC_DESIGN` | `graphic_design` | `GRAPHIC_DESIGN` |
| `PRODUCT_DATA_ENTRY` | `product_data_entry` | `PRODUCT_DATA_ENTRY` |
| `SOCIAL_MEDIA_SUPPORT` | `social_media_support` | `SOCIAL_MEDIA_SUPPORT` |

Nest owns the API enum. Frontends may keep snake_case locally until they consume
Nest responses directly; they must not add categories outside this table.

## Website association rules

When creating a ticket, `websiteId` is **optional for every service**. Customers
may associate a website when it helps triage; omit it otherwise.

`websiteId`, when present, must belong to a website the caller’s tenant can
access. Reject otherwise with a non-enumerating authorization error.

Catalog items still expose `websiteRequired` (always `false` in Phase 1) so
clients can keep a single form code path.

Source: Nest `ticket-service-catalog.ts` + customer create validation in
`tickets.service.ts`.

## Catalog endpoint

Customers need a stable list for the new-ticket select (and filters):

`GET /api/v1/tickets/services`

Response `data`:

```json
{
  "items": [
    {
      "code": "MANAGED_SERVER",
      "websiteRequired": false
    }
  ]
}
```

Labels are resolved by locale on the client (`Tickets.services.*`) or may later
include `nameFa` / `nameEn` if Nest starts owning copy. Phase 1 may return codes
+ `websiteRequired` only.

Admin does not need a separate catalog route in Phase 1; reuse the same enum.

## Ownership

- Single source for Nest: Prisma `TicketServiceCategory` + tickets module.
- Do not fork a second list inside complementary-services.
- Do not invent ticket categories that conflict with Phase 1 §15.1.
