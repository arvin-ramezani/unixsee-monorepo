import { useTranslations } from "next-intl";

import { WebsiteActiveAlerts } from "@/components/websites/website-active-alerts";
import { WebsiteDetailsInformation } from "@/components/websites/website-details-information";
import { WebsiteIdentityHeader } from "@/components/websites/website-identity-header";
import { WebsiteQuickActions } from "@/components/websites/website-quick-actions";
import { WebsiteStatusSummary } from "@/components/websites/website-status-summary";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";

export function WebsiteDetailsView({
  website,
}: {
  website: WebsiteServiceDetails;
}) {
  const common = useTranslations("Common");
  const planLabel = website.plan
    ? common(`plans.${website.plan}`)
    : common("plans.none");

  return (
    <div className="mx-auto w-full pb-4">
      <WebsiteIdentityHeader website={website} planLabel={planLabel} />

      <div className="space-y-5 sm:space-y-6">
        <WebsiteStatusSummary website={website} />
        <WebsiteActiveAlerts website={website} />
        <WebsiteQuickActions website={website} />
        <WebsiteDetailsInformation website={website} planLabel={planLabel} />
      </div>
    </div>
  );
}
