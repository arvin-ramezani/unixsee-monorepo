"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import { useDashboardView } from "@/components/dashboard/views/dashboard-view-context";
import {
  CoverageBadge,
  Visitors24hValue,
} from "@/components/websites/website-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getWebsiteStatusSummary,
  websiteSummaryToneStyles,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { WebsiteRecord, WebsiteStatus } from "@/lib/websites-data";
import { EmptyWebsitesTable } from "../websites/empty-websites-table";
import { DashboardButtonLink } from "./dashboard-button-link";

const accentStyles = {
  green: "bg-success text-success-foreground",
  red: "bg-destructive text-destructive-foreground",
  violet: "bg-card text-primary",
  blue: "bg-popover text-link",
  orange: "bg-warning text-warning-foreground",
};

function statusClasses(status: WebsiteStatus) {
  if (status === "online")
    return "border-success/25 bg-success/10 text-success-foreground dark:text-success";
  if (status === "needsAttention")
    return "border-warning/35 bg-warning/15 text-warning-foreground dark:text-warning";
  return "border-border bg-muted text-muted-foreground";
}

export function WebsiteTable({ websites }: { websites: WebsiteRecord[] }) {
  const t = useTranslations("Dashboard.table");
  const dashboard = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const format = useFormatter();
  const { view } = useDashboardView();
  const { total, statusRows } = getWebsiteStatusSummary(websites);

  return (
    <>
      <Panel className="h-74.25 p-4.75 xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {dashboard("status.title")}
          </h2>
          <span className="text-muted-foreground text-xs font-medium">
            {dashboard("status.total", {
              count: format.number(total, "integer"),
            })}
          </span>
        </div>

        <div className="mt-3 space-y-0.5">
          {statusRows.map((row) => (
            <div
              key={row.status}
              className="flex h-10 items-center gap-3 text-xs"
            >
              <row.icon
                aria-hidden="true"
                className={`size-[1.1rem] ${websiteSummaryToneStyles[row.tone].icon}`}
                strokeWidth={1.7}
              />
              <span className="flex-1">
                {dashboard(`status.${row.status}`)}
              </span>
              <span className="font-semibold tabular-nums">
                {format.number(row.count, "integer")}
              </span>
              <span
                className={`ms-2 size-2 rounded-full ${websiteSummaryToneStyles[row.tone].dot}`}
              />
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/websites"
          className="text-link border-border mt-2 flex h-11 items-end justify-between border-t pt-4 text-xs font-semibold"
        >
          {dashboard("status.viewAll")}{" "}
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </Link>
      </Panel>

      <Panel id="websites" className="overflow-hidden">
        <div className="flex h-15.5 translate-y-0.5 items-center justify-between px-4.75">
          <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
          <Link
            href="/dashboard/websites"
            className="hover:bg-muted text-link focus-visible:ring-ring flex h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium focus-visible:ring-2"
          >
            {t("viewAll")}{" "}
            <span aria-hidden="true" className="rtl:rotate-180">
              →
            </span>
          </Link>
        </div>

        <DashboardFadeIn deferUntilKeyChange animationKey={view}>
          {view === "grid" && (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {websites.map((site) => (
                <article
                  key={site.domain}
                  className="border-border bg-background hover:bg-muted/30 flex flex-col rounded-xl border p-5 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-lg text-lg font-semibold",
                        accentStyles[site.tone],
                      )}
                    >
                      {site.monogram}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground truncate font-semibold">
                        {site.name}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {common(`descriptions.${site.description}`)}
                      </p>
                    </div>
                    {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.7rem] font-normal",
                          statusClasses(site.status),
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {common(`statuses.${site.status}`)}
                      </Badge>
                    ) : (
                      <CoverageBadge coverage={site.managementCoverage} />
                    )}
                  </div>
                  <Link
                    href={`https://${site.domain}`}
                    dir="ltr"
                    className="text-muted-foreground hover:text-link mt-4 inline-flex w-fit items-center gap-2 truncate text-sm"
                  >
                    {site.domain}
                    <ExternalLink
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />
                  </Link>
                  <dl className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {t("plan")}
                      </dt>
                      <dd className="mt-1">
                        {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                          <Badge
                            variant="outline"
                            className="border-border bg-muted rounded-md px-2 py-1 text-[0.7rem] font-normal"
                          >
                            {common(`plans.${site.plan}`)}
                          </Badge>
                        ) : (
                          <CoverageBadge coverage={site.managementCoverage} />
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {t("lastUpdated")}
                      </dt>
                      <dd className="mt-1 text-xs tabular-nums">
                        <time dateTime={site.updatedAt}>
                          {format.dateTime(
                            new Date(site.updatedAt),
                            "shortDate",
                          )}
                        </time>
                      </dd>
                    </div>
                  </dl>
                  <div className="border-border mt-4 border-t pt-4">
                    {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                      <Visitors24hValue visitors24h={site.visitors24h} />
                    ) : (
                      <CoverageBadge coverage={site.managementCoverage} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div
            className={cn(
              "overflow-x-auto",
              view === "grid" ? "hidden" : "hidden lg:block",
            )}
          >
            {websites.length > 0 ? (
              <Table className="w-full min-w-197.5 table-fixed text-xs">
                <caption className="sr-only">{t("caption")}</caption>
                <colgroup>
                  <col className="w-[21%]" />
                  <col className="w-[18%]" />
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[13%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <TableHeader className="text-muted-foreground">
                  <TableRow className="border-border h-10 border-b">
                    <TableHead className="ps-4.75 text-start font-medium">
                      {t("website")}
                    </TableHead>
                    <TableHead className="text-start font-medium">
                      {t("domain")}
                    </TableHead>
                    <TableHead className="text-start font-medium">
                      {t("plan")}
                    </TableHead>
                    <TableHead className="text-start font-medium">
                      {t("status")}
                    </TableHead>
                    <TableHead className="text-start font-medium">
                      {t("visitors24h")}
                    </TableHead>
                    <TableHead className="text-start font-medium">
                      {t("lastUpdated")}
                    </TableHead>
                    <TableHead>
                      <span className="">{common("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {websites.map((site) => (
                    <TableRow
                      key={site.domain}
                      className="border-border hover:bg-muted/30 h-18.25 border-b last:border-b-0"
                    >
                      <th scope="row" className="ps-4.75 text-start">
                        <span className="flex items-center gap-4">
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold",
                              accentStyles[site.tone],
                              // monogramStyles[website.tone],
                            )}
                          >
                            {site.monogram}
                          </span>
                          <span className="min-w-0">
                            <span className="text-foreground block truncate font-semibold">
                              {site.name}
                            </span>
                            <span className="text-muted-foreground mt-1 block truncate font-normal">
                              {common(`descriptions.${site.description}`)}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td>
                        <Link
                          href={`https://${site.domain}`}
                          dir="ltr"
                          className="hover:text-link inline-flex items-center gap-1.5"
                        >
                          {site.domain}
                          <ExternalLink
                            aria-hidden="true"
                            className="text-muted-foreground size-3.5"
                          />
                        </Link>
                      </td>
                      <td>
                        {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                          <Badge
                            variant="outline"
                            className="border-border bg-muted px-2 py-1 text-[0.7rem] font-normal"
                          >
                            {common(`plans.${site.plan}`)}
                          </Badge>
                        ) : (
                          <CoverageBadge coverage={site.managementCoverage} />
                        )}
                      </td>
                      <td>
                        {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.7rem] font-normal",
                              statusClasses(site.status),
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {common(`statuses.${site.status}`)}
                          </Badge>
                        ) : (
                          <CoverageBadge coverage={site.managementCoverage} />
                        )}
                      </td>
                      <td>
                        {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                          <Visitors24hValue visitors24h={site.visitors24h} />
                        ) : (
                          <CoverageBadge coverage={site.managementCoverage} />
                        )}
                      </td>
                      <td className="leading-5 tabular-nums">
                        <time dateTime={site.updatedAt}>
                          <span className="block">
                            {format.dateTime(
                              new Date(site.updatedAt),
                              "shortDate",
                            )}
                          </span>
                          <span className="text-muted-foreground block">
                            {format.dateTime(
                              new Date(site.updatedAt),
                              "shortTime",
                            )}
                          </span>
                        </time>
                      </td>
                      <td className="leading-5 tabular-nums">
                        <Link
                          href={`/dashboard/websites/${site.id}`}
                          className="border-border dark:hover:bg-accent dark:hover:border-link/12 dark:hover:text-accent-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-lg border px-4 text-xs font-medium transition-colors focus-visible:ring-2"
                        >
                          {common("view")}
                        </Link>
                      </td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="my-10 flex flex-col items-center justify-center">
                <DashboardButtonLink
                  href="/dashboard/websites/new"
                  size="xl"
                  className="h-12 px-8"
                >
                  <Plus aria-hidden="true" className="size-4" />{" "}
                  {dashboard("hero.addSite")}
                </DashboardButtonLink>
              </div>
            )}
          </div>

          <div
            className={cn(
              "space-y-2 px-3 pb-3",
              view === "grid" ? "hidden" : "lg:hidden",
            )}
          >
            {websites.map((site) => (
              <article
                key={site.domain}
                className="border-border rounded-lg border p-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg font-semibold",
                      accentStyles[site.tone],
                    )}
                  >
                    {site.monogram}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{site.name}</h3>
                    <p
                      dir="ltr"
                      className="text-muted-foreground w-fit truncate text-xs"
                    >
                      {site.domain}
                    </p>
                  </div>
                  {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-[0.7rem]",
                        statusClasses(site.status),
                      )}
                    >
                      {common(`statuses.${site.status}`)}
                    </span>
                  ) : (
                    <CoverageBadge coverage={site.managementCoverage} />
                  )}
                </div>
                <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                  {site.managementCoverage === "UNIXSEE_MANAGED" ? (
                    <Visitors24hValue visitors24h={site.visitors24h} />
                  ) : (
                    <CoverageBadge coverage={site.managementCoverage} />
                  )}
                  <time
                    dateTime={site.updatedAt}
                    className="text-muted-foreground text-xs"
                  >
                    {format.dateTime(new Date(site.updatedAt), "shortDate")}
                  </time>
                </div>
              </article>
            ))}
          </div>
        </DashboardFadeIn>
        <div className="border-border text-muted-foreground flex h-13 items-center justify-between border-t px-5 text-xs">
          <span>
            {t("summary", {
              start: 1,
              end: websites.length,
              total: websites.length,
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
                  className="border-primary size-8 rounded-md"
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
    </>
  );
}
