# Next.js app internal layout

> **Status:** Accepted
>
> **Applies to:** `admin-panel/`, `client/`
>
> **Last verified:** 2026-08-08

This document defines the internal folder layout for each Next.js application.
It does **not** describe the whole repository. For repo ownership see
[`monorepo.md`](./monorepo.md).

## App structure

Each Next.js app should use this shape (paths relative to that app root):

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

## Feature organization

Feature components belong under domain folders:

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

## Boundaries

Nest integration in Next.js apps is allowed only where ADRs say so:

- `client/`: [0011](./decisions/0011-client-nest-auth-integration.md)
- `admin-panel/`: [0012](./decisions/0012-admin-nest-auth-integration.md)
- Hybrid transport: [0010](./decisions/0010-client-hybrid-auth-data-fetching.md)

Still forbidden inside Next.js apps:

- Database access
- Talking to agents or VPS hosts
- Inventing Nest routes/DTOs that conflict with
  [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)

## Related docs

- Frontend conventions: [`../frontend/README.md`](../frontend/README.md)
- Stack ADR: [`decisions/0002-stack-choices.md`](./decisions/0002-stack-choices.md)
