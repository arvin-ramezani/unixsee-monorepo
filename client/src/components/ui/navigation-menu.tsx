"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const NavigationMenuItemContext = React.createContext<{
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}>({ triggerRef: React.createRef() });

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <NavigationMenuItemContext.Provider value={{ triggerRef }}>
      <NavigationMenuPrimitive.Item
        data-slot="navigation-menu-item"
        className={cn("relative", className)}
        {...props}
      />
    </NavigationMenuItemContext.Provider>
  );
}

function NavigationMenu({
  className,
  children,
  positionOffset = -40,
  delayDuration = 0,
  skipDelayDuration = 0,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  positionOffset?: number;
  delayDuration?: number;
  skipDelayDuration?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportWrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // const reposition = () => {
    //   const openTrigger = root.querySelector<HTMLElement>(
    //     "[data-slot='navigation-menu-trigger'][data-state='open']",
    //   );
    //   const viewport = root.querySelector<HTMLElement>(
    //     "[data-slot='navigation-menu-viewport']",
    //   );
    //   if (!openTrigger || !viewport) return;

    //   const navRect = root.getBoundingClientRect();
    //   const tr = openTrigger.getBoundingClientRect();
    //   const vpWidth = viewport.getBoundingClientRect().width;
    //   const vw = window.innerWidth; // ← window, not navRect.width

    //   let left = tr.left - navRect.left + positionOffset;

    //   // clamp so viewport doesn't overflow the window
    //   const leftOnScreen = navRect.left + left;
    //   if (leftOnScreen + vpWidth > vw - 8)
    //     left = vw - 8 - vpWidth - navRect.left;
    //   if (leftOnScreen < 8) left = 8 - navRect.left;

    //   viewport.style.insetInlineStart = `${left}px`;
    //   // viewport.style.left = `${left}px`;
    // };

    // MutationObserver: fires when trigger opens/closes (switch between items)

    const reposition = () => {
      const openTrigger = root.querySelector<HTMLElement>(
        "[data-slot='navigation-menu-trigger'][data-state='open']",
      );
      const viewport = root.querySelector<HTMLElement>(
        "[data-slot='navigation-menu-viewport']",
      );
      if (!openTrigger || !viewport) return;

      const dir = getComputedStyle(root).direction; // "ltr" or "rtl"
      const isRtl = dir === "rtl";

      const navRect = root.getBoundingClientRect();
      const tr = openTrigger.getBoundingClientRect();
      const vpWidth = viewport.getBoundingClientRect().width;
      const vw = window.innerWidth;

      let inlineStart: number;

      if (isRtl) {
        // In RTL, insetInlineStart = distance from RIGHT edge of nav to RIGHT edge of viewport
        // tr.right is physical right of trigger, navRect.right is physical right of nav
        inlineStart = navRect.right - tr.right + positionOffset;

        // clamp: don't overflow left (physical) edge of window
        const rightOnScreen = navRect.right - inlineStart;
        if (rightOnScreen - vpWidth < 8)
          inlineStart = navRect.right - vpWidth - 8;
        if (rightOnScreen > vw - 8) inlineStart = navRect.right - (vw - 8);
      } else {
        // LTR: insetInlineStart = distance from LEFT edge of nav
        inlineStart = tr.left - navRect.left + positionOffset;

        // clamp: don't overflow right or left edge of window
        const leftOnScreen = navRect.left + inlineStart;
        if (leftOnScreen + vpWidth > vw - 8)
          inlineStart = vw - 8 - vpWidth - navRect.left;
        if (leftOnScreen < 8) inlineStart = 8 - navRect.left;
      }

      viewport.style.left = "auto"; // clear physical left
      viewport.style.right = "auto"; // clear physical right
      viewport.style.insetInlineStart = `${inlineStart}px`;
    };

    const mutationObserver = new MutationObserver(reposition);
    mutationObserver.observe(root, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-state"],
    });

    let resizeObserver: ResizeObserver | null = null;
    const viewportEl = root.querySelector<HTMLElement>(
      "[data-slot='navigation-menu-viewport']",
    );
    if (viewportEl) {
      resizeObserver = new ResizeObserver(reposition);
      resizeObserver.observe(viewportEl);
    }

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [positionOffset]);

  return (
    <NavigationMenuPrimitive.Root
      ref={rootRef}
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    >
      {children}
      <NavigationMenuViewport ref={viewportWrapRef} />
    </NavigationMenuPrimitive.Root>
  );
}

type NavigationMenuContentProps = Omit<
  React.ComponentProps<typeof NavigationMenuPrimitive.Content>,
  "title"
> & {
  title?: React.ReactNode;
  titleAs?: "p" | "h2" | "h3" | "h4" | "h5" | "h6";
  titleClassName?: string;
};

function NavigationMenuContent({
  className,
  children,
  title,
  titleAs: Title = "p",
  titleClassName,
  ...props
}: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52",
        "data-[motion=to-start]:slide-out-to-left-52",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
        "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        "top-0 left-0 w-full p-2 pr-2.5 md:w-fit",
        "**:data-[slot=navigation-menu-link]:focus:ring-0",
        "**:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      // className={cn(
      //   "data-[motion=from-end]:slide-in-from-right-52",
      //   "data-[motion=from-start]:slide-in-from-left-52",
      //   "data-[motion=to-end]:slide-out-to-right-52",
      //   "data-[motion=to-start]:slide-out-to-left-52",
      //   "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
      //   "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
      //   "top-0 left-0 w-full p-2 pr-2.5 md:w-fit",
      //   "**:data-[slot=navigation-menu-link]:focus:ring-0",
      //   "**:data-[slot=navigation-menu-link]:focus:outline-none dark:bg-transparent dark:backdrop-blur-2xl",
      //   className,
      // )}
      {...props}
    >
      {title && (
        <Title
          data-slot="navigation-menu-content-title"
          className={cn(
            "text-foreground px-2 pt-1 pb-2 text-end text-sm leading-none font-medium",
            titleClassName,
          )}
        >
          {title}
        </Title>
      )}
      {children}
    </NavigationMenuPrimitive.Content>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center gap-1 justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  const { triggerRef } = React.useContext(NavigationMenuItemContext);
  return (
    <NavigationMenuPrimitive.Trigger
      ref={triggerRef}
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent/50 flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden dark:bg-transparent dark:backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

const NavigationMenuViewport = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Viewport
    ref={ref}
    data-slot="navigation-menu-viewport"
    className={cn(
      "absolute top-full z-50 mt-1.5",
      "origin-top-center text-popover-foreground overflow-hidden rounded-md",
      "bg-popover/75 shadow-primary/5 shadow-xl backdrop-blur-xl",
      "supports-backdrop-filter:bg-popover/65",
      "dark:bg-popover/75 dark:supports-backdrop-filter:bg-popover/65",

      "w-(--radix-navigation-menu-viewport-width)",
      "h-(--radix-navigation-menu-viewport-height)",

      "data-[state=open]:border-border/50 ease-in data-[state=open]:animate-[navigation-menu-open_300ms] data-[state=open]:border",
      "ease-out data-[state=closed]:animate-[navigation-menu-close_150ms] data-[state=closed]:border-none",

      "transition-[inset-inline-start,width,background-color,box-shadow] duration-300",
      "will-change-[height,width]",

      className,
    )}
    // className={cn(
    //   "absolute top-full z-50 mt-1.5",
    //   "origin-top-center text-popover-foreground overflow-hidden rounded-md",
    //   "bg-popover/75 shadow-primary/5 shadow-xl backdrop-blur-xl",
    //   "supports-backdrop-filter:bg-popover/65",
    //   "dark:bg-popover/35 dark:supports-backdrop-filter:bg-popover/25 dark:shadow-black/25",

    //   "w-(--radix-navigation-menu-viewport-width)",
    //   "h-(--radix-navigation-menu-viewport-height)",

    //   "data-[state=open]:border-border/50 ease-in data-[state=open]:animate-[navigation-menu-open_300ms] data-[state=open]:border",
    //   "ease-out data-[state=closed]:animate-[navigation-menu-close_150ms] data-[state=closed]:border-none",

    //   "transition-[inset-inline-start,width,background-color,box-shadow] duration-300",
    //   "will-change-[height,width]",

    //   className,
    // )}

    {...props}
  />
));
NavigationMenuViewport.displayName = "NavigationMenuViewport";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
};
