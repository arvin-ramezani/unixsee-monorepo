import { CircleHelp, ServerOff, UsersRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type {
  WebsiteManagementCoverage,
  WebsiteRecord,
  WebsiteStatus,
  WebsiteVisitors24h,
} from "@/lib/websites-data";
import { cn } from "@/lib/utils";

/** Monogram avatar background per website tone. Shared by table, card, grid. */
export const monogramStyles: Record<WebsiteRecord["tone"], string> = {
  green: "bg-success text-primary-foreground",
  violet: "bg-primary text-primary-foreground",
  blue: "bg-link text-primary-foreground",
  red: "bg-destructive text-destructive-foreground",
  orange: "bg-warning text-warning-foreground",
};

export function statusStyles(status: WebsiteStatus) {
  if (status === "online")
    return "border-success/25 bg-success/10 text-success-foreground dark:text-success";
  if (status === "needsAttention")
    return "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning";
  if (status === "maintenance") return "border-primary/15 bg-accent text-link";
  return "border-link/20 bg-popover text-link";
}

export function StatusBadge({ status }: { status: WebsiteStatus }) {
  const t = useTranslations("Common.statuses");

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex h-8 items-center gap-2 border px-3 text-xs font-medium whitespace-nowrap",
        statusStyles(status),
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      {t(status)}
    </Badge>
  );
}

export function CoverageBadge({
  coverage,
}: {
  coverage: Exclude<WebsiteManagementCoverage, "UNIXSEE_MANAGED">;
}) {
  const t = useTranslations("Common.coverage");
  const Icon = coverage === "EXTERNAL_INFRASTRUCTURE" ? ServerOff : CircleHelp;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex h-8 items-center gap-2 border px-3 text-xs font-medium whitespace-nowrap",
        coverage === "EXTERNAL_INFRASTRUCTURE"
          ? "border-border bg-muted text-foreground"
          : "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning",
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(coverage)}
    </Badge>
  );
}

export function Visitors24hValue({
  visitors24h,
}: {
  visitors24h: WebsiteVisitors24h | null;
}) {
  const t = useTranslations("Websites.visitors24h");
  const format = useFormatter();
  const uniqueVisitors =
    visitors24h?.status === "READY" ? visitors24h.uniqueVisitors : null;

  return (
    <span className="inline-flex min-h-8 items-center gap-2 text-xs whitespace-nowrap">
      <UsersRound aria-hidden="true" className="text-link size-4 shrink-0" />
      {uniqueVisitors !== null ? (
        <>
          <span className="font-semibold tabular-nums">
            {format.number(uniqueVisitors, "integer")}
          </span>
          <span className="text-muted-foreground">{t("unit")}</span>
        </>
      ) : (
        <span className="text-muted-foreground">
          {visitors24h?.status === "COLLECTING"
            ? t("collecting")
            : t("unavailable")}
        </span>
      )}
    </span>
  );
}
