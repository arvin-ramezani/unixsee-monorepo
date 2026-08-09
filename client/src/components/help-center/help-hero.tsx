import { getTranslations } from "next-intl/server";

import { HelpSearch } from "@/components/help-center/help-search";
import type {
  HelpSearchTopicItem,
  HelpSearchArticleItem,
} from "@/components/help-center/help-search";
import {
  helpSearchTopics,
  helpSearchArticles,
} from "@/lib/data/help-center/help-search-data";
import { helpTopics } from "@/lib/data/help-center/help-center-data";
import type { HelpTopicKey } from "@/lib/data/help-center/help-center-data";

interface HelpHeroProps {
  topicTitle?: string;
}

export async function HelpHero({ topicTitle }: HelpHeroProps) {
  const tTopics = await getTranslations("HelpCenter.topics");
  const tAllTopics = await getTranslations("HelpCenter.allTopics");

  // TODO: Fetch topics from Help Center API
  const resolvedTopics: HelpSearchTopicItem[] = helpSearchTopics.map((src) => ({
    id: src.id,
    title: tTopics(`items.${src.key}.title`),
    summary: tAllTopics(`items.${src.key}.summary`),
    href: src.href,
  }));

  // Resolve article titles per topic.
  // TODO: Fetch article search results from backend
  type TopicTranslator = ReturnType<typeof tTopics>;
  const topicTMap: Partial<Record<HelpTopicKey, TopicTranslator>> = {};
  await Promise.all(
    helpTopics.map(async (topic) => {
      const tTopic = await getTranslations(
        `HelpCenter.topicPages.${topic.key}` as `HelpCenter.topicPages.${HelpTopicKey}`,
      );
      topicTMap[topic.key] = tTopic as unknown as TopicTranslator;
    }),
  );

  const resolvedArticles: HelpSearchArticleItem[] = helpSearchArticles.map(
    (src) => ({
      id: src.id,
      title: (topicTMap[src.topicKey] as unknown as (key: string) => string)(
        `articles.${src.articleKey}.title`,
      ),
      topicTitle: tTopics(`items.${src.topicKey}.title`),
      href: src.href,
    }),
  );

  return (
    <HelpSearch
      topics={resolvedTopics}
      articles={resolvedArticles}
      topicContext={topicTitle}
    />
  );
}
