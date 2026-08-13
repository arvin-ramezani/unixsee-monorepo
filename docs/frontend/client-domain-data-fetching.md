# Client domain data fetching (Layer 2)

> **Status:** Accepted  
> **Owner:** Frontend  
> **Last verified:** 2026-08-10  
> **Applies to:** `client/`  
> **Depends on:** [`client-data-fetching.md`](./client-data-fetching.md) (Layer 1 — session & transport)

Conventions for wiring **domain** Nest APIs (tickets, websites, plans, …) after
auth works. Do not invent Nest routes; start from
[`../backend/modules-and-routes.md`](../backend/modules-and-routes.md) and
[`../backend/contracts/`](../backend/contracts/).

TanStack Query is **specified here** and added when the first interactive
client pane needs it. Until then, prefer RSC + `server-fetch`.

## Transport decision table

| Need | Use | Entry |
|---|---|---|
| Initial authenticated page / shell data | Server Component + `server-fetch` | `lib/api/server-fetch.ts` |
| Interactive list filters, polling, shared client cache | TanStack Query + `client-fetch` | Query hook → `lib/api/client-fetch.ts` |
| Form mutation that should stay on the server boundary | Server Action + `server-action-fetch` or `public-fetch` | `src/actions/<domain>/` |
| Public unauthenticated Nest call | `public-fetch` | auth OTP, public catalogs |
| Auth / refresh / cookies | `lib/auth/*` only | never inside feature components |

**Defaults**

- First paint for a dashboard route: RSC `server-fetch` with `cache: "no-store"`.
- Add Query only when the UI is interactive after load (filters, refetch, optimistic UI).
- Mutations that set cookies or need privileged server context: Server Actions.
- Never put Bearer / refresh / JWT decode in page components or Query `queryFn` wrappers beyond calling `client-fetch`.

## Nest `ApiResponse` and error mapping

Canonical failure contract: [`../backend/contracts/api-errors.md`](../backend/contracts/api-errors.md).

Nest returns:

```ts
type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
};
```

Typed in [`../../client/src/types/auth.types.ts`](../../client/src/types/auth.types.ts).

| Condition | Client behaviour |
|---|---|
| `success === true` and `data` present | Use `data` (map to a safe DTO before Client Components) |
| `success === false` / `error` set | `mapApiError` (**code first**) → `ApiErrors.*` i18n key |
| Failed POST/PUT/PATCH/DELETE from Client Component | `toast.error` with resolved message |
| HTTP 401 after refresh retry | Treat as signed out; redirect to sign-in |
| HTTP 403 | Permission-denied UI; do not leak tenant existence |
| HTTP 404 | Not-found / empty state for that resource |
| HTTP 429 | Rate-limit message; disable retry until cooldown |
| Network / parse failure | `ApiErrors.unavailable` |

Rules:

- **`error.code` is authoritative** — map to [`ApiErrors`](../../client/src/messages/en.json)
  (EN/FA). Do not display raw `error.message` or invent copy from HTTP status when a code exists.
- Special flows (e.g. `ACCOUNT_EXISTS` panel) may bypass toast when product UX requires it.
- Client-side validation stays inline on fields; Nest validation uses `VALIDATION_ERROR` + toast.
- Do not surface stack traces, URLs, or token material.
- Helpers: [`map-api-error.ts`](../../client/src/lib/api/map-api-error.ts),
  [`resolve-api-error-message.ts`](../../client/src/lib/api/resolve-api-error-message.ts),
  [`toast-api-error.ts`](../../client/src/lib/api/toast-api-error.ts).

## Query keys, defaults, dehydrate

When introducing `@tanstack/react-query`:

**Keys** (stable, serializable tuples):

```ts
["tickets", "list", { status, page }] as const
["tickets", "detail", ticketId] as const
["users", "me"] as const
```

**Defaults** (starting point; tune per feature with evidence):

| Option | Value |
|---|---|
| `staleTime` | `10_000` (10s) for dashboard lists |
| `retry` | `1` for GETs; `0` for mutations |
| `refetchOnWindowFocus` | `true` for live ops panes; `false` for static settings |

**Prefetch / dehydrate**

1. Server Component: `const queryClient = getQueryClient()` (per-request on server).
2. `await queryClient.prefetchQuery({ queryKey, queryFn })` using server-side
   Nest access (prefer calling the same mapper used by hooks, with
   `server-fetch` inside a server-only `queryFn` variant—or prefetch DTO then
   `setQueryData`).
3. `dehydrate(queryClient)` → `<HydrationBoundary state={...}>`.
4. Client hook uses the same `queryKey` so the first client fetch is a cache hit.

Auth stays outside Query: hooks call `client-fetch` only.

## Boot reseed (Zustand access token)

HTTP-only cookies survive hard reload; the Zustand access token does not.

On app mount, `AuthStoreProvider` reseeds via `POST /api/auth/refresh` when
memory has no access token. The Route Handler no-ops cheaply without a refresh
cookie (guests). With a valid refresh cookie it sets cookies and returns
`accessToken` + `serverTimeInSeconds` only.

Do not reseed from `localStorage`. Do not return refresh tokens to JS.

## Per-feature checklist

Before wiring a Nest domain into `client/`:

1. Confirm the route in [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md).
2. Read the matching contract under [`../backend/contracts/`](../backend/contracts/)
   (e.g. tickets → [`../backend/contracts/tickets-customer.md`](../backend/contracts/tickets-customer.md)).
3. Choose transport from the table above (RSC first unless interactivity needs Query).
4. Add typed DTO / mapper; strip fields Client Components must not see.
5. Implement fetch through `server-fetch` / `client-fetch` / Action helpers—no ad hoc `fetch` to Nest from components.
6. Map errors with `map-api-error` → `ApiErrors` i18n; toast failed mutations.
7. Add loading / empty / denied / error UI states.
8. Keep mocks honest for any surface still unwired.
9. Do not add admin Nest wiring here—use
   [`admin-domain-data-fetching.md`](./admin-domain-data-fetching.md) and ADR 0012.

## Related

- Layer 1 session: [`client-data-fetching.md`](./client-data-fetching.md)
- ADRs: [`../architecture/decisions/0010-client-hybrid-auth-data-fetching.md`](../architecture/decisions/0010-client-hybrid-auth-data-fetching.md),
  [`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md)
- Next.js: [`nextjs.md`](./nextjs.md)
- Backend contracts index: [`../backend/contracts/README.md`](../backend/contracts/README.md)
