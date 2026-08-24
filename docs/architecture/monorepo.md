# Monorepo layout and ownership

> **Status:** Accepted
>
> **Last verified:** 2026-08-24
>
> **ADR:** [`decisions/0001-flat-monorepo-layout.md`](./decisions/0001-flat-monorepo-layout.md)

## Root tree

```text
unixsee-monorepo/
├── admin-panel/        staff Next.js app + app-local docs
├── client/             customer/public Next.js app + app-local docs
├── backend/            NestJS control plane + app-local docs
├── agent/              Phase 1 VPS agent
├── monitoring-agent/   monitoring edge agent + local notes
├── docs/               shared product, architecture, contracts, operations
├── README.md
├── CONTRIBUTING.md
└── AGENTS.md
```

## Ownership matrix

| Path                | Owner concern                | Documentation ownership                                                        |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `admin-panel/`      | Staff Next.js workflows      | Admin implementation rules under `admin-panel/docs/`                           |
| `client/`           | Customer/public Next.js UI   | Client implementation rules under `client/docs/`                               |
| `backend/`          | NestJS API and control plane | Backend-only rules/runbooks under `backend/docs/`                              |
| `agent/`            | Phase 1 edge runtime         | Runtime source local; shared agent/control-plane contracts under `docs/agent/` |
| `monitoring-agent/` | Monitoring edge runtime      | Local implementation notes under `monitoring-agent/docs/`                      |
| `docs/`             | Cross-deployable truth       | Product, architecture, ADRs, API/agent contracts, monorepo operations          |

Do not place source or app-only conventions for one deployable inside another.
See [`../quality/documentation.md`](../quality/documentation.md) for the
canonical placement test.

## Shared-code policy

Default: no premature shared packages.

- Keep each deployable self-contained until a second consumer needs the same
  runtime code.
- Introduce shared runtime packages only through an ADR.
- Shared contracts may live under root `docs/` before shared runtime packages
  exist.

## Documentation routing

- Root `AGENTS.md` contains global boundaries and routes to the target app.
- Each app `AGENTS.md` names its high-frequency conventions and routes to its
  local docs index.
- App-local docs support ordinary work in a single-app checkout.
- Tasks that change product behavior, auth, an API contract, or another app
  must run in the monorepo and load the relevant root docs.
- Link to canonical owners; do not duplicate rule bodies to improve recall.

## Tooling status

- Run `backend/`, `client/`, `admin-panel/`, `agent/`, and `monitoring-agent/`
  scripts from their own folders.
- Root `npm run dev` starts backend, client, and admin together on ports 4000,
  3001, and 3000.
- No broader workspace tooling is configured. Do not invent root scripts or
  claim validations that were not run.
- Deploy repos are separate single-app clones; follow
  [`../quality/deployment-remotes.md`](../quality/deployment-remotes.md).

## Where to put new work

| Change type                            | Location                             |
| -------------------------------------- | ------------------------------------ |
| Admin implementation or convention     | `admin-panel/` + `admin-panel/docs/` |
| Client implementation or convention    | `client/` + `client/docs/`           |
| Backend-only implementation or runbook | `backend/` + `backend/docs/`         |
| Cross-app API/wire contract            | `docs/backend/` or `docs/agent/`     |
| Shared frontend convention             | `docs/frontend/`                     |
| Product behavior or cross-surface UX   | `docs/product/`                      |
| Structural decision                    | `docs/architecture/decisions/`       |
| Monitoring-agent implementation note   | `monitoring-agent/docs/`             |

## Naming

- Use the deployable folder names consistently in docs, scripts, and
  discussion.
- Prefer domain names such as `tickets`, `websites`, and `plan-requests` over
  generic buckets.
- Do not invent an `apps/` or `packages/` tree without an accepted decision.
