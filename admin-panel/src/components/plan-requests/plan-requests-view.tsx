"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Filter,
  SearchX,
  TimerReset,
  UserRound,
} from "lucide-react";

import SearchInput from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLANS, type PlanIdType } from "@/lib/data/plans-data";
import {
  PLAN_REQUEST_STATUS,
  PLAN_REQUEST_STATUS_LABELS,
  type PlanRequestStatusType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import { cn } from "@/lib/utils";
import {
  resolvePlanRequestAccountLabel,
  resolvePlanRequestContactPrimary,
  resolvePlanRequestContactSecondary,
  resolvePlanRequestWebsiteLabel,
} from "@/lib/plan-requests/plan-request-display";
import {
  PLAN_REQUEST_INTAKE,
  PLAN_REQUEST_INTAKE_LABELS,
} from "@/lib/plan-requests/plan-request-intake";
import { PlanRequestIntakeBadge } from "./plan-request-intake-badge";
import { PlanRequestStatusBadge } from "./plan-request-status-badge";

export const STATUS_FILTER = {
  ALL: "ALL",
  ACTIONABLE: "ACTIONABLE",
  ...PLAN_REQUEST_STATUS,
} as const;

export type StatusFilterType =
  (typeof STATUS_FILTER)[keyof typeof STATUS_FILTER];

const PLAN_FILTER_ALL = "ALL";
type PlanFilterType = typeof PLAN_FILTER_ALL | PlanIdType | string;

const INTAKE_FILTER = {
  ALL: "ALL",
  ...PLAN_REQUEST_INTAKE,
} as const;

type IntakeFilterType = (typeof INTAKE_FILTER)[keyof typeof INTAKE_FILTER];

const INTAKE_FILTER_OPTIONS: { value: IntakeFilterType; label: string }[] = [
  { value: INTAKE_FILTER.ALL, label: "همه منابع" },
  {
    value: PLAN_REQUEST_INTAKE.LOGGED_IN,
    label: PLAN_REQUEST_INTAKE_LABELS[PLAN_REQUEST_INTAKE.LOGGED_IN],
  },
  {
    value: PLAN_REQUEST_INTAKE.PUBLIC,
    label: PLAN_REQUEST_INTAKE_LABELS[PLAN_REQUEST_INTAKE.PUBLIC],
  },
];

const STATUS_FILTER_OPTIONS: { value: StatusFilterType; label: string }[] = [
  { value: STATUS_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: STATUS_FILTER.ACTIONABLE, label: "نیازمند اقدام" },
  {
    value: PLAN_REQUEST_STATUS.PENDING,
    label: PLAN_REQUEST_STATUS_LABELS[PLAN_REQUEST_STATUS.PENDING],
  },
  {
    value: PLAN_REQUEST_STATUS.READY_TO_ENABLE,
    label: PLAN_REQUEST_STATUS_LABELS[PLAN_REQUEST_STATUS.READY_TO_ENABLE],
  },
  {
    value: PLAN_REQUEST_STATUS.ENABLED,
    label: PLAN_REQUEST_STATUS_LABELS[PLAN_REQUEST_STATUS.ENABLED],
  },
  {
    value: PLAN_REQUEST_STATUS.DECLINED,
    label: PLAN_REQUEST_STATUS_LABELS[PLAN_REQUEST_STATUS.DECLINED],
  },
  {
    value: PLAN_REQUEST_STATUS.CANCELLED,
    label: PLAN_REQUEST_STATUS_LABELS[PLAN_REQUEST_STATUS.CANCELLED],
  },
];

const PLAN_FILTER_OPTIONS = [
  { value: PLAN_FILTER_ALL, label: "همه پلن‌ها" },
  ...PLANS.map((plan) => ({ value: plan.id, label: plan.name })),
];

const ACTIONABLE_STATUSES = new Set<PlanRequestStatusType>([
  PLAN_REQUEST_STATUS.PENDING,
  PLAN_REQUEST_STATUS.READY_TO_ENABLE,
]);

type PlanRequestsViewProps = {
  initialStatus?: StatusFilterType;
  initialRequests?: PlanRequestType[];
  loadError?: string | null;
};

export function PlanRequestsView({
  initialStatus = STATUS_FILTER.ACTIONABLE,
  initialRequests = [],
  loadError = null,
}: PlanRequestsViewProps = {}) {
  const requests = initialRequests;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterType>(initialStatus);
  const [planFilter, setPlanFilter] = useState<PlanFilterType>(PLAN_FILTER_ALL);
  const [intakeFilter, setIntakeFilter] = useState<IntakeFilterType>(
    INTAKE_FILTER.ALL,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();

  const summary = useMemo(() => {
    return {
      total: requests.length,
      actionable: requests.filter((request) =>
        ACTIONABLE_STATUSES.has(request.status),
      ).length,
      ready: requests.filter(
        (request) => request.status === PLAN_REQUEST_STATUS.READY_TO_ENABLE,
      ).length,
      enabled: requests.filter(
        (request) => request.status === PLAN_REQUEST_STATUS.ENABLED,
      ).length,
      guestUnlinked: requests.filter(
        (request) =>
          request.intakeType === PLAN_REQUEST_INTAKE.PUBLIC &&
          !request.linkedUserId &&
          ACTIONABLE_STATUSES.has(request.status),
      ).length,
    };
  }, [requests]);

  const summaryItems = [
    {
      key: "actionable",
      label: "نیازمند اقدام",
      value: summary.actionable,
      hint: "در انتظار تکمیل یا آماده فعال‌سازی",
      icon: TimerReset,
      emphasis: true,
      filter: STATUS_FILTER.ACTIONABLE as StatusFilterType,
      filterKind: "status" as const,
    },
    {
      key: "guest",
      label: "مهمان بدون اتصال",
      value: summary.guestUnlinked,
      hint: "درخواست وب عمومی؛ کاربر هنوز متصل نشده",
      icon: UserRound,
      emphasis: false,
      filter: PLAN_REQUEST_INTAKE.PUBLIC as IntakeFilterType,
      filterKind: "intake" as const,
    },
    {
      key: "ready",
      label: "آماده فعال‌سازی",
      value: summary.ready,
      hint: "کاربر و وب‌سایت آماده هستند",
      icon: CheckCircle2,
      emphasis: false,
      filter: PLAN_REQUEST_STATUS.READY_TO_ENABLE as StatusFilterType,
      filterKind: "status" as const,
    },
    {
      key: "enabled",
      label: "فعال‌شده",
      value: summary.enabled,
      hint: "پلن روی وب‌سایت فعال است",
      icon: CheckCircle2,
      emphasis: false,
      filter: PLAN_REQUEST_STATUS.ENABLED as StatusFilterType,
      filterKind: "status" as const,
    },
    {
      key: "total",
      label: "کل درخواست‌ها",
      value: summary.total,
      hint: "همه وضعیت‌ها",
      icon: ClipboardList,
      emphasis: false,
      filter: STATUS_FILTER.ALL as StatusFilterType,
      filterKind: "status" as const,
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return requests.filter((request) => {
      const statusOk =
        statusFilter === STATUS_FILTER.ALL ||
        (statusFilter === STATUS_FILTER.ACTIONABLE
          ? ACTIONABLE_STATUSES.has(request.status)
          : request.status === statusFilter);
      const planOk =
        planFilter === PLAN_FILTER_ALL || request.chosenPlanId === planFilter;
      const intakeOk =
        intakeFilter === INTAKE_FILTER.ALL ||
        request.intakeType === intakeFilter;
      if (!statusOk || !planOk || !intakeOk) return false;
      if (!q) return true;

      const haystack = [
        request.id,
        request.chosenPlanName,
        request.contactName,
        request.contactEmail ?? "",
        request.contactMobile ?? "",
        request.domainHint ?? "",
        request.linkedUserName ?? "",
        request.linkedTenantName ?? "",
        request.targetWebsiteDomain ?? "",
        request.nextAction,
        PLAN_REQUEST_INTAKE_LABELS[request.intakeType],
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [requests, search, statusFilter, planFilter, intakeFilter]);

  const openRequest = (requestId: string) => {
    router.push(`/plan-requests/${requestId}`);
  };

  return (
    <div className="space-y-6">
      {loadError ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="خلاصه درخواست‌های پلن"
      >
        {summaryItems.map((item) => {
          const Icon = item.icon;
          const isSelected =
            item.filterKind === "intake"
              ? intakeFilter === item.filter
              : statusFilter === item.filter;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.filterKind === "intake") {
                  setIntakeFilter(item.filter as IntakeFilterType);
                  setStatusFilter(STATUS_FILTER.ACTIONABLE);
                  return;
                }
                setStatusFilter(item.filter as StatusFilterType);
              }}
              aria-pressed={isSelected}
              className={cn(
                "rounded-xl border p-4 text-start transition-colors",
                item.emphasis
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted/30",
                isSelected && !item.emphasis && "ring-2 ring-primary/30",
                isSelected &&
                  item.emphasis &&
                  "ring-2 ring-primary-foreground/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      "text-sm",
                      item.emphasis
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {item.value.toLocaleString("fa-IR")}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      item.emphasis
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.hint}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    item.emphasis
                      ? "bg-primary-foreground/10"
                      : "bg-muted text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی پلن، تماس، دامنه یا کاربر…"
              aria-label="جستجوی درخواست‌های پلن"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <Filter className="size-4" aria-hidden />
            فیلترها
          </Button>
          <div
            className={cn(
              "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
              filtersOpen ? "grid" : "hidden lg:grid",
            )}
          >
            <Select
              value={intakeFilter}
              onValueChange={(value) => {
                if (value) setIntakeFilter(value as IntakeFilterType);
              }}
            >
              <SelectTrigger aria-label="فیلتر منبع درخواست">
                <SelectValue>
                  {INTAKE_FILTER_OPTIONS.find(
                    (option) => option.value === intakeFilter,
                  )?.label ?? "همه منابع"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {INTAKE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value) setStatusFilter(value as StatusFilterType);
              }}
            >
              <SelectTrigger aria-label="فیلتر وضعیت">
                <SelectValue>
                  {STATUS_FILTER_OPTIONS.find(
                    (option) => option.value === statusFilter,
                  )?.label ?? "همه وضعیت‌ها"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={planFilter}
              onValueChange={(value) => {
                if (value) setPlanFilter(value as PlanFilterType);
              }}
            >
              <SelectTrigger aria-label="فیلتر پلن">
                <SelectValue>
                  {PLAN_FILTER_OPTIONS.find(
                    (option) => option.value === planFilter,
                  )?.label ?? "همه پلن‌ها"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {PLAN_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span dir="ltr">{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">پلن</TableHead>
                <TableHead className="px-4 py-3 text-right">منبع</TableHead>
                <TableHead className="px-4 py-3 text-right">تماس / حساب</TableHead>
                <TableHead className="px-4 py-3 text-right">اتصال</TableHead>
                <TableHead className="px-4 py-3 text-right">وب‌سایت</TableHead>
                <TableHead className="px-4 py-3 text-right">وضعیت</TableHead>
                <TableHead className="px-4 py-3 text-right">
                  اقدام بعدی
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    <div className="inline-flex items-center gap-2">
                      <SearchX className="size-4" aria-hidden />
                      {loadError
                        ? "بارگذاری درخواست‌ها ناموفق بود."
                        : "درخواستی با این فیلترها پیدا نشد."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    role="link"
                    aria-label={`مشاهده درخواست ${request.chosenPlanName}`}
                    onClick={() => openRequest(request.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRequest(request.id);
                      }
                    }}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="font-medium w-fit" dir="ltr">
                        {request.chosenPlanName}
                      </div>
                      <div
                        className="text-xs text-muted-foreground w-fit"
                        dir="ltr"
                      >
                        {request.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <PlanRequestIntakeBadge intakeType={request.intakeType} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div>{resolvePlanRequestContactPrimary(request)}</div>
                      <div
                        className="text-xs text-muted-foreground w-fit"
                        dir="ltr"
                      >
                        {resolvePlanRequestContactSecondary(request)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {resolvePlanRequestAccountLabel(request)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="w-fit" dir="ltr">
                        {resolvePlanRequestWebsiteLabel(request)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <PlanRequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {request.nextAction}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {loadError
                ? "بارگذاری درخواست‌ها ناموفق بود."
                : "درخواستی با این فیلترها پیدا نشد."}
            </p>
          ) : (
            filtered.map((request) => (
              <Link
                key={request.id}
                href={`/plan-requests/${request.id}`}
                className="rounded-xl border border-border bg-background p-4 text-right shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold" dir="ltr">
                        {request.chosenPlanName}
                      </p>
                      <PlanRequestIntakeBadge intakeType={request.intakeType} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {resolvePlanRequestContactPrimary(request)}
                    </p>
                  </div>
                  <PlanRequestStatusBadge status={request.status} />
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <dt>اتصال</dt>
                    <dd>{resolvePlanRequestAccountLabel(request)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>وب‌سایت</dt>
                    <dd dir="ltr">{resolvePlanRequestWebsiteLabel(request)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>اقدام بعدی</dt>
                    <dd>{request.nextAction}</dd>
                  </div>
                </dl>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
