# docs/architecture/project.md

## Project Structure

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
│   └── data/
├── stores/
└── types/
```

## Boundaries

Nest auth and `/api/v1/admin/*` data fetching are **authorized** by monorepo ADR
0012. Staff login + session and `/tickets` are wired. Until each remaining
surface is wired, keep fixtures under `src/lib/data/` and do not invent routes
or DTOs.

Allowed when implementing the Nest slice:

- Staff username/password auth against Nest (`/api/v1/auth/login`)
- Hybrid session transport (admin cookie jar + memory access token)
- Authenticated fetches to Nest admin APIs via documented helpers

Still forbidden:

- Database access inside this Next.js app
- Talking to agents or VPS hosts
- Inventing Nest contracts that conflict with monorepo `docs/backend/`

Canonical docs:

- [`../../../docs/architecture/decisions/0012-admin-nest-auth-integration.md`](../../../docs/architecture/decisions/0012-admin-nest-auth-integration.md)
- [`../../../docs/frontend/admin-data-fetching.md`](../../../docs/frontend/admin-data-fetching.md)
- [`../../../docs/frontend/admin-domain-data-fetching.md`](../../../docs/frontend/admin-domain-data-fetching.md)

## Feature Organization

Feature components belong under:

```text
src/components/tickets/
src/components/websites/
src/components/users/
```

Shared primitives belong under:

```text
src/components/ui/
```

Do not place feature-specific components in `components/ui/`.
