# Server rendering, Server Components, and Server Functions

## React-level boundary

React defines the model. The framework defines routing, bundling, caching, data access, directives, and deployment behavior.

Do not infer framework behavior from generic React documentation.

## Server Components

Server Components render in a server environment before client bundling.

React does not use a `"use server"` directive to identify Server Components.

A module is a Server Component according to the framework’s server/client module graph.

Rules:

- Keep browser APIs and interactive state out of Server Components.
- Keep secrets and privileged data access on the server.
- Pass serializable props to Client Components.
- Avoid importing server-only modules into client code.
- Use the framework’s supported data-fetching and caching model.

## Server Functions

`"use server"` marks a Server Function.

A Server Function becomes a Server Action when used through an Action boundary such as a form action or Action call.

Rules:

- Authenticate and authorize inside the Server Function.
- Validate every untrusted input.
- Return minimal serializable results.
- Do not trust hidden fields or client-provided identifiers.
- Keep side effects idempotent when retries or duplicate submissions are possible.
- Do not expose stack traces, secrets, database objects, or non-serializable values.

## `useActionState` with Server Functions

React can integrate form submission state with a Server Function. Framework behavior determines transport, cache invalidation, navigation, and revalidation.

Do not invent framework-specific APIs in this React skill.

## Streaming and Suspense

Use Suspense boundaries to define meaningful streaming units.

The framework may add route-level loading and error boundaries. Follow the framework skill for exact placement.

## Version and security

Use the React version supported by the framework and keep it on the latest patched release in that supported line.

Do not manually install or pin internal React Server Components packages unless the framework documentation explicitly requires it.
