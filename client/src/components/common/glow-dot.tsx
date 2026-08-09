"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type GlowDotProps = {
  className?: string;
  color: string;
  color2?: string;
  color3?: string;
};

export default function GlowDot({
  className,
  color,
  color2,
  color3,
}: GlowDotProps) {
  return (
    <div className="relative flex size-4 items-center justify-center overflow-visible lg:size-6 2xl:size-6">
      {[-1.6, -0.8, 0].map((delay) => (
        <motion.span
          key={delay}
          className={cn(
            "bg-secondary/70 absolute inset-0 rounded-full",
            color3,
          )}
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1, 1.35, 1.9],
            opacity: [0, 0, 0.3, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.18, 0.38, 1],
            delay,
          }}
        />
      ))}

      <motion.span
        className={cn(
          "bg-secondary/90 absolute inset-2 rounded-full blur-md",
          color2,
        )}
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: [1, 1, 1.15, 1.45],
          opacity: [0, 0, 0.2, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.2, 0.4, 1],
          delay: -0.4,
        }}
      />

      <div
        className={cn(
          "bg-secondary relative z-10 size-2 rounded-full shadow-[0_0_24px_rgba(31,167,155,0.45)] lg:size-3 2xl:size-3",
          color,
        )}
      />
    </div>
  );
}
