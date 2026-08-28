"use client";

import { motion, useInView } from "framer-motion";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slideIn } from "@/lib/variants";
import { SLIDE_IN_VARIANT } from "@/constants/variants";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Hash } from "lucide-react";
import { Video } from "@/components/ui/video";

const MotionBadge = motion.create(Badge);
const MotionCardTitle = motion.create(CardTitle);
const MotionCardDescription = motion.create(CardDescription);

type MobileProblemSectionCardProps = {
  index: number;
  title: string;
  description?: string;
  subTitle?: string;
  tags: string[];
  metric?: string;
  metricLabel?: string;
  isFirstIndex?: boolean;
};

export function MobileProblemSectionCard({
  index,
  title,
  description,
  subTitle,
  tags,
  metric,
  metricLabel,
  isFirstIndex,
}: MobileProblemSectionCardProps) {
  const isRtl = useLocale() === "fa";
  const targetRef = useRef<HTMLDivElement>(null);
  // const [fireAnimate, setFireAnimate] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // const isDesktop = useIsDesktop();

  const isInView = useInView(targetRef, {
    once: true,
    margin: "0px 0px -38% 0px",
  });

  const fireAnimate = isFirstIndex && isInView;

  return (
    <div
      data-scroll-drag-area
      ref={targetRef}
      className="mx-auto w-full rounded-ss-3xl rounded-se-3xl pt-0 select-none lg:hidden lg:max-w-none lg:flex-row"
    >
      <div
        className={cn(
          "relative z-10 flex aspect-video w-full rounded-3xl rounded-ss-3xl rounded-se-3xl rounded-es-3xl bg-[#ebebeb] lg:aspect-690/520 lg:w-auto lg:min-w-[60%] lg:pe-0",
          {
            "rounded-ee-none rounded-es-none lg:rounded-se-none lg:rounded-ee-none lg:rounded-es-3xl lg:pe-0":
              isInView,
          },
        )}
      >
        <div className="bg-primary relative w-full rounded-2xl rounded-ee-none rounded-es-none lg:flex dark:bg-white">
          <div className="relative aspect-video h-auto w-full bg-black/35 lg:m-auto lg:h-[calc(100%-80px)] lg:w-[calc(100%-48px)]">
            {index === 0 ? (
              <Video
                className="absolute inset-0 h-full w-full object-contain"
                poster="/videos/unixsee-team/slide-1/slide-1-poster.webp"
                desktopMp4="/videos/unixsee-team/slide-1/slide-1-wide.mp4"
                desktopWebm="/videos/unixsee-team/slide-1/slide-1-wide.webm"
                mobileMp4="/videos/unixsee-team/slide-1/slide-1-wide.mp4"
                mobileWebm="/videos/unixsee-team/slide-1/slide-1-wide.webm"
              />
            ) : (
              <Video
                className="absolute inset-0 h-full w-full object-contain"
                poster="/videos/unixsee-team/slide-2/slide-2-poster.webp"
                desktopMp4="/videos/unixsee-team/slide-2/slide-2-wide.mp4"
                desktopWebm="/videos/unixsee-team/slide-2/slide-2-wide.webm"
                mobileMp4="/videos/unixsee-team/slide-2/slide-2-wide.mp4"
                mobileWebm="/videos/unixsee-team/slide-2/slide-2-wide.webm"
              />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex w-full items-end justify-between rounded-2xl rounded-ee-none rounded-es-none bg-[linear-gradient(0deg,hsl(0_0%_100%/0.06)_0%,hsl(0_0%_100%/0)_100%)] p-8 lg:gap-8 dark:bg-[linear-gradient(0deg,oklch(0.26_0.04_254.5/0.75)_0%,oklch(0.26_0.04_254.5/0)_100%)]">
            <div className="dark:text-text-primary text-white">
              <p className="text-5xl">{metric}</p>
              <p className="mt-1 text-nowrap lg:mt-2 lg:text-2xl">
                {metricLabel}
              </p>
            </div>
            <div className="h-px w-[40%] bg-white lg:w-full" />
          </div>
        </div>
      </div>

      <motion.div
        className={cn(
          "bg-primary text-background overflow-hidden rounded-se-none rounded-ee-3xl rounded-es-3xl p-5 lg:rounded-se-3xl lg:rounded-es-none lg:p-0 lg:py-2 lg:ps-6 lg:pe-2",
        )}
        initial={
          isFirstIndex
            ? {
                y: "-100%",
              }
            : { y: 0 }
        }
        animate={
          isInView && isDesktop
            ? { x: "0" }
            : isInView && !isDesktop
              ? {
                  y: "0",
                }
              : {}
        }
        transition={{ ease: "easeIn", duration: 0.3 }}
      >
        <div className={cn("mt-2 h-full overflow-hidden lg:flex lg:flex-col")}>
          <MotionCardTitle
            variants={slideIn}
            initial={
              isFirstIndex ? SLIDE_IN_VARIANT.initial : SLIDE_IN_VARIANT.animate
            }
            animate={fireAnimate ? SLIDE_IN_VARIANT.animate : {}}
            transition={{ delay: 0.6 }}
            custom={isRtl}
            className="dark:text-text-primary mb-1 text-2xl font-extrabold lg:text-[2.5rem]"
          >
            {title}
          </MotionCardTitle>

          <MotionCardDescription
            variants={slideIn}
            initial={
              isFirstIndex ? SLIDE_IN_VARIANT.initial : SLIDE_IN_VARIANT.animate
            }
            animate={fireAnimate ? SLIDE_IN_VARIANT.animate : {}}
            transition={{ delay: 0.9 }}
            custom={isRtl}
            className="text-primary-foreground mt-4 rtl:font-light"
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
            className="dark:text-text-secondary text-muted mt-4 flex flex-wrap gap-x-2 gap-y-1.5 text-[.6rem] leading-2.5 font-light text-nowrap uppercase lg:mt-auto"
          >
            {/* {subTitle} */}
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-0.5">
                <Hash className="size-3" />{" "}
                <span className="ltr:mt-1">{tag}</span>
              </span>
            ))}
          </MotionCardDescription>
        </div>
      </motion.div>
    </div>
  );
}
