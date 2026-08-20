"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  AUTHORIZATION_STATUS,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";

const BANNER_STATUSES: AuthorizationStatus[] = [
  AUTHORIZATION_STATUS.NOT_STARTED,
  AUTHORIZATION_STATUS.DRAFT,
  AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
  AUTHORIZATION_STATUS.REJECTED,
];

type AuthorizationDashboardBannerProps = {
  status: AuthorizationStatus;
};

export function AuthorizationDashboardBanner({
  status,
}: AuthorizationDashboardBannerProps) {
  const t = useTranslations("Authorization.banner");

  if (!BANNER_STATUSES.includes(status)) {
    return null;
  }

  const message =
    status === AUTHORIZATION_STATUS.DRAFT
      ? t("draft")
      : status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO
        ? t("needs_more_info")
        : status === AUTHORIZATION_STATUS.REJECTED
          ? t("rejected")
          : t("not_started");

  return (
    <aside
      className="border-warning/40 bg-warning/10 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          aria-hidden="true"
          className="text-warning-foreground dark:text-warning mt-0.5 size-5 shrink-0"
        />
        <p className="text-sm leading-6">{message}</p>
      </div>
      <Button asChild className="min-h-11 shrink-0">
        <Link href="/dashboard/authorization">{t("cta")}</Link>
      </Button>
    </aside>
  );
}
