import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  NotificationArticle,
  type RelatedNotificationView,
} from "@/components/notifications/notification-article";
import type { Locale } from "@/i18n/routing";
import { getNotificationArticle } from "@/lib/data/notifications/notification-records";

interface NotificationDetailsPageProps {
  params: Promise<{ locale: Locale; notificationId: string }>;
}

export async function generateMetadata({
  params,
}: NotificationDetailsPageProps): Promise<Metadata> {
  const { locale, notificationId } = await params;
  setRequestLocale(locale);
  const article = getNotificationArticle(notificationId);
  if (!article) return {};

  const feeds = await getTranslations("Dashboard.feeds");
  const metadata = await getTranslations("Metadata.notificationDetails");
  const titleByKind = {
    platformUpdate: feeds("platformUpdateTitle"),
    seoGuide: feeds("seoGuideTitle"),
    designShowcase: feeds("designShowcaseTitle"),
    socialMediaTrends: feeds("socialMediaTrendsTitle"),
  };
  const summaryByKind = {
    platformUpdate: feeds("platformUpdateDetail"),
    seoGuide: feeds("seoGuideDetail"),
    designShowcase: feeds("designShowcaseDetail"),
    socialMediaTrends: feeds("socialMediaTrendsDetail"),
  };

  return {
    title: metadata("title", { notification: titleByKind[article.kind] }),
    description: summaryByKind[article.kind],
  };
}

export default async function NotificationDetailsPage({
  params,
}: NotificationDetailsPageProps) {
  const { locale, notificationId } = await params;
  setRequestLocale(locale);
  const article = getNotificationArticle(notificationId);
  if (!article) notFound();

  const t = await getTranslations("Notifications");
  const feeds = await getTranslations("Dashboard.feeds");
  const titleByKind = {
    platformUpdate: feeds("platformUpdateTitle"),
    seoGuide: feeds("seoGuideTitle"),
    designShowcase: feeds("designShowcaseTitle"),
    socialMediaTrends: feeds("socialMediaTrendsTitle"),
  };
  const summaryByKind = {
    platformUpdate: feeds("platformUpdateDetail"),
    seoGuide: feeds("seoGuideDetail"),
    designShowcase: feeds("designShowcaseDetail"),
    socialMediaTrends: feeds("socialMediaTrendsDetail"),
  };

  const sections = article.sections.map((section) => ({
    id: section.id,
    title: t(`articles.${article.kind}.${section.key}.title`),
    paragraphs: [
      t(`articles.${article.kind}.${section.key}.paragraphOne`),
      t(`articles.${article.kind}.${section.key}.paragraphTwo`),
    ],
  }));
  const related = article.relatedIds.flatMap<RelatedNotificationView>(
    (relatedId) => {
      const relatedArticle = getNotificationArticle(relatedId);
      if (!relatedArticle) return [];

      return [
        {
          id: relatedArticle.id,
          kind: relatedArticle.kind,
          title: titleByKind[relatedArticle.kind],
          summary: summaryByKind[relatedArticle.kind],
          date: t("date", { date: new Date(relatedArticle.publishedAt) }),
        },
      ];
    },
  );
  const title = titleByKind[article.kind];

  return (
    <DashboardShell
      activeItem="Dashboard"
      showViewToggle={false}
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/notifications" },
        { label: title },
      ]}
    >
      <NotificationArticle
        notificationId={article.id}
        title={title}
        summary={summaryByKind[article.kind]}
        category={t(`categories.${article.kind}`)}
        published={t("published", { date: new Date(article.publishedAt) })}
        readingTime={t("readingTime", { count: article.readingMinutes })}
        image={
          article.image
            ? {
                src: article.image,
                alt: t("articles.platformUpdate.imageAlt"),
              }
            : undefined
        }
        sections={sections}
        related={related}
        labels={{
          back: t("back"),
          more: t("more"),
          relatedLabel: t("relatedLabel"),
        }}
      />
    </DashboardShell>
  );
}
