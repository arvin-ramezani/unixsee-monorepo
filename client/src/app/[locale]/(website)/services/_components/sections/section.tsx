import { ComponentProps, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export type SectionType = {
  className?: string;
  containerClassName?: string;
} & ComponentProps<"section"> &
  PropsWithChildren;

export default function Section({
  children,
  className,
  containerClassName,

  ...otherProps
}: SectionType) {
  return (
    <section {...otherProps} className={cn("bg-background w-full", className)}>
      <div
        className={cn(
          "container-lg flex flex-col py-14 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-24 xl:py-28",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
