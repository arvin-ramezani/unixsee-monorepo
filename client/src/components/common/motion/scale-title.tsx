"use client";

import { useRef } from "react";
import {
  HTMLMotionProps,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
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

type ScaleTitleOwnProps<T extends HeadingTag> = {
  children?: React.ReactNode;
  className?: string;
  as?: T;
  scaleFrom?: number;
  scaleTo?: number;
  withOpacity?: boolean;
  transformOrigin?: string;
};

// SOLID: Interface Segregation — props are derived per-tag from HTMLMotionProps<T>
// instead of a hand-rolled superset, so consumers only see attributes valid for
// the element they actually chose (e.g. no "href" leaking onto an <h1>).
export type ScaleTitleProps<T extends HeadingTag = "h1"> =
  ScaleTitleOwnProps<T> & Omit<HTMLMotionProps<T>, keyof ScaleTitleOwnProps<T>>;

export function ScaleTitle<T extends HeadingTag = "h1">({
  children,
  className,
  as = "h1" as T,
  scaleFrom = 0.5,
  scaleTo = 1,
  withOpacity = true,
  transformOrigin,
  style,
  ...props
}: ScaleTitleProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const isRtl = useLocale() === "fa";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 50%"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // SOLID: Open/Closed — supporting a new tag means adding one entry to
  // MotionElements, not touching this component's logic. The cast here is the
  // standard escape hatch for polymorphic "as" components: MotionElements[as]
  // is a union of incompatible forwardRef types across tags, but every member
  // is still a valid React.ElementType (Liskov-substitutable for rendering).
  const MotionTag = MotionElements[as] as React.ElementType;

  return (
    <MotionTag
      ref={ref}
      style={{
        ...style,
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
      {...props}
    >
      {children}
    </MotionTag>
  );
}

// "use client";

// import { ForwardRefExoticComponent, RefAttributes, useRef } from "react";
// import {
//   HTMLMotionProps,
//   motion,
//   useScroll,
//   useTransform,
// } from "framer-motion";
// import { useLocale } from "next-intl";

// import { cn } from "@/lib/utils";

// type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

// const MotionElements = {
//   h1: motion.h1,
//   h2: motion.h2,
//   h3: motion.h3,
//   h4: motion.h4,
//   h5: motion.h5,
//   h6: motion.h6,
//   p: motion.p,
//   span: motion.span,
// } satisfies Record<HeadingTag, React.ElementType>;

// // add motion props + forwardref
// export type ScaleTitleProps = {
//   children: React.ReactNode;
//   className?: string;
//   as?: HeadingTag;
//   scaleFrom?: number;
//   scaleTo?: number;
//   withOpacity?: boolean;
//   transformOrigin?: string;
// };

// export function ScaleTitle({
//   children,
//   className,
//   as = "h1",
//   scaleFrom = 0.5,
//   scaleTo = 1,
//   withOpacity = true,
//   transformOrigin,
//   ...props
// }: ScaleTitleProps) {
//   const ref = useRef<HTMLHeadingElement>(null);
//   const isRtl = useLocale() === "fa";

//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start 85%", "start 50%"],
//   });

//   const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
//   const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

//   const MotionTag = MotionElements[as];

//   return (
//     <MotionTag
//       ref={ref}
//       style={{
//         scale,
//         ...(withOpacity && { opacity }),
//         transformOrigin:
//           transformOrigin || (isRtl ? "right center" : "left center"),
//         willChange: "transform, opacity",
//       }}
//       className={cn(
//         "block",
//         {
//           "text-3xl font-extrabold md:text-4xl lg:text-[40px]": as !== "p",
//           "text-text-secondary text-base md:text-lg lg:text-lg": as === "p",
//         },
//         className,
//       )}
//       {...props}
//     >
//       {children}
//     </MotionTag>
//   );
// }
