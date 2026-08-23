"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { RadialRevealButton } from "../common/radial-reveal/radial-reveal-button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type Direction = "ltr" | "rtl";

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  dir?: Direction;
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: "horizontal" | "vertical";
  dir: Direction;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  dir,
  // setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedDir, setResolvedDir] = React.useState<Direction>(dir ?? "ltr");
  const isRtl = resolvedDir === "rtl";

  React.useEffect(() => {
    if (dir) {
      setResolvedDir(dir);
      return;
    }

    const el = rootRef.current;
    if (!el) return;

    const closestDirElement = el.closest("[dir]");
    const nextDir =
      (closestDirElement?.getAttribute("dir") as Direction | null) ??
      (document.documentElement.getAttribute("dir") as Direction | null) ??
      "ltr";

    setResolvedDir(nextDir);
  }, [dir]);

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
      direction: orientation === "horizontal" ? resolvedDir : undefined,
    },
    plugins,
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const handlePointerDown = React.useCallback(() => {
    // reserved for ProgressBar pause
  }, []);

  const handlePointerUp = React.useCallback(() => {
    // reserved for ProgressBar resume
  }, []);

  const onSelect = React.useCallback(
    (api: CarouselApi) => {
      if (!api) return;

      if (isRtl) {
        setCanScrollPrev(api.canScrollNext());
        setCanScrollNext(api.canScrollPrev());
      } else {
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
      }

      // setCanScrollPrev(api.canScrollPrev());
      // setCanScrollNext(api.canScrollNext());
    },
    [isRtl],
  );

  const scrollPrev = React.useCallback(() => {
    if (!api) return;

    if (isRtl) {
      api?.scrollNext();
    } else {
      api?.scrollPrev();
    }
  }, [api, isRtl]);

  const scrollNext = React.useCallback(() => {
    if (!api) return;

    if (isRtl) {
      api.scrollPrev();
    } else {
      api.scrollNext();
    }
  }, [api, isRtl]);

  // const scrollPrev = React.useCallback(() => {
  //   api?.scrollPrev();
  // }, [api]);

  // const scrollNext = React.useCallback(() => {
  //   api?.scrollNext();
  // }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
      // if (orientation === "vertical") {
      //   if (event.key === "ArrowUp") {
      //     event.preventDefault();
      //     scrollPrev();
      //   } else if (event.key === "ArrowDown") {
      //     event.preventDefault();
      //     scrollNext();
      //   }
      //   return;
      // }

      // if (resolvedDir === "rtl") {
      //   if (event.key === "ArrowLeft") {
      //     event.preventDefault();
      //     scrollNext();
      //   } else if (event.key === "ArrowRight") {
      //     event.preventDefault();
      //     scrollPrev();
      //   }
      // } else {
      //   if (event.key === "ArrowLeft") {
      //     event.preventDefault();
      //     scrollPrev();
      //   } else if (event.key === "ArrowRight") {
      //     event.preventDefault();
      //     scrollNext();
      //   }
      // }
    },
    [scrollNext, scrollPrev],
    // [orientation, resolvedDir, scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api) return;

    onSelect(api);

    api.on("reInit", onSelect);
    api.on("select", onSelect);

    api.on("pointerDown", handlePointerDown);
    api.on("pointerUp", handlePointerUp);

    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);

      api.off("pointerDown", handlePointerDown);
      api.off("pointerUp", handlePointerUp);
    };
  }, [api, onSelect, handlePointerDown, handlePointerUp]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        dir: resolvedDir,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={rootRef}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative w-full overflow-hidden", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...(dir ? { dir } : {})}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<"div"> & { wrapperClassName?: string }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn("w-full min-w-0 overflow-hidden", wrapperClassName)}
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "ps-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant,
  size = "icon-sm",
  iconClassName,
  ...props
}: React.ComponentProps<typeof Button> & { iconClassName?: string }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <RadialRevealButton
      revealClassName="bg-background"
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "disabled:border-primary data-[radial-hover-active=true]:[&_svg]:text-primary dark:data-[radial-hover-active=true]:[&_svg]:text-secondary dark:hover:bg-secondary dark:disabled:[&_svg]:text-secondary dark:disabled:border-secondary disabled:[&_svg]:text-primary dark:[&_svg]:text-secondary-foreground dark:bg-secondary pointer-events-auto! absolute touch-manipulation rounded-full border-[1.9px] transition-colors duration-300 ease-out disabled:bg-transparent aria-invalid:bg-transparent dark:disabled:bg-transparent",
        // orientation === "horizontal"
        //   ? "-inset-s-12 top-1/2 -translate-y-1/2"
        //   : "inset-s-1/2 -top-12 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon
        className={cn(
          "size-full stroke-[1.2px]!",
          orientation === "vertical" && "rotate-90",
          iconClassName,
        )}
        // className={cn("cn-rtl-flip size-full", {
        //   "rotate-180": isRtl,
        // })}
      />
      <span className="sr-only">Previous slide</span>
    </RadialRevealButton>
  );
}

function CarouselNext({
  className,
  variant,
  size = "icon-sm",
  iconClassName,
  ...props
}: React.ComponentProps<typeof Button> & { iconClassName?: string }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  // const isRtl = useDirection() === "rtl";

  return (
    <RadialRevealButton
      data-slot="carousel-next"
      variant={variant}
      size={size}
      revealClassName="bg-background"
      className={cn(
        "disabled:border-primary data-[radial-hover-active=true]:[&_svg]:text-primary dark:data-[radial-hover-active=true]:[&_svg]:text-secondary dark:bg-secondary dark:hover:bg-secondary dark:disabled:[&_svg]:text-secondary dark:[&_svg]:text-secondary-foreground dark:disabled:border-secondary disabled:[&_svg]:text-primary pointer-events-auto! absolute touch-manipulation rounded-full border-[1.9px] transition-colors duration-300 ease-out disabled:bg-transparent dark:disabled:bg-transparent",
        // orientation === "horizontal"
        //   ? "-inset-e-12 top-1/2 -translate-y-1/2"
        //   : "inset-s-1/2 -bottom-12 -translate-x-1/2 rotate-90",
        className,
      )}
      // className={cn(
      //   "disabled:border-primary dark:bg-secondary dark:hover:bg-secondary dark:disabled:[&_svg]:text-secondary dark:[&_svg]:text-secondary-foreground dark:disabled:border-secondary disabled:[&_svg]:text-primary pointer-events-auto! absolute touch-manipulation rounded-full border-[1.9px] duration-300 disabled:bg-transparent dark:disabled:bg-transparent",
      //   orientation === "horizontal"
      //     ? "-inset-e-12 top-1/2 -translate-y-1/2"
      //     : "inset-s-1/2 -bottom-12 -translate-x-1/2 rotate-90",
      //   className,
      // )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon
        className={cn(
          "size-full stroke-[1.2px]!",
          orientation === "vertical" && "rotate-90",
          iconClassName,
        )}
        // className={cn("cn-rtl-flip size-full w-full", {
        //   "rotate-180": isRtl,
        // })}
      />
      <span className="sr-only">Next slide</span>
    </RadialRevealButton>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};

// "use client";

// import * as React from "react";
// import useEmblaCarousel, {
//   type UseEmblaCarouselType,
// } from "embla-carousel-react";
// import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "./button";

// type CarouselApi = UseEmblaCarouselType[1];
// type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
// type CarouselOptions = UseCarouselParameters[0];
// type CarouselPlugin = UseCarouselParameters[1];

// type CarouselProps = {
//   opts?: CarouselOptions;
//   plugins?: CarouselPlugin;
//   orientation?: "horizontal" | "vertical";
//   setApi?: (api: CarouselApi) => void;
// };

// type CarouselContextProps = {
//   carouselRef: ReturnType<typeof useEmblaCarousel>[0];
//   api: ReturnType<typeof useEmblaCarousel>[1];
//   scrollPrev: () => void;
//   scrollNext: () => void;
//   canScrollPrev: boolean;
//   canScrollNext: boolean;
// } & CarouselProps;

// const CarouselContext = React.createContext<CarouselContextProps | null>(null);

// function useCarousel() {
//   const context = React.useContext(CarouselContext);

//   if (!context) {
//     throw new Error("useCarousel must be used within a <Carousel />");
//   }

//   return context;
// }

// function Carousel({
//   orientation = "horizontal",
//   opts,
//   setApi,
//   plugins,
//   className,
//   children,
//   ...props
// }: React.ComponentProps<"div"> & CarouselProps) {
//   const [carouselRef, api] = useEmblaCarousel(
//     {
//       ...opts,
//       axis: orientation === "horizontal" ? "x" : "y",
//     },
//     plugins,
//   );
//   const [canScrollPrev, setCanScrollPrev] = React.useState(false);
//   const [canScrollNext, setCanScrollNext] = React.useState(false);

//   const onSelect = React.useCallback((api: CarouselApi) => {
//     if (!api) return;
//     setCanScrollPrev(api.canScrollPrev());
//     setCanScrollNext(api.canScrollNext());
//   }, []);

//   const scrollPrev = React.useCallback(() => {
//     api?.scrollPrev();
//   }, [api]);

//   const scrollNext = React.useCallback(() => {
//     api?.scrollNext();
//   }, [api]);

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
//     [scrollPrev, scrollNext],
//   );

//   React.useEffect(() => {
//     if (!api || !setApi) return;
//     setApi(api);
//   }, [api, setApi]);

//   React.useEffect(() => {
//     if (!api) return;
//     onSelect(api);
//     api.on("reInit", onSelect);
//     api.on("select", onSelect);

//     return () => {
//       api?.off("select", onSelect);
//     };
//   }, [api, onSelect]);

//   return (
//     <CarouselContext.Provider
//       value={{
//         carouselRef,
//         api: api,
//         opts,
//         orientation:
//           orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
//         scrollPrev,
//         scrollNext,
//         canScrollPrev,
//         canScrollNext,
//       }}
//     >
//       <div
//         onKeyDownCapture={handleKeyDown}
//         className={cn("relative", className)}
//         role="region"
//         aria-roledescription="carousel"
//         data-slot="carousel"
//         {...props}
//       >
//         {children}
//       </div>
//     </CarouselContext.Provider>
//   );
// }

// function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
//   const { carouselRef, orientation } = useCarousel();

//   return (
//     <div
//       ref={carouselRef}
//       className="overflow-hidden"
//       data-slot="carousel-content"
//     >
//       <div
//         className={cn(
//           "flex",
//           orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col",
//           className,
//         )}
//         {...props}
//       />
//     </div>
//   );
// }

// function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
//   const { orientation } = useCarousel();

//   return (
//     <div
//       role="group"
//       aria-roledescription="slide"
//       data-slot="carousel-item"
//       className={cn(
//         "min-w-0 shrink-0 grow-0 basis-full",
//         orientation === "horizontal" ? "ps-4" : "pt-4",
//         className,
//       )}
//       {...props}
//     />
//   );
// }

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
//       <ChevronLeftIcon className="cn-rtl-flip" />
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
//       <ChevronRightIcon className="cn-rtl-flip" />
//       <span className="sr-only">Next slide</span>
//     </Button>
//   );
// }

// export {
//   type CarouselApi,
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselPrevious,
//   CarouselNext,
//   useCarousel,
// };
