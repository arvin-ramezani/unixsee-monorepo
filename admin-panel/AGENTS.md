# Unixsee admin-panel agent guide

This folder is the standalone staff Next.js deployable. Start with the local
documentation index; use monorepo docs only when changing a shared product,
auth, or API contract.

## Read first

| Task                                                              | Canonical local doc                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Any admin implementation                                          | [`docs/README.md`](docs/README.md)                                 |
| Select, DropdownMenu, Dialog, AlertDialog, Sheet, or UI primitive | [`docs/development/components.md`](docs/development/components.md) |
| File placement and app boundaries                                 | [`docs/architecture/project.md`](docs/architecture/project.md)     |
| Next.js/App Router                                                | [`docs/frontend/nextjs.md`](docs/frontend/nextjs.md)               |
| Styling, Tailwind v4, RTL                                         | [`docs/frontend/styling.md`](docs/frontend/styling.md)             |
| Fixture vs wired Nest data                                        | [`docs/development/data.md`](docs/development/data.md)             |
| Validation                                                        | [`docs/quality/validation.md`](docs/quality/validation.md)         |
| Deployment and agent archive                                      | [`docs/runbooks/deployment.md`](docs/runbooks/deployment.md)       |

Framework workflows are available under [`.agents/skills/`](.agents/skills/).
Installed Next.js docs and repository contracts override skill defaults.

## High-frequency component rules

Before admin forms, menus, or overlays, load
[`components.md`](docs/development/components.md). This app uses shadcn on
Base UI, not generic Radix examples:

- Select: render the visible label inside `SelectValue` and set
  `SelectContent alignItemWithTrigger={false}`.
- DropdownMenu: nest every `DropdownMenuLabel` inside `DropdownMenuGroup`.
- Overlay choice: Dialog for short create/pick, AlertDialog for irreversible
  confirmation, Sheet for inspectors/filters/mobile navigation.

The detailed doc is canonical for examples and edge cases.

## App boundaries

- Next.js 16.3 App Router, React 19, strict TypeScript, Tailwind CSS v4,
  shadcn/Base UI, Zustand, Zod, React Hook Form, npm, Persian RTL-first.
- Nest staff auth and wired admin domains use hybrid JWT fetch. Unwired panes
  stay on fixtures under `src/lib/data/`.
- NestJS owns persistence, authorization, business rules, orchestration, and
  agent access. Do not add database access or call agents/VPS hosts here.
- The API base URL already ends in `/api/v1`; pass `/admin/tickets`, never
  `/v1/admin/tickets`, to fetch helpers.
- Keep technical docs, code, comments, and file names in English.
- Preserve positive-only JSX: `{condition && <Component />}`; coerce
  strings/numbers first. Use a ternary only when both branches render UI.

## Monorepo contracts

When this checkout is inside the monorepo and a task changes shared behavior,
also read:

- Admin auth/data: [`../docs/frontend/admin-data-fetching.md`](../docs/frontend/admin-data-fetching.md)
  and [`admin-domain-data-fetching.md`](../docs/frontend/admin-domain-data-fetching.md)
- Auth decision: ADR [`0012`](../docs/architecture/decisions/0012-admin-nest-auth-integration.md)
- API route map/contracts: [`../docs/backend/`](../docs/backend/)
- Product behavior and admin UX: [`../docs/product/`](../docs/product/)

Do not invent routes or DTOs when those shared contracts are unavailable; make
cross-app contract changes in the monorepo.

## Next.js version-matched docs

Before changing fetch/cache behavior, Server Components, Server Actions,
Route Handlers, Cache Components, Suspense, streaming, or proxy behavior:

1. Inspect this app's installed Next.js version and configuration.
2. Read the relevant guide under `node_modules/next/dist/docs/` from this folder.

Use `proxy.ts` where Next.js 16 requires interception; do not add new
`middleware.ts` behavior.

## Working rules

- Inspect existing implementation and reuse current components/patterns.
- Keep feature components focused; primitives belong in `src/components/ui`.
- Avoid unrelated refactors, premature abstractions, and unnecessary
  dependencies.
- Run only scripts present in this package and report validation honestly.
- Final reports state changes, decisions, validation, manual actions, and
  remaining limitations.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
