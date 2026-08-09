import {
  ArrowUpRight,
  CircleHelp,
  History,
  Layers3,
  MessagesSquare,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Panel } from "@/components/dashboard/panel";
import { Link } from "@/i18n/navigation";
import { DashboardButtonLink } from "@/app/[locale]/(dashboard)/dashboard/_components/common";
import { cn } from "@/lib/utils";
import { complementaryServicesQuickActions } from "@/lib/dashboard-data";
import ServicesQuickActions from "./services-quick-actions";

export async function RequestServiceAside({
  className,
}: {
  className?: string;
}) {
  const t = await getTranslations("ComplementaryServices.requestAside");

  return (
    <aside
      aria-label={t("label")}
      className={cn("grid gap-5 xl:sticky xl:top-24", className)}
    >
      <ServicesQuickActions className="hidden xl:block" />

      <Panel className="flex flex-col p-5">
        <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-full">
          <CircleHelp aria-hidden="true" className="size-5" />
        </span>

        <h2 className="mt-4 text-lg font-semibold">{t("help.title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t("help.description")}
        </p>

        <DashboardButtonLink
          size={"xl"}
          href={{
            pathname: "/dashboard/tickets/new",
            query: { context: "complementary-services" },
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring mt-5 inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:ms-auto sm:w-fit xl:w-full"
        >
          {t("help.action")}
        </DashboardButtonLink>
      </Panel>
    </aside>
  );
}
