"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

import Section from "@/components/common/section";
import VideoBackground from "./hero-section/video-background";

import { useLightHeaderStore } from "@/providers/light-header-provider";

export type HeroSectionProps = {
  id?: string;
};

const HEADER_OFFSET_PX = 64;

export default function HeroSection({ id }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const setHeaderTone = useLightHeaderStore((state) => state.setTone);

  useEffect(() => {
    const element = heroRef.current;

    if (!element || !resolvedTheme) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const heroVisible = entry.isIntersecting;
        setHeaderTone(
          resolvedTheme === "dark" || heroVisible ? "dark" : "light",
        );
      },
      {
        threshold: 0,
        rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px`,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [resolvedTheme, setHeaderTone]);

  return (
    <div ref={heroRef} className="sticky top-16">
      <Section
        id={id}
        containerClassName="p-0"
        className="sticky top-16 h-[calc(100dvh-65px)] bg-black text-center"
      >
        <VideoBackground />
      </Section>
    </div>
  );
}
