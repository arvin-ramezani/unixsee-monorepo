# Client state

> **Applies to:** `admin-panel/`, `client/`

## Zustand

Use Zustand for shared client-side state.

Follow the per-request store pattern required by Next.js App Router.

Do not create global mutable state that can leak between requests.

Use React state for local component state.

Do not use Zustand when local state is sufficient.

### Planned auth store (`client/` only)

When Nest integration is allowed (see ADR 0010), the auth store may hold a
**memory-only access token** plus a safe user DTO for Bearer calls. That is
auth-session state only—not a general API or React Query cache. Server
Components still must not read Zustand; cookies remain the server source of
truth. Detail:
[`client-data-fetching.md`](./client-data-fetching.md).

## Client Components

Keep state close to where it is consumed.

Avoid converting Server Components to Client Components only for convenience.

## Related

- Next.js rules: [`nextjs.md`](./nextjs.md)
- Frontend index: [`README.md`](./README.md)
