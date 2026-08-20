import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Section from "@/components/common/section";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import Image from "next/image";

const itemKeys = [
  "woocommerceOnly",
  "managedServer",
  "migration",
  "fixedPlans",
  "complementaryServices",
  "bestFit",
] as const;

export type FaqSectionProps = { id?: string };
// & ComponentWithCmsProps<HomeFaqSectionProps>;

export default function FaqSection({ id }: FaqSectionProps) {
  const t = useTranslations("HomePage.FAQSection");

  return (
    <Section className="min-h-auto" id={id}>
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

      <div className="w-full items-center justify-between gap-16 2xl:flex">
        <Accordion
          type="multiple"
          className="mx-auto mt-8 max-w-2xl lg:mt-12 2xl:mx-0"
        >
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

        <div className="relative aspect-1448/1086 w-full">
          <Image
            src="/images/faq/faq-section.png"
            alt="FAQ Section Image"
            fill
            className="object-cover rtl:hidden"
          />
          <Image
            src="/images/faq/faq-section-rtl.png"
            alt="FAQ Section Image"
            fill
            className="hidden object-cover rtl:block"
          />
        </div>
      </div>
    </Section>
  );
}
