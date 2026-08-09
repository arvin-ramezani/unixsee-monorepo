---
name: nextjs-app-router
description: Build, refactor, review, debug, or upgrade Next.js 16+ applications using the App Router. Use for routing, layouts, pages, Server and Client Components, Server Functions, Route Handlers, Proxy, async request APIs, metadata, navigation, errors, images, fonts, observability, TypeScript route types, Turbopack, and production checks. Load separate project skills for authentication, authorization, caching policy, internationalization, data access, styling, testing, and deployment conventions.
---

# Next.js App Router 16+

Use current App Router patterns for the installed Next.js version.

## Source-of-truth workflow

Before writing or changing Next.js code:

1. Inspect `package.json`, the lockfile, `next.config.*`, `tsconfig.json`, lint configuration, and the relevant `app/` tree.
2. Determine the installed Next.js version.
3. Read the relevant version-matched documentation in `node_modules/next/dist/docs/`.
4. Search that directory before relying on memory:
   - PowerShell: `Get-ChildItem node_modules/next/dist/docs -Recurse -File | Select-String -Pattern "<term>"`
   - Ubuntu: `rg -n "<term>" node_modules/next/dist/docs`
5. If bundled docs are unavailable, use the official `nextjs.org/docs/app` documentation matching the installed major and minor version.
6. Treat repository instructions and project-specific skills as authoritative where they intentionally specialize this skill.

Never assume APIs from a newer Next.js release exist in the installed project.

## Scope boundaries

This skill provides reusable framework rules. It does not define project policy for:

- Authentication or authorization providers
- Cache lifetimes, tags, or invalidation architecture
- Internationalized routing
- Database or API client architecture
- Styling or component libraries
- Test frameworks
- Hosting-platform configuration

Load the relevant project skill before deciding those details.

## Default architecture

- Use the App Router under `app/` or `src/app/`.
- Treat pages and layouts as Server Components unless interactivity or browser APIs require a Client Component.
- Keep `"use client"` boundaries as low and narrow as practical.
- Fetch server data directly from its source in Server Components.
- Do not call the application's own Route Handler from a Server Component.
- Pass serializable values across Server-to-Client boundaries.
- Keep secrets, privileged data access, and authorization on the server.
- Use Suspense and route loading UI for meaningful streaming boundaries.
- Prefer framework primitives over custom infrastructure.

Read `references/server-client-and-data.md`.

## Routing and file conventions

Use current App Router conventions:

- `page.tsx` exposes a route.
- `layout.tsx` preserves shared UI and state across navigation.
- `template.tsx` remounts its subtree on navigation.
- `loading.tsx` provides route-level Suspense UI.
- `error.tsx` handles uncaught route-segment errors and must be a Client Component.
- `global-error.tsx` handles root-level failures.
- `not-found.tsx` renders expected not-found UI.
- `route.ts` defines HTTP handlers.
- `default.tsx` provides a fallback for parallel route slots.
- `instrumentation.ts` initializes server observability.
- `instrumentation-client.ts` initializes early client observability.
- Metadata files and APIs should be preferred over handwritten `<head>` management.
- Route groups organize code without affecting URLs.
- Private folders colocate implementation without becoming routes.
- Use parallel and intercepting routes only when their navigation and reload behavior is intentionally designed.

Do not create `page.tsx` and `route.ts` at the same route segment.

Read `references/routing-and-navigation.md`.

## Async request APIs

In modern App Router code, treat these values as asynchronous:

- `params`
- `searchParams`
- `cookies()`
- `headers()`
- `draftMode()`
- Async metadata and route-handler context values documented by the installed version

In Server Components, Server Functions, Route Handlers, and metadata functions, use `await`.

In synchronous Client Components, unwrap Promise props with React `use` only when the framework provides that Promise.

Do not access, spread, enumerate, or iterate these values synchronously.

Prefer generated route helpers:

```tsx
export default async function Page(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params
  return <ProductPage slug={slug} />
}
```

Use `LayoutProps<"...">` and `RouteContext<"...">` where supported.

## Server and Client Components

Add `"use client"` only when the module requires:

- State or event handlers
- Effects or browser lifecycle behavior
- Browser-only APIs
- Client-only third-party components
- Client-side React context consumers or providers

Do not add `"use client"` merely because a Server Component imports a Client Component.

Keep large data transformations, markdown rendering, syntax highlighting, and other non-interactive work on the server when possible.

Use `server-only` and `client-only` to make environment assumptions explicit where useful.

## Server Functions and mutations

- Use async Server Functions for server-side mutations.
- Use `"use server"` inside an async function or at the top of a dedicated server-functions file.
- Do not use `"use server"` to mark a Server Component.
- Treat every Server Function as a directly reachable POST endpoint.
- Authenticate and authorize inside every mutation.
- Validate all untrusted input at the server boundary.
- Return expected validation failures as typed state.
- Keep unexpected failures for error boundaries or server logging.
- Use forms and React Action APIs when they match the interaction.
- Expect Server Actions to be dispatched sequentially from the client.
- Perform independent parallel work inside one Server Function when required.
- Revalidate or refresh only after the mutation succeeds.
- Use `redirect()` outside `try/catch` when it intentionally terminates control flow.

Read `references/server-functions-and-route-handlers.md`.

## Route Handlers

Use `route.ts` for public HTTP endpoints, webhooks, external clients, callbacks, streaming responses, or BFF endpoints.

- Use Web `Request` and `Response` APIs by default.
- Use `NextRequest` and `NextResponse` only for Next.js-specific features.
- Export only supported HTTP method functions and documented route configuration.
- Treat Route Handlers as public endpoints.
- Validate method, content type, body, authentication, authorization, and rate-limit requirements.
- Return explicit status codes and safe response bodies.
- Do not use a Route Handler as an internal transport layer for Server Components.
- Do not place `route.ts` beside `page.tsx` in the same segment.

## Proxy

Use `proxy.ts`, not `middleware.ts`, for new Next.js 16+ code.

- Place it at the project root or `src/`, alongside `app/`.
- Export a named `proxy` function or default function.
- Export one optional static `config` object with a precise matcher.
- Use Proxy for request-boundary redirects, rewrites, headers, locale negotiation, lightweight session checks, or network-boundary routing.
- Keep Proxy fast, deterministic, and independent from render-time state.
- Do not rely on shared mutable globals.
- Do not perform slow database work or broad authorization solely in Proxy.
- Repeat authorization checks at Server Functions, Route Handlers, and data-access boundaries.
- Pass information through headers, cookies, rewrites, redirects, or the URL.
- Confirm the installed version's Proxy runtime before using runtime-specific APIs.
- Do not use cache revalidation APIs from Proxy.

Read `references/proxy-and-security-boundaries.md`.

## Caching awareness

Do not choose a caching architecture without the project's cache skill or explicit requirements.

Before editing cache behavior, inspect:

- `cacheComponents` in `next.config.*`
- Existing `"use cache"` directives
- `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag`, `revalidatePath`, and `refresh`
- Suspense boundaries
- Deployment topology and shared cache requirements

When Cache Components are enabled:

- Dynamic work is request-time by default unless explicitly cached.
- Use `"use cache"` only around data and output safe to share for the chosen cache scope.
- Place uncached request-time work under Suspense where required.
- Do not use removed experimental PPR flags.
- Do not introduce deprecated `unstable_cache` for new Next.js 16 code.
- Use the installed docs to distinguish stale-while-revalidate from read-your-writes behavior.

Read `references/cache-components-awareness.md`.

## Navigation

- Use `next/link` for normal internal navigation.
- Use `redirect` or `permanentRedirect` for server-side control flow.
- Use `useRouter` only for imperative client navigation.
- Import App Router hooks from `next/navigation`, never `next/router`.
- Do not manually prefetch what `Link` already handles without evidence.
- Do not assume a layout rerenders on every navigation.
- Read changing query values from page `searchParams` or a Client Component using `useSearchParams`.
- Use native history APIs only where documented and justified.
- Design parallel and intercepting routes for both soft navigation and hard reload behavior.

## Errors and expected outcomes

- Return expected errors from Server Functions and show them through Action state.
- Use `notFound()` for missing route resources.
- Use `redirect()` for intentional navigation.
- Use `error.tsx` for uncaught exceptions inside a route segment.
- Use `global-error.tsx` for root layout failures.
- Keep error boundaries small enough to preserve unaffected UI.
- Log server failures without exposing internal details to clients.
- Use `unauthorized` and `forbidden` only when supported and enabled by the installed version.

Read `references/errors-metadata-and-observability.md`.

## Metadata, images, fonts, and scripts

- Use static `metadata` or `generateMetadata` in Server Components.
- Await route parameters in dynamic metadata.
- Set `metadataBase` when relative metadata URLs require it.
- Prefer metadata file conventions for icons, robots, sitemap, Open Graph, and Twitter images.
- Use `next/image` rather than raw `<img>` for content images unless optimization is intentionally bypassed.
- Use `remotePatterns`, not deprecated `images.domains`.
- Configure only required image qualities and remote sources.
- Use `next/font` for local or hosted fonts.
- Use `next/script` for third-party scripts and choose the least disruptive strategy.
- Do not add scripts in `instrumentation-client.ts` unless they must run before interactivity.
- Keep client instrumentation initialization lightweight.

## TypeScript

- Prefer `next.config.ts`.
- Use generated `PageProps`, `LayoutProps`, and `RouteContext` helpers where available.
- Use `next typegen` when route types are needed without a full build.
- Enable `typedRoutes` when the project wants typed internal links.
- Do not hand-maintain route unions that Next.js can generate.
- Keep environment variables server-only unless intentionally prefixed with `NEXT_PUBLIC_`.
- Never import server-only environment access into client modules.

## Turbopack and tooling

- Treat Turbopack as the default for `next dev` and `next build`.
- Do not add `--turbopack` flags unnecessarily.
- Use `--webpack` only when a verified incompatibility requires it.
- Put Turbopack configuration at the top-level `turbopack` key.
- Prefer current Next.js CLI and codemods over manual large migrations.
- Use `next dev --inspect` for server debugging where supported.
- Use the Turbopack bundle analyzer only when bundle analysis is requested and supported by the installed version.
- Do not enable experimental features merely because they exist.

## Upgrades

For upgrades:

1. Read the installed and target version upgrade guides.
2. Inspect breaking changes before editing code.
3. Use the official upgrade command or codemod.
4. Review every generated change.
5. Resolve async request API migrations.
6. Rename deprecated `middleware` conventions to Proxy when compatible.
7. Remove obsolete flags only after verifying replacement behavior.
8. Run type generation, type checking, linting, tests, and a production build.
9. Check image, runtime, cache, and deployment behavior after the upgrade.

Never upgrade framework dependencies as an incidental part of an unrelated task.

## Verification

Use the repository's existing commands. For a typical pnpm project:

```powershell
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm test
pnpm build
```

Do not claim success for commands that were not run.

## Reference loading map

Load only the references relevant to the task:

- Server/Client boundaries and data flow: `references/server-client-and-data.md`
- Pages, layouts, segments, navigation, route types: `references/routing-and-navigation.md`
- Mutations, forms, Server Functions, Route Handlers: `references/server-functions-and-route-handlers.md`
- Proxy and security boundaries: `references/proxy-and-security-boundaries.md`
- Cache Components awareness: `references/cache-components-awareness.md`
- Errors, metadata, assets, instrumentation: `references/errors-metadata-and-observability.md`
- Turbopack, TypeScript, AI-agent docs, upgrades: `references/tooling-types-and-upgrades.md`
- Final review: `references/review-checklist.md`
- Official source index: `references/official-sources.md`

## Output expectations

When implementing:

- Make the smallest coherent change.
- Preserve existing framework and project conventions.
- Explain only material architecture, runtime, caching, or security decisions.
- Separate generic Next.js guidance from project-specific policy.
- Do not invent APIs or configuration options.

When reviewing:

1. Report correctness and security issues first.
2. Identify stale Pages Router or pre-Next.js-16 patterns.
3. Identify oversized client boundaries and unnecessary internal HTTP requests.
4. Identify synchronous access to async request APIs.
5. Identify misuse of Proxy, Server Functions, Route Handlers, caching, metadata, and error boundaries.
6. Provide file-specific fixes and verification commands.
