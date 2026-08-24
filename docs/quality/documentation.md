# Documentation standards

> **Last verified:** 2026-08-24

## Documentation architecture

Unixsee uses a hybrid documentation model:

- Root [`docs/`](../README.md) owns facts shared across deployables: product
  behavior, system architecture, ADRs, cross-app contracts, and monorepo
  operations.
- `<app>/docs/` owns implementation conventions, feature notes, validation,
  and runbooks specific to that deployable.
- Root and app-level `AGENTS.md` files are compact routing maps. They name
  high-frequency constraints and point to the canonical detailed document.

Place each fact once. Do not copy a rule into root docs merely to make an agent
load it; improve the route from `AGENTS.md` or the nearest index instead.

## Placement

| Information                                                         | Canonical location                            |
| ------------------------------------------------------------------- | --------------------------------------------- |
| Repository boundary, shared product behavior, or cross-app decision | `docs/architecture/`, `docs/product/`, or ADR |
| Shared frontend rule used by both Next.js apps                      | `docs/frontend/`                              |
| API route/wire contract consumed by backend and a UI/agent          | `docs/backend/` or `docs/agent/`              |
| Admin-only implementation convention                                | `admin-panel/docs/`                           |
| Client-only implementation convention                               | `client/docs/`                                |
| Backend-only implementation convention or runbook                   | `backend/docs/`                               |
| Monitoring-agent-only implementation note                           | `monitoring-agent/docs/`                      |
| Durable structural decision                                         | `docs/architecture/decisions/`                |
| Reusable cross-project procedure                                    | Skill, not repository docs                    |

If a document affects multiple deployables, keep it at root even when its name
mentions one app. For example, a client-to-Nest auth contract is shared because
both the client and backend must implement it.

## Standalone app checkouts

- App-local `AGENTS.md` must start with the local documentation index and must
  not require root docs for ordinary implementation work.
- Root links may appear under a clearly labeled “monorepo contract” route for
  tasks that change API, product, auth, or another deployable.
- Do not duplicate shared contracts to make a deploy repo self-contained.
  Cross-app contract changes belong in the monorepo.
- Existing copied product/spec files in app deployables are mirrors, not a
  second authority; update and validate their monorepo owner first.

## Routing and context budgets

Target retrieval is `AGENTS.md → docs index → focused document`, within two
hops. A route must name the convention and when it applies; a bare link to a
large document is insufficient.

- Root `AGENTS.md`: target 80–100 lines; soft maximum 120.
- App `AGENTS.md`: target 60–100 lines, excluding generated framework blocks;
  keep only local boundaries, task routes, and canonical commands.
- Documentation index: target 20–80 lines; use one-line purpose descriptions.
- `.cursor/rules`: keep thin and point to the same canonical owners.

When a routing file grows, remove duplicate explanation before splitting deep
docs. Detailed examples, rationale, and edge cases belong in the focused doc.

## Status and authority

Prefer one of: `Proposed`, `Draft`, `Accepted`, or `Superseded`. Distinguish
accepted intent from observed implementation. When they conflict, document the
conflict instead of silently treating current code as the contract.

Accepted ADRs and contracts outrank historical design notes. Mark secondary or
historical documents prominently and keep them out of high-frequency routes.

## Writing and maintenance

- One concern per document; link instead of copying.
- State phase honesty: do not describe deferred or stubbed work as shipped.
- Do not invent API contracts, schemas, auth providers, or scripts.
- Update the canonical owner and all affected indexes/links in the same change.
- Validate relative links and search for contradictory copies after changes.
- Prefer mechanical enforcement (types, tests, lint, CI) when prose alone
  cannot reliably protect a rule.

## Persistent AI memory

**Decision: deferred (2026-08-24).** Do not create a cross-session AI memory
layer now. Revisit only when the owner asks or the project needs durable
session handoffs beyond canonical docs and version control.

## Framework documentation

For Next.js work, the installed documentation under the target app's
`node_modules/next/dist/docs/` overrides model memory. App-local Next.js docs
route to the relevant version-matched guides.
