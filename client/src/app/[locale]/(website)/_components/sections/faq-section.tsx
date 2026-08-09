import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Section from "@/components/common/section";
import { ScaleTitle } from "@/components/common/motion/scale-title";

const itemKeys = [
  "woocommerceOnly",
  "migration",
  "fixedPlans",
  "onlyInfrastructure",
  "bestFit",
] as const;

export type FaqSectionProps = object;
// & ComponentWithCmsProps<HomeFaqSectionProps>;

export default function FaqSection({}: FaqSectionProps) {
  const t = useTranslations("HomePage.FAQSection");

  return (
    <Section className="min-h-auto">
      <ScaleTitle
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        transformOrigin="center center"
        className="flex justify-center"
      >
        {t(`title`)}
      </ScaleTitle>
      <ScaleTitle
        as={"p"}
        scaleFrom={0.6}
        scaleTo={1}
        transformOrigin="center center"
        className="mt-4 flex justify-center text-center lg:mt-6"
      >
        {t(`description`)}
      </ScaleTitle>

      <Accordion type="multiple" className="mx-auto mt-8 max-w-2xl lg:mt-12">
        {itemKeys.map((item) => (
          <AccordionItem
            key={t(`items.${item}.question` as never)}
            value={t(`items.${item}.question` as never)}
          >
            <AccordionTrigger className="py-4 no-underline! lg:py-8">
              {t(`items.${item}.question` as never)}
            </AccordionTrigger>

            <AccordionContent>
              {t(`items.${item}.answer` as never)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
