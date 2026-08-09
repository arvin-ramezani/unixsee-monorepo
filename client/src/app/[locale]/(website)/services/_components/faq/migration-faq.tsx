import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Text from "../common/text";

const ITEM_KEYS = [
  "item1",
  "item2",
  "item3",
  "item4",
  "item5",
  "item6",
  "item7",
  "item8",
  "item9",
  "item10",
  "item11",
  "item12",
] as const;

export type MigrationFaqProps = {
  className?: string;
};

export default function MigrationFaq({ className }: MigrationFaqProps) {
  const t = useTranslations(`MigrationPage.FAQSection`);

  return (
    <Accordion type="multiple" className={cn(className)}>
      {ITEM_KEYS.map((item) => (
        <AccordionItem
          key={t(`items.${item}.title`)}
          value={t(`items.${item}.title`)}
        >
          <AccordionTrigger
            indicator="plus-minus"
            className="gap-4 py-4 no-underline! lg:py-8 rtl:leading-[1.8]"
          >
            {t(`items.${item}.title`)}
          </AccordionTrigger>

          <AccordionContent>
            <Text>{t(`items.${item}.description`)}</Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
