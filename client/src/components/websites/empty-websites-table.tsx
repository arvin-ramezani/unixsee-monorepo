import { Search } from "lucide-react";
import { DashboardButton } from "../dashboard/dashboard-button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type EmptyWebsitesTableProps = {
  className?: string;
  resetFilters: () => void;
};

export function EmptyWebsitesTable({
  className,
  resetFilters,
}: EmptyWebsitesTableProps) {
  const t = useTranslations("Websites");

  return (
    <div
      className={cn(
        "border-border grid min-h-60 place-items-center border-b px-6 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <Search
          aria-hidden="true"
          className="text-muted-foreground mx-auto size-8"
        />
        <h3 className="mt-3 font-semibold">{t("table.emptyTitle")}</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("table.emptyDescription")}
        </p>
        <DashboardButton
          type="button"
          variant="outline"
          size="xl"
          onClick={resetFilters}
          className="border-border mt-4 h-9 rounded-lg border px-4 text-sm font-medium"
        >
          {t("table.clearFilters")}
        </DashboardButton>
      </div>
    </div>
  );
}
