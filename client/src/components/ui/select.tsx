"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
// import { useScrollLock } from "@/hooks/use-scroll-lock";
type SelectSide = "top" | "right" | "bottom" | "left";
type SelectPosition = NonNullable<
  React.ComponentProps<typeof SelectPrimitive.Content>["position"]
>;

const SelectContext = React.createContext<{
  open: boolean;
  contentSide: SelectSide | null;
  setContentSide: React.Dispatch<React.SetStateAction<SelectSide | null>>;
  contentPosition: SelectPosition;
  setContentPosition: React.Dispatch<React.SetStateAction<SelectPosition>>;
} | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);

  if (!context) {
    throw new Error("Select components must be used inside <Select />");
  }

  return context;
}

function isSelectSide(value: string | null): value is SelectSide {
  return (
    value === "top" ||
    value === "right" ||
    value === "bottom" ||
    value === "left"
  );
}

function Select({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const [contentSide, setContentSide] = React.useState<SelectSide | null>(null);
  const [contentPosition, setContentPosition] =
    React.useState<SelectPosition>("item-aligned");

  const open = isControlled ? openProp : uncontrolledOpen;

  return (
    <SelectContext.Provider
      value={{
        open,
        contentSide,
        setContentSide,
        contentPosition,
        setContentPosition,
      }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        open={openProp}
        defaultOpen={defaultOpen}
        onOpenChange={(nextOpen) => {
          if (!isControlled) {
            setUncontrolledOpen(nextOpen);
          }

          if (!nextOpen) {
            setContentSide(null);
          }

          onOpenChange?.(nextOpen);
        }}
        {...props}
      />
    </SelectContext.Provider>
  );
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  const { open, contentSide, contentPosition } = useSelectContext();
  const hasConnectedPopper =
    open && contentPosition === "popper" && contentSide !== null;

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-content-side={contentSide ?? undefined}
      className={cn(
        "border-border data-[state=open]:bg-popover data-[state=open]:border-border focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        hasConnectedPopper &&
          contentSide === "bottom" &&
          "rounded-b-none! border-b-0!",

        hasConnectedPopper &&
          contentSide === "top" &&
          "rounded-t-none! border-t-0!",

        hasConnectedPopper &&
          contentSide === "left" &&
          "rounded-s-none! border-s-0!",

        hasConnectedPopper &&
          contentSide === "right" &&
          "rounded-e-none! border-e-0!",

        className,
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const { setContentSide, setContentPosition, open } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    setContentPosition(position);
  }, [position, setContentPosition]);

  React.useLayoutEffect(() => {
    const node = contentRef.current;

    if (!node) {
      return;
    }

    const syncSide = () => {
      const side = node.getAttribute("data-side");

      if (isSelectSide(side)) {
        setContentSide(side);
      }
    };

    syncSide();

    const observer = new MutationObserver(syncSide);

    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-side"],
    });

    return () => {
      observer.disconnect();
    };
  }, [open, setContentSide]);

  /*
   * This is now a style variant only.
   * Radix always uses its real popper positioning engine.
   */
  const isImprovedPopper = position === "popper";
  const isDefaultShadcnPopper = position === "item-aligned";

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={contentRef}
        data-slot="select-content"
        data-position={position}
        className={cn(
          "bg-popover text-popover-foreground relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto",

          /*
           * Public position="item-aligned"
           * Default shadcn popper appearance.
           */
          isDefaultShadcnPopper && [
            "rounded-md border shadow-md",

            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=closed]:zoom-out-95",
            "data-[state=open]:animate-in",
            "data-[state=open]:fade-in-0",
            "data-[state=open]:zoom-in-95",

            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",

            "data-[side=bottom]:translate-y-1",
            "data-[side=left]:-translate-x-1",
            "rtl:data-[side=left]:translate-x-1",
            "data-[side=right]:translate-x-1",
            "rtl:data-[side=right]:-translate-x-1",
            "data-[side=top]:-translate-y-1",
          ],

          /*
           * Public position="popper"
           * Your improved connected popper appearance.
           */
          isImprovedPopper && [
            "inset-s-px",
            "w-[calc(100%-1.5px)]",
            "rounded-lg border",
            "ring-foreground/10",
            "duration-100",

            "shadow-select-content-bottom",
            "data-[side=bottom]:shadow-select-content-bottom",
            "data-[side=top]:shadow-select-content-top",
            "data-[side=left]:shadow-select-content-left",
            "data-[side=right]:shadow-select-content-right",

            "data-open:animate-in",
            "data-open:fade-in-0",
            "data-open:zoom-in-95",
            "data-closed:animate-out",
            "data-closed:fade-out-0",
            "data-closed:zoom-out-95",

            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=bottom]:translate-y-0",
            "data-[side=bottom]:rounded-t-none",
            "data-[side=bottom]:border-t-0",

            "data-[side=top]:slide-in-from-bottom-2",
            "data-[side=top]:translate-y-0",
            "data-[side=top]:rounded-b-none",
            "data-[side=top]:border-b-0",

            "data-[side=left]:-translate-x-1",
            "data-[side=right]:translate-x-1",
          ],

          className,
        )}
        /*
         * Critical:
         * both public variants use Radix's popper engine.
         */
        position="popper"
        align={align}
        {...props}
      >
        <SelectScrollUpButton />

        <SelectPrimitive.Viewport
          className={cn(
            isDefaultShadcnPopper && [
              "p-1",
              "h-(--radix-select-trigger-height)",
              "w-full",
              "min-w-(--radix-select-trigger-width)",
              "scroll-my-1",
            ],

            isImprovedPopper && [
              "h-(--radix-select-trigger-height)",
              "w-full",
              "min-w-(--radix-select-trigger-width)",
            ],
          )}
        >
          {children}
        </SelectPrimitive.Viewport>

        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// function SelectContent({
//   className,
//   children,
//   position = "item-aligned",
//   align = "center",
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Content>) {
//   const { setContentSide, open } = useSelectContext();
//   const contentRef = React.useRef<HTMLDivElement | null>(null);

//   // useScrollLock(open);

//   React.useLayoutEffect(() => {
//     const node = contentRef.current;

//     if (!node) {
//       return;
//     }

//     const syncSide = () => {
//       const side = node.getAttribute("data-side");

//       if (isSelectSide(side)) {
//         setContentSide(side);
//       }
//     };

//     syncSide();

//     const observer = new MutationObserver(syncSide);

//     observer.observe(node, {
//       attributes: true,
//       attributeFilter: ["data-side"],
//     });

//     return () => {
//       observer.disconnect();
//     };
//   }, [setContentSide, open]);

//   return (
//     <SelectPrimitive.Portal>
//       <SelectPrimitive.Content
//         ref={contentRef}
//         data-slot="select-content"
//         data-align-trigger={position === "item-aligned"}
//         className={cn(
//           "bg-popover text-popover-foreground ring-foreground/10 shadow-select-content-bottom data-[side=bottom]:shadow-select-content-bottom data-[side=top]:shadow-select-content-top data-[side=left]:shadow-select-content-left data-[side=right]:shadow-select-content-right relative inset-s-px z-50 max-h-(--radix-select-content-available-height) w-[calc(100%-2px)] min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border duration-100 data-[align-trigger=true]:animate-none",
//           "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",

//           "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:rounded-t-none data-[side=bottom]:border-t-0",
//           "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:rounded-b-none data-[side=top]:border-b-0",

//           position === "popper" &&
//             "data-[side=bottom]:translate-y-0 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:translate-y-0",

//           className,
//         )}
//         position={position}
//         align={align}
//         {...props}
//       >
//         <SelectScrollUpButton />

//         <SelectPrimitive.Viewport
//           data-position={position}
//           className={cn(
//             "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
//           )}
//         >
//           {children}
//         </SelectPrimitive.Viewport>

//         <SelectScrollDownButton />
//       </SelectPrimitive.Content>
//     </SelectPrimitive.Portal>
//   );
// }

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-1.5 py-1 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-select-item-hover focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative ms-px flex w-[calc(100%-4px)] cursor-default items-center gap-1.5 rounded-full py-1 ps-8 pe-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
