# Public contact messages API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/public/contact-messages`
>
> **Product:** Public contact-us form intake
>
> **Last verified:** 2026-08-27

Public contact-us message intake from the client marketing site. Nest owns
message persistence for Phase 1. Staff inbox listing is implemented under the
admin contract; notification email remains deferred. Do not treat email
delivery as the source of truth.

## Resources

### Create contact message

`POST /api/v1/public/contact-messages`

Auth: `@Public()` (no JWT).

Body:

| Field            | Type           | Required | Rules                                                                                                                            |
| ---------------- | -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `subject`        | enum           | yes      | One of `managedServer`, `migrationOptimization`, `woocommerceSupport`, `seo`, `graphicDesign`, `productDataEntry`, `socialMedia` |
| `fullName`       | string         | yes      | Trimmed, 1–200                                                                                                                   |
| `email`          | email          | yes      | Trimmed, lowercased, ≤254                                                                                                        |
| `phone`          | string         | yes      | Trimmed; spaces/`()`/`-` stripped; 1–32                                                                                          |
| `website`        | string         | no       | Trimmed; empty omitted; ≤500                                                                                                     |
| `activityBasin`  | string         | no       | Trimmed; empty omitted; ≤200                                                                                                     |
| `message`        | string         | yes      | Trimmed; 20–4000                                                                                                                 |
| `attachmentKeys` | string[]       | no       | ≤5 keys from `POST /api/v1/uploads/public` `storageKey`                                                                          |
| `locale`         | `"fa" \| "en"` | no       | Preference for future staff/customer copy                                                                                        |
| `source`         | string ≤80     | no       | Intake surface (default `contact-us`)                                                                                            |

Response `201`:

| Field       | Type         | Meaning                |
| ----------- | ------------ | ---------------------- |
| `id`        | uuid         | Contact message row id |
| `status`    | `"NEW"`      | Initial status         |
| `createdAt` | ISO datetime | Created timestamp      |

## Attachments

1. Client uploads each file via `POST /api/v1/uploads/public` first.
2. Pass returned `storageKey` values in `attachmentKeys`.
3. Public upload limits (Nest): ≤5 MB; MIME allowlist image/png, image/jpeg,
   image/webp, application/pdf, text/plain, text/csv, application/zip (and
   `application/x-zip-compressed`). Video is not accepted on this path.

## Persistence enums (Prisma)

| Enum                    | Values                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `ContactMessageSubject` | `managedServer`, `migrationOptimization`, `woocommerceSupport`, `seo`, `graphicDesign`, `productDataEntry`, `socialMedia` |
| `ContactMessageStatus`  | `NEW`, `READ`, `ARCHIVED`                                                                                                 |

Table: `contact_messages`. Phase 1 create always stores `NEW`. Staff
transitions to `READ` / `ARCHIVED` use
[`contact-messages-admin.md`](./contact-messages-admin.md).

## Client rules

1. Persist via this endpoint after optional uploads succeed.
2. Do not treat local validation alone as submission success.
3. Upload or create failure must show the contact form error toast and must not
   reset the form.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Errors: [`api-errors.md`](./api-errors.md)
- Uploads: `POST /api/v1/uploads/public` in [`../modules-and-routes.md`](../modules-and-routes.md)
