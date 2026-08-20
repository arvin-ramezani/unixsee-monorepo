# Development Runbook

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-04

## Setup

1. Install the supported Node.js version.
2. Run `npm install`.
3. Obtain required local environment values through the approved team channel.
4. Run `npm run dev`.

Do not use credentials copied from committed files. The known credential cleanup is tracked in `TODO.md`.

## Routine Validation

```bash
npm run docs:check
npm run typecheck
npm run lint
npm run build:static
```

Use the checks relevant to the change. `npm run build` is a Next.js production
build only; this app does not own a database.

## Troubleshooting Order

1. Confirm the current branch and worktree status.
2. Confirm installed dependencies match `package-lock.json`.
3. Confirm required environment variables exist without printing their values.
4. Reproduce the smallest failing route or command.
5. Check whether the failure is new or part of documented baseline debt.
6. Record durable recovery steps in the appropriate runbook after verification.
