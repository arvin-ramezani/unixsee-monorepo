"use client";

import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import ProblemSectionCarousel from "../others/problem-section-carousel";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import Story from "../others/story/wp-story";
// import {
//   useScroll,
//   useTransform,
//   motion,
//   useMotionTemplate,
//   useMotionValueEvent,
// } from "framer-motion";
// import { useEffect, useRef } from "react";
// import { useLightHeaderStore } from "@/providers/light-header-provider";
// import { useTheme } from "next-themes";
// import { HomeProblemSectionProps } from "@/types/wordpress/unixsee-home-sections";
// import SubTitle from "@/components/common/subtitle";
// import { ComponentWithCmsProps } from "@/types/component.types";

export type ProblemSectionProps = { id: string };
// &  ComponentWithCmsProps<HomeProblemSectionProps>;

export default function ProblemSection({ id }: ProblemSectionProps) {
  const t = useTranslations("HomePage.ProblemSection");

  return (
    <div className="bg-background relative rounded-t-4xl lg:rounded-t-[52px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-16 bg-linear-to-b from-transparent via-[#020812]/45 to-transparent dark:via-[#07111d]/65 dark:to-[#101b29]"
      />

      {/* <div
        aria-hidden="true"
        className="absolute inset-s-0 -top-12 h-px w-full"
      /> */}

      {/* <div className="absolute inset-s-0 -top-12 z-0 h-14 w-full rounded-full bg-white [box-shadow:0px_-1px_8px_0px_#65a2e2] lg:h-25 lg:[box-shadow:0px_-2px_13px_0px_#65a2e2] dark:bg-[#101b29] dark:[box-shadow:0_-18px_42px_rgba(0,0,0,.55),0_-1px_16px_rgba(82,123,166,.14)] dark:lg:[box-shadow:0_-28px_70px_rgba(0,0,0,.58),0_-1px_22px_rgba(82,123,166,.13)]" /> */}
      <div className="pointer-events-none absolute inset-x-0 z-0 h-14 w-full rounded-t-4xl bg-white [box-shadow:0_-8px_22px_rgba(2,8,18,.30),0_-1px_0_rgba(198,222,252,.32)] lg:h-25 lg:rounded-t-[52px] lg:[box-shadow:0_-10px_26px_rgba(2,8,18,.32),0_-1px_0_rgba(198,222,252,.30)] dark:bg-[#101b29] dark:[box-shadow:0_-4px_10px_rgba(0,0,0,.22),0_-1px_0_rgba(142,170,204,.055),inset_0_1px_0_rgba(255,255,255,.016)] dark:lg:[box-shadow:0_-5px_12px_rgba(0,0,0,.24),0_-1px_0_rgba(142,170,204,.06),inset_0_1px_0_rgba(255,255,255,.016)]" />

      <Section
        id={id}
        className="relative z-10 min-h-auto rounded-ss-3xl rounded-se-3xl border-t border-[#dcecfb] bg-white lg:rounded-ss-[52px] lg:rounded-se-[52px] dark:border-[#8eaacc1f] dark:bg-[#101b29]"
        containerClassName="lg:py-0! lg:pt-24!"
      >
        {/* <Section
        id={id}
        className="relative -top-12 min-h-auto rounded-ss-3xl rounded-se-3xl bg-white lg:rounded-ss-[52px] lg:rounded-se-[52px] dark:bg-[#101b29]"
        // className="relative -top-12 min-h-auto rounded-ss-3xl rounded-se-3xl bg-white [box-shadow:0px_-4px_26px_0px_#65a2e2] lg:rounded-ss-[52px] lg:rounded-se-[52px] dark:bg-[#101b29] dark:[box-shadow:0px_-4px_26px_0px_#527ba685]"
        containerClassName="lg:py-0! lg:pt-24!"
      > */}
        {/* <section
      id={id}
      className="-top relative -top-12 min-h-[70dvh] overflow-hidden rounded-ss-3xl rounded-se-3xl bg-white pt-14 md:pt-16 lg:rounded-ss-[52px] lg:rounded-se-[52px] lg:pt-24 xl:pb-28"
    >
      <motion.div
        ref={targetRef}
        style={
          {
            // background,
            // backdropFilter: transformedBlur,
            // backgroundImage: transformedGradient,
            // opacity,
          }
        }
        className="absolute top-0 w-full rounded-ss-3xl rounded-se-3xl lg:rounded-ss-[52px] lg:rounded-se-[52px] xl:h-[13dvh]"
      /> */}
        <Story className="inset-x-0 -mt-8 mb-8 lg:mt-0 lg:mb-10" />

        <div className="bg-white dark:bg-[#101b29]">
          <div className="">
            <ScaleTitle
              as={"h2"}
              scaleFrom={0.6}
              scaleTo={1}
              className="lg:max-w-155 lg:leading-16 xl:max-w-2xl"
            >
              {t("title")}
            </ScaleTitle>
            <ScaleTitle
              as={"p"}
              scaleFrom={0.6}
              scaleTo={1}
              className="mt-4 lg:mt-6 lg:max-w-125 xl:max-w-4xl"
            >
              {t("description")}
            </ScaleTitle>

            <ProblemSectionCarousel />
          </div>
        </div>
      </Section>
    </div>
  );
}
