# Proxy and security boundaries

## Convention

For Next.js 16+, prefer:

```tsx
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/legacy") {
    return NextResponse.redirect(new URL("/current", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/legacy"],
}
```

Place `proxy.ts` at the project root or inside `src`, at the same level as `app`.

Use the named export `proxy` or a default export. Only one Proxy function is supported.

## Appropriate uses

- Redirects based on request data
- Rewrites
- Request or response headers
- Lightweight session or token presence checks
- Locale negotiation
- Multi-tenant host or path routing
- Request-boundary logging where supported

## Inappropriate uses

- Slow database queries
- Full authorization as the only enforcement layer
- Large dependency graphs
- Rendering application UI
- Stateful shared globals
- Cache invalidation
- Long-running background work
- Logic better expressed in layouts, Server Components, Server Functions, Route Handlers, or configuration

## Authentication versus authorization

Proxy may redirect unauthenticated users for user experience.

Still authorize at Server Functions, Route Handlers, server-side data-access functions, and any mutation or sensitive read boundary.

Next.js applications have multiple entry points. Protecting only a page or Proxy matcher does not protect Server Functions and endpoints.

## Runtime

Proxy runtime behavior changed across Next.js releases. Inspect the installed version-matched docs before importing Node.js or Edge-only APIs.

Do not copy older Middleware runtime assumptions into Proxy.

## Matchers

Keep matchers static and narrow.

Exclude assets and framework internals unless the logic genuinely applies to them.

## Migration

Use the official codemod when moving from Middleware:

```powershell
pnpm dlx @next/codemod@latest middleware-to-proxy .
```

Review filename, exported function name, configuration option names, runtime assumptions, matchers, tests, and deployment behavior.
