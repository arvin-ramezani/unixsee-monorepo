# docs/frontend/styling.md

## RTL

The application is Persian and RTL-first.

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

Do not assume physical `left` and `right` represent the intended visual direction.

## Styling

Use Tailwind CSS v4 and existing project tokens.

Prefer:

```text
existing tokens
→ shadcn components
→ reusable feature components
→ new styling
```

Do not introduce duplicate colors, spacing, typography, or design tokens.

Avoid unnecessary Tailwind class duplication.

## Language

Use Persian UI copy unless the feature explicitly requires another language.
