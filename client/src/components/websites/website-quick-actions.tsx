import { ExternalLink, Gauge, PanelsTopLeft, Server } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { WebsiteDetailsActionButton } from "@/components/websites/website-details-action-button";
import { SectionHeading } from "@/components/websites/website-details-shared";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

/**
 * Single home for website tools. "What can I do next?" is expressed here for the
 * general/healthy case: the card matching `recommendedAction` is promoted to a
 * primary style with a "Recommended" marker. Problem-state actions live on their
 * alert card (see WebsiteActiveAlerts), so no action is ever duplicated.
 */
export function WebsiteQuickActions({
  website,
}: {
  website: WebsiteServiceDetails;
}) {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="quick-actions-heading">
      <SectionHeading
        id="quick-actions-heading"
        icon={<Gauge aria-hidden="true" />}
        title={t("quickActions.title")}
        description={t("quickActions.description")}
      />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {/* <WebsiteDetailsActionButton
          kind="clearCache"
          idleLabel={t("actions.clearCache")}
          pendingLabel={t("actions.clearingCache")}
          successLabel={t("actions.cacheCleared")}
          description={t("quickActions.cacheDescription")}
          className="[&_button]:h-auto [&_button]:min-h-20 [&_button]:p-4"
        /> */}

        {website.links.directAdmin ? (
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-20 justify-start gap-3 p-4 whitespace-normal"
          >
            <Link
              href={website.links.directAdmin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("actions.openDirectAdmin")} — ${t("actions.opensNewTab")}`}
            >
              <Server aria-hidden="true" className="size-5 shrink-0" />
              <span className="min-w-0 text-start">
                <span className="block">{t("actions.openDirectAdmin")}</span>
                <span className="text-muted-foreground mt-1 block text-xs font-normal">
                  {t("quickActions.directAdminDescription")}
                </span>
              </span>
              <ExternalLink
                aria-hidden="true"
                className="ms-auto size-4 shrink-0 rtl:-scale-x-100"
              />
            </Link>
          </Button>
        ) : (
          <div className="border-border text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
            {t("quickActions.directAdminUnavailable")}
          </div>
        )}

        {!!website.links.wordPressAdmin && (
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-20 justify-start gap-3 p-4 whitespace-normal"
          >
            <Link
              href={website.links.wordPressAdmin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("actions.openWordPress")} — ${t("actions.opensNewTab")}`}
            >
              <PanelsTopLeft aria-hidden="true" className="size-5 shrink-0" />
              <span className="min-w-0 text-start">
                <span className="block">{t("actions.openWordPress")}</span>
                <span
                  className={cn(
                    "text-primary-foreground/70 mt-1 block text-xs font-normal",
                  )}
                >
                  {t("quickActions.wordpressDescription")}
                </span>
              </span>
              <ExternalLink
                aria-hidden="true"
                className="ms-auto size-4 shrink-0 rtl:-scale-x-100"
              />
            </Link>
          </Button>
        )}
      </div>
    </Panel>
  );
}
