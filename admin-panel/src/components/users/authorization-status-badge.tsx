import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

import {
  USER_KYC_STATUS,
  USER_KYC_STATUS_LABELS,
  type UserKycStatusType,
} from "@/lib/users/map-admin-user";
import { cn } from "@/lib/utils";

const badgeClassName =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

type AuthorizationStatusBadgeProps = {
  status: UserKycStatusType;
  className?: string;
};

/**
 * Users-list KYC badge: package outcome only (not tenant membership).
 */
export function AuthorizationStatusBadge({
  status,
  className,
}: AuthorizationStatusBadgeProps) {
  const Icon =
    status === USER_KYC_STATUS.APPROVED
      ? CheckCircle2
      : status === USER_KYC_STATUS.REJECTED
        ? CircleAlert
        : Clock3;

  return (
    <span
      className={cn(
        badgeClassName,
        status === USER_KYC_STATUS.APPROVED
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : status === USER_KYC_STATUS.REJECTED
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
        className,
      )}
      title={
        status === USER_KYC_STATUS.APPROVED
          ? "بسته احراز هویت تأیید شده است."
          : status === USER_KYC_STATUS.REJECTED
            ? "بسته احراز هویت رد شده است."
            : "هنوز بسته احراز هویت ارسال نشده یا در صف بررسی است."
      }
    >
      <Icon aria-hidden className="size-3.5" />
      {USER_KYC_STATUS_LABELS[status]}
    </span>
  );
}
