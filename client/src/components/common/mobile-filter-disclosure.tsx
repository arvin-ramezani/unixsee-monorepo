"use client";

import { type ReactNode, useId, useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Animated mobile filter disclosure.
 *
 * Replaces the native `<details>`/`<summary>` pattern (which cannot animate its
 * height) with a controlled button + `motion.div` that animates `height`
 * between `auto` and `0`. Shared by feature managers that expose a collapsible
 * filter panel on small screens (e.g. tickets, complementary services).
 *
 * Callers control the responsive visibility via `className` (e.g. `lg:hidden`
 * or `md:hidden`) so each page keeps its own breakpoint.
 */
export function MobileFilterDisclosure({
  label,
  children,
  className,
  contentClassName,
}: {
  /** Trigger text shown next to the filter icon. */
  label: string;
  /** Filter controls revealed when expanded. */
  children: ReactNode;
  /** Applied to the root wrapper — set the responsive breakpoint here. */
  className?: string;
  /** Overrides the default content grid layout. */
  contentClassName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className={cn("mt-3", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        className="border-border focus-visible:ring-ring flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
      >
        <Filter aria-hidden="true" className="size-4" />
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ms-auto size-4 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            key="content"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { height: "auto", opacity: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0.12 } }
                : { height: 0, opacity: 0 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : {
                    height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2, ease: "easeOut" },
                  }
            }
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-3 grid gap-3 sm:grid-cols-2",
                contentClassName,
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
