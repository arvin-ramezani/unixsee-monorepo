## Summary
<!-- 1–3 bullets: what changed and why -->

-

## Surface
<!-- Check all that apply -->
- [ ] `admin-panel/`
- [ ] `client/`
- [ ] `backend/`
- [ ] `agent/`
- [ ] `docs/`

## Plan
<!-- Link issue/plan, or 2–4 lines: goal, non-goals -->

## Validation
<!-- Only claim checks that actually ran -->
- [ ] Ran available lint/build/test in changed surface(s)
- [ ] No secrets in diff
- [ ] UI-only / trust-boundary rules respected (if Next.js or agent)

Commands run:

```text
(paste commands + result)
```

## AI review
<!-- Bugbot is manual-only for this repo; opening a PR does not start it -->
- [ ] In-editor `/review-bugbot` run on branch
- [ ] In-editor `/review-security` run (if auth, enrollment, agent, tenancy, secrets)
- [ ] GitHub Bugbot triggered with `bugbot run` or `@cursor review`
- [ ] Re-triggered Bugbot after material fix pushes (if any)
- [ ] Clear findings addressed or explicitly deferred with reason

## Human review focus
<!-- What should a human skim? product fit, risky edges, etc. -->

-

## Test plan
- [ ]
- [ ]

## Merge notes
- Default: squash merge into `main`
- Follow-ups (if any):
