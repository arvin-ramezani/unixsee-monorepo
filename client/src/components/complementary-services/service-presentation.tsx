import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import type {
  ComplementaryServiceStatus,
  ServiceUsage as ServiceUsageModel,
} from "@/lib/data/complementary-services/complementary-services-data";
import { cn } from "@/lib/utils";

const statusIcons = {
  requested: Clock3,
  active: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
  expired: AlertTriangle,
} as const;

export function ComplementaryServiceStatusBadge({
  status,
}: {
  status: ComplementaryServiceStatus;
}) {
  const t = useTranslations("ComplementaryServices.statuses");
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        status === "active" &&
          "border-success/30 bg-success/10 text-success-foreground dark:text-success",
        status === "requested" && "border-link/25 bg-accent text-link",
        status === "completed" &&
          "border-success/20 bg-success/5 dark:text-success text-success-foreground",
        status === "cancelled" &&
          "border-border bg-muted text-muted-foreground",
        status === "expired" &&
          "border-warning/35 bg-warning/10 text-warning-foreground dark:text-warning",
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(status)}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className="bg-muted h-2 overflow-hidden rounded-full"
    >
      <div
        className={cn(
          "bg-success h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
          value >= 80 && "bg-warning",
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function QuotaProgress({
  usage,
}: {
  usage: Extract<ServiceUsageModel, { type: "quota" }>;
}) {
  const t = useTranslations("ComplementaryServices.usage");
  const remaining = Math.max(usage.total - usage.used, 0);
  const percentage = usage.total ? (usage.used / usage.total) * 100 : 0;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {t("remaining", {
              remaining,
              total: usage.total,
              unit: t(`units.${usage.unit}`),
            })}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("used", { used: usage.used, total: usage.total })}
          </p>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {Math.round(percentage)}%
        </span>
      </div>
      <ProgressBar value={percentage} label={t("quotaLabel")} />
      {remaining === 0 && (
        <p className="text-warning-foreground dark:text-warning/70 mt-2 text-xs font-medium">
          {t("exhausted")}
        </p>
      )}
    </div>
  );
}

export function ProjectProgress({
  usage,
}: {
  usage: Extract<ServiceUsageModel, { type: "project" }>;
}) {
  const t = useTranslations("ComplementaryServices.usage");
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {t(`stages.${usage.stageKey}`)}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("projectStage")}
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {usage.progress}%
        </span>
      </div>
      <ProgressBar value={usage.progress} label={t("projectLabel")} />
    </div>
  );
}

export function ServiceUsage({
  usage,
  showDate = false,
}: {
  usage: ServiceUsageModel;
  showDate?: boolean;
}) {
  const format = useFormatter();
  const t = useTranslations("ComplementaryServices.usage");
  return (
    <div>
      {usage.type === "quota" ? (
        <QuotaProgress usage={usage} />
      ) : (
        <ProjectProgress usage={usage} />
      )}
      {showDate &&
      (usage.type === "quota" ? usage.renewsAt : usage.expectedCompletionAt) ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {usage.type === "quota"
            ? t("renews", {
                date: format.dateTime(new Date(usage.renewsAt!), "shortDate"),
              })
            : t("expected", {
                date: format.dateTime(
                  new Date(usage.expectedCompletionAt!),
                  "shortDate",
                ),
              })}
        </p>
      ) : null}
    </div>
  );
}
