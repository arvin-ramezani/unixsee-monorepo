"use client";

import { useState } from "react";
import { CalendarClock, Check, LoaderCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";
import { RadialRevealButton } from "../common/radial-reveal/radial-reveal-button";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

interface WebsiteBillingPanelProps {
  websiteName: string;
  planLabel: string;
  billing: WebsiteServiceDetails["billing"];
}

function addOneYear(isoDate: string) {
  const date = new Date(isoDate);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString();
}

export function WebsiteBillingPanel({
  websiteName,
  planLabel,
  billing,
}: WebsiteBillingPanelProps) {
  const t = useTranslations("WebsiteServiceDetails");
  const format = useFormatter();
  const [dueDate, setDueDate] = useState(billing?.dueDate ?? "");
  const [state, setState] = useState<"idle" | "pending" | "success">("idle");
  const renewedDueDate = dueDate ? addOneYear(dueDate) : "";

  async function renewService() {
    if (state === "pending") return;
    setState("pending");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setDueDate(renewedDueDate);
    setState("success");
  }

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
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-8 text-center">
          <CalendarClock aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
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
      value: format.dateTime(new Date(dueDate), "shortDate"),
    },
    {
      label: t("billing.cycleLabel"),
      value: t(`billing.cycle.${billing.cycle}`),
    },
    { label: t("billing.plan"), value: planLabel },
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

      {billing.renewable ? (
        <div className="mt-5">
          <AlertDialog>
            <AlertDialogTrigger asChild className="[&_span]:w-fit">
              <DashboardButton
                type="button"
                size={"xl"}
                className="w-full sm:w-auto"
                disabled={state === "pending"}
              >
                {state === "pending" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : state === "success" ? (
                  <Check aria-hidden="true" />
                ) : (
                  <CalendarClock aria-hidden="true" />
                )}
                {state === "pending"
                  ? t("billing.renewing")
                  : t("billing.renew")}
              </DashboardButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("billing.dialog.title", { name: websiteName })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("billing.dialog.description", {
                    amount: format.number(billing.renewalAmount, {
                      style: "currency",
                      currency: billing.renewalCurrency,
                    }),
                    cycle: t(`billing.cycle.${billing.cycle}`),
                    date: format.dateTime(
                      new Date(renewedDueDate),
                      "shortDate",
                    ),
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  asChild
                  className="h-10 rounded-[10px] [&_span]:w-fit"
                >
                  <DashboardButton size={"xl"}>
                    {t("billing.dialog.cancel")}
                  </DashboardButton>
                </AlertDialogCancel>
                <AlertDialogAction
                  asChild
                  onClick={renewService}
                  className="h-10 rounded-[10px] [&_span]:w-fit"
                >
                  <DashboardButton size="xl">
                    {t("billing.dialog.confirm")}
                  </DashboardButton>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p
            className="text-success-foreground mt-3 text-sm"
            role="status"
            aria-live="polite"
          >
            {state === "success" &&
              t("billing.success", {
                date: format.dateTime(new Date(dueDate), "shortDate"),
              })}
          </p>
        </div>
      ) : (
        <p className="bg-muted text-muted-foreground mt-5 rounded-lg px-3 py-2 text-sm">
          {t("billing.unavailable")}
        </p>
      )}
    </Panel>
  );
}
