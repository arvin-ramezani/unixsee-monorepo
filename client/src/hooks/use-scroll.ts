"use client";

import * as React from "react";

/**
 * Returns `true` once the window has scrolled past `threshold` pixels.
 * Used for scroll-elevation on sticky headers.
 */
export function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onScroll();
  }, [onScroll]);

  return scrolled;
}
