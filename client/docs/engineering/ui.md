# UI Engineering

> **Status:** Current
>
> **Owner:** Frontend and design teams
>
> **Last verified:** 2026-08-16

## Foundations

- Use existing semantic tokens and Tailwind CSS v4 patterns.
- Reuse `src/components/ui` primitives before creating a new primitive.
- For `default`, `outline`, `secondary`, and `destructive` button-styled
  CTAs (and matching navigational button links), prefer `RadialRevealButton`
  and `RadialRevealLink` from `src/components/common/radial-reveal/`.
  Do **not** wrap `ghost`, `link`, `plain`, or ordinary text links with
  radial-reveal — keep those on shadcn `Button` / `Link`.
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
- For Tailwind v4 positioning, prefer `inset-s-*` / `inset-e-*` / `inset-bs-*` /
  `inset-be-*` over `start-*` / `end-*` or physical `left-*` / `right-*`.
  Example: `inset-s-1/2`, not `start-1/2`. Canonical rules:
  [`../../../docs/frontend/styling.md`](../../../docs/frontend/styling.md#tailwind-css-v4-logical-utilities).
- Treat directional icons, breadcrumb separators, carousels, and motion as semantic direction decisions rather than mechanically mirroring everything.
- Test Persian and English independently at mobile and desktop widths.
- Allow for text expansion and preserve readable Persian line height and typography.

## Responsive Design

- Start with the narrow layout and add larger-breakpoint behavior deliberately.
- Avoid JavaScript media queries when CSS can express the layout.
- Preserve touch target sizes and avoid hover-only access to actions.
- Test long labels, validation errors, empty states, and dynamic content rather than only ideal fixtures.

## JSX conditionals

Shared across `admin-panel/` and `client/` — see
[`../../../docs/frontend/nextjs.md`](../../../docs/frontend/nextjs.md#positive-only-jsx-branches).

- Positive-only branches: `{condition && <Component />}` — never
  `{condition ? <Component /> : null}`.
- Coerce strings/numbers before `&&` (`!!label`, `count > 0`) so React
  does not render `0`.
- Keep a ternary only when both branches render meaningful UI.
- Agent detail:
  [`../../.agents/skills/react-19/SKILL.md`](../../.agents/skills/react-19/SKILL.md).

## Motion

- Use motion to communicate hierarchy, continuity, or state change.
- Respect reduced-motion preferences.
- Avoid layout-thrashing animation and unnecessary always-running effects.
- For enter animations, match Framer `initial` with CSS (for example
  `opacity-0`) so content is not visible before hydration finishes.
- Ensure cleanup for timers, observers, animation frames, subscriptions, and scroll locks.
- Do not remove existing motion or interaction details unless the task requests it or accessibility requires a change.

## Customer dashboard loading skeletons

**Confirmed (repo convention):** Every customer-dashboard route under
`src/app/[locale]/(dashboard)/dashboard/` that shows async page content must
ship a matching loading chrome. Do not ship a page (or change its layout)
without a skeleton that mirrors that structure.

### When creating a page

1. Add co-located `loading.tsx` next to the route `page.tsx`.
2. Implement a `*LoadingSkeleton` under `src/components/<feature>/` (same
   pattern as tickets, websites, complementary services, Unixsee messages).
3. Have `loading.tsx` wrap the skeleton in `DashboardShell` with the same
   `activeItem` / breadcrumbs the live page uses.
4. Mirror the **live layout**, not a generic placeholder:
   - same grid columns (for example `xl:grid-cols-[minmax(0,1fr)_19rem]`);
   - same max-widths (`max-w-2xl` / `max-w-5xl`) and sticky aside slots;
   - same major blocks (header, list rows / detail panel, quick-actions rail);
   - mobile vs `xl` visibility for secondary rails when the page has them.
5. Set `aria-busy="true"` and a localized `aria-label` loading string.

### When changing page structure later

Treat skeleton parity as part of the same change:

1. Diff the page / primary view layout against its `*LoadingSkeleton`.
2. Update the skeleton whenever columns, rails, max-widths, or major sections
   change.
3. Do not leave an outdated skeleton that flashes a different structure than
   the hydrated page.

Reference implementations:
`tickets-loading-skeleton.tsx`, `ticket-details-loading-skeleton.tsx`,
`unixsee-messages-loading-skeleton.tsx`,
`unixsee-message-detail-loading-skeleton.tsx`,
`request-service-loading-skeleton.tsx`.

## Accessibility

- Use semantic elements before adding roles.
- Every interactive element must be keyboard reachable with a visible focus state.
- Inputs require programmatic labels and associated error/help text.
- Dialogs, menus, sheets, and tabs must preserve their primitive's focus and keyboard model.
- Maintain sufficient contrast in light and dark themes.
- Announce meaningful asynchronous results when visual feedback alone is insufficient.

## Global Styles

Treat global CSS changes as high impact. Verify public pages, dashboard layouts, both directions, both themes, reduced motion, and mobile/desktop behavior before accepting a global selector or token change.
