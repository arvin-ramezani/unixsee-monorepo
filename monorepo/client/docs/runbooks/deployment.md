# Deployment and Rollback Runbook

> **Status:** Current
>
> **Owner:** Engineering and operations teams
>
> **Last verified:** 2026-08-04

## Principles

- CI validates an immutable artifact from an identified commit.
- Staging receives the artifact before production promotion.
- Production uses the approved artifact rather than rebuilding arbitrary server state.
- Secrets are supplied by the deployment environment and never stored in Git or logs.
- Database migrations require explicit compatibility and rollback review.

## Required Checks

- Install dependencies reproducibly with `npm ci` in CI.
- Run `npm run docs:check`, `npm run typecheck`, and `npm run lint`.
- Run the appropriate build command for the target environment.
- Smoke-test localized public routes and applicable authenticated surfaces.
- Verify environment and migration readiness before the full build or deployment.

## Rollback

1. Identify the last approved artifact and its source commit.
2. Determine whether database migrations are backward compatible.
3. Restore the prior artifact and environment configuration without exposing secret values.
4. Verify critical public and authenticated routes.
5. Record the incident, recovery, and required follow-up.

Environment-specific commands and addresses belong in protected operational configuration or the staging runbook, not in architecture documents.
