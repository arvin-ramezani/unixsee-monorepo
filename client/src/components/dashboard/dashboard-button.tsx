"use client";

import * as React from "react";

import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { cn } from "@/lib/utils";

import {
  dashboardButtonSizeVariants,
  type DashboardButtonSizeVariants,
} from "./dashboard-button-variants";

type DashboardButtonProps = Omit<
  React.ComponentProps<typeof RadialRevealButton>,
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
 * Dashboard-styled button wrapper
 *
 * Wraps RadialRevealButton with dashboard-specific sizing.
 * Base classes and color variants come from buttonVariants through the radial-reveal chain.
 * Only geometry (height, padding, border-radius) is dashboard-specific.
 *
 * @example
 * ```tsx
 * <DashboardButton size="xl" variant="outline">
 *   Save Changes
 * </DashboardButton>
 * ```
 */
function DashboardButton({
  className,
  variant = "primary",
  size = "lg",
  ...props
}: DashboardButtonProps) {
  // Map dashboard variant names to buttonVariants names
  const buttonVariant = variant === "primary" ? "default" : variant;

  return (
    <RadialRevealButton
      size="plain"
      variant={buttonVariant}
      className={cn(dashboardButtonSizeVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { DashboardButton };
