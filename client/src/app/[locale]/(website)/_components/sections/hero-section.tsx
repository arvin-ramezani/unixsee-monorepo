"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTheme } from "next-themes";

import Section from "@/components/common/section";
// import StarsBackground from "../../../../components/common/stars-background";
import VideoBackground from "./hero-section/video-background";

import { useLightHeaderStore } from "@/providers/light-header-provider";
import Story from "../others/story/wp-story";

// export type HeroSectionProps = {} & { cmsProps: HomeHeroSectionProps };
export type HeroSectionProps = {
  id?: string;
};

export default function HeroSection({ id }: HeroSectionProps) {
  // const t = useTranslations("HomePage.HeroSection");

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useMeasuredInView(ref, "-50px 0px 0px 0px");

  const { resolvedTheme } = useTheme();
  const setHeaderTone = useLightHeaderStore((state) => state.setTone);

  useEffect(() => {
    if (isInView === null || !resolvedTheme) {
      return;
    }

    setHeaderTone(resolvedTheme === "dark" || isInView ? "dark" : "light");
  }, [isInView, setHeaderTone, resolvedTheme]);

  return (
    <>
      <Section
        id={id}
        className="sticky top-16 h-[calc(100dvh-65px)] bg-black text-center"
      >
        <VideoBackground />

        {/* <Story className="absolute inset-x-0 bottom-0" /> */}
      </Section>

      <div aria-hidden="true" className="h-px" ref={ref} />
    </>
  );
}

function useMeasuredInView(ref: RefObject<Element | null>, rootMargin: string) {
  const [isInView, setIsInView] = useState<boolean | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return isInView;
}
