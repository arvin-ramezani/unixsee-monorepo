import type { Metadata } from "next";
import { getFormats } from "@/i18n/formats";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HelpAllTopics } from "@/components/help-center/help-all-topics";
import { HelpAllTopicsSheet } from "@/components/help-center/help-all-topics-sheet";
import { HelpCenterExplorer } from "@/components/help-center/help-center-explorer";
import { HelpCenterHero } from "@/components/help-center/help-center-hero";
import type { AllTopicsEntry } from "@/components/help-center/help-all-topics";
import type { GuideRow } from "@/components/help-center/help-popular-guides";
import type { TopicCard } from "@/components/help-center/help-topic-grid";
import type { Locale } from "@/i18n/routing";
import {
  helpGuides,
  helpTopicArticleCountKeys,
  helpTopics,
} from "@/lib/data/help-center/help-center-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.helpCenter");
  return { title: t("title"), description: t("description") };
}

export default async function HelpCenterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HelpCenter");

  // Visible ordinal (Persian/Latin digits) that numbers the full taxonomy in
  // the All Topics list. Wrapped in a direction-matched isolate so the digit
  // and its period stay one unit and never split from the label under bidi
  // reordering when the title mixes Persian with Latin tokens (Unixsee, DNS…).
  // The isolate must follow the locale direction — an RTL isolate (U+2067) in
  // Persian keeps the numeral at the inline-start with the period to its left
  // toward the label; an LTR isolate (U+2066) does the mirror for English.
  // Forcing LTR in both would render the period on the wrong side in RTL.
  const ordinalFormatter = new Intl.NumberFormat(
    locale === "fa" ? "fa-u-nu-arabext" : "en",
  );
  const ordinalIsolate = locale === "fa" ? "⁧" : "⁦";
  const ordinal = (order: number) =>
    `${ordinalIsolate}${ordinalFormatter.format(order)}.⁩`;

  const dateFormatter = new Intl.DateTimeFormat(
    locale,
    getFormats(locale).dateTime!.shortDate,
  );

  // The six featured topics carry the "Browse by topic" grid as plain labels;
  // ordinals belong only to the full taxonomy sidebar/sheet.
  const topicCards: TopicCard[] = helpTopics
    .filter((topic) => topic.featured)
    .map((topic) => ({
      id: topic.id,
      icon: topic.icon,
      label: t(`topics.items.${topic.key}.title`),
      articleCount: t("topics.articleCount", {
        count: Number(t.raw(helpTopicArticleCountKeys[topic.key])),
      }),
      href: `/help-center/topics/${topic.id}`,
    }));

  const guideRows: GuideRow[] = helpGuides.map((guide) => ({
    id: guide.id,
    icon: guide.icon,
    title: t(`guides.items.${guide.key}.title`),
    description: t(`guides.items.${guide.key}.description`),
    category: t(`topics.items.${guide.topicKey}.title`),
    type: t(`guides.type.${guide.type}`),
    updated: t("guides.updated", {
      date: dateFormatter.format(new Date(guide.updatedAt)),
    }),
    href: "#",
  }));

  const allTopics: AllTopicsEntry[] = helpTopics.map((topic) => ({
    id: topic.id,
    label: `${ordinal(topic.order)} ${t(`topics.items.${topic.key}.title`)}`,
    href: `/help-center/topics/${topic.id}`,
  }));

  return (
    <main>
      <div className="w-full pt-8 pb-16 md:pt-10">
        <HelpCenterHero />

        {/* Mobile/tablet: All topics opens in a bottom sheet drawer. */}
        <div className="sticky top-17 z-10 mt-8 lg:hidden">
          <HelpAllTopicsSheet
            topics={allTopics}
            className="bg-background w-full"
          />
        </div>

        {/* Large screens: main column + secondary All Topics sidebar. Grid
            column order follows the writing direction, so the sidebar sits on
            the inline-end (left in fa/RTL, right in en/LTR) automatically. */}
        <div className="container-lg mt-10 lg:mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
          <HelpCenterExplorer topics={topicCards} guides={guideRows} />

          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <h2
                id="help-all-topics-heading"
                className="mb-4 text-start text-lg font-bold"
                dir="auto"
              >
                {t("allTopics.sectionTitle")}
              </h2>
              <HelpAllTopics topics={allTopics} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
