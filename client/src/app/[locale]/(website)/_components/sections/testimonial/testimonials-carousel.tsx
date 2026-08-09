"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { cn } from "@/lib/utils";
import { ActiveSlideContext } from "./active-slide-context";
import CarouselActiveTracker, {
  type SlideDirection,
} from "./active-slide-tracker";
import TestimonialItem from "./testimonial-item";
import TestimonialVideoItem from "./testimonial-video-item";
import { TESTIMONIAL_KEYS } from "./testimonials-carousel-container";

const SLIDER_AUTOPLAY_DURATION = 5000;

export type TestimonialsCarouselType = {
  testimonialKeys: typeof TESTIMONIAL_KEYS;
  className?: string;
};

export default function TestimonialsCarousel({
  testimonialKeys,
  className,
}: TestimonialsCarouselType) {
  const t = useTranslations("HomePage.TestimonialsSection.items");

  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("next");
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeIndexRef = useRef(0);

  const testimonialsItemsWithImage = testimonialKeys.map((item) => ({
    testimonial: t(`${item}.quote`),
    author: t(`${item}.author`),
    role: t(`${item}.role`),
    authorImage: {
      src: t(`${item}.authorImage.src`),
      alt: t(`${item}.authorImage.alt`),
    },
    key: item,
  }));

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: SLIDER_AUTOPLAY_DURATION,
        stopOnInteraction: false,
        stopOnFocusIn: false,
      }),
    [],
  );

  const carouselPlugins = useMemo(() => [autoplay], [autoplay]);

  const stopAutoplay = useCallback(() => {
    autoplay.stop();
  }, [autoplay]);

  const startAutoplay = useCallback(() => {
    autoplay.play();
    autoplay.reset();
  }, [autoplay]);

  const handleNavigation = useCallback(() => {
    activeVideoRef.current?.pause();
    startAutoplay();
  }, [startAutoplay]);

  const handleActiveSlideChange = useCallback(
    (index: number, direction: SlideDirection) => {
      if (index === activeIndexRef.current) return;

      activeIndexRef.current = index;
      activeVideoRef.current?.pause();
      setActiveIndex(index);
      setSlideDirection(direction);
    },
    [],
  );

  const handleVideoElementChange = useCallback(
    (videoElement: HTMLVideoElement | null) => {
      activeVideoRef.current = videoElement;
    },
    [],
  );

  return (
    <Carousel
      orientation="vertical"
      opts={{
        align: "center",
        loop: true,
        containScroll: false,
        duration: 40,
        watchDrag: (_emblaApi, event) => {
          const target = event.target as HTMLElement | null;

          return Boolean(target?.closest("[data-scroll-drag-area]"));
        },
      }}
      // plugins={carouselPlugins}
      className={cn(
        "relative mt-8 items-center justify-between gap-6 lg:mt-16 lg:w-full",
        className,
      )}
    >
      <ActiveSlideContext.Provider value={{ activeIndex }}>
        <CarouselActiveTracker onChange={handleActiveSlideChange} />
        <div className="dark:from-background dark:via-background/50 pointer-events-none absolute inset-x-0 -top-1 z-10 h-8 bg-linear-to-b from-[#fbfdff] via-[#fbfdff]/80 to-transparent dark:to-transparent" />
        <div className="dark:from-background dark:via-background/50 pointer-events-none absolute inset-x-0 -bottom-1 z-10 h-8 bg-linear-to-t from-[#fbfdff] via-[#fbfdff]/80 to-transparent dark:to-transparent" />

        <div className="flex-1">
          <div className="absolute inset-y-1/2 inset-s-0 z-10 flex h-24 -translate-y-1/2 flex-col gap-4">
            <CarouselPrevious
              onClickCapture={handleNavigation}
              className="static size-10 translate-0 p-2!"
            />
            <CarouselNext
              onClickCapture={handleNavigation}
              className="static size-10 translate-0 p-2!"
            />
          </div>

          <CarouselContent
            data-scroll-drag-area
            className="ms-20 h-94 lg:h-128"
          >
            {testimonialsItemsWithImage.map((item) => (
              <CarouselItem
                key={item.key}
                className="basis-[50%] pt-4 select-none"
              >
                <TestimonialItem
                  testimonial={item.testimonial}
                  author={item.author}
                  role={item.role}
                  authorImage={item.authorImage}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>

        <div className="lg:max-[unset] max-w-1/2 min-w-1/2 flex-1">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <TestimonialVideoItem
              key={testimonialKeys[activeIndex]}
              className="ms-8"
              src={t(`${testimonialKeys[activeIndex]}.video`)}
              itemKey={testimonialKeys[activeIndex]}
              direction={slideDirection}
              onStartVideo={stopAutoplay}
              onStopVideo={startAutoplay}
              onVideoElementChange={handleVideoElementChange}
            />
          </AnimatePresence>
        </div>
      </ActiveSlideContext.Provider>
    </Carousel>
  );
}
