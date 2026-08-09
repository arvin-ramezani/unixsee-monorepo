"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

const MotionElements = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  span: motion.span,
} satisfies Record<HeadingTag, React.ElementType>;

interface ScaleTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: HeadingTag;
  scaleFrom?: number;
  scaleTo?: number;
  withOpacity?: boolean;
  transformOrigin?: string;
}

export function ScaleTitle({
  children,
  className,
  as = "h1",
  scaleFrom = 0.5,
  scaleTo = 1,
  withOpacity = true,
  transformOrigin,
}: ScaleTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isRtl = useLocale() === "fa";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 50%"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const MotionTag = MotionElements[as];

  return (
    <MotionTag
      ref={ref}
      style={{
        scale,
        ...(withOpacity && { opacity }),
        transformOrigin:
          transformOrigin || (isRtl ? "right center" : "left center"),
        willChange: "transform, opacity",
      }}
      className={cn(
        "block",
        {
          "text-3xl font-extrabold md:text-4xl lg:text-[40px]": as !== "p",
          "text-text-secondary text-base md:text-lg lg:text-lg": as === "p",
        },
        className,
      )}
    >
      {children}
    </MotionTag>
  );
}
