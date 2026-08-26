# API errors contract (shared envelope)

> **Status:** Accepted
>
> **Audience:** All browser-facing Nest routes (`/api/v1/public/*`, `/api/v1/*`, `/api/v1/admin/*`)
>
> **Last verified:** 2026-08-25

Canonical error shape for every Nest HTTP failure. Domain contracts link here
instead of restating the envelope.

## Response envelope

Success and failure share the same top-level shape:

```ts
type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
  meta?: unknown;
};

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};
```

| Field | Role |
|---|---|
| `success` | `false` on any handled failure |
| `statusCode` | HTTP status (mirrors response status) |
| `message` | Short summary for logs/debug; **not** the primary UI string |
| `error.code` | **Authoritative** stable machine code for UI mapping |
| `error.message` | Optional English/debug text; clients must not display by default |
| `error.details` | Structured extras (e.g. validation field list) |

Implementation: `backend/src/common/http/api-response.types.ts`,
`ApiResponseBuilder.error`, `GlobalExceptionFilter`.

## Contract rules

1. **Every business failure** must set `error.code` (not HTTP status alone).
2. **Codes are stable** across releases; rename only with a migration note.
3. **Localization lives in frontends** — `client/` (EN/FA via next-intl) and
   `admin-panel/` (FA only). Map `error.code` → UI copy; do not invent messages
   from status codes when a code is present.
4. **`error.message` is not user-facing** unless a product doc explicitly says
   otherwise (none today).
5. **Auth failures stay non-enumerating** — same codes/copy for invalid
   credentials vs missing user where product requires it.
6. **Validation** uses `error.code: "VALIDATION_ERROR"` and optional
   `error.details` for field-level data.

## Global codes

These may appear on any route:

| `error.code` | Typical HTTP | UI key (frontend map) |
|---|---|---|
| `BAD_REQUEST` | 400 | `validation` |
| `VALIDATION_ERROR` | 400 | `validation` |
| `UNAUTHORIZED` | 401 | `unauthorized` |
| `FORBIDDEN` | 403 | `forbidden` |
| `NOT_FOUND` | 404 | `notFound` |
| `CONFLICT` | 409 | `conflict` |
| `TOO_MANY_REQUESTS` | 429 | `rateLimited` |
| `RATE_LIMITED` | 429 | `rateLimited` (via status fallback) |
| `INTERNAL_SERVER_ERROR` | 500 | `generic` |
| `HTTP_EXCEPTION` | varies | `generic` |

Domain-specific codes are documented on their route contract (e.g.
[`plan-requests-public.md`](./plan-requests-public.md) → `ACCOUNT_EXISTS`).

## Non-enumerating auth codes

Two codes are deliberately coarse and must stay that way (rule 5 above):

| `error.code` | HTTP | Emitted by | Why it is coarse |
|---|---|---|---|
| `OTP_VERIFICATION_FAILED` | 401 | every OTP verify route | One code and message for unknown target, wrong code, expired, already consumed, and attempts exhausted, so the response is not an oracle for which condition held |
| `RATE_LIMITED` | 429 | OTP request + verify routes | Does not name the rule that tripped, so a caller cannot learn whether the address or the target was throttled |

Do not add reason-carrying variants of these, and do not surface a distinct UI
state per underlying cause — clients cannot tell them apart by design.

## Frontend handling

| App | Locale | Map helper | User message | POST mutation UX |
|---|---|---|---|---|
| `client/` | EN + FA | `lib/api/map-api-error.ts` | `ApiErrors.*` (next-intl) | `toast.error` via `lib/api/toast-api-error.ts` |
| `admin-panel/` | FA only | `lib/api/map-api-error.ts` | `STAFF_API_ERROR_MESSAGES` | `toast.error` via `lib/api/toast-api-error.ts` |

Flow:

1. Parse Nest JSON as `ApiResponse<T>`.
2. `mapApiError(response)` — **code first**, then HTTP status fallback.
3. Resolve localized string from the mapped key (never from raw `error.message`).
4. On failed **POST/PUT/PATCH/DELETE** from a Client Component, show the string in a toast.
5. Keep **inline** errors for client-side validation and special flows (e.g.
   `ACCOUNT_EXISTS` panel on public plan request).

Layer 2 docs: [`../../frontend/client-domain-data-fetching.md`](../../frontend/client-domain-data-fetching.md),
[`../../frontend/admin-domain-data-fetching.md`](../../frontend/admin-domain-data-fetching.md).

## Examples

**409 — account guard (public plan request)**

```json
{
  "statusCode": 409,
  "success": false,
  "message": "The request conflicts with the current state.",
  "data": null,
  "error": {
    "code": "ACCOUNT_EXISTS",
    "message": "The request conflicts with the current state."
  }
}
```

Client maps `ACCOUNT_EXISTS` → dedicated UX (sign-in panel), not a generic toast.

**400 — validation**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Bad request",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Bad request",
    "details": {
      "messages": ["contactPhone must be a valid phone number"]
    }
  }
}
```

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Contract index: [`./README.md`](./README.md)
