"use client";

import * as React from "react";

import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";
import { cn } from "@/lib/utils";
import {
  dashboardButtonSizeVariants,
  DashboardButtonSizeVariants,
} from "./dashboard-button-variants";

type DashboardButtonLinkProps = Omit<
  React.ComponentProps<typeof RadialRevealLink>,
  "size" | "variant"
> &
  DashboardButtonSizeVariants & {
    /**
     * Button color variant. Maps to buttonVariants from @/components/ui/button:
     * - "primary" → "default" (filled primary background)
     * - "outline" → "outline" (transparent with primary border)
     */
    variant?: "primary" | "outline";
  };

/**
 * Dashboard-styled link button wrapper
 *
 * Wraps RadialRevealLink with dashboard-specific sizing.
 * Base classes and color variants come from buttonVariants through the radial-reveal chain.
 * Only geometry (height, padding, border-radius) is dashboard-specific.
 *
 * @example
 * ```tsx
 * <DashboardButtonLink href="/dashboard/profile" size="xl" variant="outline">
 *   View Profile
 * </DashboardButtonLink>
 * ```
 */
function DashboardButtonLink({
  className,
  variant = "primary",
  size = "lg",
  ...props
}: DashboardButtonLinkProps) {
  // Map dashboard variant names to buttonVariants names
  const buttonVariant = variant === "primary" ? "default" : variant;

  return (
    <RadialRevealLink
      size="plain"
      variant={buttonVariant}
      className={cn(dashboardButtonSizeVariants({ size }), className)}
      {...props}
    />
  );
}

export { DashboardButtonLink };
