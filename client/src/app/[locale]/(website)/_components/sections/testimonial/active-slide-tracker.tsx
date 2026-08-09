"use client";

import { useEffect, useEffectEvent } from "react";

import { useCarousel } from "@/components/ui/carousel";

export type SlideDirection = "next" | "prev";

function getSlideDirection(
  previousIndex: number,
  currentIndex: number,
  totalSlides: number,
): SlideDirection {
  if (totalSlides <= 1 || previousIndex === currentIndex) return "next";

  const forwardDistance =
    (currentIndex - previousIndex + totalSlides) % totalSlides;
  const backwardDistance =
    (previousIndex - currentIndex + totalSlides) % totalSlides;

  return forwardDistance <= backwardDistance ? "next" : "prev";
}

export default function CarouselActiveTracker({
  onChange,
}: {
  onChange: (index: number, direction: SlideDirection) => void;
}) {
  const { api } = useCarousel();

  const onActiveChange = useEffectEvent(
    (index: number, direction: SlideDirection) => {
      onChange(index, direction);
    },
  );

  useEffect(() => {
    if (!api) return;

    const handleChange = () => {
      requestAnimationFrame(() => {
        const index = api.selectedScrollSnap();
        const previousIndex = api.previousScrollSnap();
        const totalSlides = api.scrollSnapList().length;

        onActiveChange(
          index,
          getSlideDirection(previousIndex, index, totalSlides),
        );
        // onChange(index, getSlideDirection(previousIndex, index, totalSlides));
      });
    };

    api.on("select", handleChange);
    api.on("settle", handleChange);

    handleChange();

    return () => {
      api.off("select", handleChange);
      api.off("settle", handleChange);
    };
  }, [api]);

  return null;
}
