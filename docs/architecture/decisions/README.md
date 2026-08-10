# Architecture Decision Records (ADRs)

ADRs capture durable decisions that affect structure, stack, or boundaries.

## When to write an ADR

Write an ADR when you:

- Change monorepo layout or ownership
- Adopt or replace a major technology
- Change trust boundaries or phase constraints
- Introduce shared packages or cross-app contracts

Do **not** use an ADR for routine feature work. Use product notes or UX flows
instead. See [`../../quality/documentation.md`](../../quality/documentation.md).

## Status vocabulary

| Status | Meaning |
|---|---|
| Proposed | Under discussion; not binding yet |
| Accepted | Binding until superseded |
| Superseded | Replaced by a newer ADR |
| Rejected | Considered and not adopted |

## Naming

```text
NNNN-short-kebab-title.md
```

Use a zero-padded four-digit number. Numbers are chronological, not priority.

## Template

```markdown
# NNNN. Title

> **Status:** Proposed | Accepted | Superseded | Rejected
>
> **Date:** YYYY-MM-DD
>
> **Supersedes:** (optional)
>
> **Superseded by:** (optional)

## Context

What problem or constraint forced a decision?

## Decision

What did we choose?

## Consequences

What becomes easier, harder, or forbidden?
```

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-flat-monorepo-layout.md) | Flat monorepo layout | Accepted |
| [0002](./0002-stack-choices.md) | Stack choices | Accepted |
| [0003](./0003-ui-only-phase-boundaries.md) | UI-only phase boundaries | Accepted |
| [0004](./0004-api-audience-namespaces.md) | API audience namespaces | Accepted |
| [0005](./0005-domain-modules-multi-audience-controllers.md) | Domain modules with multi-audience controllers | Accepted |
| [0006](./0006-rename-agent-to-monitoring-agent.md) | Rename edge deployable to `monitoring-agent/` | Accepted |
| [0007](./0007-two-vps-agents.md) | Two VPS agents: Phase 1 `agent/` and deferred `monitoring-agent/` | Accepted |
