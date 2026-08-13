## Components

Use feature-based, reusable components.

```text
src/components/
├── tickets/
├── websites/
├── users/
└── ui/
```

## Rules

- Reuse existing components before creating new ones.
- Keep feature-specific components inside their feature directory.
- Keep generic UI primitives inside `components/ui`.
- Prefer composition over large, highly configurable components.
- Extract a component when it has a clear responsibility or meaningful reuse.
- Do not create abstractions only to avoid a small amount of duplication.
- Avoid duplicating substantially identical UI.
- Keep components focused, composable, and easy to understand.
- Apply the Single Responsibility Principle: a component should have one clear responsibility.
- Do not rewrite existing components unless the task requires it.

## Static UI Configuration

Do not define static field definitions, labels, options, navigation items, or similar configuration directly inside JSX.

Prefer a named constant outside the component and render it with `map()`:

```tsx
const WEBSITE_DETAIL_FIELDS = [
  { key: "domain", label: "دامنه" },
  { key: "customerName", label: "مشتری" },
  { key: "plan", label: "پلن" },
] as const;
```

Use `UPPER_SNAKE_CASE` for module-level constants.

Keep dynamic values in the component's data and use the configuration only to describe how they should be rendered.

Do not create a configuration array solely to avoid a few simple, genuinely unique JSX elements.

Do not write types directly in code, but create a separate types for them like:

```tsx
export const TICKET_STATUS = {
  WAITING_FOR_USER: "WAITING_FOR_USER",
  IN_PROGRESS: "IN_PROGRESS",
  NEW: "NEW",
  RESOLVED: "RESOLVED",
} as const;

export type TicketStatusType =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
```

in near of top of the component file.

## Styling

- Reuse existing design tokens and styles from `${projectRoot}/src/globals.css`.
- If no suitable token exists, create a meaningful semantic token based on the existing color palette.
- Use current Tailwind CSS v4 syntax.
- Prefer the project's existing tokens over arbitrary values.
- Do not introduce duplicate colors, spacing, typography, or design tokens.

## Component Reuse

Reuse an existing component when it provides the required behavior.

If a feature-specific component becomes genuinely reusable across features, move it to an appropriate shared directory instead of duplicating it.

Do not move components merely because they might be reusable in the future.

## shadcn/ui

The project uses **shadcn/ui with the Base UI approach**.

Before creating a UI primitive:

1. Check whether the required shadcn component already exists.
2. Reuse and compose the existing component when possible.
3. If it is not installed, attempt to add the official shadcn component.
4. If installation fails, ask the developer to add it manually.
5. Continue the task after the component is available.

Project-specific components should compose shadcn components rather than recreate or replace their primitives.

## Select

When using the shadcn Select component, always use the project's Base UI implementation with:

```tsx
    <SelectTrigger aria-label="aria_label">
        <SelectValue>{label}</SelectValue>
    </SelectTrigger>
    <SelectContent alignItemWithTrigger={false}>
```

Do not omit `alignItemWithTrigger={false}` from Select implementations.

Follow the existing Select component structure in the repository and place the prop on the appropriate Base UI Select element.

## DropdownMenu

The project uses **shadcn/ui DropdownMenu on Base UI** (`@base-ui/react/menu`).

**Confirmed (runtime):** `DropdownMenuLabel` is implemented as Base UI `Menu.GroupLabel` and **must** be nested inside `DropdownMenuGroup`. Placing a label (or separator used as a group divider) directly under `DropdownMenuContent` throws at runtime:

```text
MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.
```

Use this structure (reference: `src/components/layout/team-switcher.tsx`):

```tsx
<DropdownMenuContent align="end">
  <DropdownMenuGroup>
    <DropdownMenuLabel>عنوان گروه</DropdownMenuLabel>
    <DropdownMenuItem onClick={...}>اقدام</DropdownMenuItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

Rules:

- Wrap every `DropdownMenuLabel` in `DropdownMenuGroup`.
- Prefer `DropdownMenuGroup` for related items even when no label is shown.
- Use `DropdownMenu` for **action lists** (for example رد/لغو in plan-request detail); pick the action in the menu, then confirm with reason in the panel—do not duplicate action type with a second Select.
