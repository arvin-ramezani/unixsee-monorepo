import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Text from "../common/text";

const ITEM_KEYS = ["item1", "item2", "item3", "item4"] as const;

export type PerformanceAccordionProps = {
  className?: string;
};

export default function PerformanceAccordion({
  className,
}: PerformanceAccordionProps) {
  const t = useTranslations(`ManagedServerPage.PerformanceSection`);

  return (
    <Accordion
      // collapsible
      type="single"
      defaultValue={t(`items.${ITEM_KEYS[0]}.title`)}
      className={cn("", className)}
    >
      {ITEM_KEYS.map((item) => (
        <AccordionItem
          key={t(`items.${item}.title`)}
          value={t(`items.${item}.title`)}
        >
          <AccordionTrigger
            indicator="plus-minus"
            className="gap-4 py-4 no-underline! lg:py-8"
          >
            <Image
              src={t(`items.${item}.icon`)}
              alt={t(`items.${item}.title`)}
              width={24}
              height={24}
            />
            <span>{t(`items.${item}.title`)}</span>
          </AccordionTrigger>

          <AccordionContent>
            <Text>{t(`items.${item}.description`)}</Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
