# `use`, Suspense, and asynchronous resources

## The `use` API

`use` reads a Promise or context during render.

Unlike Hooks, `use` may be called in conditions and loops. It must still run inside a component or custom Hook.

## Promise rules

A Promise passed to `use` must be cached so React receives the same Promise instance across retries and re-renders.

Incorrect:

```tsx
import { use } from "react";

export function Products() {
  const products = use(fetch("/api/products").then((response) => response.json()));

  return <ProductList products={products} />;
}
```

This creates new Promises during render.

Preferred:

```tsx
import { Suspense, use } from "react";

export function ProductsPage({
  productsPromise,
}: {
  productsPromise: Promise<Product[]>;
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <Products productsPromise={productsPromise} />
    </Suspense>
  );
}

function Products({
  productsPromise,
}: {
  productsPromise: Promise<Product[]>;
}) {
  const products = use(productsPromise);

  return <ProductList products={products} />;
}
```

Create the Promise before the client render through the framework, a Server Component, route loader, event, preload step, or Suspense-compatible cache.

Do not append `.then(...)` during render, even to a cached Promise, because `.then(...)` creates a new Promise.

## Suspense boundaries

Place boundaries around meaningful loading units:

- Keep navigation and already-visible content usable.
- Avoid wrapping the entire application when only one region suspends.
- Avoid many tiny boundaries that create visual noise.
- Pair asynchronous resources with loading, error, retry, and empty states.
- Start related requests early to avoid waterfalls.

## Errors

Do not wrap `use` in `try/catch`. React uses thrown values internally for Suspense.

Use an Error Boundary around the reading subtree.

Expected validation or mutation failures should usually be returned as state rather than thrown.

## Context with `use`

Use `use(SomeContext)` when conditional access makes the component simpler.

```tsx
import { use } from "react";

export function FeaturePanel({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  const permissions = use(PermissionsContext);

  return permissions.canViewFeature ? <Panel /> : null;
}
```

Use `useContext` for ordinary unconditional reads.

Reading context with `use` is not supported in Server Components.

## Server-to-client Promises

When a Promise is passed from a Server Component to a Client Component:

- Its resolved value must be serializable.
- The Promise must be created outside the Client Component render.
- The reading Client Component needs an intentional Suspense boundary.
- Rejections need an Error Boundary.
- Do not expose secrets or privileged server values in the resolved payload.

## Refetching

Start refreshes inside a Transition so React can retain already-visible content while the replacement resource is pending.

Do not bypass `use` by reading custom `promise.status`, `promise.value`, or `promise.reason` fields directly.
