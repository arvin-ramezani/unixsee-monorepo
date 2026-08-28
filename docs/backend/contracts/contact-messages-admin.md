# Admin contact messages API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/contact-messages/*` (staff JWT, `ADMIN` / `OPERATOR`)
>
> **Product:** [`../../product/ux-flows/admin-contact-messages.md`](../../product/ux-flows/admin-contact-messages.md)
>
> **Public counterpart:** [`contact-messages-public.md`](./contact-messages-public.md)
>
> **Last verified:** 2026-08-27

Staff inbox for public contact-us intake. Nest owns persistence and status
transitions. Reply / notification email remain out of scope for this contract.

Auth: staff access JWT + Nest `@Roles(ADMIN, OPERATOR)`.

## Status vocabulary

| API value  | Staff FA label | Meaning                 |
| ---------- | -------------- | ----------------------- |
| `NEW`      | جدید           | Unreviewed              |
| `READ`     | خوانده‌شده     | Staff acknowledged      |
| `ARCHIVED` | بایگانی        | Triage closed; retained |

Allowed transitions:

- `NEW` → `READ` | `ARCHIVED`
- `READ` → `ARCHIVED`
- `ARCHIVED` → `READ` (unarchive)

## Resources

### List contact messages

`GET /api/v1/admin/contact-messages`

| Param    | Type                   | Notes           |
| -------- | ---------------------- | --------------- |
| `status` | `ContactMessageStatus` | Optional filter |
| `skip`   | int ≥ 0                | Default `0`     |
| `take`   | int 1–100              | Default `50`    |

Response `data`:

```json
{
  "items": [
    {
      "id": "uuid",
      "subject": "managedServer",
      "fullName": "…",
      "email": "…",
      "phone": "…",
      "website": null,
      "activityBasin": null,
      "locale": "fa",
      "source": "contact-us",
      "status": "NEW",
      "attachmentCount": 0,
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "total": 1
}
```

List items omit `message` and attachment download URLs.

### Get contact message

`GET /api/v1/admin/contact-messages/:id`

Same fields as a list item, plus:

```json
{
  "message": "…",
  "attachments": [
    {
      "storageKey": "public/…",
      "downloadUrl": "https://… or null"
    }
  ]
}
```

`downloadUrl` is a short-lived signed URL when signing succeeds; otherwise
`null` while `storageKey` remains.

### Update status

`PATCH /api/v1/admin/contact-messages/:id/status`

Body:

```json
{ "status": "READ" }
```

Response `data`: full detail payload (same as GET).

Invalid transitions → `400` validation. Missing id → `404`.

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- UX flow: [`../../product/ux-flows/admin-contact-messages.md`](../../product/ux-flows/admin-contact-messages.md)
- Public create: [`contact-messages-public.md`](./contact-messages-public.md)
- Errors: [`api-errors.md`](./api-errors.md)
