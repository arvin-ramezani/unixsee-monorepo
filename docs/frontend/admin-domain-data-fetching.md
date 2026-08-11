# Admin domain data fetching (Layer 2)

> **Status:** Accepted  
> **Owner:** Frontend  
> **Last verified:** 2026-08-10  
> **Applies to:** `admin-panel/`  
> **Depends on:** [`admin-data-fetching.md`](./admin-data-fetching.md) (Layer 1 —
> session & transport)

Conventions for wiring **staff** Nest APIs (`/api/v1/admin/*` and related) after
auth works. Admin product UX is independent of the customer dashboard — only
the fetch/auth strategy matches
[`client-domain-data-fetching.md`](./client-domain-data-fetching.md).

Do not invent Nest routes; start from
[`../backend/modules-and-routes.md`](../backend/modules-and-routes.md) and
[`../backend/contracts/`](../backend/contracts/). Prefer accepted admin
contracts when present; if a surface has routes but no contract yet, document
or extend the contract before inventing response shapes in the UI.

TanStack Query is **specified here** and added when the first interactive
admin pane needs it. Until then, prefer RSC + `server-fetch`.

## Transport decision table

| Need | Use | Entry |
|---|---|---|
| Initial authenticated page / shell data | Server Component + `server-fetch` | `lib/api/server-fetch.ts` |
| Interactive list filters, polling, shared client cache | TanStack Query + `client-fetch` | Query hook → `lib/api/client-fetch.ts` |
| Form mutation that should stay on the server boundary | Server Action + `server-action-fetch` | `src/actions/<domain>/` |
| Public unauthenticated Nest call | `public-fetch` | staff login only |
| Auth / refresh / cookies | `lib/auth/*` only | never inside feature components |

**Defaults**

- First paint for an admin route: RSC `server-fetch` with `cache: "no-store"`.
- Add Query only when the UI is interactive after load (filters, refetch,
  optimistic UI).
- Mutations that set cookies or need privileged server context: Server Actions.
- Never put Bearer / refresh / JWT decode in page components beyond calling
  `client-fetch`.

## Nest `ApiResponse` and error mapping

Same envelope as customer APIs:

```ts
type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
};
```

| Condition | Admin UI behaviour |
|---|---|
| `success === true` and `data` present | Map to a safe DTO before Client Components |
| `success === false` / `error` set | Map `error.code` → UI copy; keep authz non-enumerating |
| HTTP 401 after refresh retry | Signed out; redirect to staff sign-in |
| HTTP 403 | Permission-denied / capability-locked UI |
| HTTP 404 | Not-found / empty for that resource |
| HTTP 429 | Rate-limit message; cooldown |
| Network / parse failure | Generic unavailable message |

Prefer Nest `error.code` over raw `message`. Do not surface stack traces,
URLs, or token material.

## Query keys, defaults, dehydrate

When introducing `@tanstack/react-query`:

```ts
["admin", "tickets", "list", { status, page }] as const
["admin", "tickets", "detail", ticketId] as const
["admin", "users", "me"] as const
```

Prefix with `"admin"` so keys never collide with customer mental models if
engineers compare both apps.

| Option | Value |
|---|---|
| `staleTime` | `10_000` for ops lists (tune with evidence) |
| `retry` | `1` for GETs; `0` for mutations |
| `refetchOnWindowFocus` | `true` for triage queues; `false` for static settings |

Prefetch / dehydrate follows the same pattern as client Layer 2. Auth stays
outside Query: hooks call `client-fetch` only.

## Boot reseed (Zustand access token)

Same rule as customer Layer 2: hard reload clears memory access token; cookies
remain. `AuthStoreProvider` reseeds via admin `POST /api/auth/refresh` when
memory is empty. Do not reseed from `localStorage`. Do not return refresh
tokens to JS.

## Per-feature checklist

Before wiring a Nest domain into `admin-panel/`:

1. Confirm the **admin** route in
   [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
   (`/api/v1/admin/...`).
2. Read or add a matching contract under
   [`../backend/contracts/`](../backend/contracts/) when the response shape is
   not already Accepted.
3. Choose transport from the table above (RSC first unless interactivity needs
   Query).
4. Add typed DTO / mapper; strip fields Client Components must not see
   (secrets, internal-only fields product forbids).
5. Fetch only through `server-fetch` / `client-fetch` / Action helpers.
6. Map errors with `map-api-error` + staff UI copy.
7. Add loading / empty / denied / error states consistent with the admin UX
   flow for that domain.
8. Keep fixtures honest for any surface still unwired
   ([`../../admin-panel/docs/development/data.md`](../../admin-panel/docs/development/data.md)).
9. Do not reuse `client/` domain modules, forms, or customer ticket contracts
   for staff queues — admin UX and `/admin` DTOs are separate even when the
   underlying Nest entity is shared.

## Related

- Layer 1 session: [`admin-data-fetching.md`](./admin-data-fetching.md)
- Customer Layer 2 (pattern reference only):
  [`client-domain-data-fetching.md`](./client-domain-data-fetching.md)
- ADRs: [0010](../architecture/decisions/0010-client-hybrid-auth-data-fetching.md),
  [0012](../architecture/decisions/0012-admin-nest-auth-integration.md)
- Product admin UX: [`../product/README.md`](../product/README.md)
- Backend contracts: [`../backend/contracts/README.md`](../backend/contracts/README.md)
