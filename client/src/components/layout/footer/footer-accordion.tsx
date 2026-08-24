"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type FooterNavItem = {
  key: string;
  href?: string;
  items?: readonly {
    key: string;
    href: string;
  }[];
};

// type TranslateNavigation = (key: string) => string;

export type FooterAccordionProps = {
  className?: string;
  items: readonly FooterNavItem[];
  translate: (key: string) => string;
};

export default function FooterAccordion({
  items,
  className,
}: FooterAccordionProps) {
  // const tNavigation = useTranslations("Layout.Navigation");
  // const translate: TranslateNavigation = (key) => tNavigation(key as never);

  return (
    <ul className={cn(className)}>
      {items.map((item) => (
        <FooterAccordionItem
          key={item.key}
          itemKey={item.key}
          content={item.items || []}
        />
      ))}
    </ul>
  );
}

type FooterAccordionItemProps = {
  itemKey: string;
  content: FooterNavItem["items"];
};

function FooterAccordionItem({ content, itemKey }: FooterAccordionItemProps) {
  const pathname = usePathname();
  const tNavigation = useTranslations("Layout.Navigation");

  const isHomePage = itemKey === "home" && pathname === "/";

  if (isHomePage) return null;

  if (!content?.length) return <li>{tNavigation(itemKey as never)}</li>;

  return (
    <Accordion
      asChild
      type="multiple"
      className="w-full border-b py-1 lg:max-w-lg"
    >
      <li>
        {
          <AccordionItem value={itemKey}>
            <AccordionTrigger>
              {tNavigation(`${itemKey}.label` as never)}
            </AccordionTrigger>
            <AccordionContent className="text-text-secondary flex flex-col gap-1">
              {content.map((link) => (
                <Link
                  className="block no-underline!"
                  key={link.key}
                  href={link.href}
                >
                  {tNavigation(`${itemKey}.items.${link.key}` as never)}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        }
      </li>
    </Accordion>
  );
}
