import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import ProcessSectionCarousel from "../others/process-section-carousel";
import { ScaleTitle } from "@/components/common/motion/scale-title";

export type ProcessSectionType = { id?: string };

export default function ProcessSection({ id }: ProcessSectionType) {
  const t = useTranslations("HomePage.ProcessSection");

  return (
    <Section containerClassName="lg:pt-30 lg:pb-14 2xl:pb-8" id={id}>
      <ScaleTitle
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        className="mb-4 max-w-2/3 sm:w-1/2 lg:mb-12 lg:max-w-155 lg:leading-16 xl:max-w-lg"
      >
        {t("title")}
      </ScaleTitle>

      <ProcessSectionCarousel className="mt-12 lg:mt-12" />
    </Section>
  );
}
