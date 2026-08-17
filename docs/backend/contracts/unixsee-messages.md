# Unixsee messages API contract

> **Status:** Proposed
>
> **Audiences:** `/api/v1/unixsee-messages/*` (customer JWT) and
> `/api/v1/admin/unixsee-messages/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/unixsee-messages-prd.md`](../../product/unixsee-messages-prd.md)
>
> **Last verified:** 2026-08-16

One-way tenant-targeted staff → customer messages (پیام‌های یونیکسی).
**Not** Notifications (News) and **not** ticket thread messages.

## Content model

Single-language body:

| Field | Rules |
|---|---|
| `title` | Required non-empty string |
| `body` | Required non-empty string |
| `contentLocale` | `fa` \| `en` — language the message was written in |

Admin compose shows `recipientPreferredLocale` from the tenant **OWNER**
`User.locale` (default `fa`) so staff know which language to write.

## Lifecycle

```text
DRAFT ──publish──► PUBLISHED ──withdraw──► WITHDRAWN
              ▲
              └── edit (draft or published)
```

Withdrawn messages are hidden from the customer audience.

## Customer routes

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/unixsee-messages` | `{ items, total, hasUnread }` — published only; `hasUnread` is a boolean presence flag (no count) |
| GET | `/api/v1/unixsee-messages/:id` | Published + tenant membership; attachments include `downloadUrl` when signing succeeds |
| GET | `/api/v1/unixsee-messages/:id/attachments/:attachmentId/download` | Signed download URL |
| POST | `/api/v1/unixsee-messages/:id/read` | Upsert per-user read receipt |

Item fields include `isRead`, `links[]`, `attachments[]` (`storageKey`,
optional `downloadUrl` from Supabase via `StorageModule`), optional `website`.

## Admin routes

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/admin/unixsee-messages` | Optional `status`, `tenantId`, `skip`, `take` |
| GET | `/api/v1/admin/unixsee-messages/tenants/:tenantId/compose-context` | Preferred locale + websites |
| GET | `/api/v1/admin/unixsee-messages/:id` | Includes preferred locale fields + signed attachment URLs |
| POST | `/api/v1/admin/unixsee-messages` | Create draft (no attachment metadata on body) |
| PATCH | `/api/v1/admin/unixsee-messages/:id` | Edit draft/published (does not replace attachments) |
| POST | `/api/v1/admin/unixsee-messages/:id/publish` | |
| POST | `/api/v1/admin/unixsee-messages/:id/withdraw` | Published only |
| POST | `/api/v1/admin/unixsee-messages/:id/attachments/upload` | Multipart `file` → Supabase |
| GET | `/api/v1/admin/unixsee-messages/:id/attachments/:attachmentId/download` | Signed download URL |
| DELETE | `/api/v1/admin/unixsee-messages/:id/attachments/:attachmentId` | Delete row + object |

Create/update body may include `links[]` (`label?`, `url`,
`kind: external|dashboard`). Do **not** send attachment metadata on create/update —
upload bytes after save via the multipart route.

### Attachment limits

- Max **5** attachments per message
- Max **5 MB** per file
- Allowed types: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`
- Storage key shape: `unixsee-messages/{messageId}/{uuid}/{safeName}`
