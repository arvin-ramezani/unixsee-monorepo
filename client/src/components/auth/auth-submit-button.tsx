"use client";

import {
  RadialRevealButton,
  type RadialRevealButtonProps,
} from "@/components/common/radial-reveal/radial-reveal-button";
import { cn } from "@/lib/utils";

export type AuthSubmitButtonProps = RadialRevealButtonProps & {
  pendingLabel?: React.ReactNode;
};

export function AuthSubmitButton({
  className,
  loading,
  loadingLabel,
  pendingLabel,
  children,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <RadialRevealButton
      type="submit"
      loading={loading}
      loadingLabel={pendingLabel ?? loadingLabel}
      className={cn("h-11 min-h-11 w-full text-sm font-medium", className)}
      {...props}
    >
      {children}
    </RadialRevealButton>
  );
}
