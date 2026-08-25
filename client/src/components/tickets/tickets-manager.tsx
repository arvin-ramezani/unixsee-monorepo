"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useReducedMotion, motion } from "framer-motion";

import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";
import { MobileFilterDisclosure } from "@/components/common/mobile-filter-disclosure";
import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import { useDashboardView } from "@/components/dashboard/views/dashboard-view-context";
import { TicketGrid } from "@/components/tickets/ticket-grid";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
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
import type { Locale } from "@/i18n/routing";
import { formatTicketRelativeActivity } from "@/lib/tickets/relative-activity";
import {
  TICKET_STATUSES,
  type TicketListItem,
  type TicketServiceCategory,
  type TicketStatus,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type TicketTab = "all" | "needs_reply" | "active" | "resolved";
type TicketsState = "ready" | "empty" | "error";

const tabs: TicketTab[] = ["all", "needs_reply", "active", "resolved"];
const pageSize = 5;

function SelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <Label className="sr-only">{label}</Label>
      <SelectTrigger className="h-11! w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TicketsManager({
  tickets,
  initialState = "ready",
}: {
  tickets: TicketListItem[];
  initialState?: TicketsState;
}) {
  const t = useTranslations("Tickets");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const [state] = useState(initialState);
  const [tab, setTab] = useState<TicketTab>("all");
  const [query, setQuery] = useState("");
  const [service, setService] = useState<"all" | TicketServiceCategory>("all");
  const [website, setWebsite] = useState("all");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const { view } = useDashboardView();
  const prefersReducedMotion = useReducedMotion();

  const services = Array.from(new Set(tickets.map((ticket) => ticket.service)));
  const websites = Array.from(
    new Map(
      tickets
        .filter((ticket) => ticket.website)
        .map((ticket) => [ticket.website!.id, ticket.website!]),
    ).values(),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredTickets = tickets
    .filter((ticket) => {
      const tabMatches =
        tab === "all" ||
        (tab === "needs_reply" && ticket.status === "WAITING_CUSTOMER") ||
        (tab === "active" &&
          (ticket.status === "SUBMITTED" || ticket.status === "IN_PROGRESS")) ||
        (tab === "resolved" &&
          (ticket.status === "RESOLVED" || ticket.status === "CLOSED"));
      const queryMatches =
        !normalizedQuery ||
        `${ticket.subject} ${ticket.number}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);

      return (
        tabMatches &&
        queryMatches &&
        (service === "all" || ticket.service === service) &&
        (website === "all" || ticket.website?.id === website) &&
        (status === "all" || ticket.status === status)
      );
    })
    .sort((a, b) => {
      const difference =
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime();
      return sort === "latest" ? difference : -difference;
    });
  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasFilters = Boolean(
    normalizedQuery ||
    tab !== "all" ||
    service !== "all" ||
    website !== "all" ||
    status !== "all",
  );

  function resetFilters() {
    setTab("all");
    setQuery("");
    setService("all");
    setWebsite("all");
    setStatus("all");
    setSort("latest");
    setPage(1);
  }

  const filters = (
    <>
      <SelectControl
        label={t("filters.serviceLabel")}
        value={service}
        onChange={(value) => {
          setService(value as "all" | TicketServiceCategory);
          setPage(1);
        }}
        options={[
          { value: "all", label: t("filters.allServices") },
          ...services.map((value) => ({
            value,
            label: t(`services.${value}`),
          })),
        ]}
      />
      <SelectControl
        label={t("filters.websiteLabel")}
        value={website}
        onChange={(value) => {
          setWebsite(value);
          setPage(1);
        }}
        options={[
          { value: "all", label: t("filters.allWebsites") },
          ...websites.map((value) => ({ value: value.id, label: value.name })),
        ]}
      />
      <SelectControl
        label={t("filters.statusLabel")}
        value={status}
        onChange={(value) => {
          setStatus(value as "all" | TicketStatus);
          setPage(1);
        }}
        options={[
          { value: "all", label: t("filters.allStatuses") },
          ...TICKET_STATUSES.map((value) => ({
            value,
            label: t(`statuses.${value}`),
          })),
        ]}
      />
      <SelectControl
        label={t("filters.sortLabel")}
        value={sort}
        onChange={(value) => setSort(value as "latest" | "oldest")}
        options={[
          { value: "latest", label: t("filters.latest") },
          { value: "oldest", label: t("filters.oldest") },
        ]}
      />
    </>
  );

  if (state === "error") {
    return (
      <Panel
        className="grid min-h-90 place-items-center px-6 text-center"
        aria-live="polite"
      >
        <div className="max-w-md">
          <span className="bg-warning/15 text-warning-foreground mx-auto grid size-12 place-items-center rounded-full">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">
            {t("states.errorTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("states.errorDescription")}
          </p>
          <DashboardButtonLink
            href="/dashboard/tickets"
            variant="outline"
            className="mt-5 min-h-10"
          >
            {t("states.retry")}
          </DashboardButtonLink>
        </div>
      </Panel>
    );
  }

  if (state === "empty" || tickets.length === 0) {
    return (
      <Panel className="grid min-h-90 place-items-center px-6 text-center">
        <div className="max-w-md">
          <span className="bg-muted text-muted-foreground mx-auto grid size-12 place-items-center rounded-full">
            <Inbox aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">
            {t("states.emptyTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("states.emptyDescription")}
          </p>
          <DashboardButtonLink
            href="/dashboard/tickets/new"
            className="bg-primary text-primary-foreground focus-visible:ring-ring mt-5 inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-medium focus-visible:ring-2"
          >
            {t("states.create")}
          </DashboardButtonLink>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="mt-8 overflow-hidden">
      <div className="flex min-h-16 items-center px-5 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("allTickets")}
        </h2>
      </div>
      <div className="overflow-y-hidden px-4 sm:px-5">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TicketTab);
            setPage(1);
          }}
        >
          <TabsList
            data-lenis-prevent
            aria-label={t("tabs.label")}
            className="border-border no-scrollbar h-auto! max-w-full gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 py-2"
          >
            {tabs.map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-muted-foreground dark:data-[state=active]:text-secondary data-[state=active]:text-primary h-full rounded border-0! border-b border-transparent bg-transparent! px-3 shadow-none! transition-colors"
              >
                {t(`tabs.${value}`)}

                {value === tab && (
                  <motion.div
                    layoutId="active-tab-underline"
                    className="bg-primary dark:bg-secondary absolute -bottom-1.5 h-1 w-full origin-center scale-y-50 rounded-full"
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
      </div>

      <div className="border-border border-b p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(220px,500px)_repeat(4,minmax(130px,170px))]">
          <Label className="relative block">
            <span className="sr-only">{t("filters.searchLabel")}</span>
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute inset-s-4 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t("filters.searchPlaceholder")}
              className="h-11 ps-11 pe-4"
            />
          </Label>
          <div className="hidden lg:contents">{filters}</div>
        </div>
        <MobileFilterDisclosure
          label={t("filters.mobile")}
          className="lg:hidden"
        >
          {filters}
        </MobileFilterDisclosure>
      </div>

      <DashboardFadeIn
        deferUntilKeyChange
        animationKey={`${view}-${tab}-${service}-${website}-${status}-${sort}-${page}`}
      >
        {visibleTickets.length === 0 ? (
          <div className="grid min-h-90 place-items-center px-6 text-center">
            <div>
              <Search
                aria-hidden="true"
                className="text-muted-foreground mx-auto size-8"
              />
              <h3 className="mt-3 font-semibold">
                {t("states.filteredTitle")}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("states.filteredDescription")}
              </p>
              {hasFilters && (
                <DashboardButton
                  type="button"
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-4 min-h-10"
                >
                  {t("states.clear")}
                </DashboardButton>
              )}
            </div>
          </div>
        ) : (
          <>
            {view === "grid" && <TicketGrid tickets={visibleTickets} />}

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
                  <col className="w-[30%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <TableHeader className="text-muted-foreground">
                  <TableRow className="h-12">
                    <TableHead className="ps-6 text-xs">
                      {t("table.ticket")}
                    </TableHead>
                    <TableHead className="text-xs">
                      {t("table.service")}
                    </TableHead>
                    <TableHead className="text-xs">
                      {t("table.website")}
                    </TableHead>
                    <TableHead className="text-xs">
                      {t("table.status")}
                    </TableHead>
                    <TableHead className="text-xs">
                      {t("table.activity")}
                    </TableHead>
                    <TableHead className="text-xs">
                      {t("table.action")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-border hover:bg-muted/30 h-19.5 border-b"
                    >
                      <TableHead
                        scope="row"
                        className="text-foreground h-auto ps-6 pe-4 text-start"
                      >
                        <span className="flex items-center gap-3">
                          {ticket.unread ? (
                            <span
                              className="bg-warning size-2 shrink-0 rounded-full"
                              aria-label={t("unread")}
                            />
                          ) : (
                            <span className="size-2 shrink-0" />
                          )}
                          <span className="min-w-0">
                            <Link
                              href={`/dashboard/tickets/${ticket.id}`}
                              className="hover:text-link focus-visible:ring-ring block truncate font-semibold focus-visible:ring-2"
                            >
                              {ticket.subject}
                            </Link>
                            <span className="text-muted-foreground mt-1 block text-start text-xs font-normal">
                              #{ticket.number}
                            </span>
                          </span>
                        </span>
                      </TableHead>
                      <TableCell>{t(`services.${ticket.service}`)}</TableCell>
                      <TableCell>
                        {ticket.website?.name ?? t("notApplicable")}
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="pe-3 text-xs leading-5">
                        <span className="block">
                          {formatTicketRelativeActivity(
                            ticket.lastActivityAt,
                            locale,
                          )}
                        </span>
                        <span className="text-muted-foreground block">
                          {t(`activity.${ticket.lastActor}`)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="border-border dark:hover:bg-accent dark:hover:border-link/12 dark:hover:text-accent-foreground hover:bg-muted focus-visible:ring-ring inline-flex min-h-9 items-center rounded-lg border px-3 text-xs font-medium focus-visible:ring-2"
                        >
                          {t("viewTicket")}
                        </Link>
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
              {visibleTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="border-border rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {ticket.unread && (
                          <span
                            className="bg-warning size-2 shrink-0 rounded-full"
                            aria-label={t("unread")}
                          />
                        )}
                        <h3 className="truncate font-semibold">
                          {ticket.subject}
                        </h3>
                      </div>
                      <p
                        dir="ltr"
                        className="text-muted-foreground mt-1 w-fit text-start text-xs"
                      >
                        #{ticket.number}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                  <dl className="border-border mt-4 grid grid-cols-2 gap-4 border-y py-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {t("table.service")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {t(`services.${ticket.service}`)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {t("table.website")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {ticket.website?.name ?? t("notApplicable")}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-muted-foreground text-xs leading-5">
                      {formatTicketRelativeActivity(
                        ticket.lastActivityAt,
                        locale,
                      )}
                      <br />
                      {t(`activity.${ticket.lastActor}`)}
                    </p>
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="border-border focus-visible:ring-ring inline-flex min-h-10 items-center rounded-lg border px-3 text-xs font-medium focus-visible:ring-2"
                    >
                      {t("viewTicket")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </DashboardFadeIn>

      <footer className="border-border text-muted-foreground flex min-h-15 items-center justify-between gap-4 border-t px-5 text-sm sm:px-6">
        <span>
          {t("pagination.summary", { count: filteredTickets.length })}
        </span>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label={t("pagination.previous")}
                variant="outline"
                size="icon-sm"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4 rtl:rotate-180"
                />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span
                className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-md"
                aria-current="page"
              >
                {format.number(currentPage, "integer")}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                type="button"
                disabled={currentPage === pageCount}
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                aria-label={t("pagination.next")}
                variant="outline"
                size="icon-sm"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 rtl:rotate-180"
                />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </Panel>
  );
}
