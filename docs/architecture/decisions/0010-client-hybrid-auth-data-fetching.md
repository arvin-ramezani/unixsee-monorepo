# 0010. Client hybrid auth and data fetching

> **Status:** Accepted
>
> **Date:** 2026-08-10
>
> **Related:** Implementation authorized by [0011](./0011-client-nest-auth-integration.md)
> (which supersedes [0003](./0003-ui-only-phase-boundaries.md))

## Context

The public `client/` app needs a durable design for authenticated NestJS data
access after sign-in/sign-up: short-lived access tokens, refresh continuity,
Server Component prefetch, and interactive dashboard fetches (React Query).

Two patterns were considered:

- **Hybrid:** HTTP-only cookies for both access and refresh; Zustand holds a
  memory-only access token for browser → Nest `Authorization` Bearer calls;
  Next.js owns a same-origin refresh Route Handler.
- **Cookie-only BFF:** Browser never sees access tokens; all authenticated
  traffic stays on Next.js Server Components, Server Actions, or same-origin
  proxies.

[ADR 0003](./0003-ui-only-phase-boundaries.md) still forbids live Nest/auth
wiring in Next.js apps. This ADR records the **chosen design** so agents and
engineers do not invent conflicting transports when integration is later
allowed. It does **not** authorize implementation while 0003 remains Accepted.

NestJS remains the token issuer and auth authority
([`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md)).
Product UX stays OTP-first with phone default
([`../../product/ux-flows/client-auth.md`](../../product/ux-flows/client-auth.md));
email is the first *documented* integration slice, not a product UX rewrite.

## Decision

Adopt the **hybrid** model for `client/` when Nest integration is allowed:

1. **Token storage**
   - Refresh token: HTTP-only cookie only; never readable by JavaScript; never
     returned in refresh JSON bodies.
   - Access token: HTTP-only cookie for server/RSC/proxy **and** a memory-only
     Zustand copy for browser Bearer calls. Never `localStorage` /
     `sessionStorage`.
   - Optional clock-offset cookie (or equivalent) so expiry buffers use Nest
     time, not only the browser clock.

2. **Runtime-split auth helpers** (not one isomorphic `auth-client`):
   - Browser: `client-auth` + `refresh-manager` (promise lock) + Zustand.
   - RSC / layouts: `server-auth` (cookie read; no Zustand).
   - Server Actions: `server-action-auth` (cookie read/refresh/write).
   - Browser refresh BFF: `app/api/auth/refresh` Route Handler.
   - Shared: `jwt` via `jose` **decode** for expiry / “expires soon” only—never
     as authorization.

3. **Refresh strategy**
   - Primary: proactive refresh before authenticated client requests when the
     access token is within an expiry buffer (typical 30s–2m).
   - Secondary: one 401 → refresh → retry through the same refresh lock.
   - Deduplicate concurrent refreshes with a single in-flight promise.

4. **Fetch boundaries**
   - `client-fetch`: obtain a valid access token, attach `Authorization`, call
     Nest. Keep refresh orchestration in auth helpers, not in React Query.
   - `server-fetch`: cookie-based access for Server Components.
   - `public-fetch`: unauthenticated auth endpoints (login/register/OTP).
   - React Query owns cache/sync for interactive dashboard state only—not auth.

5. **Proxy (`proxy.ts`)**
   - Optimistic protection for dashboard (and similar) routes via cookie
     presence / light session checks; optional light refresh on protected
     navigations.
   - Not a substitute for authorization inside Server Actions, Route Handlers,
     or data helpers. Re-verify on every privileged boundary.

6. **Ownership**
   - Nest issues and validates JWTs (`/api/v1/auth/*`).
   - Next.js sets/clears HTTP-only cookies, seeds the client access-token store
     after successful auth Actions, and never redesigns OTP/refresh contracts.

Convention detail:
[`../../frontend/client-data-fetching.md`](../../frontend/client-data-fetching.md).

## Consequences

- Design is binding for `client/` Nest auth/data-fetch work.
- Live Nest wiring in `client/` is authorized by
  [0011](./0011-client-nest-auth-integration.md) (`admin-panel/` remains UI-only).
- Cookie-only BFF (Model B) is rejected for `client/` unless a new ADR replaces
  this decision.
- Implement against this ADR and
  [`../../frontend/client-data-fetching.md`](../../frontend/client-data-fetching.md)—not
  ad-hoc blog patterns.
- XSS can still read a live in-memory access token; mitigate with short access
  TTL, refresh rotation on Nest, and never exposing refresh to JS.
- `jose` is required for expiry buffers; TanStack Query lands when interactive
  dashboard panes need it (not required for the phone OTP auth slice).
