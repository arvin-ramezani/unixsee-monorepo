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

Until a later ADR supersedes it, UI work remains UI-only. See
[`decisions/0003-ui-only-phase-boundaries.md`](./decisions/0003-ui-only-phase-boundaries.md).

Do not add inside Next.js apps:

- API integration against NestJS (until allowed)
- Database access
- Authentication or authorization implementation
- Backend services or agent communication

Future backend integration must follow project architecture decisions.

## Related docs

- Frontend conventions: [`../frontend/README.md`](../frontend/README.md)
- Stack ADR: [`decisions/0002-stack-choices.md`](./decisions/0002-stack-choices.md)
