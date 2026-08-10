# Git and GitHub workflow

> **Status:** Current
>
> **Owner:** Engineering
>
> **Last verified:** 2026-08-09

Working model for the Unixsee monorepo: plan → implement → debug → test →
review → PR → merge. Optimized for Cursor-assisted development, frequent local
commits, **explicit** AI review (not automatic), and a short human review.

## Goals

- Keep `main` releasable.
- One PR = one coherent change (feature, fix, or docs slice).
- Prefer small commits while building; keep history on `main` readable via
  squash merge.
- Use AI agents for most review depth; humans focus on product fit, security,
  and trust-boundary mistakes.
- Never assume Bugbot ran — this repo uses **manual trigger only**.

## Branch naming

Create branches from up-to-date `main`:

| Prefix | Use |
|---|---|
| `feat/` | New behavior or UI |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `chore/` | Tooling, ignore rules, deps without product change |
| `refactor/` | Internal restructure without intended behavior change |
| `test/` | Tests only (rare; usually ship tests with the feature) |

Examples: `feat/admin-enrollment-reveal`, `fix/agent-heartbeat-401`,
`docs/git-workflow`.

Do not commit directly to `main`.

## Recommended end-to-end flow

```text
main
  └─ feat/my-change
       1. Plan
       2. Build     → commit
       3. Debug     → commit
       4. Tests     → commit  (when the surface has tests)
       5. Local self-check (lint/build/scripts that exist)
       6. In-editor AI review  (/review-bugbot [+ /review-security])
       7. Fix findings         → commit
       8. Push + open PR
       9. Trigger GitHub Bugbot explicitly  (bugbot run or @cursor review)
      10. Fix PR findings      → commit → push
      11. Re-trigger Bugbot if the diff changed materially
      12. Short human review
      13. Squash-merge to main
      14. Delete branch
```

### 1. Plan

Before coding a non-trivial change:

- Identify owning surface: `admin-panel/`, `client/`, `backend/`, `agent/`,
  or `docs/` ([`../architecture/monorepo.md`](../architecture/monorepo.md)).
- Read the relevant product/UX/architecture docs (see [`../README.md`](../README.md)).
- Write a short plan (GitHub issue, Cursor plan, or PR description draft):
  goal, non-goals, files likely touched, validation commands.

For UI-only phase boundaries on Next.js apps, respect
[`../architecture/decisions/0003-ui-only-phase-boundaries.md`](../architecture/decisions/0003-ui-only-phase-boundaries.md).

### 2–4. Build, debug, test — commit after each step

| Step | Commit style (subject) | Notes |
|---|---|---|
| Build the feature | `feat(admin): add enrollment reveal sheet` | One logical slice |
| Debug | `fix(admin): correct token expiry copy` | Keep debug commits focused |
| Tests | `test(backend): cover enrollment token reuse` | Only if scripts/tests exist |
| Docs needed by the change | `docs: note enrollment UX in product flow` | Same PR when possible |

Rules:

- Commit **often locally**; push when ready for PR review (or earlier for a
  draft PR).
- Do not invent lint/test scripts. Run only what exists; never claim validation
  passed unless it ran ([`validation.md`](./validation.md)).
- Do not mix unrelated surfaces in one PR unless intentionally cross-cutting
  (say why in the PR).

### 5. Local self-check

From the changed surface folder(s), run real scripts, for example:

```bash
# admin-panel or client
npm run lint
npm run build   # or build:static in client when DB is unavailable

# agent
npm run build

# backend (from backend/)
pnpm lint   # only if the script exists
pnpm test   # only if the script exists
```

Trust-boundary skim:

- Next.js apps still UI-only unless an ADR allows Nest integration.
- Agent still outbound-only to NestJS.
- No secrets in the diff.

### 6–7. In-editor AI review (Cursor) — always manual

These do **not** run by themselves. You start them in Cursor Agent chat with
the monorepo root open and your feature branch checked out.

#### Always run Bugbot (defect review)

```text
/review-bugbot
```

Reviews branch changes vs `main` (committed + uncommitted).

For dirty working tree only:

```text
/review-bugbot review only uncommitted changes
```

#### Run Security Review when relevant

Use `/review-security` if the change touches any of:

- auth, sessions, OTP, refresh tokens
- enrollment tokens, agent secrets, HMAC
- tenant isolation / admin capabilities
- credentials, payment, or cross-tenant data paths

```text
/review-security
```

Skip for pure docs, copy, or layout-only UI with no trust-boundary impact.

#### Fix and re-run

1. Fix clear findings (or defer low-value nits with a reason).
2. Commit: `fix: address review findings on …`
3. Re-run `/review-bugbot` (and `/review-security` if you changed sensitive code).

Do not ask for human review until the in-editor pass is done.

### 8. Push and open PR

```bash
git push -u origin HEAD
```

Open a PR into `main` using the repository PR template.

Draft PRs are fine for long work, but remember: **opening or updating a PR does
not start Bugbot** in this repository.

### 9–11. GitHub Bugbot — explicit trigger only

**Repo setting:** Bugbot Trigger Mode is manual. Bugbot runs only when someone
comments one of:

```text
bugbot run
```

or

```text
@cursor review
```

It does **not** run automatically on PR open, push, or draft → ready.

#### Required PR review steps

1. After the PR exists (and after each material push you care about), comment
   `bugbot run` or `@cursor review` on the PR.
2. Wait for Bugbot comments / check.
3. Fix accepted findings locally → commit → push.
4. If the diff changed in a meaningful way, comment `bugbot run` (or
   `@cursor review`) again. Do not assume the previous run covers new commits.
5. For debugging a silent Bugbot: `bugbot run verbose=true` or
   `cursor review verbose=true`.

Optional: run in-editor `/review-bugbot` again after PR fixes if you want
editor-side findings before re-triggering GitHub Bugbot.

### 12. Human review (small)

Human review stays short. Reviewers check:

- Planned product/UX outcome
- Trust-boundary / tenancy mistakes AI might miss
- PR scope (one story)
- Docs/ADRs updated when behavior or structure changed

Do not re-do the full AI nitpick pass.

### 13. Merge

Default: **Squash and merge** into `main`.

Why squash: micro-commits (build / debug / test / review fixes) are great while
working; `main` stays one clear commit per PR.

After merge: delete the remote branch.

## AI review cheat sheet

| Review | Where | Automatic? | How to start |
|---|---|---|---|
| Defect review | Cursor editor | No | `/review-bugbot` |
| Security review | Cursor editor | No | `/review-security` (when relevant) |
| GitHub Bugbot | Pull request | No (manual-only for this repo) | PR comment: `bugbot run` or `@cursor review` |

Minimum bar before human review:

1. In-editor `/review-bugbot` completed (and security if relevant).
2. GitHub Bugbot explicitly triggered at least once on the current PR head.
3. Clear findings fixed or deferred with reason in the PR.

## Commit message convention

```text
feat(agent): enroll with one-time token before ingest
fix(client): preserve RTL for install command copy
docs: add git and PR workflow
chore: tighten root gitignore for Next.js
```

- Subject: imperative, ~72 chars; explain **why** in the body when useful.
- One logical change per commit when practical.
- Never commit secrets.

## PR size guidance

| Size | Guidance |
|---|---|
| Small (preferred) | One feature slice or fix; easy AI + human review |
| Medium | One vertical slice across docs + one app |
| Too large | Split: API contract PR, then UI PR, then follow-ups |

## What not to do

- Do not force-push `main`.
- Do not use `--no-verify` unless explicitly required and justified.
- Do not open PRs that claim green checks/tests without running available checks.
- Do not assume Bugbot ran because the PR was opened or updated.
- Do not put product-wide specs only inside `client/docs` or `admin-panel/docs`;
  those folders stay app-scoped ([`documentation.md`](./documentation.md)).

## Cursor usage map

| Phase | Cursor mode / tool |
|---|---|
| Plan | Plan mode / short written plan |
| Implement | Agent mode in the owning surface |
| Debug | Debug or Agent with runtime evidence |
| Local review | `/review-bugbot`, optionally `/review-security` |
| PR review | Comment `bugbot run` or `@cursor review`; humans skim |

## Optional next hardening (later)

When ready, add GitHub Actions that run per changed surface (`admin-panel`,
`client`, `backend`, `agent`) on pull requests. Until then, local scripts +
explicit AI review + human skim are the gate.

## Related

- Contributing entry: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Validation: [`validation.md`](./validation.md)
- Documentation standards: [`documentation.md`](./documentation.md)
- Monorepo ownership: [`../architecture/monorepo.md`](../architecture/monorepo.md)
