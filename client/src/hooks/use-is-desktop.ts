"use client";

import { useMediaQuery } from "./use-media-query";

const IS_SERVER = typeof window === "undefined";

export default function useIsDesktop() {
  if (!IS_SERVER) return;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return isDesktop;
}
