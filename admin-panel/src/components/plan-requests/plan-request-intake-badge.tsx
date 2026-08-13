import {
  PLAN_REQUEST_INTAKE_LABELS,
  type PlanRequestIntakeType,
} from "@/lib/plan-requests/plan-request-intake";
import { cn } from "@/lib/utils";

const INTAKE_CONFIG: Record<
  PlanRequestIntakeType,
  { className: string }
> = {
  logged_in: {
    className: "bg-primary/10 text-primary",
  },
  public: {
    className: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
};

type PlanRequestIntakeBadgeProps = {
  intakeType: PlanRequestIntakeType;
  className?: string;
};

export function PlanRequestIntakeBadge({
  intakeType,
  className,
}: PlanRequestIntakeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        INTAKE_CONFIG[intakeType].className,
        className,
      )}
    >
      {PLAN_REQUEST_INTAKE_LABELS[intakeType]}
    </span>
  );
}
