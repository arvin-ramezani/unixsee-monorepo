import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span";
};

const Text = forwardRef<HTMLElement, TextProps>(
  ({ as = "p", className, children, ...restProps }, ref) => {
    const Component = as;

    return (
      <Component
        ref={ref as never}
        className={cn(
          "text-muted-foreground text-base leading-[1.4] text-balance",
          "rtl:leading-[1.65]",
          className,
        )}
        {...restProps}
      >
        {children}
      </Component>
    );
  },
);

Text.displayName = "Text";

export default Text;
