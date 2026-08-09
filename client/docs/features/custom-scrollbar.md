# Custom Scrollbar Implementation

## Overview

The project uses the `overlayscrollbars` library to provide a custom desktop scrollbar while preserving the native browser scrollbar on touch-first devices.

The custom scrollbar is designed to:

- Start below the header with a configurable offset.
- End above the bottom edge of the viewport with a configurable offset.
- Optionally support a footer-based bottom offset.
- Avoid custom scrollbar behavior on touch devices.
- Prevent the scrollbar thumb from visually jumping during initialization.

## Three Scroll Surfaces

The app themes scrollbars at three levels. All three share the same blue-grey
palette (`--custom-scrollbar-thumb*`) so they read as one system.

| Surface | Mechanism | Use for | Lenis |
| --- | --- | --- | --- |
| Page (`AppScrollbar`) | OverlayScrollbars on `document.body` | The root document scroll | Driven by Lenis |
| Content region (`ScrollArea`) | Radix `ScrollArea` primitive | Overflowing content you render (lists, panels, popover bodies) | Marks a nested boundary via `data-lenis-prevent` |
| Self-scrolling element (`app-scrollbar` utility) | Native CSS scrollbar | Elements that own their scroll (`<textarea>`, `<pre>`) | Requires manual `data-lenis-prevent` |

### `ScrollArea` vs. `app-scrollbar`: which to use

Use the `ScrollArea` primitive when **you** control the overflowing content —
the Radix viewport scrolls the children you pass in, and `data-lenis-prevent` is
applied for you. Give it a bounded height (and `min-h-0` in flex layouts).

Use the `app-scrollbar` utility for elements that scroll their **own** content
and therefore cannot be driven by a `ScrollArea` viewport. A `<textarea>` is the
canonical case: wrapping it in `ScrollArea` never shows the Radix thumb, because
the wrapping viewport never overflows — the textarea scrolls internally. Apply
`app-scrollbar` directly to the element and add `data-lenis-prevent` to the same
element so Lenis does not hijack the wheel gesture:

```tsx
<Textarea
  data-lenis-prevent
  className="app-scrollbar resize-y"
/>
```

Prefer `app-scrollbar` over the `no-scrollbar` hack when a visible, themed
scrollbar is wanted. `no-scrollbar` only hides the native bar; it does not solve
the Lenis wheel-capture problem on its own.

### Customizing an internal scrollbar

Both surfaces above resolve their appearance from CSS variables, so a region can
be recolored or resized by overriding tokens on any ancestor:

- `--scroll-area-thumb`, `--scroll-area-thumb-hover`, `--scroll-area-thumb-active`
- `--scroll-area-track`
- `--scroll-area-size` — track thickness (default `0.625rem`)
- `--scroll-area-cross-padding` — inset of the thumb from the track edges

The `[data-slot="popover-content"]` block in `globals.css` is a worked example:
it tints the thumb to suit the popover surface without touching the primitive.

## Header and Bottom Offsets

The scrollbar track begins after:

```text
header height + top offset
```

The current top offset is `16px`, so the thumb begins 16 pixels below the header when the page is at the start of its scroll range.

Client-side navigation can replace the active route-group header or footer without remounting `AppScrollbar`. The measurement hook watches for matching element replacements and reattaches its `ResizeObserver`, ensuring offsets are correct immediately after navigation as well as after a full refresh.

The bottom of the track uses a fixed viewport offset rather than the full footer height.

Although the implementation can calculate the bottom position from the footer, this is not used in the current layout because the footer can exceed `70dvh`. Subtracting the complete footer height would make the scrollbar track too short and could produce incorrect thumb calculations.

For better UX, the scrollbar ends at a fixed distance from the bottom of the viewport.

## Device Capability Detection

Custom scrollbar behavior is based on input capability rather than screen size.

```ts
const supportsCustomScrollbar = matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;
```

This condition normally matches devices using a mouse or another precise pointer.

Touch-first devices keep the browser’s native scrollbar:

```ts
const isTouchDevice = !matchMedia("(hover: hover) and (pointer: fine)").matches;

if (isTouchDevice) {
  document.documentElement.removeAttribute("data-overlayscrollbars-initialize");

  document.body.removeAttribute("data-overlayscrollbars-initialize");

  return;
}
```

Removing `data-overlayscrollbars-initialize` is important because the OverlayScrollbars stylesheet may hide the native scrollbar while that attribute is present, even when no instance is created.

## Responsive CSS

The custom scrollbar is only visible when the primary pointer supports hover and precise input:

```css
@media (hover: hover) and (pointer: fine) {
  .os-theme-app {
    display: block;
  }
}

@media (hover: none), (pointer: coarse) {
  .os-theme-app {
    display: none;
  }
}
```

This is more reliable than using a breakpoint such as `1024px`.

A narrow desktop browser can still use a mouse, while a large tablet can still be touch-first.

## Initialization State

The custom scrollbar remains visually hidden until its dimensions and offsets are ready.

After header measurements and scrollbar initialization are complete, the following attribute is added:

```html
<html data-scrollbar-ready="true"></html>
```

CSS opacity and transitions then reveal the scrollbar:

```css
.os-scrollbar.os-theme-app {
  opacity: 0;
}

html[data-scrollbar-ready="true"] .os-scrollbar.os-theme-app {
  opacity: 1;
}
```

This prevents the scrollbar thumb from briefly appearing at an incorrect size or position during the initial render.

## Proportional Thumb Size

The thumb represents the fraction of the total content that is currently visible. Its size follows the same proportional model used by browser scrollbars:

```text
visible ratio = viewport size / total content size

thumb size = clamp(
  minimum thumb size,
  track size * visible ratio,
  track size
)
```

For the vertical scrollbar, OverlayScrollbars calculates the visible ratio from the viewport height and vertical overflow, exposes it through `--os-viewport-percent`, and applies it to the actual available track height. The track already accounts for the configured header and bottom offsets.

The `--os-handle-min-size: 38px` theme value remains a lower bound for usability on very long pages. It is not a fixed thumb height. Do not set `height`, `min-height`, or `max-height` directly on `.os-scrollbar-handle`, because those declarations can override or clamp the proportional size maintained by OverlayScrollbars.

Initialization is handled by hiding the complete scrollbar with opacity until `data-scrollbar-ready` is set. The handle must retain its library-calculated dimensions while hidden so it is correct when revealed.

## Implementation Rules

- Use pointer capability instead of screen size.
- Do not initialize OverlayScrollbars on touch-first devices.
- Remove initialization attributes when falling back to native scrolling.
- Do not permanently hide native scrollbars globally.
- Do not subtract the full height of a large document footer.
- Let OverlayScrollbars calculate the thumb height and movement.
- Keep the thumb proportional to the visible viewport and only apply a minimum-size bound.
- Do not override the handle's axis size during initialization; hide the scrollbar with opacity instead.
- Use `data-scrollbar-ready` only for visual initialization control.
