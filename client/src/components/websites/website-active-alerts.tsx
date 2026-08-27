import { AlertCircle, AlertTriangle, BellRing, Ticket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WebsiteDetailsActionButton } from "@/components/websites/website-details-action-button";
import { Link } from "@/i18n/navigation";
import { formatRelativeValue } from "@/i18n/formats";
import type { Locale } from "@/i18n/routing";
import type {
  WebsiteAlert,
  WebsiteAlertSeverity,
  WebsiteServiceDetails,
} from "@/lib/data/websites/website-service-details";
import { cn } from "@/lib/utils";

const alertStyles: Record<WebsiteAlertSeverity, string> = {
  critical: "border-destructive/35 bg-destructive/5",
  warning: "border-warning/40 bg-warning/10",
  info: "border-link/25 bg-popover/70",
};

function AlertIcon({ severity }: { severity: WebsiteAlertSeverity }) {
  if (severity === "critical") return <AlertCircle aria-hidden="true" />;
  if (severity === "warning") return <AlertTriangle aria-hidden="true" />;
  return <BellRing aria-hidden="true" />;
}

function AlertItem({
  alert,
  website,
}: {
  alert: WebsiteAlert;
  website: WebsiteServiceDetails;
}) {
  const t = useTranslations("WebsiteServiceDetails");
  // const format = useFormatter();
  const locale = useLocale() as Locale;
  const detected = formatRelativeValue(
    locale,
    alert.detected.value,
    alert.detected.unit,
  );

  const description = (() => {
    if (alert.kind === "unavailable") {
      return t("alerts.items.unavailable.description", {
        code: alert.technicalCode ?? "HTTP 503",
      });
    }
    if (alert.kind === "updates") {
      return t("alerts.items.updates.description", {
        count: website.software?.wordpressUpdates.count ?? 0,
      });
    }
    if (alert.kind === "security") {
      return t("alerts.items.security.description", {
        count: website.software?.securityScan.issueCount ?? 0,
      });
    }
    if (alert.kind === "statusUnknown") {
      return t("alerts.items.statusUnknown.description");
    }
    return t("alerts.items.renewal.description");
  })();

  return (
    <Alert
      className={cn(
        "grid-cols-[auto_minmax(0,1fr)] gap-x-3 px-4 py-4 sm:px-5",
        alertStyles[alert.severity],
      )}
    >
      <AlertIcon severity={alert.severity} />
      <AlertTitle className="line-clamp-none text-base">
        {t(`alerts.items.${alert.kind}.title`)}
      </AlertTitle>
      <AlertDescription className="mt-1 gap-3">
        <p>{description}</p>

        <p className="text-muted-foreground text-xs">
          {t("alerts.detected", { relative: detected })}
          {alert.technicalCode && (
            <>
              {" "}
              <span dir="ltr" className="text-foreground font-mono">
                {alert.technicalCode}
              </span>
            </>
          )}
        </p>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          {alert.kind === "unavailable" ||
            (alert.kind === "statusUnknown" && (
              <WebsiteDetailsActionButton
                kind="retryStatus"
                idleLabel={t("actions.checkAgain")}
                pendingLabel={t("actions.checking")}
                successLabel={t("actions.checked")}
                className="sm:w-auto"
              />
            ))}

          {alert.kind === "security" && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/tickets/new?website=${website.id}`}>
                {t("actions.openTicket")}
                <Ticket aria-hidden="true" />
              </Link>
            </Button>
          )}

          {alert.kind === "renewal" && (
            <Button asChild variant="outline">
              <Link href="#billing-heading">{t("actions.renewService")}</Link>
            </Button>
          )}

          {alert.kind === "unavailable" && (
            <Button asChild variant="destructive">
              <Link href={`/dashboard/tickets/new?website=${website.id}`}>
                {t("actions.openTicket")}
                <Ticket aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function WebsiteActiveAlerts({
  website,
}: {
  website: WebsiteServiceDetails;
}) {
  const t = useTranslations("WebsiteServiceDetails");
  if ((website.alerts ?? []).length === 0) return null;

  const priority: Record<WebsiteAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  const sortedAlerts = [...(website.alerts ?? [])].sort(
    (first, second) => priority[first.severity] - priority[second.severity],
  );

  return (
    <section id="active-alerts" aria-labelledby="alerts-heading">
      <div className="mb-4">
        <h2 id="alerts-heading" className="text-lg font-semibold">
          {t("alerts.title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("alerts.description")}
        </p>
      </div>

      <div className="space-y-3">
        {sortedAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} website={website} />
        ))}
      </div>
    </section>
  );
}
