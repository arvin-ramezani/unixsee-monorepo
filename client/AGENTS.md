# Unixsee client agent guide

This folder is the standalone public/customer Next.js deployable. Persian RTL
is primary and English LTR is secondary. Start with local docs; use monorepo
docs only for shared product, auth, or API contract changes.

## Read first

| Task                                  | Canonical local doc                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Any client implementation             | [`docs/README.md`](docs/README.md)                                                      |
| File placement                        | [`docs/engineering/repository-structure.md`](docs/engineering/repository-structure.md)  |
| App Router, data, forms, localization | [`docs/engineering/nextjs.md`](docs/engineering/nextjs.md)                              |
| UI, RTL/LTR, accessibility, motion    | [`docs/engineering/ui.md`](docs/engineering/ui.md)                                      |
| Dashboard page/loading layout         | [`docs/engineering/ui.md`](docs/engineering/ui.md#customer-dashboard-loading-skeletons) |
| Quality and review                    | [`docs/engineering/quality-and-review.md`](docs/engineering/quality-and-review.md)      |
| Local/deploy operations               | [`docs/runbooks/`](docs/runbooks/)                                                      |

Framework workflows are available under [`.agents/skills/`](.agents/skills/).
Installed Next.js docs and repository contracts override skill defaults.

## High-frequency UI rule

Every async customer-dashboard route under
`src/app/[locale]/(dashboard)/dashboard/` needs a co-located `loading.tsx` and
a structure-matched skeleton. When the page's grid, rails, max-width, or major
blocks change, update its skeleton in the same change. Detailed rules:
[`docs/engineering/ui.md`](docs/engineering/ui.md#customer-dashboard-loading-skeletons).

## App boundaries

- Next.js App Router, React 19, strict TypeScript, Tailwind CSS v4, Radix-based
  shadcn components, Framer Motion, Zustand, React Hook Form/Zod, next-intl.
- This app is presentation-only for managed-service data. NestJS owns auth,
  persistence, authorization, orchestration, and agent control.
- Do not add Prisma/database access, Nest modules, staff admin UI, or direct
  agent/VPS communication.
- The API base URL already ends in `/api/v1`; pass `/auth/otp/request`, never
  `/v1/auth/otp/request`, to fetch helpers.
- Preserve translations, Persian RTL, English LTR, keyboard behavior, focus,
  and ARIA semantics.
- Preserve positive-only JSX: `{condition && <Component />}`; coerce
  strings/numbers first. Use a ternary only when both branches render UI.
- Keep code, comments, file names, and technical docs in English.

## Monorepo contracts

When this checkout is inside the monorepo and a task changes shared behavior,
also read:

- Client auth/data: [`../docs/frontend/client-data-fetching.md`](../docs/frontend/client-data-fetching.md)
  and [`client-domain-data-fetching.md`](../docs/frontend/client-domain-data-fetching.md)
- Decisions: ADR [`0010`](../docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md)
  and ADR [`0011`](../docs/architecture/decisions/0011-client-nest-auth-integration.md)
- API route map/contracts: [`../docs/backend/`](../docs/backend/)
- Shared product behavior: [`../docs/product/`](../docs/product/)

Do not invent routes or DTOs when those shared contracts are unavailable; make
cross-app contract changes in the monorepo.

## Next.js version-matched docs

Before changing fetch/cache behavior, Server Components, Server Actions,
Route Handlers, Cache Components, Suspense, streaming, or proxy behavior:

1. Inspect this app's installed Next.js version and configuration.
2. Read the relevant guide under `node_modules/next/dist/docs/` from this folder.

Default to Server Components and keep client boundaries small. Use `proxy.ts`
for new request interception; do not add new `middleware.ts` behavior.

## Security and validation

- Never commit credentials or expose server-only environment variables.
- Treat external payloads as untrusted; avoid unsanitized
  `dangerouslySetInnerHTML`.
- Avoid unrelated refactors, premature abstractions, and unnecessary
  dependencies.
- Use scripts that exist in this package:

```bash
npm run docs:check
npm run typecheck
npm run lint
npm run build:static
```

Report only checks that actually ran.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
