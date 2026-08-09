"use client";

import React from "react";

export const ActiveSlideContext = React.createContext<{
  activeIndex: number;
} | null>(null);

export default function useActiveSlide() {
  const ctx = React.useContext(ActiveSlideContext);
  if (!ctx) throw new Error("useActiveSlide must be used inside provider");
  return ctx;
}
