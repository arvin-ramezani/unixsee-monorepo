import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HelpAllTopicsSheet } from "@/components/help-center/help-all-topics-sheet";
import { TopicHeadingFocus } from "@/components/help-center/topic-heading-focus";
import { HelpArticleBreadcrumb } from "@/components/help-center/help-article-breadcrumb";
import { HelpArticleHero } from "@/components/help-center/help-article-hero";
import { HelpArticleBlocks } from "@/components/help-center/help-article-blocks";
import { HelpArticleTocMobile } from "@/components/help-center/help-article-toc";
import { HelpArticleRail } from "@/components/help-center/help-article-rail";
import { HelpArticleRelated } from "@/components/help-center/help-article-related";
import { HelpArticleRecovery } from "@/components/help-center/help-article-recovery";
import type { RelatedArticleRow } from "@/components/help-center/help-article-related";

import type { Locale } from "@/i18n/routing";
import { getFormats } from "@/i18n/formats";
import {
  helpTopics,
  getHelpArticleDescriptionKey,
  getHelpArticleTitleKey,
  getArticleBySlug,
  getRelatedArticles,
  helpArticleIndex,
} from "@/lib/data/help-center/help-center-data";
import {
  defaultHelpArticleUpdatedAt,
  getArticleBody,
  getArticleBodyMessageKey,
  getArticleMeta,
  type ArticleBlock,
  type ArticleBodyTextKey,
} from "@/lib/data/help-center/article-content";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Params {
  locale: Locale;
  topicSlug: string;
  articleSlug: string;
}

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return helpArticleIndex.flatMap((loc) => [
    { locale: "fa", topicSlug: loc.topic.id, articleSlug: loc.slug },
    { locale: "en", topicSlug: loc.topic.id, articleSlug: loc.slug },
  ]);
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, topicSlug, articleSlug } = await params;
  setRequestLocale(locale);

  const loc = getArticleBySlug(topicSlug, articleSlug);
  if (!loc) return {};

  const tMeta = await getTranslations("Metadata.helpCenterArticle");
  const tTopics = await getTranslations("HelpCenter.topics");
  const tTopicData = await getTranslations(
    `HelpCenter.topicPages.${loc.topic.key}`,
  );

  const articleTitle = tTopicData(getHelpArticleTitleKey(loc.article.key));
  const topicTitle = tTopics(`items.${loc.topic.key}.title`);

  return {
    title: tMeta("title", { article: articleTitle }),
    description: tMeta("description", {
      article: articleTitle,
      topic: topicTitle,
    }),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HelpCenterArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, topicSlug, articleSlug } = await params;
  setRequestLocale(locale);

  // Resolve the article; 404 if the slug pair is invalid.
  const articleLoc = getArticleBySlug(topicSlug, articleSlug);
  if (!articleLoc) notFound();

  const { topic, article } = articleLoc;

  // ── Translations ──────────────────────────────────────────────────────────
  const t = await getTranslations("HelpCenter");
  const tPage = await getTranslations("HelpCenter.topicPage");
  const tArticlePage = await getTranslations("HelpCenter.articlePage");
  const tTopics = await getTranslations("HelpCenter.topics");
  const tTopicData = await getTranslations(
    `HelpCenter.topicPages.${topic.key}`,
  );

  // ── Article body & metadata ───────────────────────────────────────────────
  const body = getArticleBody(topic.key, article.key);
  const meta = getArticleMeta(topic.key, article.key);

  // Resolve body text keys only when an authored body exists.
  const resolveText: ((key: ArticleBodyTextKey) => string) | undefined = body
    ? (key) => t(getArticleBodyMessageKey(topic.key, article.key, key))
    : undefined;

  // ── Derived strings ───────────────────────────────────────────────────────
  const topicTitle = tTopics(`items.${topic.key}.title`);
  const topicHref = `/dashboard/help-center/topics/${topic.id}`;
  const articleTitle = tTopicData(getHelpArticleTitleKey(article.key));
  const articleSummary = tTopicData(getHelpArticleDescriptionKey(article.key));
  const typeLabel = tPage(`articleType.${article.type}`);
  const dateFormatter = new Intl.DateTimeFormat(
    locale,
    getFormats(locale).dateTime!.shortDate,
  );

  // Reading time and last-reviewed (shown only when governed — spec §5).
  let readingTime: string | undefined;
  if (meta?.readingMinutes) {
    readingTime = tArticlePage("readingTime", {
      minutes: meta.readingMinutes,
    });
  }
  let lastReviewed: string | undefined;
  if (meta?.reviewedAt) {
    lastReviewed = tArticlePage("lastReviewed", {
      date: dateFormatter.format(new Date(meta.reviewedAt)),
    });
  }

  // ── TOC items (headings from the authored body) ───────────────────────────
  const tocItems =
    body && resolveText
      ? body
          .filter(
            (b): b is Extract<ArticleBlock, { kind: "heading" }> =>
              b.kind === "heading",
          )
          .map((b) => ({ id: b.id, label: resolveText!(b.textKey) }))
      : [];

  // ── Notice labels ─────────────────────────────────────────────────────────
  const noticeLabels = {
    beforeYouBegin: tArticlePage("notices.beforeYouBegin"),
    tip: tArticlePage("notices.tip"),
    important: tArticlePage("notices.important"),
    warning: tArticlePage("notices.warning"),
  } as const;

  // ── All topics (for mobile sheet / desktop sidebar) ───────────────────────
  const ordinalFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-u-nu-arabext" : "en",
  );
  const ordinalIsolate = locale === "fa" ? "\u2067" : "\u2066";
  const ordinal = (order: number) =>
    `${ordinalIsolate}${ordinalFormatter.format(order)}.\u2069`;

  const allTopics = helpTopics.map((tp) => ({
    id: tp.id,
    label: `${ordinal(tp.order)} ${tTopics(`items.${tp.key}.title`)}`,
    href: `/dashboard/help-center/topics/${tp.id}`,
  }));

  // ── Related articles (same topic, ≤ 3, excl. current) ────────────────────
  const relatedRows: RelatedArticleRow[] = getRelatedArticles(
    articleLoc,
    3,
  ).map((loc) => ({
    id: loc.slug,
    type: loc.article.type,
    title: tTopicData(getHelpArticleTitleKey(loc.article.key)),
    description: tTopicData(getHelpArticleDescriptionKey(loc.article.key)),
    category: tTopics(`items.${loc.topic.key}.title`),
    updated: t("guides.updated", {
      date: dateFormatter.format(
        new Date(
          getArticleMeta(loc.topic.key, loc.article.key)?.reviewedAt ??
            defaultHelpArticleUpdatedAt,
        ),
      ),
    }),
    href: `/dashboard/help-center/topics/${loc.topic.id}/${loc.slug}`,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="container-lg">
      {/* Focus management: moves keyboard focus to the article heading on
          in-app navigation, skipping the initial direct-URL load. */}
      <TopicHeadingFocus />

      <div className="w-full pt-8 pb-16 md:pt-10">
        {/* Mobile/tablet: topic list in a bottom sheet (spec §7). */}
        <div className="sticky top-17 z-10 mb-6 lg:hidden">
          <HelpAllTopicsSheet
            topics={allTopics}
            currentId={topic.id}
            triggerLabel={tPage("mobileNav.label")}
            title={tPage("mobileNav.current", { topic: topicTitle })}
            className="bg-background w-full"
          />
        </div>

        {/* Two-column grid: main article + contextual right rail (spec §6). */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
          {/* ── Main article column ─────────────────────────────────────── */}
          <main>
            {/* Breadcrumb (spec §5) */}
            <HelpArticleBreadcrumb
              homeLabel={tArticlePage("notFound.home")}
              homeHref="/dashboard/help-center"
              topicLabel={topicTitle}
              topicHref={topicHref}
              articleTitle={articleTitle}
              className="mb-6"
            />

            {/* Back to topic */}
            <Link
              href={topicHref}
              className="group focus-visible:ring-ring mb-2 flex w-fit items-center gap-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform ltr:-scale-x-100"
                strokeWidth={2}
              />
              <span>
                {tArticlePage("backToTopic", {
                  topic: topicTitle,
                })}
              </span>
            </Link>

            {/* Article header: title, summary, type + topic chips (spec §5). */}
            <HelpArticleHero
              title={articleTitle}
              summary={articleSummary}
              typeLabel={typeLabel}
              topicLabel={topicTitle}
              topicHref={topicHref}
              readingTime={readingTime}
              lastReviewed={lastReviewed}
              imageSrc={meta?.heroImage}
            />

            {/* Mobile "On this page" disclosure — only when ≥ 3 headings (spec §7, §11). */}
            {tocItems.length >= 3 && (
              <HelpArticleTocMobile
                items={tocItems}
                label={tArticlePage("onThisPage")}
                className="mb-6 lg:hidden"
              />
            )}

            {/* Article body */}
            {body && resolveText ? (
              <HelpArticleBlocks
                blocks={body}
                resolveText={resolveText}
                noticeLabels={noticeLabels}
                copyLabel={tArticlePage("copyCode")}
                copiedLabel={tArticlePage("copied")}
                keyTakeawaysLabel={tArticlePage("keyTakeaways")}
                expectedOutcomeLabel={tArticlePage("expectedOutcome")}
                checklistHint={tArticlePage("checklistHint")}
                className="mb-10"
              />
            ) : (
              /* Generic overview for articles without an authored body (spec §16). */
              <div className="mb-10">
                <p className="text-foreground/80 text-base leading-7">
                  {articleSummary}
                </p>
              </div>
            )}

            {/* Related articles (spec §13) */}
            {relatedRows.length > 0 && (
              <HelpArticleRelated
                heading={tArticlePage("relatedArticles")}
                articles={relatedRows}
              />
            )}

            {/* Recovery / search area (spec §14) */}
            <HelpArticleRecovery
              title={tArticlePage("recovery.title")}
              searchLabel={tArticlePage("recovery.search")}
              searchHref="/help-center"
              backToTopicLabel={tArticlePage("recovery.backToTopic", {
                topic: topicTitle,
              })}
              topicHref={topicHref}
              allTopicsLabel={tArticlePage("recovery.allTopics")}
              allTopicsHref="/help-center"
            />
          </main>

          {/* ── Desktop contextual right rail (spec §6) ─────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-44">
              <HelpArticleRail
                // backToTopicLabel={}
                // topicHref={topicHref}
                allTopicsLabel={t("allTopics.sectionTitle")}
                allTopicsHref="/help-center"
                tocItems={tocItems}
                onThisPageLabel={tArticlePage("onThisPage")}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
