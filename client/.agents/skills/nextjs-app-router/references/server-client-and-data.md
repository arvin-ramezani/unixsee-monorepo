# Server and Client Components

## Default boundary

Pages and layouts are Server Components by default. Keep them on the server unless the module itself needs client capabilities.

Use Client Components for:

- Event handlers
- Local interactive state
- Effects
- Browser APIs
- Client-only libraries
- Client-side context

Do not mark a parent as client only because it renders a Client Component.

## Data fetching

Fetch directly in Server Components from a database, internal service SDK, external API, or server-only repository layer.

Do not fetch your own `/api/...` Route Handler from a Server Component. That adds an unnecessary HTTP boundary and can fail during build or deployment.

Start independent work early and await together:

```tsx
export default async function Page() {
  const productPromise = getProduct()
  const reviewsPromise = getReviews()

  const [product, reviews] = await Promise.all([
    productPromise,
    reviewsPromise,
  ])

  return <ProductDetails product={product} reviews={reviews} />
}
```

Use Suspense when independent sections should stream separately.

## Serialization

Props crossing from Server Components to Client Components must be serializable by React and the installed framework version.

Do not pass database clients, request objects, secrets, server-only functions, class instances without supported serialization, or runtime handles.

Pass minimal DTO-shaped data.

## Environment safety

Use `server-only` for modules that must never enter client bundles:

```tsx
import "server-only"
```

Use `client-only` for browser-only modules where the boundary is otherwise unclear.

Never expose secrets through `NEXT_PUBLIC_` variables.

## Request APIs

Use asynchronous access:

```tsx
import { cookies, headers } from "next/headers"

export default async function Page() {
  const cookieStore = await cookies()
  const requestHeaders = await headers()

  return (
    <p>
      {cookieStore.get("theme")?.value ?? requestHeaders.get("user-agent")}
    </p>
  )
}
```

Treat request APIs as dynamic inputs. Their rendering and caching consequences depend on the installed version and Cache Components configuration.
