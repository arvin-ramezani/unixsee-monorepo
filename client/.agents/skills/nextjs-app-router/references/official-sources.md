# Official sources

Last reviewed: 2026-08-10

Always prefer the installed version-matched docs in:

```text
node_modules/next/dist/docs/
```

Those installed docs are authoritative over model memory for version-sensitive
Next.js behavior (data fetching, caching, Server Components/Actions, Route
Handlers, Cache Components, Suspense/streaming). Confirm the app’s Next.js
version and cache configuration before introducing `"use cache"` or related APIs.

Use these official online sources when local docs are unavailable or when researching a target upgrade.

## Core

- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/getting-started
- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://nextjs.org/docs/app/getting-started/fetching-data
- https://nextjs.org/docs/app/getting-started/mutating-data
- https://nextjs.org/docs/app/getting-started/error-handling

## Routing and request APIs

- https://nextjs.org/docs/app/api-reference/file-conventions
- https://nextjs.org/docs/app/api-reference/file-conventions/page
- https://nextjs.org/docs/app/api-reference/file-conventions/layout
- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/messages/sync-dynamic-apis
- https://nextjs.org/docs/app/guides/redirecting

## Cache Components

- https://nextjs.org/docs/app/getting-started/caching
- https://nextjs.org/docs/app/guides/migrating-to-cache-components
- https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
- https://nextjs.org/docs/app/api-reference/directives/use-cache
- https://nextjs.org/docs/app/api-reference/functions/cacheLife
- https://nextjs.org/docs/app/api-reference/functions/cacheTag
- https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- https://nextjs.org/docs/app/api-reference/functions/updateTag
- https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- https://nextjs.org/docs/app/api-reference/functions/refresh

## Security and backend

- https://nextjs.org/docs/app/guides/authentication
- https://nextjs.org/docs/app/guides/data-security
- https://nextjs.org/docs/app/guides/backend-for-frontend
- https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions

## Metadata, assets, and instrumentation

- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/getting-started/images
- https://nextjs.org/docs/app/getting-started/fonts
- https://nextjs.org/docs/app/guides/scripts
- https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
- https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

## Tooling and upgrades

- https://nextjs.org/docs/app/guides/ai-agents
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/docs/app/api-reference/cli/next
- https://nextjs.org/docs/app/api-reference/config/typescript
- https://nextjs.org/docs/app/api-reference/turbopack
- https://nextjs.org/docs/app/guides/package-bundling
- https://nextjs.org/blog/next-16
- https://nextjs.org/blog/next-16-1
