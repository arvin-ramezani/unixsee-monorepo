import { CheckCircle2, Clock3, CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import type { VerificationStatus as Status } from "@/lib/data/profile/profile-data";
import { cn } from "@/lib/utils";

const icons = {
  verified: CheckCircle2,
  unverified: CircleAlert,
  pending: Clock3,
};

const styles = {
  verified: "text-success-foreground dark:text-success",
  unverified: "text-warning-foreground dark:text-warning",
  pending: "text-link",
};

export function VerificationStatus({ status }: { status: Status }) {
  const t = useTranslations("Profile.verification");
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        styles[status],
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(status)}
    </span>
  );
}
