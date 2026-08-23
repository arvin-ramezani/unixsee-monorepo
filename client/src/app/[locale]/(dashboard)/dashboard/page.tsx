import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { NestAuthorizationCaseDto } from "@/actions/authorization/authorization-case";
import { AuthorizationDashboardBanner } from "@/components/authorization/authorization-dashboard-banner";
import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FeedCard } from "@/components/dashboard/feed-card";
import { RightRail } from "@/components/dashboard/right-rail";
import { WebsiteTable } from "@/components/dashboard/website-table";
import { getRecentActivities } from "@/lib/data/activity/activity-records";
import type { Locale } from "@/i18n/routing";
import { serverFetch } from "@/lib/api/server-fetch";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { mapNestAuthorizationCase } from "@/lib/authorization/map-nest-case";
import {
  AUTHORIZATION_STATUS,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";
import { notifications, websites } from "@/lib/dashboard-data";
import type { SafeAuthUser } from "@/types/auth.types";
import { DashboardButtonLink } from "./_components/common";

async function loadAuthorizationStatus(): Promise<AuthorizationStatus> {
  try {
    const response = await serverFetch<NestAuthorizationCaseDto | null>(
      "/authorization-cases/me",
      { method: "GET" },
    );
    if (response.success && response.data) {
      return mapNestAuthorizationCase(response.data).status;
    }
  } catch {
    // Fall through to not_started when Nest is unavailable.
  }
  return AUTHORIZATION_STATUS.NOT_STARTED;
}

function resolveWelcomeName(user: SafeAuthUser | null, fallback: string) {
  const fullName = user?.fullName?.trim();

  if (fullName) {
    return fullName.split(/\s+/)[0] || fullName;
  }
  return fallback;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Dashboard");
  const nav = await getTranslations("Navigation");
  const [user, authorizationStatus] = await Promise.all([
    getCurrentUser(),
    loadAuthorizationStatus(),
  ]);
  const recentActivities = getRecentActivities();
  const welcomeName = resolveWelcomeName(user, nav("accountFallback"));

  return (
    <DashboardShell activeItem="Dashboard" userName={welcomeName}>
      <section className="flex min-h-27 -translate-y-1 flex-col justify-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="ps-2">
          <h1 className="mt-8 text-[1.8rem] font-semibold tracking-tight">
            {t("hero.title", { name: welcomeName })}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {t("hero.description")}
          </p>
        </div>

        <DashboardButtonLink
          className="mt-8 md:w-fit"
          size="xl"
          href="/dashboard/plans"
        >
          <Plus aria-hidden="true" className="size-4" /> {t("hero.addSite")}
        </DashboardButtonLink>
      </section>
      <div className="mt-4">
        <AuthorizationDashboardBanner status={authorizationStatus} />
      </div>
      <div className="mt-8 grid items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_288px]">
        <div className="min-w-0 space-y-4.5">
          <WebsiteTable websites={websites} />

          <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2 2xl:grid-cols-[414px_minmax(0,1fr)]">
            <FeedCard
              className="px-0"
              titleClassName="px-4.75"
              title={t("feeds.notifications")}
              cardFooterClassName="mx-4.75"
              items={notifications}
              linkLabel={t("feeds.allNotifications")}
              linkHref="/dashboard/notifications"
            />
            <ActivityFeedCard
              title={t("feeds.activities")}
              items={recentActivities}
              linkLabel={t("feeds.allActivities")}
              linkHref="/dashboard/activities"
            />
          </div>
        </div>

        <RightRail />
      </div>
    </DashboardShell>
  );
}
