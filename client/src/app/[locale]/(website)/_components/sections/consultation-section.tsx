import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import ConsultationTabsSection from "../others/consultation-tabs-section";
import { cn } from "@/lib/utils";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const itemKeys = [
  "woocommerceOnly",
  "managedServer",
  "migration",
  "fixedPlans",
  "complementaryServices",
  "bestFit",
] as const;

export type ConsultationSectionType = { id?: string };

export default function ConsultationSection({ id }: ConsultationSectionType) {
  const t = useTranslations("HomePage");

  return (
    <div className="bg-background relative z-10">
      <div id={id} className="flex flex-col gap-8 2xl:flex-row">
        <Section className="min-h-auto bg-transparent">
          <ScaleTitle
            as={"h2"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            className="flex justify-center"
          >
            {t(`FAQSection.title`)}
          </ScaleTitle>
          <ScaleTitle
            as={"p"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            className="mt-4 flex justify-center text-center lg:mt-6"
          >
            {t(`FAQSection.description`)}
          </ScaleTitle>

          <Accordion
            type="multiple"
            className="mx-auto mt-8 max-w-2xl lg:mt-12 2xl:mx-0"
          >
            {itemKeys.map((item) => (
              <AccordionItem
                key={t(`FAQSection.items.${item}.question` as never)}
                value={t(`FAQSection.items.${item}.question` as never)}
              >
                <AccordionTrigger className="py-4 no-underline! lg:py-8">
                  {t(`FAQSection.items.${item}.question` as never)}
                </AccordionTrigger>

                <AccordionContent>
                  {t(`FAQSection.items.${item}.answer` as never)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

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
