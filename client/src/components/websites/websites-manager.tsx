"use client";

import { useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import { useDashboardView } from "@/components/dashboard/views/dashboard-view-context";
import {
  BackupBadge,
  StatusBadge,
  monogramStyles,
} from "@/components/websites/website-badges";
import { WebsiteGrid } from "@/components/websites/website-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import type {
  WebsiteBackup,
  WebsitePlan,
  WebsiteRecord,
  WebsiteStatus,
} from "@/lib/websites-data";
import { cn } from "@/lib/utils";

const tabs = [
  "all",
  "online",
  "needsAttention",
  "maintenance",
  "setupPending",
] as const;
type WebsiteTab = (typeof tabs)[number];

function SelectControl({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={className}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="border-border bg-background hover:bg-muted focus-visible:ring-ring h-11! w-full rounded-lg ps-4 pe-3 text-sm focus-visible:ring-2"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function WebsitesManager({
  websites,
  className,
}: {
  websites: WebsiteRecord[];
  className?: string;
}) {
  const t = useTranslations("Websites");
  const common = useTranslations("Common");
  const format = useFormatter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<WebsiteTab>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | WebsiteStatus>("all");
  const [plan, setPlan] = useState<"all" | WebsitePlan>("all");
  const [backup, setBackup] = useState<"all" | WebsiteBackup>("all");
  const [coverage, setCoverage] = useState<
    "all" | WebsiteRecord["managementCoverage"]
  >("all");
  const [sort, setSort] = useState<"updated" | "name">("updated");
  const { view } = useDashboardView();
  const prefersReducedMotion = useReducedMotion();

  const visibleWebsites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matches = websites.filter((website) => {
      const tabMatch = activeTab === "all" || website.status === activeTab;
      const statusMatch = status === "all" || website.status === status;
      const planMatch = plan === "all" || website.plan === plan;
      const backupMatch = backup === "all" || website.backup === backup;
      const coverageMatch =
        coverage === "all" || website.managementCoverage === coverage;
      const queryMatch =
        !normalizedQuery ||
        `${website.name} ${website.domain}`
          .toLowerCase()
          .includes(normalizedQuery);
      return (
        tabMatch &&
        statusMatch &&
        planMatch &&
        backupMatch &&
        coverageMatch &&
        queryMatch
      );
    });
    return sort === "name"
      ? [...matches].sort((a, b) => a.name.localeCompare(b.name, locale))
      : matches;
  }, [
    activeTab,
    backup,
    coverage,
    locale,
    plan,
    query,
    sort,
    status,
    websites,
  ]);

  const resetFilters = () => {
    setActiveTab("all");
    setQuery("");
    setStatus("all");
    setPlan("all");
    setBackup("all");
    setCoverage("all");
    setSort("updated");
  };
  const statusOptions = [
    "online",
    "needsAttention",
    "maintenance",
    "setupPending",
  ] as const;
  const planOptions = [
    "starter",
    "business",
    "pro",
    "premium",
    "dedicatedPlan",
  ] as const;

  return (
    <Panel className={cn("overflow-hidden", className)}>
      <div className="flex h-16 items-center px-6">
        <h2 className="translate-y-1 text-xl font-semibold tracking-tight">
          {t("allWebsites")}
        </h2>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as WebsiteTab)}
        className="px-5"
      >
        <TabsList
          data-lenis-prevent
          aria-label={t("tablist")}
          className="border-border no-scrollbar flex h-auto max-w-full snap-x snap-mandatory justify-start gap-3 overflow-x-auto rounded-none border-b bg-transparent p-0"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                "text-muted-foreground hover:text-foreground focus-visible:ring-ring dark:data-[state=active]:text-secondary data-[state=active]:text-primary relative h-auto snap-center rounded border-0 border-b border-transparent bg-transparent px-4 py-0 text-sm shadow-none focus-visible:ring-2 data-state-active:shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
              )}
            >
              {t(`tabs.${tab}`)}
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-underline"
                  className="bg-primary dark:bg-secondary absolute -bottom-1 h-1 w-full origin-center scale-y-50 rounded-full"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 38,
                          mass: 0.65,
                        }
                  }
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border-border grid gap-4.5 border-b px-5.5 py-4.25 md:grid-cols-2 lg:grid-cols-[265px_102px_105px_132px_176px_1fr_44px]">
        <div className="relative">
          <Label htmlFor="website-search" className="sr-only">
            {t("filters.searchLabel")}
          </Label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground absolute inset-s-4 top-1/2 size-4 -translate-y-1/2"
          />
          <Input
            id="website-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder={t("filters.searchPlaceholder")}
            className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-lg border ps-11 pe-4 text-sm outline-none focus-visible:ring-2"
          />
        </div>
        <SelectControl
          label={t("filters.statusLabel")}
          value={status}
          onChange={(value) => setStatus(value as "all" | WebsiteStatus)}
          options={[
            { value: "all", label: t("filters.status") },
            ...statusOptions.map((value) => ({
              value,
              label: common(`statuses.${value}`),
            })),
          ]}
        />
        <SelectControl
          label={t("filters.planLabel")}
          value={plan}
          onChange={(value) => setPlan(value as "all" | WebsitePlan)}
          options={[
            { value: "all", label: t("filters.plan") },
            ...planOptions.map((value) => ({
              value,
              label: common(`plans.${value}`),
            })),
          ]}
        />
        <SelectControl
          label={t("filters.coverageLabel")}
          value={coverage}
          onChange={(value) =>
            setCoverage(value as "all" | WebsiteRecord["managementCoverage"])
          }
          options={[
            { value: "all", label: t("filters.coverage") },
            {
              value: "UNIXSEE_MANAGED",
              label: common("coverage.UNIXSEE_MANAGED"),
            },
            {
              value: "EXTERNAL_INFRASTRUCTURE",
              label: common("coverage.EXTERNAL_INFRASTRUCTURE"),
            },
            {
              value: "UNCLASSIFIED",
              label: common("coverage.UNCLASSIFIED"),
            },
          ]}
        />
      </div>

      <DashboardFadeIn
        deferUntilKeyChange
        animationKey={`${view}-${activeTab}-${status}-${plan}-${backup}-${sort}`}
      >
        {view === "grid" && visibleWebsites.length > 0 && (
          <WebsiteGrid websites={visibleWebsites} />
        )}

        <div
          className={cn(
            "overflow-x-auto",
            view === "grid" ? "hidden" : "hidden lg:block",
          )}
        >
          <Table className="min-w-245 table-fixed text-sm">
            <TableCaption className="sr-only">
              {t("table.caption")}
            </TableCaption>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
            </colgroup>
            <TableHeader className="text-muted-foreground">
              <TableRow className="h-11.25">
                <TableHead className="ps-7 text-xs">
                  {t("table.website")}
                </TableHead>
                <TableHead className="text-xs">{t("table.domain")}</TableHead>
                <TableHead className="text-xs">{t("table.plan")}</TableHead>
                <TableHead className="text-xs">{t("table.status")}</TableHead>
                <TableHead className="text-xs">{t("table.backup")}</TableHead>
                <TableHead className="text-xs">
                  {t("table.lastUpdated")}
                </TableHead>
                <TableHead className="text-xs">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleWebsites.map((website) => (
                <TableRow
                  key={website.domain}
                  className="border-border hover:bg-muted/30 h-18 border-b"
                >
                  <TableHead
                    scope="row"
                    className="text-foreground h-auto ps-5.5 text-start"
                  >
                    <span className="flex items-center gap-5">
                      <span
                        className={cn(
                          "grid size-9.5 shrink-0 place-items-center rounded-full text-lg font-semibold",
                          monogramStyles[website.tone],
                        )}
                      >
                        {website.monogram}
                      </span>
                      <span className="min-w-0">
                        <span className="text-foreground block truncate font-semibold">
                          {website.name}
                        </span>
                        {website.managementCoverage !== "UNIXSEE_MANAGED" && (
                          <span className="border-border bg-muted text-muted-foreground mt-1 block w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium">
                            {t("table.externalComplementaryNote")}
                          </span>
                        )}
                        <span className="text-muted-foreground mt-1 block truncate text-xs font-normal">
                          {common(`descriptions.${website.description}`)}
                        </span>
                      </span>
                    </span>
                  </TableHead>
                  <TableCell>
                    <Link
                      href={`https://${website.domain}`}
                      dir="ltr"
                      className="hover:text-link inline-flex items-center gap-2"
                    >
                      {website.domain}
                      <ExternalLink
                        aria-hidden="true"
                        className="text-muted-foreground size-3.5"
                      />
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {website.managementCoverage === "UNIXSEE_MANAGED"
                      ? common(`plans.${website.plan}`)
                      : t("table.notApplicable")}
                  </TableCell>
                  <TableCell>
                    {website.managementCoverage === "UNIXSEE_MANAGED" ? (
                      <StatusBadge status={website.status} />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {t("table.notApplicable")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {website.managementCoverage === "UNIXSEE_MANAGED" ? (
                      <BackupBadge backup={website.backup} />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {t("table.notApplicable")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="leading-5 tabular-nums">
                    <time dateTime={website.updatedAt}>
                      <span className="block">
                        {format.dateTime(
                          new Date(website.updatedAt),
                          "shortDate",
                        )}
                      </span>
                      <span className="text-muted-foreground block">
                        {format.dateTime(
                          new Date(website.updatedAt),
                          "shortTime",
                        )}
                      </span>
                    </time>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-5">
                      <Link
                        href={`/dashboard/websites/${website.id}`}
                        className="border-border hover:bg-muted focus-visible:ring-ring dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-link/12 inline-flex h-9 items-center rounded-lg border px-4 text-xs font-medium transition-colors focus-visible:ring-2"
                      >
                        {t("table.manage")}
                      </Link>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div
          className={cn(
            "space-y-3 p-4",
            view === "grid" ? "hidden" : "lg:hidden",
          )}
        >
          {visibleWebsites.map((website) => (
            <article
              key={website.domain}
              className="border-border rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full font-semibold",
                    monogramStyles[website.tone],
                  )}
                >
                  {website.monogram}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{website.name}</h3>
                  <p
                    dir="ltr"
                    className="text-muted-foreground truncate text-xs"
                  >
                    {website.domain}
                  </p>
                </div>
                {website.managementCoverage === "UNIXSEE_MANAGED" ? (
                  <StatusBadge status={website.status} />
                ) : (
                  <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
                    {common("coverage.EXTERNAL_INFRASTRUCTURE")}
                  </span>
                )}
              </div>
              <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
                {website.managementCoverage === "UNIXSEE_MANAGED" ? (
                  <BackupBadge backup={website.backup} />
                ) : (
                  <span className="text-muted-foreground text-xs">
                    {t("table.complementaryOnly")}
                  </span>
                )}
                <Link
                  href={`/dashboard/websites/${website.id}`}
                  className="border-border focus-visible:ring-ring inline-flex h-9 items-center rounded-lg border px-4 text-xs font-medium focus-visible:ring-2"
                >
                  {t("table.manage")}
                </Link>
              </div>
            </article>
          ))}
        </div>
        {visibleWebsites.length === 0 && (
          <div className="border-border grid min-h-60 place-items-center border-b px-6 text-center">
            <div className="flex flex-col items-center">
              <Search
                aria-hidden="true"
                className="text-muted-foreground mx-auto size-8"
              />
              <h3 className="mt-3 font-semibold">{t("table.emptyTitle")}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("table.emptyDescription")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="plain"
                onClick={resetFilters}
                className="border-border mt-4 h-9 rounded-lg border px-4 text-sm font-medium"
              >
                {t("table.clearFilters")}
              </Button>
            </div>
          </div>
        )}
      </DashboardFadeIn>
      <div className="text-muted-foreground flex h-15 items-center justify-between px-6 text-sm">
        <span>
          {t("table.summary", {
            start: visibleWebsites.length === 0 ? 0 : 1,
            end: visibleWebsites.length,
            total: visibleWebsites.length,
          })}
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled
                aria-label={common("previousPage")}
                className="border-border grid size-8 place-items-center rounded-md border opacity-40"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4 rtl:rotate-180"
                />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                type="button"
                size="icon"
                aria-current="page"
                aria-label={common("pageNumber", { page: 1 })}
                className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md"
              >
                {format.number(1, "integer")}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled
                aria-label={common("nextPage")}
                className="border-border grid size-8 place-items-center rounded-md border opacity-40"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 rtl:rotate-180"
                />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Panel>
  );
}
