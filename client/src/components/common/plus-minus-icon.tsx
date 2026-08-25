"use client";

import { motion, useReducedMotion, type SVGMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type PlusMinusIconProps = Omit<SVGMotionProps<SVGSVGElement>, "children"> & {
  expanded: boolean;
  title?: string;
};

export function PlusMinusIcon({
  expanded,
  title,
  className,
  ...props
}: PlusMinusIconProps) {
  const prefersReducedMotion = useReducedMotion();

  const duration = prefersReducedMotion ? 0 : 0.2;
  const hasAccessibleName = Boolean(title || props["aria-label"]);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      fill="none"
      focusable="false"
      role={hasAccessibleName ? "img" : undefined}
      aria-hidden={hasAccessibleName ? undefined : true}
      data-slot="accordion-trigger-icon"
      className={cn("pointer-events-none size-4 shrink-0", className)}
      {...props}
    >
      {!!title && <title>{title}</title>}

      {/* Horizontal bar: always visible */}
      <rect
        x="2.25"
        y="7"
        width="10.5"
        height="1"
        rx="0.5"
        fill="currentColor"
      />

      {/* Vertical bar: collapses into the horizontal bar */}
      <motion.rect
        x="7"
        width="1"
        rx="0.5"
        fill="currentColor"
        initial={false}
        animate={{
          attrY: expanded ? 7.5 : 2.25,
          height: expanded ? 0 : 10.5,
          opacity: expanded ? 0 : 1,
        }}
        transition={{
          duration,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </motion.svg>
  );
}
