"use client";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthorizationStatusBadge } from "@/components/authorization/authorization-status-badge";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  AUTHORIZATION_STATUS,
  type AuthorizationCase,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";

type AuthorizationStatusViewProps = {
  status: AuthorizationStatus;
  authCase: AuthorizationCase | null;
  onStart: () => void;
  onContinue: () => void;
};

export function AuthorizationStatusView({
  status,
  authCase,
  onStart,
  onContinue,
}: AuthorizationStatusViewProps) {
  const t = useTranslations("Authorization.status");

  const copy = {
    [AUTHORIZATION_STATUS.NOT_STARTED]: {
      title: t("not_startedTitle"),
      body: t("not_startedBody"),
      icon: ShieldCheck,
    },
    [AUTHORIZATION_STATUS.DRAFT]: {
      title: t("draftTitle"),
      body: t("draftBody"),
      icon: Clock3,
    },
    [AUTHORIZATION_STATUS.PENDING_REVIEW]: {
      title: t("pendingTitle"),
      body: t("pendingBody"),
      icon: Clock3,
    },
    [AUTHORIZATION_STATUS.NEEDS_MORE_INFO]: {
      title: t("needsInfoTitle"),
      body: t("needsInfoBody"),
      icon: CircleAlert,
    },
    [AUTHORIZATION_STATUS.REJECTED]: {
      title: t("rejectedTitle"),
      body: t("rejectedBody"),
      icon: CircleAlert,
    },
    [AUTHORIZATION_STATUS.APPROVED]: {
      title: t("approvedTitle"),
      body: t("approvedBody"),
      icon: CheckCircle2,
    },
  }[status];

  const Icon = copy.icon;

  return (
    <Panel className="space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-full">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {copy.title}
            </h1>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-6">
              {copy.body}
            </p>
          </div>
        </div>
        <AuthorizationStatusBadge status={status} />
      </div>

      {(status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO ||
        status === AUTHORIZATION_STATUS.REJECTED) &&
        authCase?.staffReason && (
          <div
            className="border-warning/40 bg-warning/10 rounded-xl border p-4 text-sm"
            role="status"
          >
            <p className="font-medium">{authCase.staffReason}</p>
          </div>
        )}

      <div className="flex flex-wrap gap-2">
        {status === AUTHORIZATION_STATUS.NOT_STARTED && (
          <Button type="button" className="min-h-11" onClick={onStart}>
            {t("start")}
          </Button>
        )}
        {status === AUTHORIZATION_STATUS.DRAFT && (
          <Button type="button" className="min-h-11" onClick={onContinue}>
            {t("continue")}
          </Button>
        )}
        {(status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO ||
          status === AUTHORIZATION_STATUS.REJECTED) && (
          <Button type="button" className="min-h-11" onClick={onContinue}>
            {t("fix")}
          </Button>
        )}
        {status === AUTHORIZATION_STATUS.APPROVED && (
          <Button asChild className="min-h-11">
            <Link href="/dashboard/plans">{t("plans")}</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/dashboard">{t("dashboard")}</Link>
        </Button>
      </div>
    </Panel>
  );
}
