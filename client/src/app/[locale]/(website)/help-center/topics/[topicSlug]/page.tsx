import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HelpAllTopics } from "@/components/help-center/help-all-topics";
import { HelpAllTopicsSheet } from "@/components/help-center/help-all-topics-sheet";
import { HelpCenterHero } from "@/components/help-center/help-center-hero";
import { HelpTopicArticles } from "@/components/help-center/help-topic-articles";
import { HelpTopicBreadcrumb } from "@/components/help-center/help-topic-breadcrumb";
import type { AllTopicsEntry } from "@/components/help-center/help-all-topics";
import type {
  ArticleGroupRow,
  ArticleRow,
} from "@/components/help-center/help-topic-articles";
import type { Locale } from "@/i18n/routing";
import {
  getHelpArticleDescriptionKey,
  getHelpArticleGroupKey,
  getHelpArticleTitleKey,
  getTopicBySlug,
  getCanonicalArticleSlug,
  helpTopicContent,
  helpTopics,
  type HelpArticle,
} from "@/lib/data/help-center/help-center-data";

interface Params {
  locale: Locale;
  topicSlug: string;
}

export function generateStaticParams() {
  return helpTopics.flatMap((topic) => [
    { locale: "fa", topicSlug: topic.id },
    { locale: "en", topicSlug: topic.id },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, topicSlug } = await params;

  setRequestLocale(locale);
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return {};

  const t = await getTranslations("Metadata.helpCenterTopic");
  const tTopics = await getTranslations("HelpCenter.topics");
  const topicTitle = tTopics(`items.${topic.key}.title`);

  return {
    title: t("title", { topic: topicTitle }),
    description: t("description", { topic: topicTitle }),
  };
}

export default async function HelpCenterTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, topicSlug } = await params;
  setRequestLocale(locale);

  const topic = getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const content = helpTopicContent[topic.key];

  const t = await getTranslations("HelpCenter");
  const tPage = await getTranslations("HelpCenter.topicPage");
  const tTopicData = await getTranslations(
    `HelpCenter.topicPages.${topic.key}`,
  );
  const tTopics = await getTranslations("HelpCenter.topics");

  const ordinalFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-u-nu-arabext" : "en",
  );
  const ordinalIsolate = locale === "fa" ? "⁧" : "⁦";
  const ordinal = (order: number) =>
    `${ordinalIsolate}${ordinalFormatter.format(order)}.⁩`;

  const topicTitle = tTopics(`items.${topic.key}.title`);

  const allTopics: AllTopicsEntry[] = helpTopics.map((tp) => ({
    id: tp.id,
    label: `${ordinal(tp.order)} ${tTopics(`items.${tp.key}.title`)}`,
    href: `/help-center/topics/${tp.id}`,
  }));

  function buildArticleRow(article: HelpArticle): ArticleRow {
    const slug = getCanonicalArticleSlug(topic!.id, article.key) ?? article.id;
    return {
      id: article.id,
      type: article.type,
      title: tTopicData(getHelpArticleTitleKey(article.key)),
      description: tTopicData(getHelpArticleDescriptionKey(article.key)),
      typeLabel: tPage(`articleType.${article.type}`),
      href: `/help-center/topics/${topic!.id}/${slug}`,
    };
  }

  const startHereRows: ArticleRow[] | undefined =
    content.startHere?.map(buildArticleRow);

  const groupRows: ArticleGroupRow[] = content.groups.map((group) => ({
    id: group.id,
    heading: tTopicData(getHelpArticleGroupKey(group.key)),
    articles: group.articles.map(buildArticleRow),
  }));

  return (
    <div className="w-full pt-8 pb-16 md:pt-10">
      <HelpTopicBreadcrumb
        homeLabel={tPage("recovery.allTopics")}
        homeHref="/help-center"
        topicTitle={topicTitle}
        className="container-lg mb-6"
      />

      {/* Help Center hero — topic-specific title and description */}
      <HelpCenterHero title={topicTitle} description={tTopicData("scope")} />

      {/* Mobile/tablet: topic list in a bottom sheet */}
      <div className="sticky top-17 z-10 mt-8 mb-6 lg:hidden">
        <HelpAllTopicsSheet
          topics={allTopics}
          currentId={topic.id}
          triggerLabel={tPage("mobileNav.label")}
          title={tPage("mobileNav.current", { topic: topicTitle })}
          className="bg-background w-full"
        />
      </div>

      {/* Two-column grid: main content + sticky All Topics sidebar */}
      <div className="container-lg mt-20 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <main>
          <HelpTopicArticles
            startHere={startHereRows}
            startHereLabel={tPage("startHere")}
            groups={groupRows}
            recoveryAllTopicsLabel={tPage("recovery.allTopics")}
            recoveryAllTopicsHref="/help-center"
            recoverySearchLabel={tPage("recovery.search")}
            recoverySearchHref="/help-center"
          />
        </main>

        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <h2 className="mb-4 text-start text-lg font-bold" dir="auto">
              {t("allTopics.sectionTitle")}
            </h2>

            <HelpAllTopics topics={allTopics} currentId={topic.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
