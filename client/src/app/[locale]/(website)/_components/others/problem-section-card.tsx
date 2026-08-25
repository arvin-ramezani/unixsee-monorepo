"use client";

import { motion, useInView } from "framer-motion";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { slideIn } from "@/lib/variants";
import { SLIDE_IN_VARIANT } from "@/constants/variants";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";
import { Video } from "@/components/ui/video";

const MotionCardTitle = motion.create(CardTitle);
const MotionCardDescription = motion.create(CardDescription);
const cardBackgroundColor = "var(--problem-card-background)";

type ProblemSectionCardProps = {
  index: number;
  title: string;
  description?: string;
  subTitle?: string;
  tags: string[];
  metric?: string;
  metricLabel?: string;
  isFirstIndex?: boolean;
};

export function ProblemSectionCard({
  index,
  title,
  description,
  subTitle,
  tags,
  isFirstIndex,
}: ProblemSectionCardProps) {
  const isRtl = useLocale() === "fa";
  const targetRef = useRef<HTMLDivElement>(null);
  const [isRevealComplete, setIsRevealComplete] = useState(!isFirstIndex);

  const isInView = useInView(targetRef, {
    once: true,
    margin: "0px 0px -38% 0px",
  });

  const fireAnimate = isFirstIndex && isInView;
  const showCardShadow = !isFirstIndex || isRevealComplete;

  return (
    <motion.div
      data-scroll-drag-area
      initial={
        isFirstIndex
          ? {
              backgroundColor: "transparent",
            }
          : {
              backgroundColor: cardBackgroundColor,
            }
      }
      animate={
        isInView
          ? {
              backgroundColor: cardBackgroundColor,
              transition: { ease: "easeIn", duration: 0.01, delay: 0.5 },
            }
          : {}
      }
      // transition={{ ease: "easeIn", duration: 0.01, delay: .5 }}
      ref={targetRef}
      className={cn(
        "relative hidden flex-row overflow-hidden rounded-3xl border border-transparent pt-0 transition-colors duration-100 select-none [--problem-card-background:#132439] lg:flex dark:[--problem-card-background:#11161e]",
        showCardShadow &&
          "border-[#dcecfb]/70 lg:[box-shadow:0_18px_44px_-32px_rgba(19,36,57,.24),0_2px_10px_-6px_rgba(19,36,57,.12),0_0_0_1px_rgba(198,222,252,.28)] 2xl:[box-shadow:0_22px_54px_-38px_rgba(19,36,57,.26),0_4px_14px_-8px_rgba(19,36,57,.12),0_0_0_1px_rgba(198,222,252,.30)] dark:border-[#8eaacc14] dark:lg:[box-shadow:inset_0_1px_0_rgba(255,255,255,.016)] dark:2xl:[box-shadow:inset_0_1px_0_rgba(255,255,255,.016)]",
      )}
      // className={cn(
      //   "relative hidden flex-row overflow-hidden rounded-3xl pt-0 select-none lg:flex",
      //   showCardShadow &&
      //     "lg:[box-shadow:0px_0px_13px_0px_#4c95c6] 2xl:[box-shadow:0px_6px_36px_0px_#4c95c6] dark:[box-shadow:0px_0px_4px_0px_#0a161ea6] dark:2xl:[box-shadow:0px_0px_16px_4px_#0a161ea6]",
      // )}
    >
      <motion.div
        initial={
          isFirstIndex
            ? { opacity: 0, width: "100%" }
            : { opacity: 1, width: "100%" }
        }
        animate={
          isInView && isFirstIndex
            ? { opacity: 1, width: "100%" }
            : !isFirstIndex
              ? { opacity: 1, width: "100%" }
              : {}
        }
        transition={{ duration: 0.2, delay: 1.2 }}
        className="absolute inset-e-0 inset-be-0 h-full w-full rounded-3xl bg-[radial-gradient(ellipse_clamp(340px,28vw,560px)_clamp(260px,22vw,440px)_at_6%_73%,rgb(24_116_179/0.34)_0%,rgb(24_116_179/0.26)_24%,rgb(24_116_179/0.18)_44%,rgb(24_116_179/0.1)_62%,rgb(24_116_179/0.04)_76%,rgb(24_116_179/0)_90%)] blur-lg"
        // className="absolute inset-e-0 inset-be-0 h-full w-full rounded-3xl [background:radial-gradient(circle_at_94%_73%,#1874b3d1,transparent)] lg:[box-shadow:0px_0px_13px_0px_#4c95c6] 2xl:[box-shadow:0px_6px_36px_0px_#4c95c6] rtl:[background:radial-gradient(circle_at_6%_73%,#1874b3d1,transparent)]"
      />
      <motion.div
        initial={
          isFirstIndex
            ? {
                backgroundColor: cardBackgroundColor,
              }
            : {}
        }
        animate={
          isInView
            ? {
                backgroundColor: "transparent",
                // transition: { ease: "easeIn", duration: 0.01, delay: 0.5 },
              }
            : {}
        }
        transition={{ duration: 0.01, delay: 1.6 }}
        onAnimationComplete={() => {
          if (isFirstIndex && isInView) {
            setIsRevealComplete(true);
          }
        }}
        className={cn(
          "relative z-10 flex w-full rounded-3xl rounded-ss-3xl rounded-es-3xl lg:w-auto lg:min-w-[60%] lg:p-2 lg:pe-0",
          {
            "rounded-se-none rounded-ee-none lg:pe-0": isInView,
          },
        )}
      >
        <div className="relative w-full overflow-hidden rounded-2xl lg:flex">
          {/* <div className="h-full w-full bg-black/35 lg:m-auto lg:h-[calc(100%-80px)] lg:w-[calc(100%-48px)]" /> */}
          {/* <div className="relative h-full w-full lg:m-auto lg:h-[calc(100%-80px)] lg:w-[calc(100%-48px)]"> */}
          <div className="relative aspect-video h-full w-full lg:m-auto lg:h-auto lg:w-full">
            {index === 0 ? (
              <Video
                className="absolute inset-0 h-full w-full object-contain"
                poster="/videos/unixsee-team/slide-1/slide-1-poster.webp"
                desktopMp4="/videos/unixsee-team/slide-1/slide-1-wide.mp4"
                desktopWebm="/videos/unixsee-team/slide-1/slide-1-wide.webm"
                mobileMp4="/videos/unixsee-team/slide-1/slide-1-mobile.mp4"
                mobileWebm="/videos/unixsee-team/slide-1/slide-1-mobile.webm"
              />
            ) : (
              <Video
                className="absolute inset-0 h-full w-full object-contain"
                poster="/videos/unixsee-team/slide-2/slide-2-poster.webp"
                desktopMp4="/videos/unixsee-team/slide-2/slide-2-wide.mp4"
                desktopWebm="/videos/unixsee-team/slide-2/slide-2-wide.webm"
                mobileMp4="/videos/unixsee-team/slide-2/slide-2-mobile.mp4"
                mobileWebm="/videos/unixsee-team/slide-2/slide-2-mobile.webm"
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="dark:bg-card bg-primary relative overflow-hidden rounded-se-3xl rounded-ee-3xl lg:py-2 lg:ps-0 lg:pe-2 xl:ps-4 2xl:ps-6"
        initial={
          isFirstIndex
            ? {
                x: isRtl ? "100%" : "-100%",
                backgroundColor: cardBackgroundColor,
              }
            : {
                x: "0",
                backgroundColor: cardBackgroundColor,
              }
        }
        animate={
          isInView
            ? {
                x: "0",
                backgroundColor: "transparent",
              }
            : {}
        }
        transition={{
          x: { ease: "easeIn", duration: 0.3 },
          backgroundColor: { ease: "easeIn", duration: 0.01, delay: 1 },
        }}
      >
        <div
          className={cn(
            "mt-6 h-full justify-between overflow-hidden lg:m-0 lg:flex lg:flex-col lg:p-4",
          )}
        >
          <MotionCardTitle
            variants={slideIn}
            initial={
              isFirstIndex ? SLIDE_IN_VARIANT.initial : SLIDE_IN_VARIANT.animate
            }
            animate={fireAnimate ? SLIDE_IN_VARIANT.animate : {}}
            transition={{ delay: 0.6 }}
            custom={isRtl}
            className="text-primary-foreground dark:text-text-primary text-2xl font-extrabold select-text lg:text-[1.5rem] 2xl:text-[2.5rem] rtl:leading-12 rtl:2xl:leading-16"
          >
            <h3>{title}</h3>
          </MotionCardTitle>
          <MotionCardDescription
            variants={slideIn}
            initial={
              isFirstIndex ? SLIDE_IN_VARIANT.initial : SLIDE_IN_VARIANT.animate
            }
            animate={fireAnimate ? SLIDE_IN_VARIANT.animate : {}}
            transition={{ delay: 0.9 }}
            custom={isRtl}
            className="dark:text-text-primary text-primary-foreground mt-auto font-medium select-text"
          >
            {description}
          </MotionCardDescription>
          <MotionCardDescription
            variants={slideIn}
            initial={
              isFirstIndex ? SLIDE_IN_VARIANT.initial : SLIDE_IN_VARIANT.animate
            }
            animate={fireAnimate ? SLIDE_IN_VARIANT.animate : {}}
            transition={{ delay: 1.2 }}
            custom={isRtl}
            className="dark:text-text-secondary text-muted mt-6 flex flex-wrap items-center gap-1.5 gap-x-1.5 gap-y-1 text-nowrap uppercase select-text lg:text-[0.7rem]"
          >
            {/* {subTitle} */}
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 leading-none"
              >
                <Hash className="size-3" /> {tag}
              </span>
            ))}
          </MotionCardDescription>
        </div>
      </motion.div>
    </motion.div>
  );
}
