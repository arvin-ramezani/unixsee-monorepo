# Client state

> **Applies to:** `admin-panel/`, `client/`

## Zustand

Use Zustand for shared client-side state.

Follow the per-request store pattern required by Next.js App Router.

Do not create global mutable state that can leak between requests.

Use React state for local component state.

Do not use Zustand when local state is sufficient.

## Client Components

Keep state close to where it is consumed.

Avoid converting Server Components to Client Components only for convenience.

## Related

- Next.js rules: [`nextjs.md`](./nextjs.md)
- Frontend index: [`README.md`](./README.md)
