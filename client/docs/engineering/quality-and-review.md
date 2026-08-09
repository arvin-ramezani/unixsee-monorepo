# Quality and Review

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-04

## Objective

Validation and review should prove that a change meets its specification without introducing unrelated behavior, security risk, accessibility regressions, or architectural drift.

## Before Implementation

- Read the relevant product, architecture, engineering, and feature documents.
- Inspect the implementation and nearby tests or fixtures.
- Identify unclear acceptance criteria before choosing an irreversible design.
- Record significant new architecture decisions as ADRs.

## Validation Commands

Use the narrowest relevant commands, then expand when risk warrants it:

```bash
npm run docs:check
npm run typecheck
npm run lint
npm run build:static
```

The full `npm run build` generates Prisma and deploys migrations before building. Run it only when a configured database and migration execution are appropriate for the task.

The repository currently has no test runner or test script. Do not document or claim tests that do not exist. Add focused tests when introducing a runner is within scope; otherwise document the unvalidated behavior.

As of 2026-08-04, the global lint baseline contains 23 errors and 88 warnings. New work must not add failures. Report baseline failures separately rather than claiming lint passed.

## Review Priorities

Review in this order:

1. Security, authorization, secret exposure, and unsafe external input handling.
2. Broken behavior, data loss, incorrect state, and contract incompatibility.
3. Architecture-boundary violations and accidental legacy WordPress expansion.
4. Accessibility, RTL/LTR, responsive behavior, and interaction regressions.
5. Missing error, loading, empty, permission, and cleanup states.
6. Performance regressions, unnecessary dependencies, and avoidable client work.
7. Maintainability, duplication, naming, and documentation drift.

## Review Findings

- Report actionable findings before summaries.
- Include a precise file and line reference.
- Explain the user or system impact and a safe correction.
- Do not report formatting that configured tools can fix unless it hides a functional issue.
- If no findings remain, state that directly and identify any validation gaps.

## Completion Criteria

- Requested behavior and non-goals are satisfied.
- Existing architecture and conventions are preserved unless the change explicitly updates them.
- No unrelated files or behaviors changed.
- Relevant edge and error states were considered.
- Actual validation results are reported accurately.
- Current documentation and ADRs reflect material decisions.
- The final diff was reviewed for secrets, debug output, backup files, and accidental generated artifacts.
