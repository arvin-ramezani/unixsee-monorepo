import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminBackLinkProps = {
  href: ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Shared detail-page back control. Uses outline + post-merge `cn` so
 * `border-border` wins over the button base `border-transparent`.
 */
export function AdminBackLink({
  href,
  children,
  className,
  "aria-label": ariaLabel,
}: AdminBackLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "w-fit gap-2 border-border bg-background",
        className,
      )}
    >
      <ArrowRight data-icon="inline-start" />
      {children}
    </Link>
  );
}
