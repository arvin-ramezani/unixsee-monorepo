# Agent guide

This file orients AI agents working in the Unixsee monorepo. Canonical detail
lives under `docs/` — read docs instead of inventing structure or product
behavior.

## Mandatory read order

Before making changes, read in this order as relevant to the task:

1. [`docs/architecture/overview.md`](./docs/architecture/overview.md)
2. [`docs/architecture/monorepo.md`](./docs/architecture/monorepo.md)
3. Surface docs for the work:
   - Frontend: [`docs/frontend/README.md`](./docs/frontend/README.md) and
     [`docs/frontend/nextjs.md`](./docs/frontend/nextjs.md) (version-matched
     Next.js docs under each app’s `node_modules/next/dist/docs/`)
   - Admin panel UI (Select, DropdownMenu, Dialog/AlertDialog/Sheet):
     [`admin-panel/docs/development/components.md`](./admin-panel/docs/development/components.md)
     and [`admin-panel/AGENTS.md`](./admin-panel/AGENTS.md)
   - Client dashboard pages (co-located `loading.tsx` + structure-matched
     skeletons; keep skeletons in sync when layout changes):
     [`client/docs/engineering/ui.md`](./client/docs/engineering/ui.md#customer-dashboard-loading-skeletons)
     and [`client/AGENTS.md`](./client/AGENTS.md)
   - Client auth session / Nest data fetching:
     [`docs/frontend/client-data-fetching.md`](./docs/frontend/client-data-fetching.md)
     (Layer 1) and
     [`docs/frontend/client-domain-data-fetching.md`](./docs/frontend/client-domain-data-fetching.md)
     (Layer 2), plus ADRs [`0010`](./docs/architecture/decisions/0010-client-hybrid-auth-data-fetching.md) /
     [`0011`](./docs/architecture/decisions/0011-client-nest-auth-integration.md)
   - Admin auth session / Nest data fetching:
     [`docs/frontend/admin-data-fetching.md`](./docs/frontend/admin-data-fetching.md)
     (Layer 1) and
     [`docs/frontend/admin-domain-data-fetching.md`](./docs/frontend/admin-domain-data-fetching.md)
     (Layer 2), plus ADR [`0012`](./docs/architecture/decisions/0012-admin-nest-auth-integration.md)
   - Backend: [`docs/backend/README.md`](./docs/backend/README.md),
     [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md),
     and [`docs/backend/contracts/`](./docs/backend/contracts/) when changing APIs
   - Agent: [`docs/agent/README.md`](./docs/agent/README.md)
4. Product: [`docs/product/phase-1-application-features.md`](./docs/product/phase-1-application-features.md)
5. Matching UX flow under [`docs/product/ux-flows/`](./docs/product/ux-flows/) when doing admin UI

Also respect [`docs/architecture/decisions/0011-client-nest-auth-integration.md`](./docs/architecture/decisions/0011-client-nest-auth-integration.md) for `client/` Nest auth/data-fetch (supersedes ADR 0003 for customer), and [`docs/architecture/decisions/0012-admin-nest-auth-integration.md`](./docs/architecture/decisions/0012-admin-nest-auth-integration.md) for `admin-panel/` Nest auth/data-fetch. Backend ADRs [`0004`](./docs/architecture/decisions/0004-api-audience-namespaces.md) / [`0005`](./docs/architecture/decisions/0005-domain-modules-multi-audience-controllers.md) apply when changing Nest routes or modules.

## Repository layout

Flat deployables at repo root (no `apps/` / `packages/` yet):

- `admin-panel/` — staff Next.js UI
- `client/` — customer / public Next.js UI
- `backend/` — NestJS (active control plane)
- `agent/` — Phase 1 VPS agent (new; see `docs/agent/prd.md`)
- `monitoring-agent/` — monitoring edge agent (existing; develop later)
- `docs/` — canonical documentation

## Hard boundaries

- Do not invent NestJS routes or DTOs that conflict with
  [`docs/backend/modules-and-routes.md`](./docs/backend/modules-and-routes.md).
- Do not redesign authentication; extend role/capability checks on `/admin` instead.
- Do not add API, database, auth, or backend services inside Next.js apps except
  where an Accepted ADR allows it (`client/` Nest auth/JWT fetch: ADR 0011;
  `admin-panel/` Nest auth/admin JWT fetch: ADR 0012).
- Admin and client never talk to agents or VPS hosts; NestJS is the control
  plane.
- Do not invent unavailable npm/pnpm scripts or claim lint/build/tests passed
  unless they actually ran.
- Do not treat deferred Phase 1 features as shipped.
- Do not rewrite large product/UX specs unless fixing a factual conflict; prefer
  indexes and cross-links.
- Keep `.cursor/rules` thin; put lasting detail in `docs/`.

## Graphify knowledge graph

This repository uses Graphify as a local code knowledge graph.

Graphify data location:

- `graphify-out/graph.json`

The graph is generated from the repository source code and should be used as the first source for repository relationship questions.

### Before codebase analysis

For questions involving:

- architecture understanding
- dependency discovery
- impact analysis
- finding related modules
- tracing imports or relationships

use Graphify first when `graphify-out/graph.json` exists.

Preferred commands:

```bash
graphify query "<question>"
```

Use:

```bash
graphify path "<source>" "<target>"
```

for relationship tracing between files/components.

Use:

```bash
graphify explain "<concept>"
```

for focused concept exploration.

Avoid starting with broad grep/search when Graphify can provide a scoped relationship view.

### Graph navigation priority

Use this order:

1. Graphify queries for relationship discovery
2. Repository documentation under `docs/`
3. Source code inspection
4. Broad text search only when required

If available:

```text
graphify-out/wiki/index.md
```

may be used for broad navigation before inspecting source files.

Use:

```text
graphify-out/GRAPH_REPORT.md
```

only for broad architecture reviews or when Graphify queries do not provide enough context.

### After code changes

When modifying code:

- keep the Graphify graph synchronized
- update the graph after structural changes

Run:

```bash
graphify update .
```

The graph update should be AST-only and should not require an external LLM/API key.

### Graphify does not replace repository rules

Graphify provides relationship knowledge.

It does not override:

- `docs/` as the canonical architecture/product source
- `AGENTS.md` rules
- ADR decisions
- backend/frontend ownership boundaries

When Graphify results conflict with repository documentation, follow the canonical documentation.

## Code formatting

- Every agent that creates or changes code must format every Prettier-supported
  file it touched before handoff. Run Prettier with `--write` against the
  explicit changed-file list and use the nearest project configuration.
- Before claiming completion, run Prettier again with `--check` against the same
  changed-file list and report any file that cannot be formatted.
- Do not run repository-wide formatting when the task only changes a subset of
  files, and do not format unrelated or user-owned changes.

## Deploy remotes (server repos)

Development happens in this monorepo. **Deployment / staging / real-server
testing** uses separate single-app repositories per surface.

When asked to **update the main repos** or **sync deploy repos**, follow
[`docs/quality/deployment-remotes.md`](./docs/quality/deployment-remotes.md):

| Monorepo path  | Remote repo                         | Branch    |
| -------------- | ----------------------------------- | --------- |
| `backend/`     | `unixseemaster-pixel/unixsee-api`   | `develop` |
| `client/`      | `unixseemaster-pixel/unixsee-web`   | `staging` |
| `admin-panel/` | `unixseemaster-pixel/unixsee-admin` | `dev`     |

**Critical:** the root repo's `origin` must always stay
`https://github.com/arvin-ramezani/unixsee-monorepo.git`. Deploy repos are
separate clones — never repoint the root origin to an app repo, and always
restore the root repo to the branch it was on before syncing.

## Cursor rules

| Rule                                                                     | When it applies               |
| ------------------------------------------------------------------------ | ----------------------------- |
| [`.cursor/rules/monorepo.mdc`](./.cursor/rules/monorepo.mdc)             | Always                        |
| [`.cursor/rules/frontend-next.mdc`](./.cursor/rules/frontend-next.mdc)   | `admin-panel/**`, `client/**` |
| [`.cursor/rules/backend-nestjs.mdc`](./.cursor/rules/backend-nestjs.mdc) | `backend/**`                  |
| [`.cursor/rules/docs-product.mdc`](./.cursor/rules/docs-product.mdc)     | `docs/product/**`             |

## Documentation standards

[`docs/quality/documentation.md`](./docs/quality/documentation.md)
