# Cache Components awareness

This reference prevents accidental misuse. Project-specific cache policy belongs in a separate skill.

## Detect the active model

Inspect `next.config.*` for:

```tsx
const nextConfig = {
  cacheComponents: true,
}
```

Also search for:

- `"use cache"`
- `"use cache: private"`
- `"use cache: remote"`
- `cacheLife`
- `cacheTag`
- `revalidateTag`
- `updateTag`
- `revalidatePath`
- `refresh`
- `unstable_cache`
- Removed PPR flags
- Route Segment Config from earlier models

Do not mix caching models without reading the installed migration guide.

## Cache Components enabled

General rules:

- Request-time dynamic work is the default.
- `"use cache"` makes eligible functions, components, or routes cacheable.
- Cache keys are generated from eligible inputs and captured values.
- Use `cacheLife` for lifetime policy and `cacheTag` for invalidation grouping.
- Uncached blocking work may require a parent Suspense boundary.
- Cached output must not leak one user's private data to another user.
- Read the installed docs before using private or remote cache scopes.

## Mutation refresh choices

Use the project cache policy to choose among:

- `updateTag`: read-your-writes behavior in supported Server Action contexts
- `revalidateTag`: stale-while-revalidate behavior with a cache profile
- `revalidatePath`: invalidate a route path
- `refresh`: refresh uncached client-router data after an Action
- `router.refresh()`: client-side route refresh when justified

Do not call these indiscriminately after every mutation.

## Avoid stale patterns

For new Next.js 16+ Cache Components code:

- Do not add deprecated `unstable_cache`.
- Do not add removed `experimental.ppr` or route-level `experimental_ppr`.
- Do not assume old `dynamic`, `revalidate`, and `fetchCache` patterns remain preferred when Cache Components are enabled.
- Do not use single-argument `revalidateTag` when the installed types require a cache profile.

## Suspense

Use Suspense around dynamic regions that should stream independently from cached shells.

Fallbacks should preserve layout stability, match the region's size, communicate loading where useful, and avoid replacing useful parent UI.
