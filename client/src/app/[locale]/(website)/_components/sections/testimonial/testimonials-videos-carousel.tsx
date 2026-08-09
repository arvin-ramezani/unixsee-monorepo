"use client";

import Autoplay from "embla-carousel-autoplay";
import { useLocale, useTranslations } from "next-intl";
import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

import { TESTIMONIAL_KEYS } from "./testimonials-carousel-container";
import { cn } from "@/lib/utils";
import TestimonialsVideoTextsContainer from "./testimonials-video-texts-container";
import { ActiveSlideContext } from "./active-slide-context";
import CarouselActiveTracker from "./active-slide-tracker";
import TestimonialVideoCarouselItem from "./testimonial-video-carousel-item";

const SLIDER_AUTOPLAY_DURATION = 7000;

const MotionCarouselItem = motion.create(CarouselItem);

export type TestimonialsVideosCarouselProps = {
  testimonialKeys: typeof TESTIMONIAL_KEYS;
  className?: string;
};

export default function TestimonialsVideosCarousel({
  testimonialKeys,
  className,
}: TestimonialsVideosCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [src, setSrc] = useState("");

  const [stopSliderKey, setStopSliderKey] = useState<null | string>(null);
  const t = useTranslations("HomePage.TestimonialsSection.items");

  const stopSliderKeyHandler = (key: string) => {
    setStopSliderKey(key);
  };

  const startSliderHandler = () => setStopSliderKey(null);

  useEffect(() => {
    const fetchVideoUrl = () => {
      setSrc(t(`${testimonialKeys[activeIndex]}.video`));
    };

    fetchVideoUrl();
  }, [activeIndex, testimonialKeys, t]);

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
        containScroll: false,
        duration: 40,
      }}
      plugins={[
        Autoplay({
          active: !stopSliderKey,
          delay: SLIDER_AUTOPLAY_DURATION,
          stopOnInteraction: false,
        }),
      ]}
      className={cn(
        "relative mt-8 flex-col items-center justify-between gap-4 lg:mt-16 lg:max-w-1/2",
        className,
      )}
    >
      <ActiveSlideContext.Provider value={{ activeIndex }}>
        <CarouselActiveTracker onChange={setActiveIndex} />

        <CarouselContent
          wrapperClassName="w-full py-4"
          className="overflow-visible py-4"
        >
          {testimonialKeys.map((key, index) => {
            return (
              <MotionCarouselItem
                key={key}
                className={cn(
                  "basis-[70%] py-4 will-change-transform select-none",
                  {
                    "z-50": activeIndex === index,
                  },
                )}
                initial={false}
                animate={
                  stopSliderKey === key
                    ? {
                        flexBasis: "100%",
                        paddingBlockStart: "16px",
                      }
                    : {
                        flexBasis: "70%",
                        paddingBlockStart: "16px",
                      }
                }
              >
                <TestimonialVideoCarouselItem
                  src={src}
                  itemKey={key}
                  onStartVideo={stopSliderKeyHandler}
                  isStop={key === stopSliderKey}
                  onStopVideo={startSliderHandler}
                  index={index}
                />
              </MotionCarouselItem>
            );
          })}
        </CarouselContent>

        <TestimonialsVideoTextsContainer
          className=""
          testimonialKeys={testimonialKeys}
        />

        <ProgressBar
          className="w-[88%] md:w-[90%]"
          isStop={!!stopSliderKey}
          durationMs={SLIDER_AUTOPLAY_DURATION}
        />
      </ActiveSlideContext.Provider>
    </Carousel>
  );
}

type ProgressBarProps = {
  durationMs: number;
  isStop?: boolean;
  className?: string;
};

function ProgressBar({
  durationMs,
  isStop = false,
  className,
}: ProgressBarProps) {
  const isRtl = useLocale() === "fa";
  const controls = useAnimationControls();
  const { api } = useCarousel();

  const isInteractingRef = useRef(false);

  const resetAndStart = useCallback(async () => {
    controls.set({ scaleX: 0 });

    if (isInteractingRef.current || isStop) return;

    await controls.start({
      scaleX: 1,
      originX: isRtl ? "right" : "left",
      transition: {
        duration: durationMs / 1000,
        ease: "linear",
      },
    });
  }, [controls, durationMs, isRtl, isStop]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      resetAndStart();
    };

    const handlePointerDown = () => {
      isInteractingRef.current = true;
      controls.stop();
    };

    const handlePointerUp = () => {
      isInteractingRef.current = false;
      resetAndStart();
    };

    api.on("select", handleSelect);
    api.on("pointerDown", handlePointerDown);
    api.on("pointerUp", handlePointerUp);

    resetAndStart();

    return () => {
      api.off("select", handleSelect);
      api.off("pointerDown", handlePointerDown);
      api.off("pointerUp", handlePointerUp);
    };
  }, [api, durationMs, isRtl, controls, resetAndStart]);

  useEffect(() => {
    if (isStop) {
      controls.stop();
      return;
    }

    resetAndStart();
  }, [isStop, controls, resetAndStart]);

  return (
    <motion.div
      animate={{ opacity: isStop ? 0 : 1 }}
      className={cn(
        "bg-primary/60 h-0.5 w-full overflow-hidden rounded-full",
        className,
      )}
    >
      <motion.div
        className="bg-primary h-full w-full origin-left"
        animate={controls}
      />
    </motion.div>
  );
}

// function ProgressBar({ durationMs, isStop }: ProgressBarProps) {
//   const isRtl = useLocale() === "fa";

//   const controls = useAnimationControls();
//   const { api } = useCarousel();
//   const isPausedRef = useRef(false);

//   useEffect(() => {
//     if (!api) return;

//     const resetAndStart = async () => {
//       controls.set({ scaleX: 0 });

//       if (isPausedRef.current) return;

//       await controls.start({
//         scaleX: 1,
//         originX: isRtl ? "right" : "left",
//         transition: {
//           duration: durationMs / 1000,
//           ease: "linear",
//         },
//       });
//     };

//     const handleSelect = () => {
//       resetAndStart();
//     };

//     const handlePointerDown = () => {
//       isPausedRef.current = true;
//       controls.stop();
//     };

//     const handlePointerUp = () => {
//       isPausedRef.current = false;
//       resetAndStart();
//     };

//     api.on("select", handleSelect);
//     api.on("pointerDown", handlePointerDown);
//     api.on("pointerUp", handlePointerUp);

//     resetAndStart();

//     return () => {
//       api.off("select", handleSelect);
//       api.off("pointerDown", handlePointerDown);
//       api.off("pointerUp", handlePointerUp);
//     };
//   }, [api, controls, durationMs, isRtl]);

//   return (
//     <div className="bg-primary/60 h-0.5 w-full overflow-hidden rounded-full">
//       <motion.div className="bg-primary h-full" animate={controls} />
//     </div>
//   );
// }

// function ProgressBar({ durationMs, pause, reset }: ProgressBarProps) {
//   const isRtl = useLocale() === "fa";
//   const controls = useAnimationControls();

//   const { api } = useCarousel();

//   useEffect(() => {
//     if (!api) return;

//     const onSelect = () => {
//       const index = api.selectedScrollSnap();
//       controls.set({ scaleX: 0 });
//       console.log("slide changed:", index);
//     };

//     api.on("select", onSelect);

//     return () => {
//       api.off("select", onSelect);
//     };
//   }, [api, controls]);

//   useEffect(() => {
//     let isActive = true;

//     async function run() {
//       while (isActive) {
//         if (reset) {
//           controls.set({ scaleX: 0 });
//         }

//         if (pause) {
//           await new Promise((resolve) => setTimeout(resolve, 100));
//           continue;
//         }

//         controls.set({ scaleX: 0 });

//         await controls.start({
//           scaleX: 1,
//           originX: isRtl ? "right" : "left",
//           transition: {
//             duration: durationMs / 1000,
//             ease: "linear",
//           },
//         });
//       }
//     }

//     run();

//     return () => {
//       isActive = false;
//     };
//   }, [controls, durationMs, isRtl, pause, reset]);

//   return (
//     <div className="bg-primary/60 h-0.5 w-full overflow-hidden rounded-full">
//       <motion.div className="bg-primary h-full" animate={controls} />
//     </div>
//   );
// }
