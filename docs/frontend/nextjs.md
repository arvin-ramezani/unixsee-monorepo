# Next.js conventions

> **Applies to:** `admin-panel/`, `client/`

## Version

Target Next.js 16.3, React 19, and App Router.

Use current framework APIs and conventions. Do not rely on patterns from older
Next.js versions.

## Version-matched documentation

Next.js 16.2+ ships documentation inside the installed package. On 16.3 the
agent workflow around those docs is stronger still. For Next.js-specific
implementation, do **not** treat model memory or generic “Next best practices”
skills as the primary authority.

Before implementing or modifying version-sensitive behavior such as:

- data fetching
- caching and revalidation
- Server Components
- Server Actions / Server Functions
- Route Handlers
- Cache Components (`"use cache"` and related)
- Suspense / streaming

1. Confirm the installed Next.js version and any cache / Cache Components
   configuration **in that app**.
2. Read the matching guides under that app’s
   `node_modules/next/dist/docs/` (resolve from `admin-panel/` or `client/`;
   the package may not be visible from the monorepo root).

The installed Next.js documentation is authoritative over model knowledge.

## Rules

- Prefer Server Components.
- Use Client Components only when required.
- Use Server Actions when server-side mutations are introduced.
- Use `proxy.ts` where Next.js 16 requires request interception.
- Never introduce `middleware.ts` for new functionality.
- Follow current App Router conventions.
- Verify unfamiliar or version-sensitive APIs in the installed docs before
  implementing them.
- Do not guess when framework behavior is uncertain.

## Positive-only JSX branches

Applies to **both** `admin-panel/` and `client/` (new and touched code).

- Write `{condition && <Component />}` — never
  `{condition ? <Component /> : null}`.
- Coerce strings/numbers before `&&` (`!!label`, `count > 0`) so React does
  not render `0`.
- Keep a ternary only when both branches render meaningful UI.
- Do not copy nearby `? … : null` when editing a file; follow this rule for
  touched branches.
- Agent detail: each app’s `.agents/skills/react-19/SKILL.md`.

## Authenticated data fetching (`client/`)

Hybrid session + Nest fetch conventions (phone OTP live under ADR 0011):

- Layer 1: [`client-data-fetching.md`](./client-data-fetching.md)
- Layer 2 (domain): [`client-domain-data-fetching.md`](./client-domain-data-fetching.md)
- ADRs: [`../architecture/decisions/0010-client-hybrid-auth-data-fetching.md`](../architecture/decisions/0010-client-hybrid-auth-data-fetching.md),
  [`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md)

## Tailwind

Use Tailwind CSS v4 conventions.

Do not introduce Tailwind v3 configuration patterns into either Next.js app.

For logical positioning and RTL-aware utilities (for example `inset-s-1/2`
instead of `start-1/2`), follow
[`styling.md`](./styling.md#tailwind-css-v4-logical-utilities).

## Related

- App layout: [`../architecture/project.md`](../architecture/project.md)
- Frontend index: [`README.md`](./README.md)
- Stack ADR: [`../architecture/decisions/0002-stack-choices.md`](../architecture/decisions/0002-stack-choices.md)
