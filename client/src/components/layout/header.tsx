"use client";

import React, { useRef, useState } from "react";
import {
  useScroll as useMotionScroll,
  useMotionValueEvent,
} from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "../ui/button";
import { MenuToggleIcon } from "../ui/menu-toggle-icon";
import LocaleSwitcher from "./locale/locale-switcher";
import { ModeToggle } from "../ui/theme-toggle";
import BottomFloatingNavigation from "./bottom-floating-navigation";
import { HeaderNavigation } from "./header-navigation";
import { NAVIGATION_ITEMS } from "@/lib/translation-keys";
import MobileNavigation from "./mobile-navigation";
import Logo from "../common/logo";
import { useLightHeaderStore } from "@/providers/light-header-provider";
import { HeaderAuthControl } from "./header-auth-control";

export default function Header() {
  const scrolled = useScroll(100);
  const { scrollYProgress } = useMotionScroll();
  const prevScrollRef = useRef(0);
  const [show, setShow] = useState(true);
  const [showShadow, setShowShadow] = useState(
    show && scrollYProgress.get() > 0,
  );
  const headerTone = useLightHeaderStore((state) => state.tone);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const previous = prevScrollRef.current;
    const isAtTop = current === 0;
    const isScrollingUp = current < previous;
    const isLeavingTop = previous === 0;
    const shouldShowHeader = isScrollingUp || isLeavingTop;

    setShow(shouldShowHeader);

    if (shouldShowHeader) {
      setShowShadow(!isAtTop);
    }

    prevScrollRef.current = current;
  });

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <motion.header
        data-app-header="true"
        animate={show ? { y: "0" } : { y: "-100%" }}
        transition={show ? { duration: 0.2 } : { duration: 0.1 }}
        // className={cn(
        //   "dark:bg-background/25 bg-background top-0 z-50 w-full overflow-visible border-b border-transparent py-3 shadow lg:p-0 lg:pt-1 dark:backdrop-blur-lg",
        //   {
        //     "shadow-none": !showShadow || open,
        //   },
        //   // {
        //   //   "supports-backdrop-filter:bg-background/50 border-border lg-border-b lg:supports-backdrop-filter:transparent backdrop-blur-lg lg:border-b lg:border-transparent":
        //   //     scrolled,
        //   // },
        // )}
        className={cn(
          // "dark:bg-background/25 sticky top-0 z-50 w-full overflow-visible border-b border-transparent bg-white py-3 shadow lg:p-0 lg:pt-1",
          "bg-background/25 sticky top-0 z-50 w-full overflow-visible border-b border-transparent py-3 shadow lg:p-0 lg:pt-1",
          {
            // "backdrop-blur-lg": !isAssessmentOpen,
            "shadow-none": !showShadow || open,
            dark: headerTone === "dark" || headerTone === "pending",
          },
          // {
          //   "supports-backdrop-filter:bg-background/50 border-border lg-border-b lg:supports-backdrop-filter:transparent backdrop-blur-lg lg:border-b lg:border-transparent":
          //     scrolled,
          // },
        )}
      >
        <div
          aria-hidden="true"
          className="dark:bg-background/25 pointer-events-none absolute inset-0 z-0 bg-white/85 backdrop-blur-lg supports-backdrop-filter:bg-white/75"
        />

        <div className="relative z-10">
          <nav className="container-header mx-auto flex w-full items-center justify-between lg:mt-1.5 lg:mb-3">
            <div className="flex items-center gap-5 xl:gap-24 2xl:gap-36">
              <Logo className="w-20 lg:w-32" />

              <HeaderNavigation items={NAVIGATION_ITEMS} />
            </div>
            <div className="ms-auto me-2 flex items-center gap-2">
              <ModeToggle
                iconClassName="size-4 lg:size-[1.2rem]"
                triggerClassName="dark:bg-transparent size-8 lg:size-10 bg-background border-border text-foreground hover:bg-background/90 hover:text-foreground"
              />
              <LocaleSwitcher
                className="h-8 lg:h-10"
                textClassName="size-7 lg:size-9.5"
                onLocaleChange={() => {
                  setOpen(false);
                }}
              />

              <HeaderAuthControl className="hidden text-xs lg:flex" />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <MenuToggleIcon open={open} className="size-5" duration={300} />
            </Button>
          </nav>

          <MobileNavigation setOpen={setOpen} open={open} />
        </div>
      </motion.header>

      <AnimatePresence>
        {scrolled && <BottomFloatingNavigation />}
      </AnimatePresence>
    </>
  );
}
