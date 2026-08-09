"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type HeadingTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "section"
  | "article";

type MotionTitleProps = Omit<HTMLMotionProps<"div">, "ref"> & {
  as?: HeadingTag;
};

const motionComponents: Record<HeadingTag, React.ElementType> = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  span: motion.span,
  div: motion.div,
  section: motion.section,
  article: motion.article,
};

const MotionTitle = forwardRef<HTMLElement, MotionTitleProps>(
  ({ as = "h1", className, children, ...restProps }, ref) => {
    const Component = motionComponents[as] as React.ForwardRefExoticComponent<
      React.PropsWithoutRef<MotionTitleProps> & React.RefAttributes<HTMLElement>
    >;

    return (
      <Component
        ref={ref}
        className={cn(
          "text-3xl font-semibold md:text-4xl lg:text-5xl",
          className,
        )}
        {...restProps}
      >
        {children}
      </Component>
    );
  },
);

MotionTitle.displayName = "MotionTitle";

export default MotionTitle;

// "use client";

// import { cn } from "@/lib/utils";
// import { AnimateType } from "@/types/framer-motion.types";
// import React, { forwardRef } from "react";
// import { motion } from "framer-motion";

// // type AllowedElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

// type MotionTitleProps = {
//   as?: React.ElementType;
//   children?: React.ReactNode;
//   className?: string;
//   animate?: AnimateType;
//   initial?: AnimateType;
// };

// const MotionTitle = forwardRef<HTMLElement, MotionTitleProps>(
//   ({ as = "h1", className, children, ...restProps }, ref) => {
//     // const Component = `motion.${as}`;
//     const Component = motion[as];

//     return (
//       <Component
//         ref={ref}
//         className={cn(
//           "text-3xl font-semibold md:text-4xl lg:text-5xl",
//           className,
//         )}
//         {...restProps}
//       >
//         {children}
//       </Component>
//     );
//   },
// );

// MotionTitle.displayName = "MotionTitle";

// export default MotionTitle;
