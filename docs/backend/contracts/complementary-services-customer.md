# Customer complementary-service requests contract

> Status: Accepted  
> Last verified: 2026-08-24

## Ownership

NestJS owns validation, authorization, normalization, persistence, acceptance,
Website resolution, assignment, and activation. Next.js is a presentation and
Server Action boundary. No customer Website-create route is introduced.

## Create request

`POST /api/v1/complementary-service-requests` is authenticated.

Request body:

| Field                  | Rule                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `catalogItemId`        | Published catalog item UUID                                         |
| `websiteId`            | Optional UUID; mutually exclusive with `websiteDomain`              |
| `websiteDomain`        | Optional domain/URL-like input; mutually exclusive with `websiteId` |
| `engagementPreference` | `ONE_TIME`, `RECURRING`, or `NOT_SURE`                              |
| `title`                | 1–100 characters                                                    |
| `description`          | 20–800 characters                                                   |
| `scope`                | Optional JSON object                                                |

The authenticated User supplies `contactName`, phone, and email snapshots.
A full name and at least one of phone/email are required. URL-like domain input
is normalized to a lowercase hostname without leading `www.`.

### Creation rules

- Existing Website: require owner/admin membership; store Website, tenant,
  domain, and coverage snapshots.
- Typed domain with no matching Website: create only the request.
- Typed domain matching a Website in an authorized tenant: link the existing
  Website.
- Typed domain matching another tenant: return generic `409 CONFLICT` and
  perform no writes.
- A viewer-only membership cannot create a request by bypassing the Website
  selector.

## Staff acceptance

`POST /api/v1/admin/complementary-service-requests/:id/accept` accepts an
optional `Idempotency-Key` header.

- Existing Website: preserve link and coverage.
- Typed domain with tenant: normalize and recheck; reuse the same-tenant Website
  or create one planless `EXTERNAL_INFRASTRUCTURE` Website.
- Typed domain without tenant: accept domain-only and set
  `DEFERRED_NO_TENANT`.
- Cross-tenant conflict: generic `409 CONFLICT`; request and Website writes roll
  back.
- Repeated acceptance returns the accepted/later request and does not create a
  second Website.

## Assignment and authorization

`POST /api/v1/admin/service-assignments` requires an accepted request.

- Assignment is separate from request acceptance.
- A domain-only request may activate with
  `NOT_AUTHORIZED_AT_ACTIVATION`.
- Tenant authorization later reconciles deferred requests, reusing or creating
  one planless external Website and linking the request.
- Acceptance, reconciliation, and assignment never set `planId` or
  `planActivatedAt` and never change management coverage.

## Website coverage

`Website.managementCoverage` is independent of plan, plan activation, VPS,
agent, telemetry, lifecycle, and complementary-service status:

- `UNIXSEE_MANAGED`
- `EXTERNAL_INFRASTRUCTURE`
- `UNCLASSIFIED` (migration only)

Website list consumers must treat infrastructure, monitoring, backup, and
managed operations as not applicable for external Websites.
