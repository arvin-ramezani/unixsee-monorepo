import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { TestimonialKeyType } from "./testimonials-carousel-container";
import useActiveSlide from "./active-slide-context";
import { cn } from "@/lib/utils";
import Image from "next/image";

const MotionCard = motion.create(Card);

export type TestimonialsVideoTextsContainerProps = {
  testimonialKeys: readonly TestimonialKeyType[];

  className?: string;
};

export default function TestimonialsVideoTextsContainer({
  className,
  testimonialKeys,
}: TestimonialsVideoTextsContainerProps) {
  const { activeIndex } = useActiveSlide();
  const activeItem = testimonialKeys[activeIndex];

  const t = useTranslations("HomePage.TestimonialsSection.items");

  return (
    <MotionCard
      key={activeIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "h-full rounded-2xl border-transparent bg-transparent p-0 ring-0",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col items-center justify-between gap-4 border-none">
        <p className="text-text-primary text-center text-base select-text lg:text-lg">
          {t(`${activeItem}.quote`)}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={t(`${activeItem}.authorImage.src`)}
              alt={t(`${activeItem}.authorImage.alt`)}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <h6 className="text-text-primary text-sm font-extrabold select-text sm:text-lg">
              {t(`${activeItem}.author`)}
            </h6>
            <p className="text-text-secondary text-sm select-text">
              {t(`${activeItem}.role`)}
            </p>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}
