"use client";

import { CalendarClock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Link } from "@/i18n/navigation";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";

interface WebsiteBillingPanelProps {
  websiteName: string;
  planLabel: string;
  billing: WebsiteServiceDetails["billing"];
}

export function WebsiteBillingPanel({
  planLabel,
  billing,
}: WebsiteBillingPanelProps) {
  const t = useTranslations("WebsiteServiceDetails");
  const format = useFormatter();

  if (!billing) {
    return (
      <Panel
        id="plan-billing"
        className="p-5 sm:p-6"
        aria-labelledby="billing-heading"
      >
        <div className="flex items-start gap-3">
          <span className="bg-muted text-foreground dark:bg-link/12 dark:text-link grid size-10 shrink-0 place-items-center rounded-lg">
            <CalendarClock aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="billing-heading" className="text-lg font-semibold">
              {t("billing.title")}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t("billing.description")}
            </p>
          </div>
        </div>
        <div className="border-muted-foreground/25 bg-muted/30 mt-5 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <CalendarClock
            aria-hidden="true"
            className="text-muted-foreground size-5"
          />
          <p className="text-muted-foreground text-sm font-medium">
            {t("billing.empty")}
          </p>
        </div>
      </Panel>
    );
  }

  const rows = [
    {
      label: t("billing.startDate"),
      value: format.dateTime(new Date(billing.startDate), "shortDate"),
    },
    {
      label: t("billing.dueDate"),
      value: format.dateTime(new Date(billing.dueDate), "shortDate"),
    },
    {
      label: t("billing.cycleLabel"),
      value: t(`billing.cycle.${billing.cycle}`),
    },
    { label: t("billing.plan"), value: planLabel },
    {
      label: t("billing.amount"),
      value: format.number(billing.renewalAmount, {
        style: "currency",
        currency: billing.renewalCurrency,
      }),
    },
  ];

  return (
    <Panel
      id="plan-billing"
      className="p-5 sm:p-6"
      aria-labelledby="billing-heading"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted text-foreground dark:bg-link/12 dark:text-link grid size-10 shrink-0 place-items-center rounded-lg">
          <CalendarClock aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="billing-heading" className="text-lg font-semibold">
            {t("billing.title")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("billing.description")}
          </p>
        </div>
      </div>

      <dl className="divide-border border-border mt-5 divide-y border-y">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-1 py-3 sm:grid sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center"
          >
            <dt className="text-muted-foreground text-sm">{row.label}</dt>
            <dd className="text-sm font-medium sm:text-end">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="bg-muted text-muted-foreground mt-5 rounded-lg px-3 py-2 text-sm">
        {t("billing.unavailable")}
      </p>
      <p className="mt-3 text-sm">
        <Link
          href="/dashboard/billing"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          {t("billing.viewAll")}
        </Link>
      </p>
    </Panel>
  );
}
