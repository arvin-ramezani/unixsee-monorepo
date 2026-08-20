import {
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  FilePenLine,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  AUTHORIZATION_STATUS,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";
import { cn } from "@/lib/utils";

const styles: Record<AuthorizationStatus, string> = {
  [AUTHORIZATION_STATUS.NOT_STARTED]:
    "border-border bg-muted text-muted-foreground",
  [AUTHORIZATION_STATUS.DRAFT]: "border-border bg-muted text-muted-foreground",
  [AUTHORIZATION_STATUS.PENDING_REVIEW]:
    "border-warning/50 bg-warning/20 text-warning-foreground dark:text-warning",
  [AUTHORIZATION_STATUS.NEEDS_MORE_INFO]:
    "border-link/20 bg-accent text-link",
  [AUTHORIZATION_STATUS.REJECTED]:
    "border-destructive/30 bg-destructive/10 text-destructive",
  [AUTHORIZATION_STATUS.APPROVED]:
    "border-success/25 bg-success/10 text-success-foreground dark:text-success",
};

const icons = {
  [AUTHORIZATION_STATUS.NOT_STARTED]: CircleDashed,
  [AUTHORIZATION_STATUS.DRAFT]: FilePenLine,
  [AUTHORIZATION_STATUS.PENDING_REVIEW]: Clock3,
  [AUTHORIZATION_STATUS.NEEDS_MORE_INFO]: CircleAlert,
  [AUTHORIZATION_STATUS.REJECTED]: CircleAlert,
  [AUTHORIZATION_STATUS.APPROVED]: ShieldCheck,
} as const;

export function AuthorizationStatusBadge({
  status,
  className,
}: {
  status: AuthorizationStatus;
  className?: string;
}) {
  const t = useTranslations("Authorization.statuses");
  const Icon = icons[status] ?? CheckCircle2;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex min-h-8 items-center gap-2 border px-3 py-1 text-xs font-medium whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(status)}
    </Badge>
  );
}
