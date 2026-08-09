import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Panel } from "../dashboard/panel";
import { DashboardButtonLink } from "@/components/dashboard/dashboard-button-link";
import { complementaryServicesQuickActions } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export type ServicesQuickActionsProps = {
  className?: string;
};

export default function ServicesQuickActions({
  className,
}: ServicesQuickActionsProps) {
  const t = useTranslations("ComplementaryServices.requestAside");

  return (
    <Panel className={cn("p-5", className)}>
      <h2 className="text-lg font-semibold">{t("quickActions.title")}</h2>

      <nav
        aria-label={t("quickActions.label")}
        className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-1"
      >
        {complementaryServicesQuickActions.map(({ key, tab, icon: Icon }) => (
          <DashboardButtonLink
            key={tab}
            variant="outline"
            href={{
              pathname: "/dashboard/complementary-services",
              query: { tab },
            }}
            revealClassName="bg-muted dark:bg-accent"
            className="group border-border hover:text-foreground! focus-visible:ring-ring flex min-h-11 items-center justify-start gap-3 border px-3.5 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ltr:font-medium [&_span]:w-full"
          >
            <Icon
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
            />
            <span className="min-w-0 flex-1 text-start">
              {t(`quickActions.${key}`)}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="text-muted-foreground ms-auto size-4 shrink-0 rtl:-scale-x-100"
            />
          </DashboardButtonLink>
        ))}
      </nav>
    </Panel>
  );
}
