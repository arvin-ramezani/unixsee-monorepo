import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";

export type SubTitleType = {
  as?: React.ElementType;
  // children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>;

export default function SubTitle({
  as,
  className,
  children,
  ...props
}: SubTitleType) {
  const Element = as || "p";

  return (
    <Element
      className={cn(
        "text-text-secondary text-base md:text-lg lg:text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  );
}
