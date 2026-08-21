"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type AuthPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthPanel({ children, className }: AuthPanelProps) {
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, bounce: 0.1, visualDuration: 0.38 };

  return (
    <div className="relative w-full max-w-md">
      <motion.div
        className={cn(
          "border-auth-panel-border bg-auth-panel relative w-full rounded-2xl border px-5 py-6 opacity-0 will-change-transform motion-safe:translate-y-2.5 motion-reduce:translate-y-0 sm:px-6 sm:py-8",
          className,
        )}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </div>
  );
}
