import {
  AUTHORIZATION_STATUS,
  AUTHORIZATION_STATUS_LABELS,
  type AuthorizationStatusType,
} from "@/lib/data/authorization-data";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  AuthorizationStatusType,
  { className: string; icon: string }
> = {
  [AUTHORIZATION_STATUS.DRAFT]: {
    className: "bg-muted text-muted-foreground",
    icon: "📝",
  },
  [AUTHORIZATION_STATUS.PENDING_REVIEW]: {
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: "⏳",
  },
  [AUTHORIZATION_STATUS.NEEDS_MORE_INFO]: {
    className: "bg-primary/10 text-primary",
    icon: "📎",
  },
  [AUTHORIZATION_STATUS.REJECTED]: {
    className: "bg-destructive/10 text-destructive",
    icon: "✕",
  },
  [AUTHORIZATION_STATUS.APPROVED]: {
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: "✓",
  },
};

type AuthorizationStatusBadgeProps = {
  status: AuthorizationStatusType;
  className?: string;
};

export function AuthorizationStatusBadge({
  status,
  className,
}: AuthorizationStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        config.className,
        className,
      )}
    >
      <span aria-hidden>{config.icon}</span>
      {AUTHORIZATION_STATUS_LABELS[status]}
    </span>
  );
}
