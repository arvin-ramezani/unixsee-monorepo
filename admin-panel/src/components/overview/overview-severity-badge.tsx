import { AlertOctagon, AlertTriangle, Info } from "lucide-react";

import {
  OVERVIEW_SEVERITY,
  OVERVIEW_SEVERITY_LABELS,
  type OverviewSeverityType,
} from "@/lib/data/overview-data";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<
  OverviewSeverityType,
  { className: string; icon: typeof AlertOctagon }
> = {
  [OVERVIEW_SEVERITY.CRITICAL]: {
    className: "bg-destructive/10 text-destructive",
    icon: AlertOctagon,
  },
  [OVERVIEW_SEVERITY.WARNING]: {
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
  },
  [OVERVIEW_SEVERITY.INFO]: {
    className: "bg-muted text-muted-foreground",
    icon: Info,
  },
};

type OverviewSeverityBadgeProps = {
  severity: OverviewSeverityType;
  className?: string;
};

export function OverviewSeverityBadge({
  severity,
  className,
}: OverviewSeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {OVERVIEW_SEVERITY_LABELS[severity]}
    </span>
  );
}
