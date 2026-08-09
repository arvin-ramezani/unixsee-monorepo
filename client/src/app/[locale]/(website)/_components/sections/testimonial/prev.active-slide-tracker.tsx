"use client";

import { useCarousel } from "@/components/ui/carousel";
import { useEffect } from "react";

export default function CarouselActiveTracker({
  onChange,
}: {
  onChange: (index: number) => void;
}) {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      requestAnimationFrame(() => {
        const index = api.selectedScrollSnap();
        onChange?.(index);
      });
    };

    const handleSettle = () => {
      requestAnimationFrame(() => {
        const index = api.selectedScrollSnap();
        onChange?.(index);
      });
    };

    api.on("select", handleSelect);
    api.on("settle", handleSettle);

    return () => {
      api.off("select", handleSelect);
      api.off("settle", handleSelect);
    };
  }, [api, onChange]);

  return null;
}
