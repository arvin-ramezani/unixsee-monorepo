import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type AllowedElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type TitleProps = React.HTMLAttributes<HTMLElement> & {
  as?: AllowedElements;
};

const titleStyles = {
  h1: [
    "text-[2rem] leading-[1.2] font-extrabold",
    "md:text-[2.5rem] md:leading-[1.18]",
    "xl:text-[3rem] xl:leading-[1.15]",
    "rtl:leading-[1.32] md:rtl:leading-[1.28] xl:rtl:leading-[1.25]",
  ].join(" "),

  h2: [
    "text-[1.75rem] leading-[1.25] font-extrabold",
    "md:text-[2.125rem] md:leading-[1.22]",
    "xl:text-[2.5rem] xl:leading-[1.2]",
    "rtl:leading-[1.38] md:rtl:leading-[1.34] xl:rtl:leading-[1.3]",
  ].join(" "),

  h3: [
    "text-[1.5rem] leading-[1.3] font-bold",
    "md:text-[1.75rem] md:leading-[1.27]",
    "xl:text-[2rem] xl:leading-[1.25]",
    "rtl:leading-[1.42] md:rtl:leading-[1.38]",
  ].join(" "),

  h4: [
    "text-[1.25rem] leading-[1.35] font-bold",
    "md:text-[1.5rem] md:leading-[1.32]",
    "xl:text-[1.75rem] xl:leading-[1.3]",
    "rtl:leading-[1.48] md:rtl:leading-[1.44]",
  ].join(" "),

  h5: [
    "text-[1.125rem] leading-[1.4] font-semibold",
    "md:text-[1.25rem]",
    "xl:text-[1.5rem] xl:leading-[1.35]",
    "rtl:leading-[1.5]",
  ].join(" "),

  h6: [
    "text-base leading-[1.45] font-semibold",
    "md:text-lg",
    "xl:text-xl xl:leading-[1.4]",
    "rtl:leading-[1.55]",
  ].join(" "),

  p: [
    "text-[1.25rem] leading-[1.35] font-bold",
    "md:text-[1.5rem] md:leading-[1.32]",
    "rtl:leading-[1.48]",
  ].join(" "),

  span: [
    "text-[1.25rem] leading-[1.35] font-bold",
    "md:text-[1.5rem] md:leading-[1.32]",
    "rtl:leading-[1.48]",
  ].join(" "),
} satisfies Record<AllowedElements, string>;

const Title = forwardRef<HTMLElement, TitleProps>(
  ({ as = "h1", className, children, ...restProps }, ref) => {
    const Component = as;

    return (
      <Component
        ref={ref as never}
        className={cn(
          "font-kalameh-family text-foreground text-balance",
          titleStyles[as],
          className,
        )}
        {...restProps}
      >
        {children}
      </Component>
    );
  },
);

Title.displayName = "Title";

export default Title;

// import { cn } from "@/lib/utils";
// import React, { forwardRef } from "react";

// type AllowedElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

// type TitleProps = {
//   as?: AllowedElements;
//   children?: React.ReactNode;
//   className?: string;
// };

// const Title = forwardRef<HTMLElement, TitleProps>(
//   ({ as = "h1", className, children, ...restProps }, ref) => {
//     const Component = as;

//     return (
//       <Component
//         ref={ref as never}
//         className={cn(
//           "text-4xl font-extrabold text-balance lg:text-5xl lg:leading-14 lg:rtl:leading-16",
//           {
//             // "text-[2rem] md:text-[2.5rem] lg:text-5xl": as === "h1",
//             "text-[clamp(2rem,1.5rem+1.5vw,3rem)] leading-[1.15]": as === "h1",

//             // "text-[1.75rem] md:text-[2.125rem] lg:text-[2.5rem]": as === "h2",
//             "text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-[1.2]":
//               as === "h2",
//           },
//           className,
//         )}
//         {...restProps}
//       >
//         {children}
//       </Component>
//     );
//   },
// );

// Title.displayName = "Title";

// export default Title;
