"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type FloatingNavEyeMarkProps = {
  className?: string;
};

/**
 * Brand mark for the bottom floating navigation.
 * Simple occasional blink + soft pupil drift; static when reduced motion is on.
 */
export function FloatingNavEyeMark({ className }: FloatingNavEyeMarkProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none size-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.35)] lg:size-8",
        className,
      )}
    >
      <path
        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <motion.g
        style={{ transformOrigin: "12px 12px" }}
        animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [1, 0.08, 1] }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.16,
                times: [0, 0.4, 1],
                ease: ["easeIn", "easeOut"],
                repeat: Infinity,
                repeatDelay: 3.8,
              }
        }
      >
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth={1.5}
          fill="rgba(255,255,255,0.12)"
        />
        <motion.g
          animate={
            shouldReduceMotion
              ? { x: 0 }
              : {
                  // Glance right → rest center → glance left → rest center
                  x: [0, 1.35, 1.35, 0, -1.35, -1.35, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 5.6,
                  times: [0, 0.18, 0.32, 0.45, 0.63, 0.77, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                }
          }
        >
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          <circle cx="13" cy="11.1" r="0.45" fill="white" fillOpacity={0.9} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
