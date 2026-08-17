import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import ConsultationTabsSection from "../others/consultation-tabs-section";
import { cn } from "@/lib/utils";
import { ScaleTitle } from "@/components/common/motion/scale-title";

export type ConsultationSectionType = { id?: string };

export default function ConsultationSection({ id }: ConsultationSectionType) {
  const t = useTranslations("HomePage");

  return (
    <div className="bg-background relative z-10">
      <div id={id} className="flex flex-col gap-8 2xl:flex-row">
        <Section
          className="relative bg-transparent"
          containerClassName="flex flex-col items-center"
        >
          <ScaleTitle
            className={cn("max-w-155 text-center text-3xl!")}
            as={"h2"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
          >
            {t("ConsultationSection.title")}
          </ScaleTitle>

          <ScaleTitle
            as={"p"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            className="mt-4 flex justify-center text-center lg:mt-4"
          >
            {t(`ConsultationSection.description`)}
          </ScaleTitle>

          <ConsultationTabsSection className="2xl:mt-22" />
        </Section>
      </div>
    </div>
  );
}
