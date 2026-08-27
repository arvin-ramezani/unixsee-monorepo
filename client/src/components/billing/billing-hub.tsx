"use client";

import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Inbox,
  Layers3,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useReducedMotion, motion } from "framer-motion";

import { DashboardButtonLink } from "@/components/dashboard/dashboard-button-link";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type {
  BillingHubKindFilter,
  BillingHubState,
  BillingItemStatus,
  CustomerBillingHubItem,
} from "@/lib/billing/types";
import { cn } from "@/lib/utils";

const kindTabs: BillingHubKindFilter[] = [
  "all",
  "MANAGED_PLAN",
  "COMPLEMENTARY_SERVICE",
];

const statusStyles: Record<BillingItemStatus, string> = {
  ACTIVE:
    "border-success/25 bg-success/10 text-success-foreground dark:text-success",
  SCHEDULED: "border-link/20 bg-accent text-link",
  PAUSED: "border-warning/40 bg-warning/15 text-warning-foreground",
  EXPIRED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function websiteLabel(item: CustomerBillingHubItem): string {
  const name = item.website.displayName?.trim();
  return name || item.website.domain;
}

function dueIso(item: CustomerBillingHubItem): string | null {
  return item.renewsAt ?? item.periodEndsAt;
}

function BillingStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Billing.statuses");
  const known =
    status === "ACTIVE" ||
    status === "SCHEDULED" ||
    status === "PAUSED" ||
    status === "EXPIRED"
      ? status
      : null;

  if (!known) {
    return (
      <Badge variant="outline" className="text-xs font-medium">
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex min-h-8 items-center border px-3 py-1 text-xs font-medium whitespace-nowrap",
        statusStyles[known],
      )}
    >
      {t(known)}
    </Badge>
  );
}

function SummaryStrip({ items }: { items: CustomerBillingHubItem[] }) {
  const t = useTranslations("Billing.summary");
  const activePlans = items.filter(
    (item) => item.kind === "MANAGED_PLAN" && item.status === "ACTIVE",
  ).length;
  const complementary = items.filter(
    (item) => item.kind === "COMPLEMENTARY_SERVICE",
  ).length;
  const expired = items.filter((item) => item.status === "EXPIRED").length;

  const cards = [
    {
      key: "activePlans",
      label: t("activePlans"),
      value: activePlans,
      icon: CreditCard,
    },
    {
      key: "complementary",
      label: t("complementary"),
      value: complementary,
      icon: Layers3,
    },
    {
      key: "expired",
      label: t("expired"),
      value: expired,
      icon: CalendarClock,
    },
  ] as const;

  return (
    <div className="mt-2 grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Panel key={card.key} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
            </div>
            <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
              <card.icon aria-hidden="true" className="size-4" />
            </span>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function BillingHelpCallout() {
  const t = useTranslations("Billing.help");

  return (
    <Panel className="mt-6 p-5 sm:p-6">
      <p className="text-muted-foreground text-sm leading-6">
        {t("renewalNote")}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <DashboardButtonLink href="/dashboard/tickets/new" size="lg">
          {t("openTicket")}
        </DashboardButtonLink>
      </div>
    </Panel>
  );
}

function BillingItemRow({ item }: { item: CustomerBillingHubItem }) {
  const t = useTranslations("Billing");
  const format = useFormatter();
  const locale = useLocale();
  const due = dueIso(item);
  const amount = Number(item.amount);
  const planName =
    item.plan &&
    (locale.startsWith("fa") ? item.plan.nameFa : item.plan.nameEn);

  return (
    <article className="border-border flex flex-col gap-4 border-b px-5 py-5 last:border-b-0 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight">
            {planName?.trim() || item.labelSnapshot}
          </h3>
          <BillingStatusBadge status={item.status} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(
            `kinds.${item.kind === "COMPLEMENTARY_SERVICE" ? "service" : "plan"}`,
          )}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">{t("fields.website")}: </span>
          <Link
            href={`/dashboard/websites/${item.website.id}`}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {websiteLabel(item)}
          </Link>
        </p>
      </div>

      <dl className="grid w-full max-w-xl grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">{t("fields.amount")}</dt>
          <dd className="mt-1 font-medium">
            {Number.isFinite(amount)
              ? format.number(amount, {
                  style: "currency",
                  currency: item.currency || "IRR",
                })
              : String(item.amount)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("fields.interval")}</dt>
          <dd className="mt-1 font-medium">
            {t(
              `intervals.${
                item.interval === "MONTHLY" ||
                item.interval === "QUARTERLY" ||
                item.interval === "YEARLY" ||
                item.interval === "NONE"
                  ? item.interval
                  : "NONE"
              }`,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {item.interval === "NONE"
              ? t("fields.periodEnd")
              : t("fields.renews")}
          </dt>
          <dd className="mt-1 font-medium">
            {due
              ? format.dateTime(new Date(due), "shortDate")
              : t("fields.notApplicable")}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function BillingHub({
  items,
  initialState = "ready",
  kindFilter = "all",
  websiteId,
}: {
  items: CustomerBillingHubItem[];
  initialState?: BillingHubState;
  kindFilter?: BillingHubKindFilter;
  websiteId?: string;
}) {
  const t = useTranslations("Billing");
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  function pushFilters(nextKind: BillingHubKindFilter) {
    const params = new URLSearchParams();
    if (nextKind !== "all") {
      params.set("kind", nextKind);
    }
    if (websiteId) {
      params.set("websiteId", websiteId);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  if (initialState === "error") {
    return (
      <>
        <Panel className="mt-6 grid min-h-90 place-items-center px-6 text-center">
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
              href="/dashboard/billing"
              variant="outline"
              className="mt-5 min-h-10"
            >
              {t("states.retry")}
            </DashboardButtonLink>
          </div>
        </Panel>
        <BillingHelpCallout />
      </>
    );
  }

  if (initialState === "empty" || items.length === 0) {
    const filtered = kindFilter !== "all" || !!websiteId;
    return (
      <>
        {kindFilter !== "all" && (
          <Panel className="mt-6 overflow-hidden">
            <div className="flex min-h-16 items-center px-5 sm:px-6">
              <h2 className="text-xl font-semibold tracking-tight">
                {t("listTitle")}
              </h2>
            </div>
            <div className="overflow-x-hidden px-4 sm:px-5">
              <Tabs
                value={kindFilter}
                onValueChange={(value) => {
                  pushFilters(value as BillingHubKindFilter);
                }}
              >
                <TabsList
                  aria-label={t("tabs.label")}
                  className="border-border no-scrollbar h-auto! max-w-full gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 py-2"
                >
                  {kindTabs.map((value) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="text-muted-foreground dark:data-[state=active]:text-secondary data-[state=active]:text-primary relative h-full rounded border-0! border-b border-transparent bg-transparent! px-3 shadow-none! transition-colors"
                    >
                      {t(`tabs.${value}`)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </Panel>
        )}
        <Panel className="mt-6 grid min-h-90 place-items-center px-6 text-center">
          <div className="max-w-md">
            <span className="bg-muted text-muted-foreground mx-auto grid size-12 place-items-center rounded-full">
              <Inbox aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              {filtered
                ? t("states.emptyFilteredTitle")
                : t("states.emptyTitle")}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {filtered
                ? t("states.emptyFilteredDescription")
                : t("states.emptyDescription")}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {filtered ? (
                <DashboardButtonLink href="/dashboard/billing">
                  {t("states.clearFilters")}
                </DashboardButtonLink>
              ) : (
                <>
                  <DashboardButtonLink href="/dashboard/websites">
                    {t("states.viewWebsites")}
                  </DashboardButtonLink>
                  <DashboardButtonLink
                    href="/dashboard/plans"
                    variant="outline"
                  >
                    {t("states.requestPlan")}
                  </DashboardButtonLink>
                </>
              )}
            </div>
          </div>
        </Panel>
        <BillingHelpCallout />
      </>
    );
  }

  return (
    <>
      <SummaryStrip items={items} />

      <Panel className="mt-6 overflow-hidden">
        <div className="flex min-h-16 items-center px-5 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("listTitle")}
          </h2>
        </div>

        <div className="overflow-x-hidden px-4 sm:px-5">
          <Tabs
            value={kindFilter}
            onValueChange={(value) => {
              pushFilters(value as BillingHubKindFilter);
            }}
          >
            <TabsList
              aria-label={t("tabs.label")}
              className="border-border no-scrollbar h-auto! max-w-full gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 py-2"
            >
              {kindTabs.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-muted-foreground dark:data-[state=active]:text-secondary data-[state=active]:text-primary relative h-full rounded border-0! border-b border-transparent bg-transparent! px-3 shadow-none! transition-colors"
                >
                  {t(`tabs.${value}`)}
                  {value === kindFilter && (
                    <motion.div
                      layoutId="billing-kind-underline"
                      className="bg-primary dark:bg-secondary absolute -bottom-1.5 h-1 w-full origin-center scale-y-50 rounded-full"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {!!websiteId && (
          <p className="text-muted-foreground border-border border-b px-5 py-3 text-sm sm:px-6">
            {t("filteredByWebsite")}
          </p>
        )}

        <div>
          {items.map((item) => (
            <BillingItemRow key={item.id} item={item} />
          ))}
        </div>
      </Panel>

      <BillingHelpCallout />
    </>
  );
}
