# Unixsee admin-panel agent instructions

This folder is the **admin-panel** deployable in the Unixsee monorepo: staff
Next.js UI for operating Unixsee. Persian / RTL is primary.

## Before editing

1. Read monorepo orientation: [`../AGENTS.md`](../AGENTS.md) and
   [`../docs/architecture/overview.md`](../docs/architecture/overview.md).
2. Read the relevant admin UX flow under
   [`../docs/product/ux-flows/`](../docs/product/ux-flows/).
3. Read app-scoped docs under [`docs/`](docs/).
4. Inspect existing implementation; prefer the smallest safe change.

## Current stack

- Next.js 16.3 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI)
- npm
- Persian / RTL

Source lives under `src/`.

## Current scope

Build UI with static/fixture data only. Do not introduce API calls,
authentication, authorization, database access, or backend integration unless
explicitly requested. Follow
[`../docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](../docs/architecture/decisions/0003-ui-only-phase-boundaries.md).

## Required context

| Task | Read first |
| --- | --- |
| Product / staff workflows | [`../docs/product/README.md`](../docs/product/README.md) |
| Shared frontend conventions | [`../docs/frontend/README.md`](../docs/frontend/README.md) |
| Components in this app | [`docs/development/components.md`](docs/development/components.md) |
| Fixture data patterns | [`docs/development/data.md`](docs/development/data.md) |
| Local workflow | [`docs/development/workflow.md`](docs/development/workflow.md) |
| Validation | [`../docs/quality/validation.md`](../docs/quality/validation.md) |

## Core rules

- Prefer reuse over duplication.
- Do not over-engineer.
- Keep components focused and composable.
- Do not make unrelated changes.
- Do not invent Nest routes or talk to agents from this app.
- Keep code, comments, and technical docs in English.

## Validation

Use scripts that exist in this package:

```bash
npm run lint
npm run build
```

Do not invent unavailable root monorepo scripts.
