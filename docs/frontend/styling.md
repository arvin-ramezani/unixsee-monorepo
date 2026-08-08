# Styling and RTL

> **Applies to:** `admin-panel/`, `client/`

## RTL

Both Next.js applications are Persian and RTL-first.

Consider RTL for:

- layouts
- spacing
- icons
- forms
- tables
- dialogs
- dropdowns
- navigation
- responsive behavior

Prefer CSS logical properties where appropriate.

Do not assume physical `left` and `right` represent the intended visual
direction.

## Styling

Use Tailwind CSS v4 and existing project tokens within each app.

Prefer:

```text
existing tokens
→ shadcn components
→ reusable feature components
→ new styling
```

Do not introduce duplicate colors, spacing, typography, or design tokens.

Avoid unnecessary Tailwind class duplication.

Do not assume a shared design-token package exists yet; keep tokens inside the
app that owns them until a second consumer justifies extraction (see
[`../architecture/monorepo.md`](../architecture/monorepo.md)).

## Language

Use Persian UI copy unless the feature explicitly requires another language.
Phase 1 also requires English LTR support for the same workflows.

## Related

- Frontend index: [`README.md`](./README.md)
- Next.js rules: [`nextjs.md`](./nextjs.md)
