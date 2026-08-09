import { CheckCircle2, CirclePause, Clock3, MessageCircleMore } from "lucide-react";

import {
  SERVICE_ASSIGNMENT_STATUS,
  SERVICE_REQUEST_STATUS,
  type ServiceAssignmentStatusType,
  type ServiceRequestStatusType,
} from "@/lib/data/complementary-services-data";
import { cn } from "@/lib/utils";

const REQUEST_STATUS_CONFIG: Record<
  ServiceRequestStatusType,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  [SERVICE_REQUEST_STATUS.SUBMITTED]: {
    label: "جدید",
    icon: Clock3,
    className: "bg-primary/10 text-primary",
  },
  [SERVICE_REQUEST_STATUS.UNDER_REVIEW]: {
    label: "در حال بررسی",
    icon: Clock3,
    className: "bg-secondary text-secondary-foreground",
  },
  [SERVICE_REQUEST_STATUS.NEEDS_CUSTOMER_INFORMATION]: {
    label: "منتظر اطلاعات مشتری",
    icon: MessageCircleMore,
    className: "bg-accent/35 text-accent-foreground",
  },
  [SERVICE_REQUEST_STATUS.SCOPED]: {
    label: "محدوده مشخص شده",
    icon: CheckCircle2,
    className: "bg-secondary text-secondary-foreground",
  },
  [SERVICE_REQUEST_STATUS.QUOTED]: {
    label: "پیشنهاد ارسال شده",
    icon: Clock3,
    className: "bg-accent/35 text-accent-foreground",
  },
  [SERVICE_REQUEST_STATUS.ACCEPTED]: {
    label: "آماده ایجاد سرویس",
    icon: CheckCircle2,
    className: "bg-primary text-primary-foreground",
  },
  [SERVICE_REQUEST_STATUS.ACTIVATED]: {
    label: "سرویس ایجاد شده",
    icon: CheckCircle2,
    className: "bg-accent/45 text-accent-foreground",
  },
  [SERVICE_REQUEST_STATUS.DECLINED]: {
    label: "رد شده",
    icon: CirclePause,
    className: "bg-destructive/10 text-destructive",
  },
};

const ASSIGNMENT_STATUS_CONFIG: Record<
  ServiceAssignmentStatusType,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  [SERVICE_ASSIGNMENT_STATUS.SCHEDULED]: {
    label: "زمان‌بندی شده",
    icon: Clock3,
    className: "bg-primary/10 text-primary",
  },
  [SERVICE_ASSIGNMENT_STATUS.ACTIVE]: {
    label: "فعال",
    icon: CheckCircle2,
    className: "bg-accent/45 text-accent-foreground",
  },
  [SERVICE_ASSIGNMENT_STATUS.PAUSED]: {
    label: "متوقف",
    icon: CirclePause,
    className: "bg-secondary text-secondary-foreground",
  },
  [SERVICE_ASSIGNMENT_STATUS.COMPLETED]: {
    label: "تکمیل شده",
    icon: CheckCircle2,
    className: "bg-muted text-muted-foreground",
  },
};

type ServiceStatusBadgeProps =
  | { kind: "request"; status: ServiceRequestStatusType }
  | { kind: "assignment"; status: ServiceAssignmentStatusType };

export function ServiceStatusBadge(props: ServiceStatusBadgeProps) {
  const config =
    props.kind === "request"
      ? REQUEST_STATUS_CONFIG[props.status]
      : ASSIGNMENT_STATUS_CONFIG[props.status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
