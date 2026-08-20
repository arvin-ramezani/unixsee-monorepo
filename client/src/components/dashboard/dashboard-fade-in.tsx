"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Soft enter duration for dashboard content (SaaS best practice: 200–300ms). */
const ENTER_DURATION_S = 0.25;

/**
 * Simple opacity fade-in for dashboard route enters, filter results, and
 * grid/table view changes. Remounts when `animationKey` changes.
 *
 * Matches `initial` opacity with CSS `opacity-0` so content stays hidden
 * until hydration finishes (see docs/engineering/ui.md).
 *
 * Use `deferUntilKeyChange` on filter/view wrappers so the first paint is
 * handled by the route `template.tsx` fade instead of stacking two fades.
 */
export function DashboardFadeIn({
  children,
  className,
  animationKey,
  deferUntilKeyChange = false,
}: {
  children: ReactNode;
  className?: string;
  /** Change this to replay the enter animation (filters, view mode, etc.). */
  animationKey?: string | number;
  /** Skip the first mount; animate only after `animationKey` changes. */
  deferUntilKeyChange?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const hasMountedRef = useRef(false);
  const playEnter = !deferUntilKeyChange || hasMountedRef.current;

  useEffect(() => {
    hasMountedRef.current = true;
  }, [animationKey]);

  return (
    <motion.div
      key={animationKey}
      className={cn(playEnter && "opacity-0", className)}
      initial={playEnter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : ENTER_DURATION_S,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
