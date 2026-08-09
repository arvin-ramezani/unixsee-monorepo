import { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { HTMLElements } from "framer-motion";

export type SectionType = {
  className?: string;
  containerClassName?: string;
} & PropsWithChildren &
  HTMLAttributes<HTMLElements>;

export default function Section({
  children,
  className,
  containerClassName,
  id,
}: SectionType) {
  return (
    <section
      id={id}
      className={cn(
        "bg-background relative flex w-full flex-col items-center",
        className,
      )}
    >
      <div
        className={cn(
          "container py-14 md:py-16 lg:py-24 xl:py-28",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
