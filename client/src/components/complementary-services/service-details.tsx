import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  LifeBuoy,
  Plus,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import {
  ComplementaryServiceStatusBadge,
  ServiceUsage,
} from "@/components/complementary-services/service-presentation";
import { Link } from "@/i18n/navigation";
import type { ComplementaryService } from "@/lib/data/complementary-services/complementary-services-data";
import { DashboardButtonLink } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

export function ServiceDetailsHeader({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices");
  const format = useFormatter();

  return (
    <header className="py-7">
      <Link
        href="/dashboard/complementary-services"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 text-sm focus-visible:ring-2"
      >
        <ArrowLeft className="size-4 rtl:-scale-x-100" />
        {t("detail.back")}
      </Link>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t(`fixtures.titles.${service.titleKey}`)}
            </h1>
            <ComplementaryServiceStatusBadge status={service.status} />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(`services.${service.serviceType}`)} · {service.websiteName} ·{" "}
            <span dir="ltr">{service.domain}</span>
          </p>
          <div className="text-muted-foreground mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-muted rounded-full border px-2.5 py-1.5">
              {t(`engagement.${service.engagementType}`)}
            </span>
            {!!service.startedAt && (
              <span className="bg-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {format.dateTime(new Date(service.startedAt), "shortDate")}
                {!!service.endsAt &&
                  ` – ${format.dateTime(new Date(service.endsAt), "shortDate")}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <DashboardButtonLink
            href={{
              pathname: "/dashboard/tickets/new",
              query: {
                service: service.serviceType,
                website: service.websiteId,
              },
            }}

            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium focus-visible:ring-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("detail.additionalWork")}
          </DashboardButtonLink>
          <DashboardButtonLink
            href={{
              pathname: "/dashboard/complementary-services/request",
              query: {
                service: service.serviceType,
                website: service.websiteId,
              },
            }}
            variant="outline"
            revealClassName="bg-muted dark:bg-accent"

            className="border-border hover:text-muted-foreground! focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-medium hover:bg-transparent! focus-visible:ring-2"
          >
            <LifeBuoy aria-hidden="true" className="size-4" />
            {t("detail.createTicket")}
          </DashboardButtonLink>

          {/* <DashboardButtonLink
            href={{
              pathname: "/dashboard/tickets/new",
              query: {
                service: service.serviceType,
                website: service.websiteId,
              },
            }}
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium focus-visible:ring-2"
          >
            <LifeBuoy aria-hidden="true" className="size-4" />
            {t("detail.createTicket")}
          </DashboardButtonLink>
          <DashboardButtonLink
            variant="outline"
            revealClassName="bg-muted dark:bg-accent"
            href={{
              pathname: "/dashboard/complementary-services/request",
              query: {
                service: service.serviceType,
                website: service.websiteId,
              },
            }}
            className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-medium focus-visible:ring-2"
          >
            {t("detail.additionalWork")}
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 rtl:-scale-x-100"
            />
          </DashboardButtonLink> */}
        </div>
      </div>
    </header>
  );
}

export function ServiceScopeCard({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices.detail");

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{t("scopeTitle")}</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("scopeDescription")}
      </p>
      <ul className="mt-5 grid gap-3">
        {service.scopeKeys.map((key) => (
          <li key={key} className="flex items-start gap-3 text-sm leading-6">
            <CircleCheck
              aria-hidden="true"
              className="text-success-foreground dark:text-success mt-0.5 size-5 shrink-0"
            />
            <span>{t(`scopeItems.${key}`)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ServiceActivityTimeline({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices.detail");
  const format = useFormatter();
  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{t("activityTitle")}</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("activityDescription")}
      </p>
      <ol className="before:bg-border relative mt-6 space-y-0 before:absolute before:inset-y-2 before:inset-s-1.75 before:w-px">
        {[...service.activity].reverse().map((event) => (
          <li key={event.id} className="relative ps-8 pb-6 last:pb-0">
            <span className="border-background bg-success absolute inset-s-0 top-1.5 size-3.5 rounded-full border-2" />
            <h3 className="text-sm font-medium">
              {t(`events.${event.eventKey}`)}
            </h3>
            <time
              dateTime={event.occurredAt}
              className="text-muted-foreground mt-1 block text-xs"
            >
              {format.dateTime(new Date(event.occurredAt), "shortDate")} ·{" "}
              {format.dateTime(new Date(event.occurredAt), "shortTime")}
            </time>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function ServiceDetailsView({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices.detail");
  return (
    <>
      <ServiceDetailsHeader service={service} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">
            {service.usage.type === "quota"
              ? t("usageTitle")
              : t("progressTitle")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {service.usage.type === "quota"
              ? t("usageDescription")
              : t("progressDescription")}
          </p>
          <div className="mt-7">
            <ServiceUsage usage={service.usage} showDate />
          </div>
        </Panel>
        <ServiceScopeCard service={service} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <ServiceActivityTimeline service={service} />
      </div>
    </>
  );
}
