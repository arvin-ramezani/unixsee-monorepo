import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  ActivityHistory,
  type ActivityDateRange,
  type ActivityFilters,
  type ActivityPageState,
} from "@/components/activity/activity-history";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/i18n/routing";
import { activityRecords } from "@/lib/data/activity/activity-records";

interface ActivitiesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const categories: Array<ActivityFilters["category"]> = [
  "all",
  "seo",
  "graphic-design",
  "product-data-entry",
  "social-media-support",
];

const dateRanges: ActivityDateRange[] = [
  "all",
  "last7",
  "last30",
  "last90",
  "custom",
];

const pageStates: ActivityPageState[] = [
  "ready",
  "empty",
  "error",
  "loadError",
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: Pick<ActivitiesPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.activityHistory");
  return { title: t("title"), description: t("description") };
}

export default async function ActivitiesPage({
  params,
  searchParams,
}: ActivitiesPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("ActivityHistory");

  const requestedCategory = firstValue(query.service);
  const requestedRange = firstValue(query.range);
  const requestedState = firstValue(query.state);
  const category = categories.includes(
    requestedCategory as ActivityFilters["category"],
  )
    ? (requestedCategory as ActivityFilters["category"])
    : "all";
  const dateRange = dateRanges.includes(requestedRange as ActivityDateRange)
    ? (requestedRange as ActivityDateRange)
    : "all";
  const initialState = pageStates.includes(requestedState as ActivityPageState)
    ? (requestedState as ActivityPageState)
    : "ready";
  const initialFilters: ActivityFilters = {
    category,
    resource: firstValue(query.resource) ?? "all",
    dateRange,
    startDate: dateRange === "custom" ? (firstValue(query.start) ?? "") : "",
    endDate: dateRange === "custom" ? (firstValue(query.end) ?? "") : "",
  };
  const stateKey = JSON.stringify({ initialFilters, initialState });

  return (
    <DashboardShell
      activeItem="Activities"
      breadcrumbs={[{ label: t("title") }]}
    >
      <div className="w-full max-w-6xl">
        <header className="pt-6 pb-7 sm:pt-7">
          <h1 className="text-[1.8rem] font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
            {t("description")}
          </p>
        </header>
        <ActivityHistory
          key={stateKey}
          records={activityRecords}
          initialFilters={initialFilters}
          initialState={initialState}
        />
      </div>
    </DashboardShell>
  );
}
