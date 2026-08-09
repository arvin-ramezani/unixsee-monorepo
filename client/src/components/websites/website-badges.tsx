import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type {
  WebsiteBackup,
  WebsiteRecord,
  WebsiteStatus,
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

export function backupStyles(backup: WebsiteBackup) {
  if (backup === "successful")
    return "border-success/25 bg-success/10 text-success-foreground dark:text-success";
  if (backup === "needsReview")
    return "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning";
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

export function BackupBadge({ backup }: { backup: WebsiteBackup }) {
  const t = useTranslations("Common.backups");
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex h-8 items-center gap-2 border px-3 text-xs font-medium whitespace-nowrap",
        backupStyles(backup),
      )}
    >
      <LockKeyhole aria-hidden="true" className="size-3.5" />
      {t(backup)}
    </Badge>
  );
}
