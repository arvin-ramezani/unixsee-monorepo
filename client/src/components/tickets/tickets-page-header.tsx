import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { DashboardButtonLink } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

export function TicketsPageHeader() {
  const t = useTranslations("Tickets");

  return (
    <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[2rem] font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {t("description")}
        </p>
      </div>
      <DashboardButtonLink
        href="/dashboard/tickets/new"
        className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg px-5 text-sm font-medium shadow-sm focus-visible:ring-2 sm:self-auto"
      >
        <Plus aria-hidden="true" className="size-5" />
        {t("newTicket")}
      </DashboardButtonLink>
    </section>
  );
}
