---
name: ui-ux-pro-max
description: Research UI/UX patterns, accessibility, layout, typography, color, motion, charts, and stack-specific guidance using the bundled local design database. Use for design exploration, UX review, or resolving an unclear interface-quality problem. Do not use for backend work, exact screenshot parity by itself, or to override this repository's approved screenshots, semantic tokens, shadcn/Radix UI stack, or Lucide icon policy.
---

# UI/UX Pro Max

Use the bundled searchable database as advisory design research. Repository instructions and approved screenshots always take precedence. Reject database tips that conflict with project JSX rules (positive-only branches use `condition && <Component />`, not `? … : null` — see `react-19`, app `AGENTS.md`, and `docs/frontend/nextjs.md`).

## Read First

Read only the files relevant to the task:

1. `AGENTS.md`
2. `docs/ai/project-scope.md`
3. `docs/ai/styling-and-design-system.md`
4. `docs/ai/responsive-and-accessibility.md`
5. `docs/ai/localization.md` when copy, locale, or direction is affected
6. `docs/ai/visual-parity.md` when screenshots define the target

## Project Guardrails

For this repository:

- Use the installed Next.js 16, React 19, Tailwind CSS v4, shadcn/Radix UI, and Lucide stack.
- Preserve semantic variables in `src/app/globals.css`.
- Reuse existing primitives and project components before creating new ones.
- Treat `design-reference/**` as the visual source of truth.
- Do not replace measured screenshot requirements with generic design recommendations.
- Support English LTR and Persian RTL with logical layout utilities.
- Preserve accessibility, keyboard behavior, focus, touch targets, and reduced motion.
- Do not introduce Phosphor, emoji icons, a second component library, or a new token system.

## Search Workflow

1. Define one narrow research question.
2. Run the bundled search script against only the required domain or stack.
3. Read the smallest useful result set.
4. Convert relevant findings into repository-compatible decisions.
5. Reject recommendations that conflict with approved screenshots or project rules.
6. Implement through existing tokens and components.
7. Validate the actual interface rather than reporting database recommendations as completed work.

Run from the repository root. On Windows, use `python`; use `python3` where that is the configured executable.

### Generate a design-system recommendation

```bash
python .agents/skills/ui-ux-pro-max/scripts/search.py "<product> <industry> <keywords>" --design-system -p "Unixsee"
```

### Search one domain

```bash
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain ux -n 8
```

Supported useful domains include:

- `ux`
- `style`
- `color`
- `typography`
- `chart`
- `motion`
- `product`
- `landing`
- `icon`

### Search stack guidance

```bash
python .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard responsive accessibility" --stack nextjs
python .agents/skills/ui-ux-pro-max/scripts/search.py "component composition forms dialogs" --stack shadcn
python .agents/skills/ui-ux-pro-max/scripts/search.py "render performance" --stack react
```

## Usage Rules

- Prefer a focused domain search over generating a broad design system for every task.
- Do not paste large database outputs into the conversation; summarize only actionable findings.
- Do not run every search category speculatively.
- For exact screenshot work, invoke `visual-parity`; use this skill only when the reference leaves a genuine design decision open.
- For component extraction or architecture, invoke `dashboard-component-builder`.
- Cite which search query informed a non-obvious design decision in the final handoff.

## Completion

Report:

- search query and domain used;
- accepted recommendations;
- recommendations rejected because of repository constraints;
- files changed;
- validation actually performed;
- anything not verified.
