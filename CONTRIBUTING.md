# Contributing

## Current workflow

Use the Git/GitHub workflow in
[`docs/quality/git-and-pr-workflow.md`](./docs/quality/git-and-pr-workflow.md):

1. Branch from `main` (`feat/…`, `fix/…`, `docs/…`, …).
2. Plan the change against monorepo docs and owning surface.
3. Commit locally after build, debug, and test steps.
4. Run in-editor `/review-bugbot` (and `/review-security` when relevant).
5. Push and open a PR, then **explicitly** trigger GitHub Bugbot with
   `bugbot run` or `@cursor review` (it does not run on PR open/push).
6. Fix findings, re-trigger Bugbot if the diff changed, then short human review.
7. Squash-merge to `main`.

Also read [`docs/README.md`](./docs/README.md) and the architecture overview
before structural or product changes.

## Where changes go

| Change | Put it in |
|---|---|
| Product behavior | `docs/product/` |
| Admin UX journey | `docs/product/ux-flows/` |
| Structural / stack decision | ADR under `docs/architecture/decisions/` |
| Frontend conventions | `docs/frontend/` |
| Admin UI code | `admin-panel/` (+ app-scoped `admin-panel/docs/` only) |
| Customer / public UI code | `client/` (+ app-scoped `client/docs/` only) |
| API / business rules | `backend/` |
| Edge agent | `agent/` |

## Phase boundaries

Until a superseding ADR lands, Next.js work is UI-only. Do not add NestJS
integration, database access, authentication, authorization, or agent/VPS
calls from admin or client apps. See
[`docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](./docs/architecture/decisions/0003-ui-only-phase-boundaries.md).

## Validation

- Do not invent lint/build/test scripts that do not exist.
- Never claim validation passed unless it actually ran.
- Follow [`docs/quality/validation.md`](./docs/quality/validation.md).

## Dependencies

Do not add dependencies unless required. Prefer existing dependencies and
native platform capabilities.

## Documentation quality

- Prefer relative links within `docs/`.
- Keep Cursor rules and `AGENTS.md` as thin pointers — do not duplicate long
  product/UX text there.
- Put lasting product/architecture detail in monorepo `docs/`, not only inside
  an app folder.
- Use ADRs for durable structural decisions, not for routine features.
