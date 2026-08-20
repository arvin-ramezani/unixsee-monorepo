# Next.js App Router review checklist

## Version and documentation

- [ ] Installed Next.js version was inspected.
- [ ] Relevant bundled docs were read.
- [ ] No API from a different version was assumed.
- [ ] Project-specific skills were loaded where required.

## Boundaries

- [ ] Pages and layouts remain Server Components by default.
- [ ] `"use client"` boundaries are narrow.
- [ ] Server-only imports cannot enter client bundles.
- [ ] Values crossing to Client Components are serializable.
- [ ] Secrets remain server-side.

## Routing

- [ ] File conventions match the intended behavior.
- [ ] No segment contains both `page.tsx` and `route.ts`.
- [ ] Dynamic params and search params are awaited.
- [ ] Layout persistence is not mistaken for rerender behavior.
- [ ] Parallel and intercepting routes handle hard reloads.
- [ ] App Router hooks come from `next/navigation`.

## Data flow

- [ ] Server Components fetch directly from data sources.
- [ ] No Server Component calls an internal Route Handler.
- [ ] Independent server work avoids waterfalls.
- [ ] Suspense boundaries match meaningful streaming regions.

## Mutations and endpoints

- [ ] Server Functions are async and correctly marked.
- [ ] Every mutation authenticates, authorizes, and validates.
- [ ] Expected errors are returned safely.
- [ ] Redirect and revalidation happen after success.
- [ ] Route Handlers are treated as public endpoints.
- [ ] Webhooks verify authenticity.

## Proxy

- [ ] New code uses `proxy.ts`.
- [ ] Matcher scope is narrow.
- [ ] Proxy avoids slow or stateful work.
- [ ] Runtime assumptions match installed docs.
- [ ] Authorization is repeated at protected boundaries.

## Caching

- [ ] Active cache model was detected.
- [ ] Cache behavior follows the project cache skill.
- [ ] User-specific data cannot leak through shared caches.
- [ ] Deprecated cache and PPR APIs were not introduced.
- [ ] Dynamic work has Suspense where required.

## Errors and metadata

- [ ] Expected and unexpected errors are separated.
- [ ] Error boundaries preserve unaffected UI.
- [ ] Missing resources use `notFound()`.
- [ ] Metadata APIs run only in Server Components.
- [ ] Dynamic metadata awaits params.
- [ ] Image and script APIs use secure, current configuration.

## Tooling

- [ ] Route types were generated where needed.
- [ ] Turbopack is used by default unless incompatibility is documented.
- [ ] Type checking, linting, tests, and production build were run or explicitly reported as not run.
