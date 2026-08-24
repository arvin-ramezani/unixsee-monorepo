import { useTranslations } from "next-intl";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProblemSectionCard } from "./problem-section-card";
import { MobileProblemSectionCard } from "./mobile-problem-section-card";

const itemKeys = [
  { key: "genericSupport" },
  { key: "infrastructureMismatch" },
  // { key: "noMonitoring" },
] as const;

export type ProblemSectionCarouselType = object;

export default function ProblemSectionCarousel({}: ProblemSectionCarouselType) {
  const t = useTranslations("HomePage.ProblemSection");

  return (
    <Carousel
      className="mt-8 overflow-visible lg:mt-16"
      opts={{
        duration: 50,
        watchDrag: (_emblaApi, event) => {
          const target = event.target as HTMLElement | null;

          return Boolean(target?.closest("[data-scroll-drag-area]"));
        },
      }}
    >
      <div className="hidden justify-end gap-4 lg:flex">
        <CarouselNext
          className="inset-s-auto inset-e-0 size-16 border-[1.9px] p-4! lg:-top-18 2xl:-top-20 rtl:lg:inset-e-28 rtl:2xl:inset-e-38"
          iconClassName="size-12 stroke-[1.2px]!"
        />
        <CarouselPrevious
          iconClassName="size-12 stroke-[1.2px]!"
          className="inset-s-auto inset-e-22 size-16 border-[1.9px] p-4! lg:-top-18 2xl:-top-20 rtl:lg:inset-e-8 rtl:2xl:inset-e-16"
        />
      </div>

      <CarouselContent className="rounded-3xl!" wrapperClassName="rounded-3xl">
        {itemKeys?.map((item, index) => (
          <CarouselItem
            key={item.key}
            className="rounded-3xl lg:p-6 lg:px-8 2xl:p-16"
          >
            <ProblemSectionCard
              videoIndex={index + 2}
              title={t(`items.${item.key}.title`)}
              description={t(`items.${item.key}.description`)}
              subTitle={t(`items.${item.key}.subTitle`)}
              tags={t.raw(`items.${item.key}.tags`)}
              metric={t(`items.${item.key}.metric`)}
              metricLabel={t(`items.${item.key}.metricLabel`)}
              isFirstIndex={index === 0}
            />
            <MobileProblemSectionCard
              videoIndex={index + 2}
              title={t(`items.${item.key}.title`)}
              description={t(`items.${item.key}.description`)}
              tags={t.raw(`items.${item.key}.tags`)}
              isFirstIndex={index === 0}
              // subTitle={t(`items.${item.key}.subTitle`)}
              // metric={t(`items.${item.key}.metric`)}
              // metricLabel={t(`items.${item.key}.metricLabel`)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-8 flex justify-end gap-4 lg:hidden rtl:flex-row-reverse rtl:justify-start">
        <CarouselPrevious
          className="relative size-12 p-0!"
          iconClassName="size-6"
        />
        <CarouselNext
          className="relative size-12 p-0!"
          iconClassName="size-6"
        />
      </div>
    </Carousel>
  );
}
