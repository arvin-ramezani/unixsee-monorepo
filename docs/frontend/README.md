# Frontend documentation

Conventions for the Next.js applications:

- `admin-panel/` — staff UI (active, UI-first)
- `client/` — public website and customer dashboard (active)

Product behavior differs per surface. Engineering conventions below apply to
both unless a doc says otherwise.

## Read order

1. [`../architecture/project.md`](../architecture/project.md) — internal app layout
2. [`nextjs.md`](./nextjs.md) — Next.js 16.3 / App Router rules, including
   **version-matched docs** under each app’s `node_modules/next/dist/docs/`
3. [`state.md`](./state.md) — Zustand and local state
4. [`styling.md`](./styling.md) — Tailwind v4, shadcn, Persian RTL-first,
   logical insets (`inset-s-*` not `start-*`)
5. [`client-auth-ui.md`](./client-auth-ui.md) — public customer auth UI shell (when building auth)
6. [`client-data-fetching.md`](./client-data-fetching.md) — planned hybrid auth session + Nest data fetching (blocked by ADR 0003)
7. [`../quality/validation.md`](../quality/validation.md) — how to validate UI work

## Stack (summary)

See [`../architecture/decisions/0002-stack-choices.md`](../architecture/decisions/0002-stack-choices.md).

- Next.js 16.3, React 19, App Router
- Tailwind CSS v4 + shadcn
- Zustand for shared client state (per-request store pattern)
- Persian RTL-first; English LTR supported by product requirements

## Phase boundaries

UI-only until integration is explicitly allowed:
[`../architecture/decisions/0003-ui-only-phase-boundaries.md`](../architecture/decisions/0003-ui-only-phase-boundaries.md).

## Product entry points

- Admin: [`../product/README.md`](../product/README.md)
- Customer auth flow: [`../product/ux-flows/client-auth.md`](../product/ux-flows/client-auth.md)
- Customer auth UI: [`client-auth-ui.md`](./client-auth-ui.md)
- Customer Nest session / data fetching (planned): [`client-data-fetching.md`](./client-data-fetching.md)
- Other customer / public behaviour: Phase 1 until additional client UX flows exist
