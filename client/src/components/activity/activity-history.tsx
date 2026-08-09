"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Filter,
  History,
  LoaderCircle,
  RefreshCw,
  SearchCheck,
  SearchX,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useRouter } from "@/i18n/navigation";
import type {
  ActivityOutcome,
  ActivityRecord,
} from "@/lib/data/activity/activity-records";
import { activityReferenceDate } from "@/lib/data/activity/activity-records";
import {
  activityIcons,
  activityIconToneClasses,
} from "@/components/activity/activity-visuals";
import { cn } from "@/lib/utils";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

export type ActivityDateRange =
  | "all"
  | "last7"
  | "last30"
  | "last90"
  | "custom";

type ActivityServiceFilter =
  | "all"
  | "seo"
  | "graphic-design"
  | "product-data-entry"
  | "social-media-support";

export interface ActivityFilters {
  category: ActivityServiceFilter;
  resource: string;
  dateRange: ActivityDateRange;
  startDate: string;
  endDate: string;
}

export type ActivityPageState = "ready" | "empty" | "error" | "loadError";

interface ActivityHistoryProps {
  records: ActivityRecord[];
  initialFilters: ActivityFilters;
  initialState: ActivityPageState;
}

const PAGE_SIZE = 6;

const categoryValues: ActivityServiceFilter[] = [
  "all",
  "seo",
  "graphic-design",
  "product-data-entry",
  "social-media-support",
];

const dateRangeValues: ActivityDateRange[] = [
  "all",
  "last7",
  "last30",
  "last90",
  "custom",
];

const outcomeIcons = {
  completed: CheckCircle2,
  resolved: CheckCircle2,
  updated: RefreshCw,
  detected: SearchCheck,
  restored: CheckCircle2,
  attention: CircleAlert,
} satisfies Record<ActivityOutcome, typeof CheckCircle2>;

const outcomeStyles = {
  completed:
    "border-success/25 bg-success/12 text-success-foreground dark:text-success",
  resolved:
    "border-success/25 bg-success/12 text-success-foreground dark:text-success",
  updated: "border-link/20 bg-popover text-link",
  detected: "border-link/20 bg-popover text-link",
  restored:
    "border-success/25 bg-success/12 text-success-foreground dark:text-success",
  attention:
    "border-warning/35 bg-warning/18 text-warning-foreground dark:text-warning",
} satisfies Record<ActivityOutcome, string>;

function isSameUtcDate(first: Date, second: Date) {
  return (
    first.getUTCFullYear() === second.getUTCFullYear() &&
    first.getUTCMonth() === second.getUTCMonth() &&
    first.getUTCDate() === second.getUTCDate()
  );
}

function utcDayDifference(first: Date, second: Date) {
  const firstDay = Date.UTC(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    first.getUTCDate(),
  );
  const secondDay = Date.UTC(
    second.getUTCFullYear(),
    second.getUTCMonth(),
    second.getUTCDate(),
  );
  return Math.round((firstDay - secondDay) / 86_400_000);
}

export function ActivityHistory({
  records,
  initialFilters,
  initialState,
}: ActivityHistoryProps) {
  const t = useTranslations("ActivityHistory");
  const format = useFormatter();
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    initialState === "loadError" ? "error" : "idle",
  );

  const resources = Array.from(
    new Map(
      records
        .filter((record) => record.resource)
        .map((record) => [
          record.resource!.id,
          { id: record.resource!.id, label: record.resource!.label },
        ]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));

  const hasInvalidCustomRange =
    filters.dateRange === "custom" &&
    Boolean(filters.startDate) &&
    Boolean(filters.endDate) &&
    filters.startDate > filters.endDate;

  const filteredRecords = (initialState === "empty" ? [] : records).filter(
    (record) => {
      if (filters.category !== "all" && record.category !== filters.category) {
        return false;
      }
      if (
        filters.resource !== "all" &&
        record.resource?.id !== filters.resource
      ) {
        return false;
      }

      const occurredAt = new Date(record.occurredAt);
      const reference = new Date(activityReferenceDate);
      if (filters.dateRange === "last7") {
        return reference.getTime() - occurredAt.getTime() <= 7 * 86_400_000;
      }
      if (filters.dateRange === "last30") {
        return reference.getTime() - occurredAt.getTime() <= 30 * 86_400_000;
      }
      if (filters.dateRange === "last90") {
        return reference.getTime() - occurredAt.getTime() <= 90 * 86_400_000;
      }
      if (filters.dateRange === "custom" && !hasInvalidCustomRange) {
        const date = record.occurredAt.slice(0, 10);
        if (filters.startDate && date < filters.startDate) return false;
        if (filters.endDate && date > filters.endDate) return false;
      }
      return true;
    },
  );

  const visibleRecords = filteredRecords.slice(0, visibleCount);
  const groupedRecords = Array.from(
    visibleRecords.reduce((groups, record) => {
      const key = record.occurredAt.slice(0, 10);
      const group = groups.get(key) ?? [];
      group.push(record);
      groups.set(key, group);
      return groups;
    }, new Map<string, ActivityRecord[]>()),
  );

  const hasMore = visibleCount < filteredRecords.length;
  const hasFilters =
    filters.category !== "all" ||
    filters.resource !== "all" ||
    filters.dateRange !== "all" ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);
  const activeFilterCount = [
    filters.category !== "all",
    filters.resource !== "all",
    filters.dateRange !== "all",
  ].filter(Boolean).length;

  function syncFilters(nextFilters: ActivityFilters) {
    setFilters(nextFilters);
    setVisibleCount(PAGE_SIZE);
    setLoadState("idle");

    const query: Record<string, string> = {};
    if (nextFilters.category !== "all") query.service = nextFilters.category;
    if (nextFilters.resource !== "all") query.resource = nextFilters.resource;
    if (nextFilters.dateRange !== "all") query.range = nextFilters.dateRange;
    if (nextFilters.dateRange === "custom" && nextFilters.startDate) {
      query.start = nextFilters.startDate;
    }
    if (nextFilters.dateRange === "custom" && nextFilters.endDate) {
      query.end = nextFilters.endDate;
    }
    if (initialState !== "ready") query.state = initialState;

    router.replace(
      { pathname: "/dashboard/activities", query },
      { scroll: false },
    );
  }

  function clearFilters() {
    syncFilters({
      category: "all",
      resource: "all",
      dateRange: "all",
      startDate: "",
      endDate: "",
    });
  }

  function loadMore() {
    setLoadState("loading");
    window.setTimeout(() => {
      setVisibleCount((count) => count + PAGE_SIZE);
      setLoadState("idle");
    }, 450);
  }

  function renderFilterFields(idPrefix: string) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-service`}>{t("filters.service")}</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              syncFilters({
                ...filters,
                category: value as ActivityFilters["category"],
              })
            }
          >
            <SelectTrigger id={`${idPrefix}-service`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`categories.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {resources.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-resource`}>
              {t("filters.resource")}
            </Label>
            <Select
              value={filters.resource}
              onValueChange={(value) =>
                syncFilters({ ...filters, resource: value })
              }
            >
              <SelectTrigger id={`${idPrefix}-resource`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allResources")}</SelectItem>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    <span dir="auto">{resource.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-range`}>{t("filters.dateRange")}</Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              syncFilters({
                ...filters,
                dateRange: value as ActivityDateRange,
                startDate: value === "custom" ? filters.startDate : "",
                endDate: value === "custom" ? filters.endDate : "",
              })
            }
          >
            <SelectTrigger id={`${idPrefix}-range`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`dateRanges.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filters.dateRange === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2 md:col-span-full lg:max-w-xl">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-start`}>{t("filters.start")}</Label>
              <Input
                id={`${idPrefix}-start`}
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(event) =>
                  syncFilters({ ...filters, startDate: event.target.value })
                }
                className="h-11"
                aria-invalid={hasInvalidCustomRange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-end`}>{t("filters.end")}</Label>
              <Input
                id={`${idPrefix}-end`}
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(event) =>
                  syncFilters({ ...filters, endDate: event.target.value })
                }
                className="h-11"
                aria-invalid={hasInvalidCustomRange}
                aria-describedby={
                  hasInvalidCustomRange ? `${idPrefix}-date-error` : undefined
                }
              />
            </div>
            {hasInvalidCustomRange && (
              <p
                id={`${idPrefix}-date-error`}
                role="alert"
                className="text-destructive text-sm sm:col-span-2"
              >
                {t("filters.dateError")}
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  if (initialState === "error") {
    return (
      <Panel className="overflow-hidden">
        <div className="grid min-h-96 place-items-center p-6">
          <Alert variant="destructive" className="bg-background max-w-xl">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{t("states.errorTitle")}</AlertTitle>
            <AlertDescription>
              <p>{t("states.errorDescription")}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => router.replace("/dashboard/activities")}
              >
                <RefreshCw aria-hidden="true" />
                {t("states.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="overflow-hidden">
      <div className="border-border flex min-h-17 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("allActivity")}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs" aria-live="polite">
            {t("resultSummary", {
              shown: Math.min(visibleCount, filteredRecords.length),
              total: filteredRecords.length,
            })}
          </p>
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters}>
            {t("filters.clear")}
          </Button>
        )}
      </div>

      <div className="border-border bg-muted/20 border-b px-4 py-4 sm:px-6">
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {renderFilterFields("desktop-activity")}
        </div>
        <details className="group md:hidden">
          <summary className="border-border bg-background focus-visible:ring-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
            <Filter aria-hidden="true" className="size-4" />
            {t("filters.mobile")}
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {format.number(activeFilterCount, "integer")}
              </Badge>
            )}
            <ChevronDown
              aria-hidden="true"
              className="ms-auto size-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-4 grid gap-4">
            {renderFilterFields("mobile-activity")}
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                {t("filters.clear")}
              </Button>
            )}
          </div>
        </details>
      </div>

      {filteredRecords.length === 0 || hasInvalidCustomRange ? (
        <div className="grid min-h-96 place-items-center px-6 py-12 text-center">
          <div className="max-w-md">
            {hasFilters || hasInvalidCustomRange ? (
              <SearchX
                aria-hidden="true"
                className="text-muted-foreground mx-auto size-9"
              />
            ) : (
              <History
                aria-hidden="true"
                className="text-muted-foreground mx-auto size-9"
              />
            )}
            <h3 className="mt-4 text-lg font-semibold">
              {hasFilters || hasInvalidCustomRange
                ? t("states.filteredTitle")
                : t("states.emptyTitle")}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {hasFilters || hasInvalidCustomRange
                ? t("states.filteredDescription")
                : t("states.emptyDescription")}
            </p>
            {hasFilters ||
              (hasInvalidCustomRange && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 min-h-10"
                  onClick={clearFilters}
                >
                  {t("filters.clear")}
                </Button>
              ))}
          </div>
        </div>
      ) : (
        <div aria-label={t("timelineLabel")}>
          {groupedRecords.map(([dateKey, group], groupIndex) => {
            const date = new Date(`${dateKey}T00:00:00Z`);
            const reference = new Date(activityReferenceDate);
            const dayDifference = utcDayDifference(reference, date);
            const dateLabel = isSameUtcDate(reference, date)
              ? t("dates.today")
              : dayDifference === 1
                ? t("dates.yesterday")
                : format.dateTime(date, "shortDate");

            return (
              <section
                key={dateKey}
                aria-labelledby={`activity-date-${dateKey}`}
                className={cn(groupIndex > 0 && "border-border border-t")}
              >
                <h3
                  id={`activity-date-${dateKey}`}
                  className="bg-muted/35 px-4 py-2.5 text-sm font-semibold sm:px-6"
                >
                  {dateLabel}
                </h3>
                <ol>
                  {group.map((record) => {
                    const ActivityIconComponent = activityIcons[record.icon];

                    const OutcomeIcon = outcomeIcons[record.outcome];
                    const hasDestination =
                      record.resource?.available && record.resource.href;

                    return (
                      <li
                        key={record.id}
                        className={cn(
                          "border-border border-t transition-colors first:border-t-0",
                          hasDestination && "group hover:bg-muted/25",
                        )}
                      >
                        <article className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-5 sm:gap-x-4 sm:px-6 lg:grid-cols-[40px_minmax(0,1fr)_184px] lg:gap-x-5">
                          <span
                            className={cn(
                              "grid size-10 shrink-0 place-items-center rounded-full",
                              activityIconToneClasses[record.outcome],
                            )}
                          >
                            <ActivityIconComponent
                              aria-hidden="true"
                              className="size-[1.15rem]"
                            />
                          </span>

                          <div className="col-start-2 row-start-1 max-w-2xl min-w-0">
                            <p className="text-sm leading-6 font-semibold wrap-break-word">
                              {t(
                                `records.${record.titleKey}`,
                                record.titleValues,
                              )}
                            </p>
                            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5">
                              {!!record.resource && (
                                <span
                                  dir={
                                    record.resource.technical ? "ltr" : "auto"
                                  }
                                >
                                  {record.resource.label}
                                </span>
                              )}
                              {!!record.resource && (
                                <span aria-hidden="true">·</span>
                              )}
                              <span>{t(`sources.${record.source}`)}</span>
                            </p>
                          </div>

                          <div className="col-span-2 ms-13 grid grid-cols-[auto_auto] items-center justify-start gap-x-2 gap-y-1.5 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:ms-0 lg:w-46 lg:self-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "w-fit gap-1",
                                outcomeStyles[record.outcome],
                              )}
                            >
                              <OutcomeIcon aria-hidden="true" />
                              {t(`outcomes.${record.outcome}`)}
                            </Badge>
                            <time
                              dateTime={record.occurredAt}
                              aria-label={format.dateTime(
                                new Date(record.occurredAt),
                                "dateTime",
                              )}
                              className="text-muted-foreground justify-self-start text-xs whitespace-nowrap tabular-nums"
                            >
                              {format.dateTime(
                                new Date(record.occurredAt),
                                "shortTime",
                              )}
                            </time>
                            {hasDestination ? (
                              <Link
                                href={record.resource!.href!}
                                aria-label={`${t("viewResource")}: ${record.resource!.label}`}
                                className="text-link focus-visible:after:ring-ring col-span-2 inline-flex min-h-8 w-fit items-center gap-1 rounded-md text-xs font-semibold outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-inset"
                              >
                                {t("viewResource")}
                                <ChevronRight
                                  aria-hidden="true"
                                  className="size-3.5 rtl:rotate-180"
                                />
                              </Link>
                            ) : record.resource ? (
                              <span className="text-muted-foreground col-span-2 inline-flex min-h-8 items-center gap-1 text-xs">
                                <CircleAlert
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                {t("resourceUnavailable")}
                              </span>
                            ) : null}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      {filteredRecords.length > 0 && !hasInvalidCustomRange && (
        <footer className="border-border border-t px-4 py-5 text-center sm:px-6">
          {loadState === "error" ? (
            <Alert className="bg-background mx-auto max-w-2xl text-start">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{t("states.loadErrorTitle")}</AlertTitle>
              <AlertDescription>
                <p>{t("states.loadErrorDescription")}</p>
                <DashboardButton
                  revealClassName="bg-muted dark:bg-accent"
                  size="xl"
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={loadMore}
                >
                  <RefreshCw aria-hidden="true" />
                  {t("states.retry")}
                </DashboardButton>
              </AlertDescription>
            </Alert>
          ) : hasMore ? (
            <DashboardButton
              revealClassName="bg-muted dark:bg-accent"
              size="xl"
              type="button"
              variant="outline"
              className="min-h-11 min-w-42"
              disabled={loadState === "loading"}
              onClick={loadMore}
            >
              {loadState === "loading" ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <ArrowDown aria-hidden="true" />
              )}
              {loadState === "loading" ? t("loadingOlder") : t("loadMore")}
            </DashboardButton>
          ) : (
            <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              <CalendarDays aria-hidden="true" className="size-4" />
              {t("endOfHistory")}
            </p>
          )}
        </footer>
      )}
    </Panel>
  );
}
