import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";

export type SubTitleType = {
  as?: React.ElementType;
  // children?: React.ReactNode;
  className?: string;
} & PropsWithChildren;

export default function SubTitle({ as, className, children }: SubTitleType) {
  const Element = as || "p";

  return (
    <Element
      className={cn(
        "text-text-secondary text-base md:text-lg lg:text-lg",
        className,
      )}
    >
      {children}
    </Element>
  );
}
