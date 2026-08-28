import { useLocale, useTranslations } from "next-intl";
import {
  MouseEvent,
  PointerEvent,
  WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LifeBuoy, Menu, Rocket, ServerCog, X } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  HOME_PAGE_SECTION_IDS,
  CONTACT_US_PAGE_NAV_ITEMS_KEYS,
  MANAGED_SERVER_PAGE_NAV_ITEMS_KEYS,
  MIGRATION_PAGE_NAV_ITEMS_KEYS,
} from "@/lib/constants";
import { useActiveSectionHash } from "@/hooks/use-active-section-hash";
import { selectIsScrollLocked } from "@/stores/scroll-lock-store";
import { useScrollLockedStore } from "@/providers/scroll-lock-store-provider";
import { FloatingNavEyeMark } from "@/components/common/animated-icons/floating-nav-eye-mark";

export type BottomFloatingNavigationProps = object;

const MIGRATION_PAGE_PATH = "migration-optimization";
const MANAGED_SERVER_PAGE_PATH = "managed-woocommerce-server";
const CONTACT_US_PAGE_PATH = "contact-us";
const ITEM_REVEAL_INTERVAL_SECONDS = 0.07;
const SPECIALS_ITEM_REVEAL_INTERVAL_SECONDS = 0.15;
const WHEEL_DELTA_LINE = 1;
const WHEEL_DELTA_PAGE = 2;
const SPECIAL_LINKS = [
  {
    key: "managedServer",
    href: "/managed-woocommerce-server",
    icon: ServerCog,
  },
  {
    key: "migration",
    href: "/migration-optimization",
    icon: Rocket,
  },
  {
    key: "consultation",
    href: "/contact-us",
    icon: LifeBuoy,
  },
] as const;

export default function BottomFloatingNavigation({}: BottomFloatingNavigationProps) {
  const tMigrationNav = useTranslations("Layout.MigrationSecondaryNavigation");
  const tManagedServerNav = useTranslations(
    "Layout.ManagedServerSecondaryNavigation",
  );
  const tContactUsNav = useTranslations("Layout.ContactUsSecondaryNavigation");
  const tNavigation = useTranslations("Layout.HomeSecondaryNavigation");
  const tSpecialNavigation = useTranslations("Layout.SpecialNavigation");

  const pathname = usePathname();

  const isScrollLocked = useScrollLockedStore(selectIsScrollLocked);

  const navItems = useMemo(() => {
    if (pathname.includes(MIGRATION_PAGE_PATH)) {
      return MIGRATION_PAGE_NAV_ITEMS_KEYS.map((key) => ({
        label: tMigrationNav(`${key}.label`),
        href: tMigrationNav(`${key}.href`),
      }));
    }

    if (pathname.includes(MANAGED_SERVER_PAGE_PATH)) {
      return MANAGED_SERVER_PAGE_NAV_ITEMS_KEYS.map((key) => ({
        label: tManagedServerNav(`${key}.label`),
        href: tManagedServerNav(`${key}.href`),
      }));
    }

    if (pathname.includes(CONTACT_US_PAGE_PATH)) {
      return CONTACT_US_PAGE_NAV_ITEMS_KEYS.map((key) => ({
        label: tContactUsNav(`${key}.label`),
        href: tContactUsNav(`${key}.href`),
      }));
    }

    return HOME_PAGE_SECTION_IDS.map((key) => ({
      label: tNavigation(`${key}.label`),
      href: tNavigation(`${key}.href`),
    }));
  }, [tMigrationNav, tManagedServerNav, tContactUsNav, tNavigation, pathname]);

  const { activeHref, scrollToSection } = useActiveSectionHash(navItems, {});

  const normalScrollContainerRef = useRef<HTMLDivElement>(null);
  const specialScrollContainerRef = useRef<HTMLDivElement>(null);
  const normalFirstItemRef = useRef<HTMLLIElement>(null);
  const normalLastItemRef = useRef<HTMLLIElement>(null);
  const specialFirstItemRef = useRef<HTMLLIElement>(null);
  const specialLastItemRef = useRef<HTMLLIElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const activeScrollFrameRef = useRef<number | null>(null);
  const previousActiveIndexRef = useRef<number | null>(null);
  const dragScrollStateRef = useRef({
    pointerId: null as number | null,
    startClientX: 0,
    startScrollLeft: 0,
    scrollMultiplier: -1,
    hasMoved: false,
    hasCapturedPointer: false,
    previousBodyUserSelect: "",
    previousScrollSnapType: "",
  });

  const DRAG_START_THRESHOLD_PX = 8;

  const suppressClickAfterDragRef = useRef(false);
  const resetSuppressClickTimeoutRef = useRef<number | null>(null);
  const isMenuTransitioningRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const scrollDirection = isRtl ? "rtl" : "ltr";

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isSpecialMenuOpen, setIsSpecialMenuOpen] = useState(false);
  const [isMenuTransitioning, setIsMenuTransitioning] = useState(false);

  const endDragScroll = (scrollContainer: HTMLDivElement) => {
    const dragState = dragScrollStateRef.current;

    if (dragState.pointerId === null) return;

    document.body.style.userSelect = dragState.previousBodyUserSelect;
    scrollContainer.style.scrollSnapType = dragState.previousScrollSnapType;

    if (dragState.hasMoved) {
      if (resetSuppressClickTimeoutRef.current) {
        window.clearTimeout(resetSuppressClickTimeoutRef.current);
      }

      resetSuppressClickTimeoutRef.current = window.setTimeout(() => {
        suppressClickAfterDragRef.current = false;
      }, 120);
    } else {
      suppressClickAfterDragRef.current = false;
    }

    dragScrollStateRef.current = {
      pointerId: null,
      startClientX: 0,
      startScrollLeft: 0,
      scrollMultiplier: -1,
      hasMoved: false,
      hasCapturedPointer: false,
      previousBodyUserSelect: "",
      previousScrollSnapType: "",
    };
  };

  const handleScrollPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (event.button !== 0) return;

    const scrollContainer = event.currentTarget;

    if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) return;

    suppressClickAfterDragRef.current = false;

    dragScrollStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: scrollContainer.scrollLeft,
      scrollMultiplier: getDragScrollMultiplier(scrollContainer),
      hasMoved: false,
      hasCapturedPointer: false,
      previousBodyUserSelect: document.body.style.userSelect,
      previousScrollSnapType: scrollContainer.style.scrollSnapType,
    };
  };

  const handleScrollPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget;
    const dragState = dragScrollStateRef.current;

    if (dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startClientX;

    if (!dragState.hasMoved) {
      if (Math.abs(deltaX) < DRAG_START_THRESHOLD_PX) return;

      dragState.hasMoved = true;
      dragState.hasCapturedPointer = true;
      suppressClickAfterDragRef.current = true;

      document.body.style.userSelect = "none";
      scrollContainer.style.scrollSnapType = "none";

      scrollContainer.setPointerCapture(event.pointerId);
    }

    event.preventDefault();

    scrollContainer.scrollLeft =
      dragState.startScrollLeft + deltaX * dragState.scrollMultiplier;
  };

  const handleScrollPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget;
    const dragState = dragScrollStateRef.current;

    if (dragState.pointerId !== event.pointerId) return;

    if (scrollContainer.hasPointerCapture(event.pointerId)) {
      scrollContainer.releasePointerCapture(event.pointerId);
    }

    endDragScroll(scrollContainer);
  };

  const handleScrollWheel = (event: WheelEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget;

    if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) return;
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

    const deltaMultiplier =
      event.deltaMode === WHEEL_DELTA_LINE
        ? 16
        : event.deltaMode === WHEEL_DELTA_PAGE
          ? scrollContainer.clientWidth
          : 1;
    const currentScrollLeft = getLogicalScrollLeft(scrollContainer, isRtl);
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const nextScrollLeft = Math.min(
      Math.max(currentScrollLeft + event.deltaY * deltaMultiplier, 0),
      maxScrollLeft,
    );

    if (nextScrollLeft === currentScrollLeft) return;

    event.preventDefault();
    setLogicalScrollLeft(scrollContainer, nextScrollLeft, isRtl);
  };

  const handleNavItemClick = (
    event: MouseEvent<HTMLButtonElement>,
    href: string,
  ) => {
    if (suppressClickAfterDragRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    scrollToSection(href);
  };

  const handleSpecialLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClickAfterDragRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleSpecialMenuToggle = () => {
    if (isMenuTransitioningRef.current) return;

    const nextIsSpecialMenuOpen = !isSpecialMenuOpen;
    const nextScrollContainer = nextIsSpecialMenuOpen
      ? specialScrollContainerRef.current
      : normalScrollContainerRef.current;

    if (!shouldReduceMotion) {
      isMenuTransitioningRef.current = true;
      setIsMenuTransitioning(true);
    }
    setIsSpecialMenuOpen(nextIsSpecialMenuOpen);

    if (nextScrollContainer) {
      setLogicalScrollLeft(nextScrollContainer, 0, isRtl);
    }
  };

  useEffect(() => {
    return () => {
      if (resetSuppressClickTimeoutRef.current) {
        window.clearTimeout(resetSuppressClickTimeoutRef.current);
      }

      const dragState = dragScrollStateRef.current;

      if (dragState.pointerId !== null) {
        document.body.style.userSelect = dragState.previousBodyUserSelect;
      }
    };
  }, []);

  useEffect(() => {
    const scrollContainer = isSpecialMenuOpen
      ? specialScrollContainerRef.current
      : normalScrollContainerRef.current;
    const startContent = isSpecialMenuOpen
      ? specialFirstItemRef.current
      : normalFirstItemRef.current;
    const endContent = isSpecialMenuOpen
      ? specialLastItemRef.current
      : normalLastItemRef.current;

    if (!scrollContainer || !startContent || !endContent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const isFullyVisible = entry.intersectionRatio >= 0.999;

          if (entry.target === startContent) {
            setIsAtStart(isFullyVisible);
          } else if (entry.target === endContent) {
            setIsAtEnd(isFullyVisible);
          }
        }
      },
      {
        root: scrollContainer,
        threshold: [0, 0.999, 1],
      },
    );

    observer.observe(startContent);
    observer.observe(endContent);

    return () => observer.disconnect();
  }, [isSpecialMenuOpen, navItems.length]);

  useEffect(() => {
    if (isSpecialMenuOpen) return;

    const scrollContainer = normalScrollContainerRef.current;
    const activeItem = itemRefs.current[activeHref];

    if (!scrollContainer || !activeItem) return;

    const currentActiveIndex = navItems.findIndex(
      (item) => item.href === activeHref,
    );

    if (currentActiveIndex === -1) return;

    const previousActiveIndex = previousActiveIndexRef.current;

    previousActiveIndexRef.current = currentActiveIndex;

    if (previousActiveIndex === currentActiveIndex) return;

    const isMovingBackward =
      previousActiveIndex !== null && currentActiveIndex < previousActiveIndex;

    if (activeScrollFrameRef.current) {
      window.cancelAnimationFrame(activeScrollFrameRef.current);
    }

    activeScrollFrameRef.current = window.requestAnimationFrame(() => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      const tolerance = 2;

      const isFullyVisible =
        itemRect.left >= containerRect.left + tolerance &&
        itemRect.right <= containerRect.right - tolerance;

      if (isFullyVisible) return;

      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: isMovingBackward ? "end" : "start",
      });
    });

    return () => {
      if (activeScrollFrameRef.current) {
        window.cancelAnimationFrame(activeScrollFrameRef.current);
      }
    };
  }, [activeHref, isSpecialMenuOpen, navItems]);

  const showStartShadow = isRtl ? isAtStart : isAtEnd;
  const showEndShadow = isRtl ? isAtEnd : isAtStart;

  return (
    <motion.nav
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "200%" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      }
      style={{ perspective: 1100 }}
      className={cn(
        "pointer-events-none fixed inset-s-1/2 bottom-4 z-20 w-[calc(100%-2rem)] -translate-x-1/2 md:max-w-md lg:max-w-lg rtl:translate-x-1/2",
        {
          "ms-[calc(var(--scrollbar-width)/2)]": isScrollLocked,
          "lg:hidden": pathname.includes(CONTACT_US_PAGE_PATH),
        },
      )}
    >
      <motion.div
        initial={false}
        animate={{
          rotateX: isSpecialMenuOpen ? 180 : 0,
        }}
        transition={
          shouldReduceMotion
            ? { rotateX: { duration: 0 } }
            : {
                rotateX: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              }
        }
        onAnimationStart={() => {
          if (shouldReduceMotion) return;

          isMenuTransitioningRef.current = true;
          setIsMenuTransitioning(true);
        }}
        onAnimationComplete={() => {
          if (shouldReduceMotion) return;

          isMenuTransitioningRef.current = false;
          setIsMenuTransitioning(false);
        }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="relative w-full"
      >
        <div
          aria-hidden={isSpecialMenuOpen}
          inert={isSpecialMenuOpen}
          className={cn(
            "pointer-events-auto relative flex w-full items-center rounded-[12px] border border-[#4b5966] bg-[#202b35]/85 p-1 shadow-[0_18px_40px_-24px_#111820,inset_0_1px_0_#596674] backdrop-blur-xl backface-hidden supports-backdrop-filter:bg-[#202b35]/82 lg:p-2 dark:border-[#24415f] dark:bg-[#10253a]/88 dark:shadow-[0_18px_40px_-28px_#020812] dark:[box-shadow:0_18px_40px_-24px_#00070d] dark:backdrop-blur-xl dark:supports-backdrop-filter:bg-[#06111d]/78",
            { "pointer-events-none": isSpecialMenuOpen },
          )}
        >
          <div className="bg-primary relative me-1 flex w-10.5 shrink-0 items-center justify-center self-stretch overflow-hidden rounded-sm text-white ring-0 lg:me-2 lg:w-13.5">
            <FloatingNavEyeMark />
          </div>

          <motion.div
            animate={{ opacity: showEndShadow ? 0 : 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 h-10.5 w-12 rounded-ss-sm rounded-es-sm bg-linear-to-r from-[#071421]/80 from-10% to-transparent lg:h-13.5 ltr:inset-s-17 rtl:inset-e-12.5 rtl:rounded-se-sm rtl:rounded-ee-sm rtl:lg:inset-e-18 dark:from-[#06111d]"
          />

          <div
            data-lenis-prevent-wheel
            dir={scrollDirection}
            ref={normalScrollContainerRef}
            onWheel={handleScrollWheel}
            onPointerDownCapture={handleScrollPointerDown}
            onPointerMoveCapture={handleScrollPointerMove}
            onPointerUpCapture={handleScrollPointerUp}
            onPointerCancelCapture={handleScrollPointerUp}
            onLostPointerCapture={(event) => endDragScroll(event.currentTarget)}
            onDragStart={(event) => event.preventDefault()}
            className="no-scrollbar mx-auto flex h-full w-full min-w-0 touch-pan-x snap-x snap-mandatory items-center justify-start overflow-x-auto overflow-y-hidden rounded-sm bg-[#172431]/78 p-1 px-1.5 backdrop-blur-md lg:p-2 dark:bg-[#061321]/86 dark:backdrop-blur-md"
          >
            <motion.ul
              initial="hidden"
              animate={isSpecialMenuOpen ? "hidden" : "visible"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    delayChildren: shouldReduceMotion ? 0 : 0.22,
                    staggerChildren: shouldReduceMotion
                      ? 0
                      : ITEM_REVEAL_INTERVAL_SECONDS,
                  },
                },
              }}
              className="flex w-max min-w-max shrink-0 text-xs lg:text-sm"
            >
              {navItems.map((item, index) => (
                <motion.li
                  ref={(node) => {
                    itemRefs.current[item.href] = node;

                    if (index === 0) {
                      normalFirstItemRef.current = node;
                    }

                    if (index === navItems.length - 1) {
                      normalLastItemRef.current = node;
                    }
                  }}
                  variants={{
                    hidden: shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 8, scale: 0.96 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="mx-0.5 shrink-0 snap-start scroll-ms-2 rounded-md transition-colors lg:mx-1"
                  key={item.href}
                >
                  <button
                    type="button"
                    className={cn(
                      "dark:text-foreground inline-block cursor-pointer rounded-md border border-[#26384c] px-3 py-2 font-light text-[#eaf2fb] transition-colors select-none hover:border-[#365575] hover:bg-[#102238] dark:border-[#22364d] dark:hover:border-[#315172] dark:hover:bg-[#0f2238]",
                      {
                        "border-[#c7a45a]! bg-[#1e3450]! text-white! dark:border-[#c7a45a]! dark:bg-[#1e3450]!":
                          activeHref === item.href,
                      },
                    )}
                    onClick={(event) => handleNavItemClick(event, item.href)}
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            animate={{ opacity: showStartShadow ? 0 : 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-e-18 z-10 h-10.5 w-12 rounded-se-sm rounded-ee-sm bg-linear-to-l from-[#071421]/80 from-10% to-transparent lg:h-13.5 rtl:inset-s-12.5 rtl:rounded-ss-sm rtl:rounded-es-sm rtl:lg:inset-s-17.5 dark:from-[#06111d]"
          />

          <button
            type="button"
            aria-pressed="false"
            disabled={isMenuTransitioning}
            aria-label={tSpecialNavigation("openLabel")}
            onClick={handleSpecialMenuToggle}
            className="ms-1 flex w-10.5 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-sm border border-transparent bg-[#071421] text-white transition-colors outline-none hover:bg-[#0d1d2e] focus-visible:border-[#c7a45a] focus-visible:ring-3 focus-visible:ring-[#c7a45a]/35 disabled:cursor-wait lg:ms-2 lg:w-14 dark:bg-[#06192b] dark:hover:bg-[#0b2540]"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div
          aria-hidden={!isSpecialMenuOpen}
          inert={!isSpecialMenuOpen}
          className={cn(
            "pointer-events-auto absolute inset-0 flex w-full transform-[rotateX(180deg)] items-center rounded-[12px] border border-[#4b5966] bg-[#202b35]/85 p-1 shadow-[0_18px_40px_-24px_#111820,inset_0_1px_0_#596674] backdrop-blur-xl backface-hidden supports-backdrop-filter:bg-[#202b35]/82 lg:p-2 dark:border-[#24415f] dark:bg-[#10253a]/88 dark:shadow-[0_18px_40px_-28px_#020812] dark:[box-shadow:0_18px_40px_-24px_#00070d] dark:backdrop-blur-xl dark:supports-backdrop-filter:bg-[#06111d]/78",
            { "pointer-events-none": !isSpecialMenuOpen },
          )}
        >
          <div className="bg-primary relative me-1 flex w-10.5 shrink-0 items-center justify-center self-stretch overflow-hidden rounded-sm text-white ring-0 lg:me-2 lg:w-13.5">
            <FloatingNavEyeMark />
          </div>

          <motion.div
            animate={{ opacity: showEndShadow ? 0 : 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 h-10.5 w-12 rounded-ss-sm rounded-es-sm bg-linear-to-r from-[#071421]/80 from-10% to-transparent lg:h-13.5 ltr:inset-s-17 rtl:inset-e-12.5 rtl:rounded-se-sm rtl:rounded-ee-sm rtl:lg:inset-e-18 dark:from-[#06111d]"
          />

          <div
            data-lenis-prevent-wheel
            dir={scrollDirection}
            ref={specialScrollContainerRef}
            onWheel={handleScrollWheel}
            onPointerDownCapture={handleScrollPointerDown}
            onPointerMoveCapture={handleScrollPointerMove}
            onPointerUpCapture={handleScrollPointerUp}
            onPointerCancelCapture={handleScrollPointerUp}
            onLostPointerCapture={(event) => endDragScroll(event.currentTarget)}
            onDragStart={(event) => event.preventDefault()}
            className="no-scrollbar mx-auto flex h-full w-full min-w-0 touch-pan-x snap-x snap-mandatory items-center justify-start overflow-x-auto overflow-y-hidden rounded-sm bg-[#172431]/78 p-1 px-1.5 backdrop-blur-md lg:p-2 dark:bg-[#061321]/86 dark:backdrop-blur-md"
          >
            <motion.ul
              initial="hidden"
              animate={isSpecialMenuOpen ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    delayChildren: shouldReduceMotion ? 0 : 0.2,
                    staggerChildren: shouldReduceMotion
                      ? 0
                      : SPECIALS_ITEM_REVEAL_INTERVAL_SECONDS,
                  },
                },
              }}
              className="flex w-max min-w-max shrink-0 text-xs lg:text-sm"
            >
              {SPECIAL_LINKS.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.li
                    ref={(node) => {
                      if (index === 0) {
                        specialFirstItemRef.current = node;
                      }

                      if (index === SPECIAL_LINKS.length - 1) {
                        specialLastItemRef.current = node;
                      }
                    }}
                    key={item.key}
                    variants={{
                      hidden: shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 8, scale: 0.94 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className="mx-0.5 shrink-0 snap-start scroll-ms-2 rounded-md lg:mx-1"
                  >
                    <Link
                      href={item.href}
                      draggable={false}
                      onClick={handleSpecialLinkClick}
                      onDragStart={(event) => event.preventDefault()}
                      className="group/special flex items-center gap-1.5 rounded-md border border-[#3e5267] bg-[#1d3349] px-3 py-2 text-white transition-colors outline-none hover:border-[#c7a45a]/70 hover:bg-[#25415d] focus-visible:border-[#c7a45a] focus-visible:ring-2 focus-visible:ring-[#c7a45a]/35 dark:border-[#31506c] dark:bg-[#102c45] dark:hover:border-[#c7a45a]/70 dark:hover:bg-[#173a58]"
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-3.5 text-[#e3c477] transition-transform group-hover/special:-translate-y-0.5"
                      />
                      {tSpecialNavigation(`items.${item.key}.label`)}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>

          <motion.div
            animate={{ opacity: showStartShadow ? 0 : 1 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-e-18 z-10 h-10.5 w-12 rounded-se-sm rounded-ee-sm bg-linear-to-l from-[#071421]/80 from-10% to-transparent lg:h-13.5 rtl:inset-s-12.5 rtl:rounded-ss-sm rtl:rounded-es-sm rtl:lg:inset-s-17.5 dark:from-[#06111d]"
          />

          <button
            type="button"
            aria-pressed="true"
            disabled={isMenuTransitioning}
            aria-label={tSpecialNavigation("closeLabel")}
            onClick={handleSpecialMenuToggle}
            className="ms-1 flex w-10.5 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-sm border border-transparent bg-[#071421] text-white transition-colors outline-none hover:bg-[#0d1d2e] focus-visible:border-[#c7a45a] focus-visible:ring-3 focus-visible:ring-[#c7a45a]/35 disabled:cursor-wait lg:ms-2 lg:w-14 dark:bg-[#06192b] dark:hover:bg-[#0b2540]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      </motion.div>
    </motion.nav>
  );
}

type RtlScrollType = "default" | "negative" | "reverse";

let cachedRtlScrollType: RtlScrollType | null = null;

function getDragScrollMultiplier(element: HTMLElement): 1 | -1 {
  const content = element.firstElementChild;

  if (!content) return -1;

  const originalScrollLeft = element.scrollLeft;
  const originalScrollBehavior = element.style.scrollBehavior;
  const originalScrollSnapType = element.style.scrollSnapType;
  const initialContentLeft = content.getBoundingClientRect().left;

  element.style.scrollBehavior = "auto";
  element.style.scrollSnapType = "none";

  try {
    for (const candidateMultiplier of [1, -1] as const) {
      element.scrollLeft = originalScrollLeft + candidateMultiplier;

      const contentMovement =
        content.getBoundingClientRect().left - initialContentLeft;

      element.scrollLeft = originalScrollLeft;

      if (Math.abs(contentMovement) > 0.1) {
        return contentMovement > 0
          ? candidateMultiplier
          : candidateMultiplier === 1
            ? -1
            : 1;
      }
    }

    return -1;
  } finally {
    element.scrollLeft = originalScrollLeft;
    element.style.scrollBehavior = originalScrollBehavior;
    element.style.scrollSnapType = originalScrollSnapType;
  }
}

function getRtlScrollType(): RtlScrollType {
  if (cachedRtlScrollType) return cachedRtlScrollType;

  const container = document.createElement("div");
  const content = document.createElement("div");

  container.dir = "rtl";
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.width = "4px";
  container.style.height = "1px";
  container.style.overflow = "scroll";
  container.style.visibility = "hidden";

  content.style.width = "8px";
  content.style.height = "1px";

  container.appendChild(content);
  document.body.appendChild(container);

  if (container.scrollLeft > 0) {
    cachedRtlScrollType = "default";
  } else {
    container.scrollLeft = 1;
    cachedRtlScrollType = container.scrollLeft === 0 ? "negative" : "reverse";
  }

  document.body.removeChild(container);

  return cachedRtlScrollType;
}

function setLogicalScrollLeft(
  element: HTMLElement,
  value: number,
  isRtl: boolean,
) {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const nextValue = Math.min(Math.max(value, 0), maxScrollLeft);

  if (!isRtl) {
    element.scrollLeft = nextValue;
    return;
  }

  const rtlScrollType = getRtlScrollType();

  if (rtlScrollType === "negative") {
    element.scrollLeft = -nextValue;
    return;
  }

  if (rtlScrollType === "default") {
    element.scrollLeft = maxScrollLeft - nextValue;
    return;
  }

  element.scrollLeft = nextValue;
}

function getLogicalScrollLeft(element: HTMLElement, isRtl: boolean) {
  if (!isRtl) return element.scrollLeft;

  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const rtlScrollType = getRtlScrollType();

  if (rtlScrollType === "negative") return -element.scrollLeft;
  if (rtlScrollType === "default") return maxScrollLeft - element.scrollLeft;

  return element.scrollLeft;
}

// export type BottomFloatingNavigationProps = object;

// const MIGRATION_PAGE_PATH = "migration-optimization";

// export default function BottomFloatingNavigation({}: BottomFloatingNavigationProps) {
//   const tMigrationNav = useTranslations("Layout.MigrationSecondaryNavigation");
//   const tNavigation = useTranslations("Layout.HomeSecondaryNavigation");

//   const pathname = usePathname();

//   const navItems = useMemo(() => {
//     if (pathname.includes(MIGRATION_PAGE_PATH)) {
//       return MIGRATION_PAGE_NAV_ITEMS_KEYS.map((key) => ({
//         label: tMigrationNav(`${key}.label`),
//         href: tMigrationNav(`${key}.href`),
//       }));
//     } else {
//       return HOME_PAGE_SECTION_IDS.map((key) => ({
//         label: tNavigation(`${key}.label`),
//         href: tNavigation(`${key}.href`),
//       }));
//     }
//   }, [tMigrationNav, tNavigation, pathname]);

//   const { activeHref, scrollToSection } = useActiveSectionHash(navItems, {});

//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const firstItemRef = useRef<HTMLLIElement>(null);
//   const lastItemRef = useRef<HTMLLIElement>(null);
//   const [isAtStart, setIsAtStart] = useState(true);
//   const [isAtEnd, setIsAtEnd] = useState(false);

//   useEffect(() => {
//     const scrollContainer = scrollContainerRef.current;
//     const startContent = firstItemRef.current;
//     const endContent = lastItemRef.current;

//     if (!scrollContainer || !startContent || !endContent) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         for (const entry of entries) {
//           const isFullyVisible = entry.intersectionRatio >= 0.999;

//           if (entry.target === startContent) {
//             setIsAtStart(isFullyVisible);
//           } else if (entry.target === endContent) {
//             setIsAtEnd(isFullyVisible);
//           }
//         }
//       },
//       {
//         root: scrollContainer,
//         threshold: [0, 0.999, 1],
//       },
//     );

//     observer.observe(startContent);
//     observer.observe(endContent);

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <nav className="pointer-events-none fixed inset-s-1/2 bottom-4 z-20 w-[calc(100%-2rem)] max-w-xs translate-x-1/2 px-2 md:max-w-md lg:max-w-lg">
//       <motion.div
//         initial={{ y: "100%" }}
//         animate={{ y: "0", opacity: isAtEnd ? 0 : 1 }}
//         exit={{ y: "200%" }}
//         aria-hidden="true"
//         className="from-primary pointer-events-none absolute inset-e-2 top-0 z-10 h-full w-12 rounded-se-[12px] rounded-ee-[12px] bg-linear-to-r from-10% to-transparent"
//       />

//       <motion.div
//         ref={scrollContainerRef}
//         initial={{ y: "100%" }}
//         animate={{ y: "0" }}
//         exit={{ y: "200%" }}
//         className="no-scrollbar dark:supports-backdrop-filter:bg-foreground/10 supports-backdrop-filter:bg-primary/90 border-border pointer-events-auto mx-auto flex h-full w-full min-w-0 snap-x snap-mandatory items-center justify-start overflow-x-auto overflow-y-hidden rounded-[12px] p-2 backdrop-blur-lg"
//       >
//         <ul className="flex w-max min-w-max shrink-0 text-sm">
//           {navItems.map((item, index) => (
//             <li
//               ref={(node) => {
//                 if (index === 0) firstItemRef.current = node;
//                 if (index === navItems.length - 1) lastItemRef.current = node;
//               }}
//               className="border-background/30 dark:border-foreground/40 dark:hover:border-foreground hover:border-background mx-1 shrink-0 snap-center overflow-hidden rounded-md border transition-colors"
//               key={item.label}
//             >
//               <button
//                 type="button"
//                 className={cn(
//                   "text-background dark:text-foreground dark:border-foreground/40 dark:hover:border-foreground inline-block cursor-pointer px-3 py-2 transition-colors",
//                   {
//                     "bg-white/20": activeHref === item.href,
//                   },
//                 )}
//                 onClick={() => scrollToSection(item.href)}
//               >
//                 {item.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </motion.div>

//       <motion.div
//         initial={{ y: "100%" }}
//         animate={{ y: "0", opacity: isAtStart ? 0 : 1 }}
//         exit={{ y: "200%" }}
//         aria-hidden="true"
//         className="from-primary pointer-events-none absolute inset-s-2 top-0 z-10 h-full w-12 rounded-ss-[12px] rounded-es-[12px] bg-linear-to-l from-10% to-transparent"
//       />
//     </nav>
//   );

//   return (
//     <nav className="pointer-events-none fixed inset-s-1/2 bottom-4 z-20 w-full max-w-xs translate-x-1/2 overflow-x-auto px-2 md:max-w-md lg:w-fit lg:max-w-lg">
//       <motion.div
//         initial={{ y: "100%" }}
//         animate={{ y: "0", opacity: isAtEnd ? 0 : 1 }}
//         exit={{ y: "200%" }}
//         aria-hidden="true"
//         className="from-primary absolute inset-e-2 z-10 h-full w-12 rounded-se-[12px] rounded-ee-[12px] bg-linear-to-r from-10% to-transparent"
//       />
//       <motion.div
//         ref={scrollContainerRef}
//         initial={{ y: "100%" }}
//         animate={{ y: "0" }}
//         exit={{ y: "200%" }}
//         className="no-scrollbar dark:supports-backdrop-filter:bg-foreground/10 supports-backdrop-filter:bg-primary/90 border-border pointer-events-auto mx-auto flex h-full w-fit max-w-full snap-x snap-mandatory items-center justify-start gap-4 overflow-x-auto rounded-[12px] p-2 backdrop-blur-lg"
//       >
//         {/* <div ref={startContentRef} className="shrink-0 snap-center">
//           <Logo className="w-20! min-w-20" mode="dark" />
//         </div> */}

//         <ul className="flex shrink-0 text-sm">
//           {navItems.map((item, index) => (
//             <li
//               ref={(node) => {
//                 if (index === 0) firstItemRef.current = node;
//                 if (index === navItems.length - 1) lastItemRef.current = node;
//               }}
//               className="border-background/30 dark:border-foreground/40 dark:hover:border-foreground hover:border-background mx-1 shrink-0 snap-center overflow-hidden rounded-md border transition-colors"
//               key={item.label}
//             >
//               <p
//                 className={cn(
//                   "text-background dark:text-foreground dark:border-foreground/40 dark:hover:border-foreground inline-block cursor-pointer px-3 py-2 transition-colors",
//                   {
//                     "bg-white/20": activeHref === item.href,
//                   },
//                 )}
//                 onClick={() => scrollToSection(item.href)}
//               >
//                 {item.label}
//               </p>
//             </li>
//           ))}
//         </ul>

//         {/* <div ref={endContentRef} className="flex shrink-0 gap-2">
//           <ModeToggle triggerClassName="bg-transparent dark:border-foreground/40 dark:hover:border-foreground text-white hover:bg-transparent hover:text-white hover:border-background border-background/30" />
//           <LocaleSwitcher
//             className="border-background/30 hover:border-background dark:border-foreground/40 dark:hover:border-foreground bg-transparent"
//             textClassName="text-background hover:text-background dark:text-foreground transition-colors"
//             activeTextClassName=""
//             activeClassName="bg-primary"
//           />
//         </div> */}
//       </motion.div>

//       <motion.div
//         initial={{ y: "100%" }}
//         animate={{ y: "0", opacity: isAtStart ? 0 : 1 }}
//         exit={{ y: "200%" }}
//         aria-hidden="true"
//         className="from-primary absolute inset-s-2 top-0 z-10 h-full w-12 rounded-ss-[12px] rounded-es-[12px] bg-linear-to-l from-10% to-transparent"
//       />
//     </nav>
//   );
// }
