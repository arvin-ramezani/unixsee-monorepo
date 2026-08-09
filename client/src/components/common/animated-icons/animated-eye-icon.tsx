"use client";

import * as React from "react";
import { motion, useReducedMotion, type SVGMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type AnimatedEyeIconProps = Omit<SVGMotionProps<SVGSVGElement>, "children"> & {
  off: boolean;
  title?: string;
};

const slashPath = "M2 2 22 22";

export function AnimatedEyeIcon({
  off,
  title,
  className,
  ...props
}: AnimatedEyeIconProps) {
  const prefersReducedMotion = useReducedMotion();

  // Sanitizing makes the ID safe for use inside url(#...).
  const maskId = React.useId().replaceAll(":", "");

  const duration = prefersReducedMotion ? 0 : 0.22;
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
      className={cn("pointer-events-none size-4 shrink-0", className)}
      {...props}
    >
      {!!title && <title>{title}</title>}

      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          {/* Keep the complete eye visible by default. */}
          <rect width="24" height="24" fill="white" />

          {/*
           * A thicker black slash erases the eye underneath it.
           * Its geometry draws and retracts with the visible slash.
           */}
          <motion.path
            d={slashPath}
            fill="none"
            stroke="black"
            strokeWidth={4.5}
            strokeLinecap="round"
            initial={false}
            animate={{
              pathLength: off ? 1 : 0,
              pathOffset: off ? 0 : 0.5,
              strokeOpacity: off ? 1 : 0,
            }}
            transition={{
              duration,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </mask>
      </defs>

      {/* Eye geometry remains mounted throughout the animation. */}
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />

        <motion.circle
          cx="12"
          cy="12"
          r="3"
          initial={false}
          animate={{
            scale: off ? 0.88 : 1,
            strokeOpacity: off ? 0.75 : 1,
          }}
          transition={{
            duration,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        />
      </g>

      {/* Visible slash draws over the masked eye. */}
      <motion.path
        d={slashPath}
        initial={false}
        animate={{
          pathLength: off ? 1 : 0,
          pathOffset: off ? 0 : 0.5,
          strokeOpacity: off ? 1 : 0,
        }}
        transition={{
          duration,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </motion.svg>
  );
}
