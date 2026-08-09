// "use client";

// import * as React from "react";
// import useEmblaCarousel, {
//   type UseEmblaCarouselType,
// } from "embla-carousel-react";
// import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
// import { motion } from "framer-motion";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

// type CarouselApi = UseEmblaCarouselType[1];
// type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
// type CarouselOptions = UseCarouselParameters[0];
// type CarouselPlugin = UseCarouselParameters[1];
// type Direction = "ltr" | "rtl";

// type CarouselProps = {
//   opts?: CarouselOptions;
//   plugins?: CarouselPlugin;
//   orientation?: "horizontal" | "vertical";
//   dir?: Direction;
//   setApi?: (api: CarouselApi) => void;
// };

// type CarouselContextProps = {
//   carouselRef: ReturnType<typeof useEmblaCarousel>[0];
//   api: ReturnType<typeof useEmblaCarousel>[1];
//   scrollPrev: () => void;
//   scrollNext: () => void;
//   canScrollPrev: boolean;
//   canScrollNext: boolean;
//   orientation: "horizontal" | "vertical";
//   dir: Direction;
//   selectedIndex: number;
// } & CarouselProps;

// const CarouselContext = React.createContext<CarouselContextProps | null>(null);

// function useCarousel() {
//   const context = React.useContext(CarouselContext);
//   if (!context)
//     throw new Error("useCarousel must be used within a <Carousel />");
//   return context;
// }

// function Carousel({
//   orientation = "horizontal",
//   opts,
//   dir,
//   setApi,
//   plugins,
//   className,
//   children,
//   ...props
// }: React.ComponentProps<"div"> & CarouselProps) {
//   const rootRef = React.useRef<HTMLDivElement | null>(null);
//   const [resolvedDir, setResolvedDir] = React.useState<Direction>(dir ?? "ltr");
//   const isRtl = resolvedDir === "rtl";

//   React.useEffect(() => {
//     if (dir) {
//       setResolvedDir(dir);
//       return;
//     }
//     const el = rootRef.current;
//     if (!el) return;
//     const closestDirElement = el.closest("[dir]");
//     const nextDir =
//       (closestDirElement?.getAttribute("dir") as Direction | null) ??
//       (document.documentElement.getAttribute("dir") as Direction | null) ??
//       "ltr";
//     setResolvedDir(nextDir);
//   }, [dir]);

//   const [carouselRef, api] = useEmblaCarousel(
//     {
//       ...opts,
//       axis: orientation === "horizontal" ? "x" : "y",
//       direction: orientation === "horizontal" ? resolvedDir : undefined,
//       // Align center so active slide is always centred in the viewport
//       align: "center",
//       // Allow seeing adjacent slides
//       containScroll: false,
//     },
//     plugins,
//   );

//   const [canScrollPrev, setCanScrollPrev] = React.useState(false);
//   const [canScrollNext, setCanScrollNext] = React.useState(false);
//   const [selectedIndex, setSelectedIndex] = React.useState(0);

//   const onSelect = React.useCallback(
//     (api: CarouselApi) => {
//       if (!api) return;
//       setSelectedIndex(api.selectedScrollSnap());
//       if (isRtl) {
//         setCanScrollPrev(api.canScrollNext());
//         setCanScrollNext(api.canScrollPrev());
//       } else {
//         setCanScrollPrev(api.canScrollPrev());
//         setCanScrollNext(api.canScrollNext());
//       }
//     },
//     [isRtl],
//   );

//   React.useEffect(() => {
//     if (!api || !setApi) return;
//     setApi(api);
//   }, [api, setApi]);

//   const scrollPrev = React.useCallback(() => {
//     if (!api) return;

//     if (isRtl) {
//       api.scrollNext();
//     } else {
//       api.scrollPrev();
//     }
//   }, [api, isRtl]);

//   const scrollNext = React.useCallback(() => {
//     if (!api) return;

//     if (isRtl) {
//       api.scrollPrev();
//     } else {
//       api.scrollNext();
//     }
//   }, [api, isRtl]);

//   const handleKeyDown = React.useCallback(
//     (event: React.KeyboardEvent<HTMLDivElement>) => {
//       if (event.key === "ArrowLeft") {
//         event.preventDefault();
//         scrollPrev();
//       } else if (event.key === "ArrowRight") {
//         event.preventDefault();
//         scrollNext();
//       }
//     },
//     [scrollNext, scrollPrev],
//   );

//   React.useEffect(() => {
//     if (!api) return;
//     onSelect(api);
//     api.on("reInit", onSelect);
//     api.on("select", onSelect);
//     return () => {
//       api.off("reInit", onSelect);
//       api.off("select", onSelect);
//     };
//   }, [api, onSelect]);

//   return (
//     <CarouselContext.Provider
//       value={{
//         carouselRef,
//         api,
//         opts,
//         orientation,
//         dir: resolvedDir,
//         scrollPrev,
//         scrollNext,
//         canScrollPrev,
//         canScrollNext,
//         selectedIndex,
//       }}
//     >
//       <div
//         ref={rootRef}
//         onKeyDownCapture={handleKeyDown}
//         className={cn("relative", className)}
//         role="region"
//         aria-roledescription="carousel"
//         data-slot="carousel"
//         {...(dir ? { dir } : {})}
//         {...props}
//       >
//         {children}
//       </div>
//     </CarouselContext.Provider>
//   );
// }

// // ─── CarouselContent ─────────────────────────────────────────────────────────
// // overflow-visible is critical so scaled slides aren't clipped.
// // We still give Embla its ref so it manages scroll snapping.

// function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
//   const { carouselRef, orientation } = useCarousel();

//   return (
//     <div
//       ref={carouselRef}
//       // overflow-visible: lets scaled/overlapping slides show outside the track
//       className="overflow-visible"
//       data-slot="carousel-content"
//     >
//       <div
//         className={cn(
//           "flex",
//           orientation === "horizontal"
//             ? // No gap here — we rely on negative margins inside CarouselItem
//               "items-center"
//             : "flex-col items-center",
//           className,
//         )}
//         {...props}
//       />
//     </div>
//   );
// }

// // ─── CarouselItem ─────────────────────────────────────────────────────────────
// // Each item renders a Framer Motion wrapper that scales up when active and
// // pulls adjacent slides behind it with a negative margin / lower z-index.
// //
// // ┌──────────────────────────────────────────────────────────────────────────┐
// // │  basis-[75%]  ← Embla sees this width for snapping                      │
// // │  Inside: motion.div handles scale + z-index + negative horizontal margin │
// // └──────────────────────────────────────────────────────────────────────────┘

// interface CarouselItemProps extends React.ComponentProps<"div"> {
//   index: number;
// }

// function CarouselItem({ className, index, ...props }: CarouselItemProps) {
//   const { orientation, selectedIndex } = useCarousel();
//   const isActive = index === selectedIndex;

//   return (
//     <div
//       role="group"
//       aria-roledescription="slide"
//       data-slot="carousel-item"
//       data-active={isActive}
//       className={cn(
//         // basis-[75%]: each slide occupies 75% of viewport — prev/next peek in
//         "min-w-0 shrink-0 grow-0",
//         orientation === "horizontal" ? "basis-[75%]" : "w-full pt-4",
//         className,
//       )}
//     >
//       {/*
//         Framer Motion handles all the visual transforms:
//         - scale: 1.18 for active, 0.88 for neighbours
//         - z-index: active floats above neighbours
//         - marginInline: negative values pull neighbours under the active card

//         We use `layout` so Framer smoothly animates between positions as the
//         selected index changes. `layoutId` is NOT used here (different slides),
//         but `layout` on each individual item gives Framer permission to
//         interpolate its own transform changes.
//       */}
//       <motion.div
//         animate={
//           isActive
//             ? {
//                 scale: 1.18,
//                 zIndex: 10,
//                 // No negative margin on active — it sits at natural size
//                 marginLeft: 0,
//                 marginRight: 0,
//                 opacity: 1,
//               }
//             : {
//                 scale: 0.88,
//                 zIndex: 0,
//                 // Pull neighbours inward so they peek behind the active card.
//                 // Negative margin creates the "behind" overlap effect.
//                 // -10% of the slide width is a good starting point.
//                 marginLeft: "-5%",
//                 marginRight: "-5%",
//                 opacity: 0.75,
//               }
//         }
//         transition={{
//           // Spring for scale/position gives a satisfying physical feel
//           type: "spring",
//           stiffness: 300,
//           damping: 30,
//           mass: 0.8,
//           // Opacity can be a quick tween
//           opacity: { duration: 0.2 },
//         }}
//         style={{
//           // Required so the z-index actually stacks in the flex row
//           position: "relative",
//           // transform-origin center so scale expands outward from the middle
//           transformOrigin: "center center",
//           // Ensure the motion div fills its parent slide slot
//           width: "100%",
//         }}
//         {...props}
//       />
//     </div>
//   );
// }

// // ─── Navigation buttons ───────────────────────────────────────────────────────

// function CarouselPrevious({
//   className,
//   variant = "outline",
//   size = "icon-sm",
//   ...props
// }: React.ComponentProps<typeof Button>) {
//   const { orientation, scrollPrev, canScrollPrev } = useCarousel();

//   return (
//     <Button
//       data-slot="carousel-previous"
//       variant={variant}
//       size={size}
//       className={cn(
//         "absolute touch-manipulation rounded-full",
//         orientation === "horizontal"
//           ? "-inset-s-12 top-1/2 -translate-y-1/2"
//           : "inset-s-1/2 -top-12 -translate-x-1/2 rotate-90",
//         className,
//       )}
//       disabled={!canScrollPrev}
//       onClick={scrollPrev}
//       {...props}
//     >
//       <ChevronLeftIcon className="size-full" />
//       <span className="sr-only">Previous slide</span>
//     </Button>
//   );
// }

// function CarouselNext({
//   className,
//   variant = "outline",
//   size = "icon-sm",
//   ...props
// }: React.ComponentProps<typeof Button>) {
//   const { orientation, scrollNext, canScrollNext } = useCarousel();

//   return (
//     <Button
//       data-slot="carousel-next"
//       variant={variant}
//       size={size}
//       className={cn(
//         "absolute touch-manipulation rounded-full",
//         orientation === "horizontal"
//           ? "-inset-e-12 top-1/2 -translate-y-1/2"
//           : "inset-s-1/2 -bottom-12 -translate-x-1/2 rotate-90",
//         className,
//       )}
//       disabled={!canScrollNext}
//       onClick={scrollNext}
//       {...props}
//     >
//       <ChevronRightIcon className="size-full" />
//       <span className="sr-only">Next slide</span>
//     </Button>
//   );
// }

// // ─── Dot indicators (optional but nice for this layout) ───────────────────────

// function CarouselDots({ count }: { count: number }) {
//   const { selectedIndex, api } = useCarousel();

//   return (
//     <div className="mt-4 flex justify-center gap-1.5">
//       {Array.from({ length: count }).map((_, i) => (
//         <motion.button
//           key={i}
//           onClick={() => api?.scrollTo(i)}
//           animate={{
//             width: i === selectedIndex ? 20 : 8,
//             opacity: i === selectedIndex ? 1 : 0.4,
//           }}
//           transition={{ type: "spring", stiffness: 400, damping: 30 }}
//           className="h-2 rounded-full bg-current"
//           aria-label={`Go to slide ${i + 1}`}
//         />
//       ))}
//     </div>
//   );
// }

// export {
//   type CarouselApi,
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselPrevious,
//   CarouselNext,
//   CarouselDots,
//   useCarousel,
// };
