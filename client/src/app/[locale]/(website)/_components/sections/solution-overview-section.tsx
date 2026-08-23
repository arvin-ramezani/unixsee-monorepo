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
        className="lg:leading-16 xl:max-w-lg"
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        dangerouslySetInnerHTML={{ __html: t.raw("title") }}
      />

      <ScaleTitle
        as={"p"}
        scaleFrom={0.6}
        scaleTo={1}
        className="mt-4 lg:mt-6"
        dangerouslySetInnerHTML={{ __html: t.raw("description") }}
      />

      <StickyCards items={items} />
    </Section>
  );
}
