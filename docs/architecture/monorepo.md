# Monorepo layout and ownership

> **Status:** Accepted
>
> **Last verified:** 2026-08-08
>
> **ADR:** [`decisions/0001-flat-monorepo-layout.md`](./decisions/0001-flat-monorepo-layout.md)

## Root tree

```text
unixsee-monorepo/
├── admin-panel/     # Staff Next.js app (not scaffolded yet)
├── client/          # Customer / public Next.js app (not scaffolded yet)
├── backend/         # NestJS API and control plane (active)
├── agent/           # VPS edge agent (active)
├── docs/            # Canonical documentation
├── README.md
├── CONTRIBUTING.md
└── AGENTS.md
```

## Ownership matrix

| Path | Owner concern | May contain |
|---|---|---|
| `admin-panel/` | Administrator UI | Next.js App Router UI for staff workflows |
| `client/` | Customer / public UI | Next.js App Router UI for public site and customer dashboard |
| `backend/` | Platform API | NestJS modules, persistence, auth, orchestration, agent APIs |
| `agent/` | Edge runtime | Agent process that enrolls with and reports to NestJS |
| `docs/` | Shared truth | Product, architecture, frontend, backend, agent, quality docs |

Do not place application source for one surface inside another surface's folder.

## Shared-code policy

Default: **no premature shared packages**.

- Keep each deployable self-contained until a second consumer needs the same
  code.
- When extraction is justified, introduce a shared location via an ADR; do not
  invent a `packages/` tree casually.
- Documentation, types contracts, and API specs may be shared through `docs/`
  before any runtime package exists.

## Naming

- Use the folder names above consistently in docs, scripts, and discussion.
- Inside Next.js apps, follow [`project.md`](./project.md).
- Prefer clear domain names (`tickets`, `websites`, `plan-requests`) over
  generic buckets.

## Tooling status

- `backend/` has its own Nest/pnpm tooling; run scripts from that folder.
- `agent/` has its own npm tooling; run scripts from that folder (see
  [`../../agent/README.md`](../../agent/README.md)).
- Monorepo-wide workspace tooling (root workspaces, shared CI) is not configured
  yet. Do not invent unavailable root scripts or claim builds pass.
- Backend module/route targets:
  [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md).

## Where to put new work

| Change type | Location |
|---|---|
| Admin UI feature | `admin-panel/` + related `docs/product/ux-flows/` |
| Customer / public UI | `client/` + product docs |
| API / business rules | `backend/` per [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md) |
| Agent behavior | `agent/` + `docs/agent/` and product notes |
| Structural decision | ADR under `docs/architecture/decisions/` |
| Product behavior | `docs/product/` |
