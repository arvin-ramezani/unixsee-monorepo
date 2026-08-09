"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

export type LogicalGrowSide =
  | "top"
  | "bottom"
  | "start"
  | "end"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "top-left"
  | "top-right"
  | "bottom-start"
  | "bottom-end"
  | "bottom-left"
  | "bottom-right";

type InlineEdge = "left" | "right";
type BlockEdge = "top" | "bottom";

type TriggerOrigin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type ResolvedGrowSide = {
  inlineEdge: InlineEdge;
  blockEdge: BlockEdge;
  animateWidth: boolean;
  animateHeight: boolean;
};

type MotionGrowDialogContextValue = {
  side: LogicalGrowSide;
  isRtl: boolean;
  isClosing: boolean;
  triggerOrigin: TriggerOrigin | null;
  captureTriggerOrigin: (element?: HTMLElement | null) => void;
  completeCloseAnimation: () => void;
};

const MotionGrowDialogContext = React.createContext<
  MotionGrowDialogContextValue | undefined
>(undefined);

function useMotionGrowDialogContext(componentName: string) {
  const context = React.useContext(MotionGrowDialogContext);

  if (!context) {
    throw new Error(
      `${componentName} must be used inside <MotionGrowDialog />`,
    );
  }

  return context;
}

function getViewportSize(): ViewportSize {
  if (typeof window === "undefined") {
    return { width: 390, height: 844 };
  }

  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function composeEventHandlers<E extends React.SyntheticEvent>(
  userHandler: ((event: E) => void) | undefined,
  internalHandler: (event: E) => void,
) {
  return (event: E) => {
    userHandler?.(event);

    if (!event.defaultPrevented) {
      internalHandler(event);
    }
  };
}

function resolveInlineEdge(
  side: LogicalGrowSide,
  isRtl: boolean,
): InlineEdge | null {
  if (side === "left" || side.endsWith("-left")) return "left";
  if (side === "right" || side.endsWith("-right")) return "right";

  if (side === "start" || side.endsWith("-start")) {
    return isRtl ? "right" : "left";
  }

  if (side === "end" || side.endsWith("-end")) {
    return isRtl ? "left" : "right";
  }

  return null;
}

function resolveBlockEdge(side: LogicalGrowSide): BlockEdge | null {
  if (side === "top" || side.startsWith("top-")) return "top";
  if (side === "bottom" || side.startsWith("bottom-")) return "bottom";

  return null;
}

function resolveGrowSide(
  side: LogicalGrowSide,
  isRtl: boolean,
): ResolvedGrowSide {
  const inlineEdge = resolveInlineEdge(side, isRtl);
  const blockEdge = resolveBlockEdge(side);

  return {
    // Height-only sides still need a stable horizontal position.
    inlineEdge: inlineEdge ?? (isRtl ? "right" : "left"),
    // Width-only sides still need a stable vertical position.
    blockEdge: blockEdge ?? "bottom",
    animateWidth: inlineEdge !== null,
    animateHeight: blockEdge !== null,
  };
}

function getOriginOffset(
  edge: InlineEdge | BlockEdge,
  origin: TriggerOrigin | null,
  viewport: ViewportSize,
  fallback: number,
) {
  if (!origin) return fallback;

  switch (edge) {
    case "left":
      return Math.max(0, origin.left);
    case "right":
      return Math.max(0, viewport.width - origin.right);
    case "top":
      return Math.max(0, origin.top);
    case "bottom":
      return Math.max(0, viewport.height - origin.bottom);
  }
}

export type MotionGrowDialogProps = Omit<
  React.ComponentPropsWithoutRef<typeof Dialog>,
  "open" | "defaultOpen" | "onOpenChange"
> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: LogicalGrowSide;
  lockScroll?: boolean;
  scrollLockKey?: string;
};

export function MotionGrowDialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = "bottom-start",
  lockScroll = true,
  scrollLockKey = "motion-grow-dialog",
  ...props
}: MotionGrowDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [mountedOpen, setMountedOpen] = React.useState(
    controlledOpen ?? defaultOpen,
  );
  const [isClosing, setIsClosing] = React.useState(false);
  const [triggerOrigin, setTriggerOrigin] =
    React.useState<TriggerOrigin | null>(null);
  const shouldCloseAfterAnimationRef = React.useRef(false);

  const isRtl = useLocale() === "fa";

  useScrollLock(lockScroll && mountedOpen, scrollLockKey);

  React.useEffect(() => {
    if (!isControlled) return;

    if (controlledOpen) {
      shouldCloseAfterAnimationRef.current = false;
      setIsClosing(false);
      setMountedOpen(true);
      return;
    }

    if (mountedOpen) {
      shouldCloseAfterAnimationRef.current = true;
      setIsClosing(true);
    }
  }, [controlledOpen, isControlled, mountedOpen]);

  const captureTriggerOrigin = React.useCallback(
    (element?: HTMLElement | null) => {
      if (!element) return;

      const rect = element.getBoundingClientRect();

      setTriggerOrigin({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      });
    },
    [],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        shouldCloseAfterAnimationRef.current = false;
        setIsClosing(false);
        setMountedOpen(true);

        if (!isControlled) {
          onOpenChange?.(true);
          return;
        }

        onOpenChange?.(true);
        return;
      }

      if (!mountedOpen) return;

      shouldCloseAfterAnimationRef.current = true;
      setIsClosing(true);
      onOpenChange?.(false);
    },
    [isControlled, mountedOpen, onOpenChange],
  );

  const completeCloseAnimation = React.useCallback(() => {
    if (!shouldCloseAfterAnimationRef.current) return;

    shouldCloseAfterAnimationRef.current = false;
    setMountedOpen(false);
    setIsClosing(false);
  }, []);

  const context = React.useMemo<MotionGrowDialogContextValue>(
    () => ({
      side,
      isRtl,
      isClosing,
      triggerOrigin,
      captureTriggerOrigin,
      completeCloseAnimation,
    }),
    [
      side,
      isRtl,
      isClosing,
      triggerOrigin,
      captureTriggerOrigin,
      completeCloseAnimation,
    ],
  );

  return (
    <MotionGrowDialogContext.Provider value={context}>
      <Dialog open={mountedOpen} onOpenChange={handleOpenChange} {...props}>
        {children}
      </Dialog>
    </MotionGrowDialogContext.Provider>
  );
}

export const MotionGrowDialogTrigger = React.forwardRef<
  React.ComponentRef<typeof DialogTrigger>,
  React.ComponentPropsWithoutRef<typeof DialogTrigger>
>(({ onPointerDown, onKeyDown, onClick, ...props }, ref) => {
  const { captureTriggerOrigin } = useMotionGrowDialogContext(
    "MotionGrowDialogTrigger",
  );

  return (
    <DialogTrigger
      ref={ref}
      onPointerDown={composeEventHandlers(onPointerDown, (event) => {
        captureTriggerOrigin(event.currentTarget as HTMLElement);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.key === "Enter" || event.key === " ") {
          captureTriggerOrigin(event.currentTarget as HTMLElement);
        }
      })}
      onClick={composeEventHandlers(onClick, (event) => {
        captureTriggerOrigin(event.currentTarget as HTMLElement);
      })}
      {...props}
    />
  );
});
MotionGrowDialogTrigger.displayName = "MotionGrowDialogTrigger";

export type MotionGrowDialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: LogicalGrowSide;
  showCloseButton?: boolean;
  maxWidth?: number;
  margin?: number;
};

export const MotionGrowDialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  MotionGrowDialogContentProps
>(
  (
    {
      className,
      children,
      side,
      showCloseButton = true,
      maxWidth = 384,
      margin = 16,
      ...props
    },
    ref,
  ) => {
    const {
      side: rootSide,
      isRtl,
      isClosing,
      triggerOrigin,
      completeCloseAnimation,
    } = useMotionGrowDialogContext("MotionGrowDialogContent");
    const shouldReduceMotion = useReducedMotion();
    const [viewport, setViewport] = React.useState(getViewportSize);
    const [isRevealComplete, setIsRevealComplete] = React.useState(false);

    React.useEffect(() => {
      const updateViewport = () => setViewport(getViewportSize());

      updateViewport();
      window.addEventListener("resize", updateViewport);
      window.visualViewport?.addEventListener("resize", updateViewport);

      return () => {
        window.removeEventListener("resize", updateViewport);
        window.visualViewport?.removeEventListener("resize", updateViewport);
      };
    }, []);

    React.useEffect(() => {
      if (isClosing) {
        setIsRevealComplete(false);
      }
    }, [isClosing]);

    const activeSide = side ?? rootSide;
    const resolvedSide = resolveGrowSide(activeSide, isRtl);
    const { inlineEdge, blockEdge, animateWidth, animateHeight } = resolvedSide;

    const originInlineOffset = getOriginOffset(
      inlineEdge,
      triggerOrigin,
      viewport,
      margin,
    );
    const originBlockOffset = getOriginOffset(
      blockEdge,
      triggerOrigin,
      viewport,
      margin,
    );

    const finalInlineOffset = clamp(
      originInlineOffset,
      margin,
      viewport.width - 2,
    );
    const finalBlockOffset = clamp(
      originBlockOffset,
      margin,
      viewport.height - 2,
    );

    const finalWidth = Math.max(
      1,
      Math.min(maxWidth, viewport.width - finalInlineOffset - margin),
    );
    const maxHeight = Math.max(
      160,
      viewport.height - finalBlockOffset - margin,
    );

    const expandedPosition = {
      [inlineEdge]: finalInlineOffset,
      [blockEdge]: finalBlockOffset,
    } as const;

    const collapsedPosition = {
      [inlineEdge]: animateWidth ? originInlineOffset : finalInlineOffset,
      [blockEdge]: animateHeight ? originBlockOffset : finalBlockOffset,
    } as const;

    const expandedState = {
      opacity: 1,
      ...expandedPosition,
      width: finalWidth,
      height: "auto" as const,
    };

    const collapsedState = {
      opacity: shouldReduceMotion ? 0 : 1,
      ...collapsedPosition,
      width: animateWidth ? 2 : finalWidth,
      height: animateHeight ? 2 : ("auto" as const),
    };

    const closingState = shouldReduceMotion
      ? {
          ...expandedState,
          opacity: 0,
        }
      : {
          ...collapsedState,
          opacity: 0,
        };

    const motionTransition = shouldReduceMotion
      ? { duration: 0.12 }
      : {
          opacity: {
            duration: isClosing ? 0.18 : 0.12,
            ease: "easeOut",
          },
          [inlineEdge]: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
          [blockEdge]: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
          width: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
          height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        };

    const willChange = [
      inlineEdge,
      blockEdge,
      animateWidth ? "width" : null,
      animateHeight ? "height" : null,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <DialogPortal>
        <DialogOverlay onClick={(e) => e.preventDefault()} />

        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className="pointer-events-none! fixed inset-0 z-50 outline-none lg:pointer-events-auto!"
          {...props}
          onClick={(e) => console.log("---------------------------------")}
        >
          <motion.div
            data-lenis-prevent
            initial={
              shouldReduceMotion
                ? { ...expandedState, opacity: 0 }
                : collapsedState
            }
            animate={isClosing ? closingState : expandedState}
            transition={motionTransition}
            style={{
              position: "fixed",
              transformOrigin: `${inlineEdge} ${blockEdge}`,
              maxHeight,
              willChange,
            }}
            onAnimationStart={() => setIsRevealComplete(false)}
            onAnimationComplete={() => {
              if (isClosing) {
                completeCloseAnimation();
                return;
              }

              setIsRevealComplete(true);
            }}
            className={cn(
              "bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto rounded-xl text-sm shadow-lg ring-1 outline-none",
              isRevealComplete && !isClosing
                ? "overflow-x-hidden overflow-y-auto"
                : "overflow-hidden",
              className,
            )}
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: isClosing ? 0 : 1 }}
              transition={{
                duration: isClosing ? 0.08 : 0.16,
                delay: shouldReduceMotion || isClosing ? 0 : 0.12,
              }}
              className="relative grid gap-4 p-4"
              style={{ width: finalWidth }}
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <DialogPrimitive.Close data-slot="dialog-close" asChild>
                <Button
                  variant="ghost"
                  className="absolute inset-e-2 top-2"
                  size="icon-sm"
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogPrimitive.Close>
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
MotionGrowDialogContent.displayName = "MotionGrowDialogContent";

export const MotionGrowDialogClose = DialogClose;
export const MotionGrowDialogHeader = DialogHeader;
export const MotionGrowDialogFooter = DialogFooter;
export const MotionGrowDialogTitle = DialogTitle;
export const MotionGrowDialogDescription = DialogDescription;
