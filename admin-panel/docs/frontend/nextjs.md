## Version

Target Next.js 16.3, React 19, and App Router.

Use current framework APIs and conventions. Do not rely on patterns from older Next.js versions.

## Version-matched documentation

For Next.js-specific implementation, do **not** rely on model memory.

Before implementing or modifying data fetching, caching, revalidation, Server Components, Server Actions / Server Functions, Route Handlers, Cache Components, or Suspense / streaming:

1. Inspect the installed Next.js version and cache / Cache Components configuration in this app.
2. Read the relevant guides in `node_modules/next/dist/docs/` (resolved from `admin-panel/`).

The installed Next.js documentation is authoritative over model knowledge.

Shared monorepo conventions: [`../../../docs/frontend/nextjs.md`](../../../docs/frontend/nextjs.md).

## Rules

- Prefer Server Components.
- Use Client Components only when required.
- Use Server Actions when server-side mutations are introduced.
- Use `proxy.ts` where Next.js 16 requires request interception.
- Never introduce `middleware.ts` for new functionality.
- Follow current App Router conventions.
- Verify unfamiliar or version-sensitive APIs in the installed docs before implementing them.
- Do not guess when framework behavior is uncertain.

## Tailwind

Use Tailwind CSS v4 conventions.

Do not introduce Tailwind v3 configuration patterns into the project.

For logical positioning utilities (`inset-s-*` / `inset-e-*`, not `start-*` /
`end-*`), follow
[`styling.md`](./styling.md) and the monorepo canonical
[`../../docs/frontend/styling.md`](../../docs/frontend/styling.md#tailwind-css-v4-logical-utilities).
