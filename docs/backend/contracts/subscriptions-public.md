# Public newsletter subscriptions API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/public/subscriptions`
>
> **Product:** Phase architecture Content & Leads —
> [`../../architecture/overview.md`](../../architecture/overview.md) and
> `backend/docs/unixsee-phase-system-architecture.md` §6.8
>
> **Last verified:** 2026-08-27

Public newsletter intake from the client footer (and future surfaces). Nest owns
subscriber persistence for Phase 1. Mailing-provider / WordPress sync is
deferred; do not treat email delivery as the source of truth.

## Resources

### Create subscription

`POST /api/v1/public/subscriptions`

Auth: `@Public()` (no JWT).

Body:

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | email | yes | Trimmed, lowercased, ≤254 |
| `locale` | `"fa" \| "en"` | no | Preference for confirmation copy |
| `source` | string ≤80 | no | Intake surface (e.g. `footer`) |

Response `201`:

| Field | Type | Meaning |
|---|---|---|
| `id` | uuid | Subscription row id |
| `email` | string | Normalized email |
| `status` | `"ACTIVE"` | Active subscription |
| `locale` | string \| null | Stored locale |
| `source` | string \| null | Stored source |
| `consentedAt` | ISO datetime | Consent timestamp |
| `created` | boolean | `true` on first subscribe; `false` on reactivation |

### Already subscribed

Response `409`:

| Field | Value |
|---|---|
| `error.code` | `ALREADY_SUBSCRIBED` |
| `success` | `false` |

Returned when an **ACTIVE** row already exists for the email. Client maps this
to the existing `alreadySubscribed` toast.

### Reactivation

If a prior row exists with status `UNSUBSCRIBED`, Nest reactivates it
(`ACTIVE`, new `consentedAt`, clears `unsubscribedAt`) and returns `201` with
`created: false`. Unsubscribe HTTP is deferred.

## Persistence enums (Prisma)

| Enum | Values |
|---|---|
| `NewsletterSubscriptionStatus` | `ACTIVE`, `UNSUBSCRIBED` |

Table: `newsletter_subscriptions`.

## Client rules

1. Persist via this endpoint **before** any confirmation email.
2. Map `ALREADY_SUBSCRIBED` → informational already-subscribed UI.
3. Email notification failure must not roll back a successful subscribe.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Errors: [`api-errors.md`](./api-errors.md)
- Audit gap closed: FUNC-07 in
  [`../../quality/audits/2026-08-22-production-readiness-audit.md`](../../quality/audits/2026-08-22-production-readiness-audit.md)
