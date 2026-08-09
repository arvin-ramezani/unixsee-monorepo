import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import Section from "@/components/common/section";
import TestimonialsCarouselContainer from "./testimonials-carousel-container";

export type TestimonialsSectionType = { id?: string };

export default function TestimonialsSection({ id }: TestimonialsSectionType) {
  const t = useTranslations("HomePage.TestimonialsSection");
  const isRtl = useLocale() === "fa";

  return (
    <Section id={id} className="bg-background relative">
      <ScaleTitle
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        className={cn(
          "max-w-2/3 sm:w-1/2 lg:max-w-155 lg:leading-16 xl:max-w-lg",
          { "leading-14": isRtl },
        )}
      >
        {t("title")}
      </ScaleTitle>

      <TestimonialsCarouselContainer />
    </Section>
  );
}
