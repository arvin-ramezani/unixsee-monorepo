"use client";

import * as React from "react";

export function useIsMobile(mobileBreakpoint = 768) {
  // Always start false so SSR and the first client render match.
  // Real viewport detection runs only after mount.
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(
      `(max-width: ${mobileBreakpoint - 1}px)`,
    );

    const handleChange = () => {
      setIsMobile(mediaQueryList.matches);
    };

    handleChange();
    mediaQueryList.addEventListener("change", handleChange);

    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [mobileBreakpoint]);

  return isMobile;
}
