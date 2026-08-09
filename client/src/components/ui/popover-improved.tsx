"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> & {
  /**
   * When true, clicking / focusing outside of the popover content will not close it.
   * The X button and PopoverClose will still close it.
   */
  preventOutsideClose?: boolean;
  /**
   * Shows the built-in X close button inside the content.
   */
  showCloseButton?: boolean;
  closeButtonClassName?: string;
  closeLabel?: string;
};

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  preventOutsideClose = false,
  showCloseButton = true,
  closeButtonClassName,
  closeLabel = "Close",
  onInteractOutside,
  children,
  ...props
}: PopoverContentProps & { open?: boolean }) {
  return (
    <AnimatePresence>
      {typeof open === "undefined" ||
        (props.open && (
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              data-slot="popover-content"
              align={align}
              sideOffset={sideOffset}
              onInteractOutside={(event) => {
                onInteractOutside?.(event);

                if (preventOutsideClose) {
                  event.preventDefault();
                }
              }}
              className={cn(
                "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100",
                showCloseButton && "relative pt-12",
                className,
              )}
              {...props}
            >
              {children}

              {showCloseButton && (
                <PopoverPrimitive.Close
                  data-slot="popover-close"
                  aria-label={closeLabel}
                  className={cn(
                    "ring-offset-background focus:ring-ring absolute inset-e-2 top-2 inline-flex size-7 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-disabled:pointer-events-none",
                    closeButtonClassName,
                  )}
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">{closeLabel}</span>
                </PopoverPrimitive.Close>
              )}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        ))}
    </AnimatePresence>
  );
}

function PopoverClose({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
