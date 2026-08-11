"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Button, type ShadcnButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRadialReveal } from "./use-radial-reveal";

export type RadialRevealButtonProps = Omit<ShadcnButtonProps, "asChild"> & {
  revealColor?: string;
  revealClassName?: string;
  rippleColor?: string;
  rippleClassName?: string;
};

function RadialRevealButton({
  className,
  revealColor,
  revealClassName,
  rippleColor,
  rippleClassName,
  children,
  variant = "default",
  size = "default",
  disabled,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onClick,
  ...props
}: RadialRevealButtonProps) {
  const radialReveal = useRadialReveal<HTMLButtonElement>({
    disabled,
    style,
    revealColor,
    rippleColor,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onFocus,
    onBlur,
    onClick,
  });

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={disabled}
      style={radialReveal.style}
      {...radialReveal.handlers}
      className={cn(
        "relative isolate overflow-hidden [&_span]:w-fit",
        "transition-[box-shadow,color] duration-300 ease-out",
        "data-[radial-active=true]:text-primary-foreground",
        "active:shadow-none",
        className,
      )}
      data-radial-active={radialReveal.isActive ? "true" : undefined}
      data-radial-hover-active={
        radialReveal.isHoverRevealActive ? "true" : undefined
      }
    >
      <motion.span
        aria-hidden="true"
        className={cn(
          "bg-button-radial-reveal pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 rounded-full",
          revealClassName,
        )}
        style={{
          left: radialReveal.revealX,
          top: radialReveal.revealY,
          width: radialReveal.revealDiameter,
          height: radialReveal.revealDiameter,
        }}
        initial={false}
        animate={{
          scale: radialReveal.isHoverRevealActive ? 1 : 0.02,
          opacity: radialReveal.isHoverRevealActive ? 1 : 0,
        }}
        transition={
          radialReveal.shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: radialReveal.isHoverRevealActive ? 0.45 : 0.22,
                ease: [0.16, 1, 0.3, 1],
              }
        }
      />

      {radialReveal.ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          aria-hidden="true"
          className={cn(
            "bg-button-radial-ripple pointer-events-none absolute z-1 -translate-x-1/2 -translate-y-1/2 rounded-full",
            rippleClassName,
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.diameter,
            height: ripple.diameter,
          }}
          initial={{
            scale: 0.02,
            opacity: 0.45,
          }}
          animate={{
            scale: 1,
            opacity: 0,
          }}
          transition={
            radialReveal.shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          onAnimationComplete={() => {
            radialReveal.removeRipple(ripple.id);
          }}
        />
      ))}

      <span className="relative z-10 inline-flex items-center justify-center gap-[inherit]">
        {children}
      </span>
    </Button>
  );
}

export { RadialRevealButton };
