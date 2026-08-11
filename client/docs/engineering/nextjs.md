# Next.js Engineering

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-10

## Version-matched documentation

For Next.js-specific implementation, do **not** rely on model memory.

Before implementing or modifying data fetching, caching, revalidation, Server Components, Server Actions / Server Functions, Route Handlers, Cache Components (`"use cache"` and related), or Suspense / streaming:

1. Inspect the installed Next.js version and cache / Cache Components configuration in this app (`client/package.json` and Next config).
2. Read the relevant guides in `node_modules/next/dist/docs/` (resolved from `client/`; the package may not be visible from the monorepo root).

The installed Next.js documentation is authoritative over model knowledge.

Shared monorepo conventions: [`../../../docs/frontend/nextjs.md`](../../../docs/frontend/nextjs.md).

## Component Boundaries

- Default to Server Components.
- Add `"use client"` only for browser APIs, event handlers, client hooks, or client-managed state.
- Keep client boundaries small and pass serializable data into them.
- Avoid client-side effects for state that can be derived during render.
- Do not duplicate server data in Zustand merely to avoid passing a small number of props.

## Routing and Localization

- Locale-aware application routes live below `src/app/[locale]`.
- Use navigation helpers from `src/i18n/navigation.ts` for localized links and routing.
- Keep user-facing strings in next-intl messages or typed repository-owned content with localized variants.
- Preserve Persian RTL and English LTR rendering, metadata, and navigation.
- Validate dynamic route parameters before using them to select data or construct backend calls.

## Data Loading

- Before adding or changing fetch / cache / revalidate / Cache Components behavior, read the installed docs under `node_modules/next/dist/docs/` for this Next.js version.
- Public static content should be imported from repository-owned modules or messages and rendered on the server.
- Dashboard and admin application data should be requested through typed NestJS clients.
- Keep credentials and privileged calls server-only.
- Set explicit caching behavior rather than relying on accidental framework defaults.
- Use parallel data loading when requests are independent and streaming when it materially improves the experience.
- Provide stable loading, empty, permission-denied, unavailable, and error states.
- Planned hybrid auth session + Nest fetch conventions:
  [`../../../docs/frontend/client-data-fetching.md`](../../../docs/frontend/client-data-fetching.md) and
  ADRs [`../../../docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md`](../../../docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md) /
  [`../../../docs/architecture/decisions/0011-client-nest-auth-integration.md`](../../../docs/architecture/decisions/0011-client-nest-auth-integration.md).

## Mutations and Forms

- Use React Hook Form and Zod for interactive client forms when they provide clear value.
- Validate again at the trusted server or API boundary; browser validation is not authoritative.
- Prefer Server Actions or Route Handlers for presentation-layer mutations only when they preserve the NestJS ownership boundary.
- Return structured, translatable errors without exposing stack traces, internal URLs, or sensitive payloads.
- Prevent duplicate submissions and expose pending state.

## Route Handlers and Proxies

- Keep handlers thin: authenticate or validate the request, call the owning service, and map the response.
- Do not reproduce backend authorization or business workflows in Next.js.
- Restrict redirect destinations and external URLs to approved values.
- Set timeouts and handle aborted upstream requests.
- Never log credentials, session tokens, or full sensitive payloads.

## Performance

- Prefer Server Components and static rendering for public content.
- Lazy-load genuinely heavy client-only UI.
- Avoid sequential fetch waterfalls and unbounded client subscriptions.
- Use framework image and font optimizations where appropriate.
- Measure before introducing caching layers, global state, memoization, or virtualization.

## Related

- Shared monorepo Next.js rules: [`../../../docs/frontend/nextjs.md`](../../../docs/frontend/nextjs.md)
- Client data fetching Layer 1: [`../../../docs/frontend/client-data-fetching.md`](../../../docs/frontend/client-data-fetching.md)
- Client domain fetching Layer 2: [`../../../docs/frontend/client-domain-data-fetching.md`](../../../docs/frontend/client-domain-data-fetching.md)
- Agent skills: [`.agents/skills/nextjs-app-router`](../../.agents/skills/nextjs-app-router/SKILL.md),
  [`.agents/skills/react-19`](../../.agents/skills/react-19/SKILL.md)
