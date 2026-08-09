import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "border-border bg-background dark:shadow-sticky-card rounded-xl border shadow-[0_6px_18px_-14px_color-mix(in_oklch,var(--foreground)_28%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
