"use client";

import Image from "next/image";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { Card, CardContent } from "@/components/ui/card";

type CardType = {
  title: string;
  description: string;
  tags: string[];
  cta: {
    label: string;
    href: string;
  };
};

const MOBILE_STACK_OFFSET_PX = 24;
const DESKTOP_STACK_OFFSET_PX = 48;
const STACK_OFFSET_BREAKPOINT_PX = 1024;
const STACK_SCALE_STEP = 0.05;
const MIN_STACK_SCALE = 0.1;

type CardMeasurement = {
  offsetTop: number;
  height: number;
  stackedY: number;
  reachScroll: number;
};

type StackMeasurements = {
  scrollStart: number;
  cards: CardMeasurement[];
};

const EMPTY_MEASUREMENTS: StackMeasurements = {
  scrollStart: 0,
  cards: [],
};

export type StickyCardsProps = {
  items: CardType[];
};

export default function StickyCards({ items }: StickyCardsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [measurements, setMeasurements] =
    useState<StackMeasurements>(EMPTY_MEASUREMENTS);

  const { scrollY } = useScroll();

  const setCardSlotRef = useCallback(
    (index: number, element: HTMLDivElement | null) => {
      cardSlotRefs.current[index] = element;
    },
    [],
  );

  const calculateLayout = useCallback(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const slots = cardSlotRefs.current.slice(0, items.length);

    if (
      !track ||
      !sticky ||
      slots.length !== items.length ||
      slots.some((slot) => !slot)
    ) {
      return;
    }

    const stackOffset =
      window.innerWidth < STACK_OFFSET_BREAKPOINT_PX
        ? MOBILE_STACK_OFFSET_PX
        : DESKTOP_STACK_OFFSET_PX;
    const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;

    const trackTop = track.getBoundingClientRect().top + window.scrollY;

    const cards = slots.map((slot, index) => {
      const element = slot!;
      const offsetTop = element.offsetTop;
      const height = element.offsetHeight;
      const stackedY = index * stackOffset;

      return {
        offsetTop,
        height,
        stackedY,
        reachScroll: Math.max(0, offsetTop - stackedY),
      };
    });

    const lastCard = cards.at(-1);

    if (!lastCard) return;

    setMeasurements({
      scrollStart: trackTop - stickyTop,
      cards,
    });
  }, [items.length]);

  useLayoutEffect(() => {
    let frame = 0;
    let cancelled = false;

    const scheduleCalculation = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!cancelled) calculateLayout();
      });
    };

    const observer = new ResizeObserver(scheduleCalculation);

    if (trackRef.current) observer.observe(trackRef.current);
    if (stickyRef.current) observer.observe(stickyRef.current);

    cardSlotRefs.current.forEach((slot) => {
      if (slot) observer.observe(slot);
    });

    window.addEventListener("resize", scheduleCalculation);
    document.fonts?.ready.then(() => {
      if (!cancelled) scheduleCalculation();
    });

    calculateLayout();
    scheduleCalculation();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleCalculation);
    };
  }, [calculateLayout]);

  if (!items.length) return null;

  return (
    <div className="relative mt-20 w-full pb-28 min-[540px]:pb-0 lg:pb-28 xl:pb-0">
      <div ref={trackRef} className="relative grid w-full">
        <div
          aria-hidden="true"
          inert
          className="pointer-events-none invisible col-start-1 row-start-1 flex flex-col gap-8"
        >
          {items.map((item, index) => (
            <SizingCard key={`${item.title}-sizer`} index={index} {...item} />
          ))}
        </div>

        <div
          ref={stickyRef}
          className="sticky top-10 z-10 col-start-1 row-start-1 h-[70dvh] w-full self-start"
        >
          <div className="relative flex flex-col gap-8">
            {items.map((item, index) => (
              <StickyCard
                key={item.title}
                {...item}
                index={index}
                scrollY={scrollY}
                measurements={measurements}
                setCardSlotRef={setCardSlotRef}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SizingCard({
  description,
  index,
  title,
}: CardType & { index: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative flex w-full flex-col rounded-4xl">
        <Card
          style={{
            backgroundColor: PRIMARY_VARIANTS[index % PRIMARY_VARIANTS.length],
          }}
          className="py-8"
        >
          <CardContent className="flex flex-col px-8 lg:flex-row lg:justify-between">
            <div className="flex flex-1 flex-col items-start lg:pt-52.5">
              <Title as="h3" className="text-2xl font-extrabold text-white">
                {title}
              </Title>

              <SubTitle className="text-border dark:text-text-secondary mt-4 2xl:mt-12 2xl:w-4/5">
                {description}
              </SubTitle>
            </div>

            <div className="relative mt-6 aspect-square w-32 self-end md:mt-10 lg:mt-0 lg:w-40 lg:self-start 2xl:w-56">
              <Image src="/sample.svg" alt="" fill />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// export default function StickyCards({ items }: StickyCardsProps) {
//   const boundaryRef = useRef<HTMLDivElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardsRef = useRef<HTMLDivElement>(null);
//   const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const [boundaryHeight, setBoundaryHeight] = useState<number>();
//   const [releaseSpace, setReleaseSpace] = useState(0);
//   const [measurements, setMeasurements] =
//     useState<StackMeasurements>(EMPTY_MEASUREMENTS);

//   const { scrollY } = useScroll();

//   const setCardSlotRef = useCallback(
//     (index: number, element: HTMLDivElement | null) => {
//       cardSlotRefs.current[index] = element;
//     },
//     [],
//   );

//   const calculateLayout = useCallback(() => {
//     const boundary = boundaryRef.current;
//     const sticky = stickyRef.current;
//     const cardsContainer = cardsRef.current;
//     const slots = cardSlotRefs.current.slice(0, items.length);

//     if (
//       !boundary ||
//       !sticky ||
//       !cardsContainer ||
//       slots.length !== items.length ||
//       slots.some((slot) => !slot)
//     ) {
//       return;
//     }

//     const stickyTop =
//       Number.parseFloat(window.getComputedStyle(sticky).top) || 0;
//     const stickyHeight = sticky.getBoundingClientRect().height;

//     const cards = slots.map((slot, index) => {
//       const element = slot!;
//       const offsetTop = element.offsetTop;
//       const height = element.getBoundingClientRect().height;
//       const stackedY = index * STACK_OFFSET_PX;

//       return {
//         offsetTop,
//         height,
//         stackedY,
//         reachScroll: Math.max(0, offsetTop - stackedY),
//       };
//     });

//     const lastCard = cards.at(-1);
//     if (!lastCard) return;

//     const animationDistance = lastCard.reachScroll;
//     const lastCardStackedBottom = lastCard.stackedY + lastCard.height;
//     const nextBoundaryHeight = Math.ceil(stickyHeight + animationDistance);
//     const nextReleaseSpace = Math.ceil(
//       Math.max(0, lastCardStackedBottom - stickyHeight),
//     );
//     const boundaryTop = boundary.getBoundingClientRect().top + window.scrollY;

//     setBoundaryHeight((current) =>
//       current === nextBoundaryHeight ? current : nextBoundaryHeight,
//     );
//     setReleaseSpace((current) =>
//       current === nextReleaseSpace ? current : nextReleaseSpace,
//     );
//     setMeasurements({
//       scrollStart: boundaryTop - stickyTop,
//       cards,
//     });
//   }, [items.length]);

//   useLayoutEffect(() => {
//     let animationFrame = 0;
//     let restoreFrame = 0;
//     let cancelled = false;
//     const scrollStorageKey = `sticky-cards-scroll:${window.location.pathname}:${items
//       .map((item) => item.title)
//       .join("|")}`;

//     const saveScrollPosition = () => {
//       try {
//         sessionStorage.setItem(scrollStorageKey, String(window.scrollY));
//       } catch {
//         // Scroll restoration should never block the component.
//       }
//     };

//     let reloadScrollPosition: number | null = null;

//     try {
//       const navigationEntry = performance.getEntriesByType("navigation")[0] as
//         | PerformanceNavigationTiming
//         | undefined;

//       if (navigationEntry?.type === "reload") {
//         const storedPosition = sessionStorage.getItem(scrollStorageKey);
//         const parsedPosition = Number(storedPosition);

//         if (storedPosition !== null && Number.isFinite(parsedPosition)) {
//           reloadScrollPosition = parsedPosition;
//         }
//       }
//     } catch {
//       // Fall back to the browser's native restoration.
//     }

//     /*
//      * Measure synchronously on mount. State updates made from a layout effect
//      * are committed before paint, so the browser restores refresh scroll
//      * against the section's final height instead of its temporary 70dvh height.
//      */
//     calculateLayout();

//     const scrollPositionToRestore = reloadScrollPosition;

//     if (scrollPositionToRestore !== null) {
//       restoreFrame = requestAnimationFrame(() => {
//         window.scrollTo(0, scrollPositionToRestore);
//       });
//     }

//     const scheduleCalculation = () => {
//       cancelAnimationFrame(animationFrame);

//       animationFrame = requestAnimationFrame(() => {
//         animationFrame = requestAnimationFrame(() => {
//           if (!cancelled) calculateLayout();
//         });
//       });
//     };

//     const resizeObserver = new ResizeObserver(scheduleCalculation);

//     if (stickyRef.current) resizeObserver.observe(stickyRef.current);
//     if (cardsRef.current) resizeObserver.observe(cardsRef.current);

//     cardSlotRefs.current.forEach((slot) => {
//       if (slot) resizeObserver.observe(slot);
//     });

//     window.addEventListener("resize", scheduleCalculation);
//     window.addEventListener("load", scheduleCalculation);
//     window.addEventListener("pagehide", saveScrollPosition);

//     document.fonts?.ready.then(() => {
//       if (!cancelled) scheduleCalculation();
//     });

//     /*
//      * Keep the delayed calculation for late fonts/images and responsive
//      * changes. It verifies the synchronous result without causing first-paint
//      * layout shift.
//      */
//     scheduleCalculation();

//     return () => {
//       cancelled = true;
//       cancelAnimationFrame(animationFrame);
//       cancelAnimationFrame(restoreFrame);
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", scheduleCalculation);
//       window.removeEventListener("load", scheduleCalculation);
//       window.removeEventListener("pagehide", saveScrollPosition);
//     };
//   }, [calculateLayout, items.length, items]);

//   if (!items.length) return null;

//   return (
//     <div className="relative w-full pt-20">
//       <div
//         ref={boundaryRef}
//         className="relative w-full"
//         style={{
//           height: boundaryHeight ? `${boundaryHeight}px` : undefined,
//         }}
//       >
//         <div ref={stickyRef} className="sticky top-10 h-[70dvh] w-full">
//           <div ref={cardsRef} className="relative flex flex-col gap-8">
//             {items.map((item, index) => (
//               <StickyCard
//                 key={item.title}
//                 {...item}
//                 index={index}
//                 scrollY={scrollY}
//                 measurements={measurements}
//                 setCardSlotRef={setCardSlotRef}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <div aria-hidden="true" style={{ height: `${releaseSpace}px` }} />
//     </div>
//   );
// }

type StickyCardProps = CardType & {
  index: number;
  scrollY: MotionValue<number>;
  measurements: StackMeasurements;
  setCardSlotRef: (index: number, element: HTMLDivElement | null) => void;
};

const PRIMARY_VARIANTS = ["#0f2d4c", "#1e3959", "#334c69", "#517093"] as const;

function StickyCard({
  description,
  index,
  title,
  scrollY,
  measurements,
  setCardSlotRef,
}: StickyCardProps) {
  const y = useTransform(scrollY, (scrollPosition) => {
    const card = measurements.cards[index];
    if (!card) return 0;

    const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);
    return -Math.min(localScroll, card.reachScroll);
  });

  const scale = useTransform(scrollY, (scrollPosition) => {
    const card = measurements.cards[index];
    if (!card) return 1;

    const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);
    let depth = 0;

    for (
      let nextIndex = index + 1;
      nextIndex < measurements.cards.length;
      nextIndex++
    ) {
      const nextCard = measurements.cards[nextIndex];
      const previousCard = measurements.cards[nextIndex - 1];
      const animationStart = previousCard.reachScroll;
      const animationEnd = nextCard.reachScroll;
      const progress = Math.min(
        1,
        Math.max(
          0,
          (localScroll - animationStart) /
            Math.max(1, animationEnd - animationStart),
        ),
      );

      depth += progress;
    }

    return Math.max(MIN_STACK_SCALE, 1 - depth * STACK_SCALE_STEP);
  });

  return (
    <div
      ref={(element) => setCardSlotRef(index, element)}
      className="relative flex items-center justify-center"
    >
      <motion.div
        className="relative flex w-full origin-top flex-col rounded-4xl will-change-transform"
        style={{ y, scale, zIndex: index + 1 }}
      >
        <Card
          // style={{
          //   backgroundColor: PRIMARY_VARIANTS[index % PRIMARY_VARIANTS.length],
          // }}
          className="bg-sticky-card border-sticky-card-border shadow-sticky-card border py-8"
        >
          <CardContent className="flex flex-col px-8 lg:flex-row lg:justify-between">
            <div className="flex flex-1 flex-col items-start lg:pt-52.5">
              <Title
                as="h3"
                className="text-sticky-card-foreground text-2xl font-extrabold"
              >
                {title}
              </Title>

              <SubTitle className="text-sticky-card-muted dark:text-text-secondary mt-4 2xl:mt-12 2xl:w-4/5">
                {description}
              </SubTitle>
            </div>

            <div className="relative mt-6 aspect-square w-32 self-end md:mt-10 lg:mt-0 lg:w-40 lg:self-start xl:w-52">
              <Image
                src={`/images/solution-section/${index + 1}.png`}
                alt={title}
                fill
              />
              {/* <Image src={`/sample.svg`} alt={title} fill /> */}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
// import { useCallback, useLayoutEffect, useRef, useState } from "react";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";

// type CardType = {
//   title: string;
//   description: string;
//   tags: string[];
//   cta: {
//     label: string;
//     href: string;
//   };
// };

// const STACK_OFFSET_PX = 48;
// const STACK_SCALE_STEP = 0.05;
// const MIN_STACK_SCALE = 0.1;

// type CardMeasurement = {
//   offsetTop: number;
//   height: number;
//   stackedY: number;
//   reachScroll: number;
// };

// type StackMeasurements = {
//   scrollStart: number;
//   cards: CardMeasurement[];
// };

// const EMPTY_MEASUREMENTS: StackMeasurements = {
//   scrollStart: 0,
//   cards: [],
// };

// export type StickyCardsProps = {
//   items: CardType[];
// };

// export default function StickyCards({ items }: StickyCardsProps) {
//   const boundaryRef = useRef<HTMLDivElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardsRef = useRef<HTMLDivElement>(null);
//   const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const [boundaryHeight, setBoundaryHeight] = useState<number>();
//   const [releaseSpace, setReleaseSpace] = useState(0);
//   const [measurements, setMeasurements] =
//     useState<StackMeasurements>(EMPTY_MEASUREMENTS);

//   const { scrollY } = useScroll();

//   const setCardSlotRef = useCallback(
//     (index: number, element: HTMLDivElement | null) => {
//       cardSlotRefs.current[index] = element;
//     },
//     [],
//   );

//   const calculateLayout = useCallback(() => {
//     const boundary = boundaryRef.current;
//     const sticky = stickyRef.current;
//     const cardsContainer = cardsRef.current;
//     const slots = cardSlotRefs.current.slice(0, items.length);

//     if (
//       !boundary ||
//       !sticky ||
//       !cardsContainer ||
//       slots.length !== items.length ||
//       slots.some((slot) => !slot)
//     ) {
//       return;
//     }

//     const stickyTop =
//       Number.parseFloat(window.getComputedStyle(sticky).top) || 0;

//     const stickyHeight = sticky.getBoundingClientRect().height;

//     const cards = slots.map((slot, index) => {
//       const element = slot!;

//       /*
//        * The slot itself is never transformed, so these are the card's
//        * actual responsive rendered dimensions.
//        */
//       const offsetTop = element.offsetTop;
//       const height = element.getBoundingClientRect().height;
//       const stackedY = index * STACK_OFFSET_PX;

//       return {
//         offsetTop,
//         height,
//         stackedY,
//         reachScroll: Math.max(0, offsetTop - stackedY),
//       };
//     });

//     const lastCard = cards.at(-1);

//     if (!lastCard) return;

//     const animationDistance = lastCard.reachScroll;
//     const lastCardStackedBottom = lastCard.stackedY + lastCard.height;

//     /*
//      * The sticky boundary ends exactly when the final card reaches its
//      * stacked position. This allows the complete stack to then release.
//      */
//     const nextBoundaryHeight = Math.ceil(stickyHeight + animationDistance);

//     /*
//      * This separate space keeps the section alive while the released stack
//      * moves upward. It uses the last card's actual rendered height.
//      */
//     const nextReleaseSpace = Math.ceil(
//       Math.max(0, lastCardStackedBottom - stickyHeight),
//     );

//     const boundaryTop = boundary.getBoundingClientRect().top + window.scrollY;

//     setBoundaryHeight((current) =>
//       current === nextBoundaryHeight ? current : nextBoundaryHeight,
//     );

//     setReleaseSpace((current) =>
//       current === nextReleaseSpace ? current : nextReleaseSpace,
//     );

//     setMeasurements({
//       scrollStart: boundaryTop - stickyTop,
//       cards,
//     });
//   }, [items.length]);

//   useLayoutEffect(() => {
//     let animationFrame = 0;
//     let cancelled = false;

//     const scheduleCalculation = () => {
//       cancelAnimationFrame(animationFrame);

//       animationFrame = requestAnimationFrame(() => {
//         animationFrame = requestAnimationFrame(() => {
//           if (!cancelled) calculateLayout();
//         });
//       });
//     };

//     const resizeObserver = new ResizeObserver(scheduleCalculation);

//     if (stickyRef.current) {
//       resizeObserver.observe(stickyRef.current);
//     }

//     if (cardsRef.current) {
//       resizeObserver.observe(cardsRef.current);
//     }

//     cardSlotRefs.current.forEach((slot) => {
//       if (slot) resizeObserver.observe(slot);
//     });

//     window.addEventListener("resize", scheduleCalculation);
//     window.addEventListener("load", scheduleCalculation);

//     document.fonts?.ready.then(() => {
//       if (!cancelled) scheduleCalculation();
//     });

//     scheduleCalculation();

//     return () => {
//       cancelled = true;

//       cancelAnimationFrame(animationFrame);
//       resizeObserver.disconnect();

//       window.removeEventListener("resize", scheduleCalculation);
//       window.removeEventListener("load", scheduleCalculation);
//     };
//   }, [calculateLayout, items.length]);

//   if (!items.length) return null;

//   return (
//     /*
//      * Use padding instead of mt-20.
//      *
//      * Unlike margin, this 80px is included reliably in the component's
//      * actual layout height and cannot collapse outside the component.
//      */
//     <div className="relative w-full pt-20">
//       <div
//         ref={boundaryRef}
//         className="relative w-full"
//         style={{
//           height: boundaryHeight ? `${boundaryHeight}px` : undefined,
//         }}
//       >
//         <div ref={stickyRef} className="sticky top-10 h-[70dvh] w-full">
//           <div ref={cardsRef} className="relative flex flex-col gap-8">
//             {items.map((item, index) => (
//               <StickyCard
//                 key={item.title}
//                 {...item}
//                 index={index}
//                 scrollY={scrollY}
//                 measurements={measurements}
//                 setCardSlotRef={setCardSlotRef}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <div
//         aria-hidden="true"
//         style={{
//           height: `${releaseSpace}px`,
//         }}
//       />
//     </div>
//   );
// }

// type StickyCardProps = CardType & {
//   index: number;
//   scrollY: MotionValue<number>;
//   measurements: StackMeasurements;
//   setCardSlotRef: (index: number, element: HTMLDivElement | null) => void;
// };

// const PRIMARY_VARIANTS = [
//   "#1F2A3A",
//   "#253246",
//   "#2B3950",
//   "#32405A",
//   "#3A4A66",
// ] as const;

// function StickyCard({
//   description,
//   index,
//   title,
//   scrollY,
//   measurements,
//   setCardSlotRef,
// }: StickyCardProps) {
//   const y = useTransform(scrollY, (scrollPosition) => {
//     const card = measurements.cards[index];

//     if (!card) return 0;

//     const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);

//     return -Math.min(localScroll, card.reachScroll);
//   });

//   const scale = useTransform(scrollY, (scrollPosition) => {
//     const card = measurements.cards[index];

//     if (!card) return 1;

//     const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);

//     let depth = 0;

//     for (
//       let nextIndex = index + 1;
//       nextIndex < measurements.cards.length;
//       nextIndex++
//     ) {
//       const nextCard = measurements.cards[nextIndex];
//       const previousCard = measurements.cards[nextIndex - 1];

//       const animationStart = previousCard.reachScroll;
//       const animationEnd = nextCard.reachScroll;

//       const progress = Math.min(
//         1,
//         Math.max(
//           0,
//           (localScroll - animationStart) /
//             Math.max(1, animationEnd - animationStart),
//         ),
//       );

//       depth += progress;
//     }

//     return Math.max(MIN_STACK_SCALE, 1 - depth * STACK_SCALE_STEP);
//   });

//   return (
//     /*
//      * This outer slot remains untransformed and is used for measurements.
//      */
//     <div
//       ref={(element) => setCardSlotRef(index, element)}
//       className="relative flex items-center justify-center"
//     >
//       <motion.div
//         className="relative flex w-full origin-top flex-col rounded-4xl will-change-transform"
//         style={{
//           y,
//           scale,
//           zIndex: index + 1,
//         }}
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[index % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="flex flex-col px-8 lg:flex-row lg:justify-between">
//             <div className="flex flex-1 flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <SubTitle className="text-border dark:text-text-secondary mt-4 2xl:mt-6 2xl:w-4/5">
//                 {description}
//               </SubTitle>
//             </div>

//             <div className="relative mt-6 aspect-square w-32 self-end md:mt-10 lg:mt-0 lg:w-40 lg:self-start 2xl:w-56">
//               <Image src="/sample.svg" alt={title} fill />
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }

// "use client";

// import Image from "next/image";
// import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
// import { useCallback, useLayoutEffect, useRef, useState } from "react";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";

// type CardType = {
//   title: string;
//   description: string;
//   tags: string[];
//   cta: {
//     label: string;
//     href: string;
//   };
// };

// const STACK_OFFSET_PX = 48;
// const STACK_SCALE_STEP = 0.05;
// const MIN_STACK_SCALE = 0.1;
// // const SCALE_APPROACH_RATIO = 0.65;

// type CardMeasurement = {
//   offsetTop: number;
//   height: number;
//   stickyY: number;
//   reachScroll: number;
// };

// type StackMeasurements = {
//   scrollStart: number;
//   cards: CardMeasurement[];
// };

// const EMPTY_MEASUREMENTS: StackMeasurements = {
//   scrollStart: 0,
//   cards: [],
// };

// export type StickyCardsProps = {
//   items: CardType[];
// };

// export default function StickyCards({ items }: StickyCardsProps) {
//   const trackRef = useRef<HTMLDivElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardsRef = useRef<HTMLDivElement>(null);

//   /*
//    * These refs belong to untransformed layout slots.
//    * Their dimensions always represent the actual rendered card sizes.
//    */
//   const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const [trackHeight, setTrackHeight] = useState<number>();
//   const [measurements, setMeasurements] =
//     useState<StackMeasurements>(EMPTY_MEASUREMENTS);

//   const { scrollY } = useScroll();

//   const setCardSlotRef = useCallback(
//     (index: number, element: HTMLDivElement | null) => {
//       cardSlotRefs.current[index] = element;
//     },
//     [],
//   );

//   const calculateLayout = useCallback(() => {
//     const track = trackRef.current;
//     const sticky = stickyRef.current;
//     const cardsContainer = cardsRef.current;
//     const slots = cardSlotRefs.current.slice(0, items.length);

//     if (
//       !track ||
//       !sticky ||
//       !cardsContainer ||
//       slots.length !== items.length ||
//       slots.some((slot) => !slot)
//     ) {
//       return;
//     }

//     const trackTop = track.getBoundingClientRect().top + window.scrollY;

//     const computedStickyTop =
//       Number.parseFloat(getComputedStyle(sticky).top) || 0;

//     const stickyNaturalTop = sticky.offsetTop;
//     const stickyHeight = sticky.offsetHeight;

//     const cards = slots.map((slot, index) => {
//       const element = slot!;
//       const offsetTop = element.offsetTop;
//       const height = element.offsetHeight;
//       const stackedY = index * STACK_OFFSET_PX;

//       return {
//         offsetTop,
//         height,
//         stackedY,
//         reachScroll: Math.max(0, offsetTop - stackedY),
//       };
//     });

//     const lastCard = cards.at(-1);

//     if (!lastCard) return;

//     /*
//      * Distance required for the final card to reach its stacked position.
//      */
//     const animationDistance = lastCard.reachScroll;

//     /*
//      * Exact measured space required below the sticky container when the
//      * final card is taller than the available sticky viewport.
//      */
//     const lastCardStackedBottom = lastCard.stackedY + lastCard.height;

//     const lastCardOverflow = Math.max(0, lastCardStackedBottom - stickyHeight);

//     const nextTrackHeight = Math.ceil(
//       stickyNaturalTop + stickyHeight + animationDistance + lastCardOverflow,
//     );

//     setTrackHeight((current) =>
//       current === nextTrackHeight ? current : nextTrackHeight,
//     );

//     setMeasurements({
//       scrollStart: trackTop + stickyNaturalTop - computedStickyTop,
//       cards,
//     });
//   }, [items.length]);

//   useLayoutEffect(() => {
//     let animationFrame = 0;

//     const scheduleCalculation = () => {
//       cancelAnimationFrame(animationFrame);

//       animationFrame = requestAnimationFrame(() => {
//         /*
//          * The second frame ensures responsive layout and loaded image
//          * dimensions have been applied before measurement.
//          */
//         animationFrame = requestAnimationFrame(calculateLayout);
//       });
//     };

//     const resizeObserver = new ResizeObserver(scheduleCalculation);

//     if (stickyRef.current) {
//       resizeObserver.observe(stickyRef.current);
//     }

//     if (cardsRef.current) {
//       resizeObserver.observe(cardsRef.current);
//     }

//     cardSlotRefs.current.forEach((slot) => {
//       if (slot) resizeObserver.observe(slot);
//     });

//     window.addEventListener("resize", scheduleCalculation);
//     window.addEventListener("load", scheduleCalculation);

//     document.fonts?.ready.then(scheduleCalculation);

//     scheduleCalculation();

//     return () => {
//       cancelAnimationFrame(animationFrame);
//       resizeObserver.disconnect();

//       window.removeEventListener("resize", scheduleCalculation);
//       window.removeEventListener("load", scheduleCalculation);
//     };
//   }, [calculateLayout, items.length]);

//   if (!items.length) return null;

//   return (
//     <div
//       ref={trackRef}
//       className="relative w-full"
//       style={{
//         /*
//          * No estimated fallback height. useLayoutEffect measures and sets
//          * the actual required height before the browser paints.
//          */
//         height: trackHeight ? `${trackHeight}px` : undefined,
//       }}
//     >
//       <div ref={stickyRef} className="sticky top-10 mt-20 h-[70dvh] w-full">
//         <div ref={cardsRef} className="relative flex flex-col gap-8">
//           {items.map((item, index) => (
//             <StickyCard
//               key={item.title}
//               {...item}
//               index={index}
//               scrollY={scrollY}
//               measurements={measurements}
//               setCardSlotRef={setCardSlotRef}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // export default function StickyCards({ items }: StickyCardsProps) {
// //   const trackRef = useRef<HTMLDivElement>(null);
// //   const stickyRef = useRef<HTMLDivElement>(null);
// //   const cardsRef = useRef<HTMLDivElement>(null);
// //   const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

// //   const [measurements, setMeasurements] =
// //     useState<StackMeasurements>(EMPTY_MEASUREMENTS);

// //   const { scrollY } = useScroll();

// //   const setCardRef = useCallback(
// //     (index: number, element: HTMLDivElement | null) => {
// //       cardRefs.current[index] = element;
// //     },
// //     [],
// //   );

// //   const calculateLayout = useCallback(() => {
// //     const track = trackRef.current;
// //     const sticky = stickyRef.current;
// //     const cardsContainer = cardsRef.current;

// //     if (!track || !sticky || !cardsContainer) return;

// //     const cards = cardRefs.current.slice(0, items.length);

// //     if (!cards.length || cards.some((card) => !card)) return;

// //     const trackTop = track.getBoundingClientRect().top + window.scrollY;
// //     const stickyTop = Number.parseFloat(window.getComputedStyle(sticky).top);

// //     /*
// //      * offsetTop includes the existing mt-40 space, so that spacing remains
// //      * part of the sticky calculations.
// //      */
// //     const stickyNaturalTop = sticky.offsetTop;
// //     const stickyHeight = sticky.offsetHeight;

// //     const cardMeasurements = cards.map((card, index) => {
// //       const offsetTop = card!.offsetTop;
// //       const stickyY = index * STACK_OFFSET_PX;

// //       return {
// //         offsetTop,
// //         height: card!.offsetHeight,
// //         stickyY,
// //         reachScroll: Math.max(0, offsetTop - stickyY),
// //       };
// //     });

// //     const lastCard = cardMeasurements.at(-1);
// //     const scrollDistance = Math.max(1, lastCard?.reachScroll ?? 1);

// //     const scrollStart = trackTop + stickyNaturalTop - stickyTop;

// //     /*
// //      * The track lasts until the final card reaches its stack position.
// //      * Existing outer section/container py-* remains untouched.
// //      */
// //     const trackHeight = stickyNaturalTop + stickyHeight + scrollDistance;

// //     setMeasurements({
// //       scrollStart,
// //       scrollDistance,
// //       trackHeight: Math.ceil(trackHeight),
// //       cards: cardMeasurements,
// //     });
// //   }, [items.length]);

// //   useLayoutEffect(() => {
// //     let animationFrame = 0;

// //     const scheduleCalculation = () => {
// //       cancelAnimationFrame(animationFrame);
// //       animationFrame = requestAnimationFrame(calculateLayout);
// //     };

// //     const resizeObserver = new ResizeObserver(scheduleCalculation);

// //     if (stickyRef.current) {
// //       resizeObserver.observe(stickyRef.current);
// //     }

// //     if (cardsRef.current) {
// //       resizeObserver.observe(cardsRef.current);
// //     }

// //     cardRefs.current.forEach((card) => {
// //       if (card) resizeObserver.observe(card);
// //     });

// //     window.addEventListener("resize", scheduleCalculation);
// //     scheduleCalculation();

// //     return () => {
// //       cancelAnimationFrame(animationFrame);
// //       resizeObserver.disconnect();
// //       window.removeEventListener("resize", scheduleCalculation);
// //     };
// //   }, [calculateLayout, items.length]);

// //   if (!items.length) return null;

// //   return (
// //     <div
// //       ref={trackRef}
// //       className="relative w-full"
// //       style={{
// //         height:
// //           measurements.trackHeight > 1
// //             ? `${measurements.trackHeight}px`
// //             : `${items.length * 70}dvh`,
// //       }}
// //     >
// //       <div ref={stickyRef} className="sticky top-10 mt-12 h-[70dvh] w-full">
// //         <div ref={cardsRef} className="flex flex-col gap-8">
// //           {items.map((item, index) => (
// //             <StickyCard
// //               key={item.title}
// //               {...item}
// //               index={index}
// //               scrollY={scrollY}
// //               measurements={measurements}
// //               setCardRef={setCardRef}
// //             />
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// type StickyCardProps = CardType & {
//   index: number;
//   scrollY: MotionValue<number>;
//   measurements: StackMeasurements;
//   setCardSlotRef: (index: number, element: HTMLDivElement | null) => void;
// };

// const PRIMARY_VARIANTS = [
//   "#1F2A3A",
//   "#253246",
//   "#2B3950",
//   "#32405A",
//   "#3A4A66",
// ] as const;

// function StickyCard({
//   cta,
//   description,
//   index,
//   tags,
//   title,
//   scrollY,
//   measurements,
//   setCardSlotRef,
// }: StickyCardProps) {
//   const y = useTransform(scrollY, (scrollPosition) => {
//     const card = measurements.cards[index];

//     if (!card) return 0;

//     const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);

//     return -Math.min(localScroll, card.reachScroll);
//   });

//   const scale = useTransform(scrollY, (scrollPosition) => {
//     const card = measurements.cards[index];

//     if (!card) return 1;

//     const localScroll = Math.max(0, scrollPosition - measurements.scrollStart);

//     let depth = 0;

//     for (
//       let nextIndex = index + 1;
//       nextIndex < measurements.cards.length;
//       nextIndex++
//     ) {
//       const nextCard = measurements.cards[nextIndex];
//       const previousCard = measurements.cards[nextIndex - 1];

//       const animationStart = previousCard.reachScroll;
//       const animationEnd = nextCard.reachScroll;

//       const progress = Math.min(
//         1,
//         Math.max(
//           0,
//           (localScroll - animationStart) /
//             Math.max(1, animationEnd - animationStart),
//         ),
//       );

//       depth += progress;
//     }

//     return Math.max(MIN_STACK_SCALE, 1 - depth * STACK_SCALE_STEP);
//   });

//   return (
//     <div
//       ref={(element) => setCardSlotRef(index, element)}
//       className="relative flex items-center justify-center will-change-transform"
//     >
//       <motion.div
//         className="relative flex w-full flex-col rounded-4xl"
//         style={{
//           y,
//           scale,
//           zIndex: index + 1,
//         }}
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[index % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="flex flex-col px-8 lg:flex-row lg:justify-between">
//             <div className="flex flex-1 flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               {/* <TagsList tags={tags} /> */}

//               <SubTitle className="text-border dark:text-text-secondary mt-4 2xl:mt-6 2xl:w-4/5">
//                 {description}
//               </SubTitle>

//               {/* <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link> */}
//             </div>

//             <div className="relative mt-6 aspect-square w-32 self-end md:mt-10 lg:mt-0 lg:w-40 lg:self-start 2xl:w-56">
//               <Image
//                 className=""
//                 src="/sample.svg"
//                 alt={title}
//                 fill
//                 // width={231}
//                 // height={231}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }

// // export default function StickyCards({ items }: StickyCardsProps) {
// //   return (
// //     <div className="sticky top-0 h-[70dvh] bg-black">
// //       {items.map((item, index) => {
// //         return <StickyCard key={item.title} index={index} {...item} />;
// //       })}
// //     </div>
// //   );
// // }

// // type StickyCardProps = CardType & { index: number };

// // const StickyCard = ({
// //   cta,
// //   description,
// //   index,
// //   tags,
// //   title,
// // }: StickyCardProps) => {
// //   const PRIMARY_VARIANTS = [
// //     "#1F2A3A",
// //     "#253246",
// //     "#2B3950",
// //     "#32405A",
// //     "#3A4A66",
// //   ] as const;

// //   return (
// //     <div className="flex items-center justify-center">
// //       <motion.div className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform">
// //         <Card
// //           style={{
// //             backgroundColor: PRIMARY_VARIANTS[index % PRIMARY_VARIANTS.length],
// //           }}
// //           className="py-8"
// //         >
// //           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
// //             <div className="flex flex-col items-start lg:pt-52.5">
// //               <Title as="h3" className="text-2xl font-medium text-white">
// //                 {title}
// //               </Title>

// //               <TagsList tags={tags} />

// //               <SubTitle className="text-border dark:text-text-secondary mt-4">
// //                 {description}
// //               </SubTitle>

// //               <Link
// //                 href={cta.href}
// //                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
// //               >
// //                 {cta.label}
// //               </Link>
// //             </div>

// //             <Image
// //               className="mt-14 lg:mt-0 lg:self-start"
// //               src="/sample.svg"
// //               alt={title}
// //               width={231}
// //               height={231}
// //             />
// //           </CardContent>
// //         </Card>
// //       </motion.div>
// //     </div>
// //   );
// // };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-2 flex flex-wrap gap-x-2 lg:mt-4 lg:gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1 text-xs md:text-sm"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }
