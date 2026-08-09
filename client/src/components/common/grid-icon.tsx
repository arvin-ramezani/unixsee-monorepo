"use client";

import { motion, useReducedMotion, type SVGMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type LayoutMorphIconProps = Omit<SVGMotionProps<SVGSVGElement>, "children"> & {
  view: "grid" | "list";
  title?: string;
};

const listLines = ["M14 4h7", "M14 9h7", "M14 15h7", "M14 20h7"] as const;

export function GridIcon({
  view,
  title,
  className,
  ...props
}: LayoutMorphIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isList = view === "list";

  const duration = prefersReducedMotion ? 0 : 0.6;
  const ease = [0.4, 0, 0.2, 1] as const;

  const hasAccessibleName = Boolean(title || props["aria-label"]);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={hasAccessibleName ? "img" : undefined}
      aria-hidden={hasAccessibleName ? undefined : true}
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />

      <motion.rect
        x="14"
        width="7"
        initial={false}
        animate={{
          attrY: isList ? 4 : 3,
          height: isList ? 0 : 7,
          rx: isList ? 0 : 1,
          pathLength: isList ? 0 : 1,
          pathOffset: isList ? 0.5 : 0,
          strokeOpacity: isList ? 0 : 1,
        }}
        transition={{
          duration,
          ease,
          //   delay: isList ? 0 : duration * 0.15,
        }}
      />

      <motion.rect
        x="14"
        width="7"
        initial={false}
        animate={{
          attrY: isList ? 15 : 14,
          height: isList ? 0 : 7,
          rx: isList ? 0 : 1,
          pathLength: isList ? 0 : 1,
          pathOffset: isList ? 0.5 : 0,
          strokeOpacity: isList ? 0 : 1,
        }}
        transition={{
          duration,
          ease,
          //   delay: isList ? 0 : duration * 0.15,
        }}
      />

      {listLines.map((path) => (
        <motion.path
          key={path}
          d={path}
          initial={false}
          animate={{
            pathLength: isList ? 1 : 0,
            pathOffset: isList ? 0 : 0.5,
            strokeOpacity: isList ? 1 : 0,
          }}
          transition={{
            duration,
            ease,
            // delay: isList ? duration * (0.12 + index * 0.035) : index * 0.015,
          }}
        />
      ))}
    </motion.svg>
  );
}
