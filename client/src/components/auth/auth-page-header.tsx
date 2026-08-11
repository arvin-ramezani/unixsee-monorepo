"use client";

import { cn } from "@/lib/utils";

export type AuthPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  titleRef?: React.Ref<HTMLHeadingElement>;
};

export function AuthPageHeader({
  title,
  description,
  className,
  titleRef,
}: AuthPageHeaderProps) {
  return (
    <header className={cn("text-start", className)}>
      <h1
        ref={titleRef}
        tabIndex={-1}
        className="text-foreground text-2xl font-semibold tracking-tight outline-none sm:text-3xl"
      >
        {title}
      </h1>
      {!!description && (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
