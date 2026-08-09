# Routing and navigation

## Core files

- `page.tsx`: route UI
- `layout.tsx`: persistent shared UI
- `template.tsx`: remounted shared UI
- `loading.tsx`: route-segment loading UI
- `error.tsx`: route-segment error boundary
- `global-error.tsx`: root error boundary
- `not-found.tsx`: not-found UI
- `default.tsx`: parallel slot fallback
- `route.ts`: HTTP endpoint

A folder is not publicly routable until a `page` or `route` file exposes it.

## Dynamic segments

Treat route props as Promises:

```tsx
export default async function Page(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params
  const searchParams = await props.searchParams

  return (
    <ProductPage
      slug={slug}
      preview={searchParams.preview === "1"}
    />
  )
}
```

Use generated helpers where available:

- `PageProps<"/route">`
- `LayoutProps<"/route">`
- `RouteContext<"/route">`

Run `next typegen` when the generated types are not present.

## Layout behavior

Layouts persist across client navigation and do not receive `searchParams`.

Use page `searchParams` for server-rendered query-dependent output or `useSearchParams` in a Client Component for reactive client reads.

Use `template.tsx` when remounting is intentional.

## Route groups and private folders

Use route groups such as `(marketing)` to organize layouts without changing the URL.

Use private folders such as `_components` to colocate implementation and prevent routing ambiguity.

Avoid multiple root layouts unless separate document shells are intentional; navigation between them may perform a full page load.

## Parallel and intercepting routes

Use parallel routes for independently navigable regions and provide `default.tsx` for slots that may not be recoverable after a hard reload.

Use intercepting routes for shareable modal patterns that overlay current context during soft navigation but render as full pages on direct access.

Design soft navigation, hard reload, close, back, forward, and default-slot behavior.

## Navigation APIs

Use:

- `<Link>` for normal internal links
- `redirect()` for temporary server redirects
- `permanentRedirect()` for permanent redirects
- `useRouter()` from `next/navigation` for imperative client navigation
- `usePathname()` and `useSearchParams()` only in Client Components

Do not import App Router code from `next/router`.

Let `<Link>` manage normal prefetching. Change `prefetch` only with a measured or documented reason.
