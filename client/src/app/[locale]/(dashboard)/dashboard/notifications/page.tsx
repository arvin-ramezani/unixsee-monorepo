import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  NotificationList,
  type NotificationListItemView,
} from "@/components/notifications/notification-list";
import type { Locale } from "@/i18n/routing";
import { notifications } from "@/lib/dashboard-data";
import { getNotificationArticle } from "@/lib/data/notifications/notification-records";

interface NotificationsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: NotificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.notifications");
  return { title: t("title"), description: t("description") };
}

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
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

  const items = notifications.flatMap<NotificationListItemView>(
    (notification) => {
      const article = getNotificationArticle(notification.notificationId);
      if (!article) return [];

      return [
        {
          id: notification.notificationId,
          kind: notification.kind,
          title: titleByKind[notification.kind],
          summary: summaryByKind[notification.kind],
          category: t(`categories.${notification.kind}`),
          date: t("date", { date: new Date(article.publishedAt) }),
          isSeen: notification.seenAt !== null,
        },
      ];
    },
  );

  return (
    <DashboardShell
      activeItem="Dashboard"
      breadcrumbs={[{ label: t("title") }]}
      showViewToggle={false}
    >
      <div className="me-auto w-full max-w-240 pb-10 pt-6 sm:pt-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-[1.8rem] font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </header>
        <NotificationList
          items={items}
          listLabel={t("listLabel")}
          unseenLabel={t("unseen")}
        />
      </div>
    </DashboardShell>
  );
}
