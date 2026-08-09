import {
  PLAN_REQUEST_STATUS,
  PLAN_REQUEST_STATUS_LABELS,
  type PlanRequestStatusType,
} from "@/lib/data/plan-requests-data";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  PlanRequestStatusType,
  { className: string }
> = {
  [PLAN_REQUEST_STATUS.PENDING]: {
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  [PLAN_REQUEST_STATUS.READY_TO_ENABLE]: {
    className: "bg-primary/10 text-primary",
  },
  [PLAN_REQUEST_STATUS.ENABLED]: {
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  [PLAN_REQUEST_STATUS.DECLINED]: {
    className: "bg-destructive/10 text-destructive",
  },
  [PLAN_REQUEST_STATUS.CANCELLED]: {
    className: "bg-muted text-muted-foreground",
  },
};

type PlanRequestStatusBadgeProps = {
  status: PlanRequestStatusType;
  className?: string;
};

export function PlanRequestStatusBadge({
  status,
  className,
}: PlanRequestStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_CONFIG[status].className,
        className,
      )}
    >
      {PLAN_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
