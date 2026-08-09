"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * After in-app navigation to a new topic page, moves focus to the topic
 * heading so keyboard and screen-reader users land at the right place
 * (UX spec §4.3 / §11). Skips the initial mount so a direct page load is
 * not hijacked.
 */
export function TopicHeadingFocus() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const heading = document.getElementById("help-topic-heading");
    heading?.focus();
  }, [pathname]);

  return null;
}
