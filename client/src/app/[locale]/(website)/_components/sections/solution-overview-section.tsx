import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import { StickyScrollCards } from "../others/sticky-scroll-cards";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import StickyCards from "../others/sticky-cards";

const ITEM_KEYS = [
  "continuousMonitoring",
  "storeAwareSupport",
  "operationalStability",
  "optimizedInfrastructure",
] as const;

export type SolutionOverviewSectionType = { id?: string };

export default function SolutionOverviewSection({
  id,
}: SolutionOverviewSectionType) {
  const t = useTranslations("HomePage.SolutionOverviewSection");

  const items = ITEM_KEYS.map((itemKey) => {
    const itemTitle = t(`items.${itemKey}.title`);
    const itemDescription = t(`items.${itemKey}.description`);
    const itemTagKeys = ["tag1", "tag2", "tag3", "tag4"] as const;
    const tags = itemTagKeys.map((tagKey) =>
      t(`items.${itemKey}.tags.${tagKey}`),
    );

    return {
      title: itemTitle,
      description: itemDescription,
      tags: tags,
      cta: {
        label: t(`items.${itemKey}.cta.label`),
        href: t(`items.${itemKey}.cta.href`),
      },
    };
  });

  return (
    <Section id={id} className="z-0">
      <ScaleTitle
        className="max-w-2/3 sm:w-1/2 lg:max-w-155 lg:leading-16 xl:max-w-lg"
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
      >
        {t("title")}
      </ScaleTitle>

      <ScaleTitle
        as={"p"}
        scaleFrom={0.6}
        scaleTo={1}
        className="mt-4 max-w-4/5 sm:max-w-2/3 lg:mt-6 lg:max-w-155 xl:max-w-2xl"
      >
        {t("description")}
      </ScaleTitle>

      <StickyCards items={items} />
    </Section>
  );
}
