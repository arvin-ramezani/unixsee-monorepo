import { getTranslations } from "next-intl/server";

import { HelpCenterIntro } from "@/components/help-center/help-center-intro";
import { HelpHero } from "@/components/help-center/help-hero";

interface HelpCenterHeroProps {
  title?: string;
  description?: string;
}

/**
 * The global Help Center hero. On the home page renders generic intro copy;
 * on topic pages receives topic-specific title/description so the hero
 * communicates context without duplicating content below.
 */
export async function HelpCenterHero({ title, description }: HelpCenterHeroProps = {}) {
  const t = await getTranslations("HelpCenter.intro");
  return (
    <HelpCenterIntro
      eyebrow={t("eyebrow")}
      title={title ?? t("title")}
      description={description ?? t("description")}
      search={<HelpHero />}
    />
  );
}
