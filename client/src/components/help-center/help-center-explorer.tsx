import { getTranslations } from "next-intl/server";

import {
  HelpPopularGuides,
  type GuideRow,
} from "@/components/help-center/help-popular-guides";
import {
  HelpTopicGrid,
  type TopicCard,
} from "@/components/help-center/help-topic-grid";

interface HelpCenterExplorerProps {
  topics: TopicCard[];
  guides: GuideRow[];
}

/**
 * Static Help Center content regions: browse-by-topic grid and popular guides.
 * Search is no longer an in-place filter — it lives in the featured HelpHero
 * search which opens a suggestion dropdown and navigates to topics/articles.
 */
export async function HelpCenterExplorer({
  topics,
  guides,
}: HelpCenterExplorerProps) {
  const t = await getTranslations("HelpCenter");

  return (
    <div className="space-y-11 md:space-y-12">
      {/* Browse by topic */}
      <section aria-labelledby="help-topics-heading" className="scroll-mt-24">
        <h2
          id="help-topics-heading"
          className="mb-5 text-start text-2xl font-bold"
          dir="auto"
        >
          {t("topics.sectionTitle")}
        </h2>
        <HelpTopicGrid topics={topics} />
      </section>

      {/* Popular guides */}
      <section aria-labelledby="help-guides-heading">
        <h2 id="help-guides-heading" className="mb-5 text-start text-2xl font-bold" dir="auto">
          {t("guides.sectionTitle")}
        </h2>
        <HelpPopularGuides guides={guides} />
      </section>
    </div>
  );
}
