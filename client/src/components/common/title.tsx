import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type AllowedElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type TitleProps = {
  as?: AllowedElements;
  children?: React.ReactNode;
  className?: string;
};

const Title = forwardRef<HTMLElement, TitleProps>(
  ({ as = "h1", className, children, ...restProps }, ref) => {
    const Component = as;

    return (
      <Component
        ref={ref as never}
        className={cn(
          "text-3xl font-extrabold md:text-4xl lg:text-5xl",
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
