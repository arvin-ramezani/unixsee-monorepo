# docs/frontend/state.md

## Zustand

Use Zustand for shared client-side state.

Follow the per-request store pattern required by Next.js App Router.

Do not create global mutable state that can leak between requests.

Use React state for local component state.

Do not use Zustand when local state is sufficient.

## Client Components

Keep state close to where it is consumed.

Avoid converting Server Components to Client Components only for convenience.
