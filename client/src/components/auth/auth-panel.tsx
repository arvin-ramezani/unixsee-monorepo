"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type AuthPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * CSS mirrors Framer `initial` so the panel stays hidden until hydration
 * applies `animate` (avoids a one-frame fully-visible flash).
 */
const enterHiddenClass =
  "opacity-0 will-change-transform motion-safe:translate-y-2.5 motion-reduce:translate-y-0";

export function AuthPanel({ children, className }: AuthPanelProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  const transition = reduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, bounce: 0.1, visualDuration: 0.38 };

  return (
    // Stable size shell — only the bordered surface animates, as one unit,
    // so the border never sits empty while nested content fades.
    <div className="relative w-full max-w-md">
      <AnimatePresence mode="wait" initial>
        <motion.div
          key={pathname}
          className={cn(
            "border-auth-panel-border bg-auth-panel relative w-full rounded-2xl border px-5 py-6 sm:px-6 sm:py-8",
            enterHiddenClass,
            className,
          )}
          style={{ opacity: 0 }}
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -8 }
          }
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
