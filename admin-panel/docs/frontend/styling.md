# docs/frontend/styling.md

> Canonical monorepo styling rules for both Next.js apps live in
> [`../../../docs/frontend/styling.md`](../../../docs/frontend/styling.md).
> Keep this file as a short admin-panel pointer; do not fork conflicting rules.

## RTL

The application is Persian and RTL-first.

Prefer CSS logical properties. Do not assume physical `left` / `right` are the
intended visual direction.

## Tailwind CSS v4

Use Tailwind CSS v4 and existing project tokens.

For direction-aware positioning, prefer modern inset utilities:

| Prefer | Avoid |
|---|---|
| `inset-s-*` | `start-*`, physical `left-*` when logical |
| `inset-e-*` | `end-*`, physical `right-*` when logical |
| `inset-bs-*` / `inset-be-*` | physical `top-*` / `bottom-*` when block-logical |

Example: `inset-s-1/2` — not `start-1/2`.

Full table and agent pitfalls:
[`../../../docs/frontend/styling.md`](../../../docs/frontend/styling.md#tailwind-css-v4-logical-utilities).

## Styling preference order

```text
existing tokens
→ shadcn components
→ reusable feature components
→ new styling
```

Do not introduce duplicate colors, spacing, typography, or design tokens.

## Language

Use Persian UI copy unless the feature explicitly requires another language.
