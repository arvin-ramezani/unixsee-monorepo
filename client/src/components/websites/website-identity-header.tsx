import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  AvailabilityIcon,
  availabilityStyles,
  monogramStyles,
} from "@/components/websites/website-details-shared";
import { formatRelativeValue } from "@/i18n/formats";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";
import { cn } from "@/lib/utils";

export function WebsiteIdentityHeader({
  website,
  planLabel,
}: {
  website: WebsiteServiceDetails;
  planLabel: string;
}) {
  const t = useTranslations("WebsiteServiceDetails");
  const locale = useLocale() as Locale;
  const isExternal = website.managementCoverage !== "UNIXSEE_MANAGED";
  const relativeCheck = website.lastChecked
    ? formatRelativeValue(locale, website.lastChecked.value, website.lastChecked.unit)
    : null;

  return (
    <header className="flex flex-col gap-5 py-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-xl border border-current/10 text-xl font-semibold shadow-sm sm:size-16",
            monogramStyles[website.tone],
          )}
          aria-hidden="true"
        >
          {website.monogram}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[2rem]">
              {website.name}
            </h1>
            {isExternal ? (
              <Badge variant="secondary" className="h-7 gap-1.5 px-2.5">
                {t("common.externalHosting")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  "h-7 gap-1.5 px-2.5",
                  availabilityStyles[website.availability ?? "unknown"],
                )}
              >
                <span className="[&>svg]:size-3.5">
                  <AvailabilityIcon status={website.availability ?? "unknown"} />
                </span>
                {t(`availability.${website.availability ?? "unknown"}.label`)}
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span>{t("header.managedPlan", { plan: planLabel })}</span>
            <span aria-hidden="true" className="hidden sm:inline">
              •
            </span>
            <Link
              href={website.links?.publicWebsite ?? `https://${website.domain}`}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              aria-label={`${website.domain} — ${t("actions.opensNewTab")}`}
              className="text-link focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm hover:underline focus-visible:ring-2"
            >
              {website.domain}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <p className="text-muted-foreground mt-2 text-sm">
            {relativeCheck ? t("header.lastChecked", { relative: relativeCheck }) : t("common.noData")}
            {website.latestCheckCode && (
              <>
                {" — "}
                <span dir="ltr" className="text-foreground font-mono">
                  {website.latestCheckCode}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </header>
  );
}
