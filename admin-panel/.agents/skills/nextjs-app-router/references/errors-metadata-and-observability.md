# Errors, metadata, assets, and observability

## Expected errors

Expected validation, permission, and business outcomes should be represented explicitly.

For Server Functions, return typed state.

For missing route resources, call `notFound()` and provide `not-found.tsx`.

Use unauthorized or forbidden interrupts only when supported by the installed version and intentionally enabled.

## Uncaught errors

Use `error.tsx` for route-segment errors:

```tsx
"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section>
      <h2>Something went wrong</h2>
      <button onClick={reset} type="button">
        Try again
      </button>
    </section>
  )
}
```

Use `global-error.tsx` for failures in the root layout.

Do not expose sensitive messages or stack traces.

## Metadata

Use a static `metadata` export when values are fixed.

Use `generateMetadata` for route-dependent values and await params:

```tsx
export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params
  const product = await getProduct(slug)

  return {
    title: product.name,
    description: product.summary,
  }
}
```

Only Server Components support metadata exports.

Configure `metadataBase` when relative URL metadata fields need it.

Prefer file conventions for favicon, icon, apple-icon, Open Graph images, Twitter images, robots, sitemap, and manifest.

## Images

Use `next/image` for optimized content images.

- Provide meaningful `alt`.
- Use empty `alt` for decorative images.
- Prevent layout shift with dimensions or `fill` and a constrained parent.
- Use `sizes` with responsive `fill`.
- Configure `remotePatterns` narrowly.
- Do not use deprecated `images.domains`.
- Do not enable local IP optimization unless explicitly required.
- Confirm configured quality values in Next.js 16+.

## Fonts and scripts

Use `next/font` and keep subsets and weights minimal.

Use `next/script` for third-party scripts and choose the least disruptive strategy.

Do not inject the same script in multiple layouts.

## Instrumentation

Use `instrumentation.ts` for server initialization and request-error observability supported by the installed version.

Use `instrumentation-client.ts` for early client monitoring that must run before application interactivity.

Keep client instrumentation startup lightweight and resilient.
