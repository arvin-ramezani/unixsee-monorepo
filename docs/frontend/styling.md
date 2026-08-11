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

## Tailwind CSS v4 (logical utilities)

Both apps use **Tailwind CSS v4**. Prefer current logical utilities over older
`start-*` / `end-*` positioning aliases and over physical `left-*` / `right-*`
when the intent is direction-aware.

### Positioning (inset)

| Prefer (v4) | Avoid | CSS intent |
|---|---|---|
| `inset-s-*` | `start-*`, `left-*` (when logical) | `inset-inline-start` |
| `inset-e-*` | `end-*`, `right-*` (when logical) | `inset-inline-end` |
| `inset-bs-*` | physical `top-*` when block-logical | `inset-block-start` |
| `inset-be-*` | physical `bottom-*` when block-logical | `inset-block-end` |

Examples:

```text
inset-s-1/2   ✅   start-1/2   ❌
inset-e-4     ✅   end-4       ❌
inset-s-0     ✅   left-0      ❌ (for RTL-aware UI)
inset-bs-2    ✅   when the edge is block-start, not always "top"
```

Centering a positioned element on the inline axis:

```text
absolute inset-s-1/2 -translate-x-1/2
```

(In RTL, pair with `rtl:translate-x-1/2` when the translate must flip; follow
existing components such as radio indicators and dialogs.)

### Spacing and borders (already logical)

Keep using:

- `ps-*` / `pe-*` — padding-inline-start / end
- `ms-*` / `me-*` — margin-inline-start / end
- `text-start` / `text-end`
- `rounded-s-*` / `rounded-e-*`, `border-s-*` / `border-e-*`

Do not rewrite these to physical `pl`/`pr`/`ml`/`mr` for direction-aware UI.

### Agent pitfalls

- Training data often emits `start-1/2` or `left-1/2`. For this repo, rewrite to
  `inset-s-1/2` (and `inset-e-*` for the opposite edge).
- Do not invent Tailwind v3 `tailwind.config.js` content/purge patterns.
- Prefer existing app tokens and utilities over one-off arbitrary values.

Match patterns already used in the codebase (`inset-s-*`, `inset-e-*`,
`inset-bs-*`, `inset-be-*`) before introducing physical inset classes.

## Styling

Use Tailwind CSS v4 and existing project tokens within each app.

Prefer:

```text
existing tokens
→ shadcn components
→ RadialRevealButton / RadialRevealLink for default, outline, secondary, destructive CTAs
→ reusable feature components
→ new styling
```

Do not wrap `ghost`, `link`, `plain`, or ordinary text links with radial-reveal.

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
- Client UI engineering: [`../../client/docs/engineering/ui.md`](../../client/docs/engineering/ui.md)
- Admin styling note: [`../../admin-panel/docs/frontend/styling.md`](../../admin-panel/docs/frontend/styling.md)
