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

const faqItemKeys = [
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
        <Section
          className="relative bg-transparent"
          containerClassName="flex flex-col items-center"
        >
          <ScaleTitle
            className={cn("text-center")}
            as={"h2"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            dangerouslySetInnerHTML={{
              __html: t.raw("ConsultationSection.title"),
            }}
          />
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

        <Section className="min-h-auto">
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

          <div className="w-full items-center justify-between gap-16 2xl:flex">
            <Accordion
              type="multiple"
              className="mx-auto mt-8 max-w-2xl lg:mt-24 2xl:mx-0"
            >
              {faqItemKeys.map((item) => (
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
          </div>
        </Section>
      </div>
    </div>
  );
}
