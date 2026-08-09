# UI Engineering

> **Status:** Current
>
> **Owner:** Frontend and design teams
>
> **Last verified:** 2026-08-04

## Foundations

- Use existing semantic tokens and Tailwind CSS v4 patterns.
- Reuse `src/components/ui` primitives before creating a new primitive.
- Preserve Radix semantics, focus management, keyboard interaction, and ARIA behavior.
- Use Lucide or the repository's existing icon source instead of custom text glyphs.
- Prefer composition over copying variant classes into feature components.

## Component Scope

- Low-level primitives must not contain Unixsee feature mapping or localized business copy.
- Shared brand/presentation elements belong in `src/components/common`.
- Customer-dashboard shell and reusable dashboard presentation components belong in `src/components/dashboard`.
- Feature components belong in their existing `src/components/<feature>` directory.
- Route-specific sections stay under the route that owns them.

## RTL and LTR

- Use logical properties and utilities such as inline start/end instead of physical left/right when direction should adapt.
- Treat directional icons, breadcrumb separators, carousels, and motion as semantic direction decisions rather than mechanically mirroring everything.
- Test Persian and English independently at mobile and desktop widths.
- Allow for text expansion and preserve readable Persian line height and typography.

## Responsive Design

- Start with the narrow layout and add larger-breakpoint behavior deliberately.
- Avoid JavaScript media queries when CSS can express the layout.
- Preserve touch target sizes and avoid hover-only access to actions.
- Test long labels, validation errors, empty states, and dynamic content rather than only ideal fixtures.

## Motion

- Use motion to communicate hierarchy, continuity, or state change.
- Respect reduced-motion preferences.
- Avoid layout-thrashing animation and unnecessary always-running effects.
- Ensure cleanup for timers, observers, animation frames, subscriptions, and scroll locks.
- Do not remove existing motion or interaction details unless the task requests it or accessibility requires a change.

## Accessibility

- Use semantic elements before adding roles.
- Every interactive element must be keyboard reachable with a visible focus state.
- Inputs require programmatic labels and associated error/help text.
- Dialogs, menus, sheets, and tabs must preserve their primitive's focus and keyboard model.
- Maintain sufficient contrast in light and dark themes.
- Announce meaningful asynchronous results when visual feedback alone is insufficient.

## Global Styles

Treat global CSS changes as high impact. Verify public pages, dashboard layouts, both directions, both themes, reduced motion, and mobile/desktop behavior before accepting a global selector or token change.
