import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProcessSectionCard from "./process-section-card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const ITEM_KEYS = ["step1", "step2", "step3", "step4"] as const;

export type ProcessSectionCarouselType = {
  className?: string;
};

export default function ProcessSectionCarousel({
  className,
}: ProcessSectionCarouselType) {
  const t = useTranslations("HomePage.ProcessSection");
  return (
    <Carousel
      className={cn(className)}
      opts={{
        duration: 50,
      }}
    >
      <CarouselContent wrapperClassName="rounded-4xl">
        {ITEM_KEYS.map((item) => (
          <CarouselItem key={item} className="select-none">
            <ProcessSectionCard
              title={t(`items.${item}.title`)}
              description={t(`items.${item}.description`)}
              duration={t(`items.${item}.duration`)}
              step={t(`items.${item}.number`)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-16 flex justify-end gap-4 rtl:flex-row-reverse rtl:justify-start">
        <CarouselPrevious
          iconClassName="size-12 dark:text-primary"
          className="relative size-12 p-3 lg:size-16 lg:p-4!"
        />
        <CarouselNext
          iconClassName="size-12"
          className="relative size-12 p-3 lg:size-16 lg:p-4!"
        />
      </div>
    </Carousel>
  );
}
