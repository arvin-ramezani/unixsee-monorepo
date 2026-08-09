import {
  ExternalLink,
  Globe2,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WebsiteBillingPanel } from "@/components/websites/website-billing-panel";
import {
  DetailRows,
  SectionHeading,
} from "@/components/websites/website-details-shared";
import { formatRelativeValue } from "@/i18n/formats";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";
import { cn } from "@/lib/utils";
import { DashboardButtonLink } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

function SoftwarePanel({ website }: { website: WebsiteServiceDetails }) {
  const t = useTranslations("WebsiteServiceDetails");
  const locale = useLocale() as Locale;
  const updateChecked = formatRelativeValue(
    locale,
    website.software.wordpressUpdates.checked.value,
    website.software.wordpressUpdates.checked.unit,
  );
  const securityChecked = formatRelativeValue(
    locale,
    website.software.securityScan.checked.value,
    website.software.securityScan.checked.unit,
  );

  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="software-heading">
      <SectionHeading
        id="software-heading"
        icon={<Wrench aria-hidden="true" />}
        title={t("software.title")}
        description={t("software.description")}
      />
      <DetailRows
        rows={[
          {
            label: t("software.wordpress"),
            value: website.software.wordpressVersion,
            valueDirection: "ltr",
          },
          {
            label: t("software.php"),
            value: website.software.phpVersion,
            valueDirection: "ltr",
          },
          {
            label: t("software.imagick"),
            value: website.software.imagickVersion,
            valueDirection: "ltr",
          },
        ]}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="border-border bg-muted/35 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {t("software.updates.title")}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t("software.lastChecked", { relative: updateChecked })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                website.software.wordpressUpdates.status === "upToDate" &&
                  "border-success/30 bg-success/10 text-success-foreground dark:text-success",
                website.software.wordpressUpdates.status ===
                  "updatesAvailable" &&
                  "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning",
              )}
            >
              {t(
                `software.updates.${website.software.wordpressUpdates.status}`,
                { count: website.software.wordpressUpdates.count ?? 0 },
              )}
            </Badge>
          </div>
        </div>

        <div className="border-border bg-muted/35 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {t("software.security.title")}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t("software.lastChecked", { relative: securityChecked })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                website.software.securityScan.status === "noIssues" &&
                  "border-success/30 bg-success/10 text-success-foreground dark:text-success",
                website.software.securityScan.status === "issuesFound" &&
                  "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {website.software.securityScan.status === "noIssues" ? (
                <ShieldCheck aria-hidden="true" />
              ) : website.software.securityScan.status === "issuesFound" ? (
                <ShieldAlert aria-hidden="true" />
              ) : null}
              {t(`software.security.${website.software.securityScan.status}`, {
                count: website.software.securityScan.issueCount ?? 0,
              })}
            </Badge>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TrafficPanel({ website }: { website: WebsiteServiceDetails }) {
  const t = useTranslations("WebsiteServiceDetails");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const trafficFreshness = formatRelativeValue(
    locale,
    website.traffic.freshness.value,
    website.traffic.freshness.unit,
  );

  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="traffic-heading">
      <SectionHeading
        id="traffic-heading"
        icon={<Users aria-hidden="true" />}
        title={t("traffic.title")}
        description={t("traffic.description")}
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="border-border bg-muted/35 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            {t("traffic.activeNow")}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {website.traffic.activeNow === null
              ? t("common.noData")
              : format.number(website.traffic.activeNow, "integer")}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("traffic.measured", { relative: trafficFreshness })}
          </p>
        </div>
        <div className="border-border bg-muted/35 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            {t("traffic.last24Hours")}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {website.traffic.activeLast24Hours === null
              ? t("common.noData")
              : format.number(website.traffic.activeLast24Hours, "integer")}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("traffic.definition")}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ServicePanel({
  website,
  planLabel,
}: {
  website: WebsiteServiceDetails;
  planLabel: string;
}) {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="service-heading">
      <SectionHeading
        id="service-heading"
        icon={<Globe2 aria-hidden="true" />}
        title={t("service.title")}
        description={t("service.description")}
      />
      <DetailRows
        rows={[
          {
            label: t("service.domain"),
            value: (
              <Link
                href={website.links.publicWebsite}
                target="_blank"
                rel="noreferrer"
                aria-label={`${website.domain} — ${t("actions.opensNewTab")}`}
                className="text-link inline-flex items-center gap-1 hover:underline"
              >
                {website.domain}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </Link>
            ),
            valueDirection: "ltr",
          },
          { label: t("service.plan"), value: planLabel },
          {
            label: t("service.location"),
            value: t(`service.locations.${website.service.serverLocation}`),
          },
          {
            label: t("service.controlPanel"),
            value: website.links.directAdmin ? (
              <Link
                href={website.links.directAdmin}
                target="_blank"
                rel="noreferrer"
                aria-label={`${website.service.controlPanel} — ${t("actions.opensNewTab")}`}
                className="text-link inline-flex items-center gap-1 hover:underline"
              >
                {website.service.controlPanel}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </Link>
            ) : (
              website.service.controlPanel
            ),
            valueDirection: "ltr",
          },
        ]}
      />
    </Panel>
  );
}

function SupportRecovery({ website }: { website: WebsiteServiceDetails }) {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <Panel
      id="support-recovery"
      className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between"
      aria-labelledby="support-heading"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted text-foreground dark:bg-link/12 dark:text-link grid size-10 shrink-0 place-items-center rounded-lg">
          <LifeBuoy aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 id="support-heading" className="text-lg font-semibold">
            {t("support.title")}
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
            {website.availability === "unavailable"
              ? t("support.unavailableDescription")
              : t("support.description")}
          </p>
        </div>
      </div>
      <DashboardButtonLink
        variant="outline"
        className="w-full md:w-auto"
        href={`/dashboard/tickets/new?website=${website.id}`}
      >
        <Ticket aria-hidden="true" />
        {t("actions.openTicket")}
      </DashboardButtonLink>
    </Panel>
  );
}

export function WebsiteDetailsInformation({
  website,
  planLabel,
}: {
  website: WebsiteServiceDetails;
  planLabel: string;
}) {
  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)] lg:gap-6">
        <div className="space-y-5 sm:space-y-6">
          <SoftwarePanel website={website} />
          <TrafficPanel website={website} />
          <SupportRecovery website={website} />
        </div>
        <aside className="space-y-5 sm:space-y-6">
          <ServicePanel website={website} planLabel={planLabel} />
          <WebsiteBillingPanel
            websiteName={website.name}
            planLabel={planLabel}
            billing={website.billing}
          />
        </aside>
      </div>
    </>
  );
}
