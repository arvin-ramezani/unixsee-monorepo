"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Globe2,
  LoaderCircle,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  declinePlanRequestAction,
  enablePlanRequestAction,
  linkPlanRequestWebsiteAction,
  listWebsitesForPlanRequestAction,
  type PlanRequestWebsiteOption,
} from "@/actions/plan-requests/plan-request-actions";
import SearchInput from "@/components/common/search-input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PLAN_REQUEST_BLOCKER,
  PLAN_REQUEST_BLOCKER_LABELS,
  PLAN_REQUEST_STATUS,
  type PlanRequestBlockerType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import { findAuthorizationCaseByUserId } from "@/lib/data/authorization-runtime";
import { STAFF_CAPABILITY } from "@/lib/data/users-data";
import {
  isPublicPlanRequest,
  PLAN_REQUEST_INTAKE_HINTS,
} from "@/lib/plan-requests/plan-request-intake";
import { hasCapability, maskEmail, maskMobile } from "@/lib/users-utils";
import { toastApiErrorMessage } from "@/lib/api/toast-api-error";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlanRequestIntakeBadge } from "./plan-request-intake-badge";
import { PlanRequestStatusBadge } from "./plan-request-status-badge";

type PlanRequestDetailsViewProps = {
  request: PlanRequestType;
};

const WEBSITE_ROW_HEIGHT = 72;

const REFUSE_OPTIONS = [
  {
    kind: "declined" as const,
    label: "رد درخواست",
    description: "درخواست نامناسب است یا شرایط فعال‌سازی فراهم نیست.",
  },
  {
    kind: "cancelled" as const,
    label: "لغو درخواست",
    description: "مشتری منصرف شده یا دیگر نیازی به پیگیری نیست.",
  },
] satisfies Array<{
  kind: "declined" | "cancelled";
  label: string;
  description: string;
}>;

function getRefuseOption(kind: "declined" | "cancelled") {
  return REFUSE_OPTIONS.find((option) => option.kind === kind) ?? REFUSE_OPTIONS[0];
}

function isTerminalPlanRequestStatus(status: PlanRequestType["status"]) {
  return (
    status === PLAN_REQUEST_STATUS.ENABLED ||
    status === PLAN_REQUEST_STATUS.DECLINED ||
    status === PLAN_REQUEST_STATUS.CANCELLED
  );
}

function resolveEnablementBlockers(
  request: PlanRequestType,
  selectedWebsite: PlanRequestWebsiteOption | null,
): PlanRequestBlockerType[] {
  if (isTerminalPlanRequestStatus(request.status)) {
    return [];
  }

  const blockers: PlanRequestBlockerType[] = [];

  if (!request.linkedUserId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_USER);
  } else if (!request.linkedTenantId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_TENANT);
  }

  if (!request.targetWebsiteId && !selectedWebsite) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE);
  }

  if (selectedWebsite?.hasActivePlan) {
    blockers.push(PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT);
  }

  return blockers;
}

export function PlanRequestDetailsView({
  request,
}: PlanRequestDetailsViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Link
        href="/plan-requests"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "w-fit gap-2",
        })}
        aria-label="بازگشت به درخواست‌های پلن"
      >
        <ArrowRight data-icon="inline-start" />
        بازگشت به درخواست‌های پلن
      </Link>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="w-fit" dir="ltr">
            {request.chosenPlanName}
          </span>
          <PlanRequestIntakeBadge intakeType={request.intakeType} />
          <PlanRequestStatusBadge status={request.status} />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPublicPlanRequest(request)
            ? "درخواست مهمان — ابتدا کاربر موجود را پیدا کنید، سپس وب‌سایت را انتخاب و پلن را فعال کنید."
            : "درخواست از داشبورد مشتری — حساب متصل است؛ وب‌سایت را انتخاب و پلن را فعال کنید."}
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <PlanRequestDetailsBody key={request.id} request={request} />
      </div>
    </div>
  );
}

function PlanRequestSummary({ request }: { request: PlanRequestType }) {
  const intakeHint = PLAN_REQUEST_INTAKE_HINTS[request.intakeType];

  return (
    <div className="flex flex-col gap-4">
      <section
        className={cn(
          "rounded-xl border p-4 text-sm",
          isPublicPlanRequest(request)
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-primary/20 bg-primary/5",
        )}
      >
        <div className="flex items-start gap-3">
          {isPublicPlanRequest(request) ? (
            <UserRound className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          )}
          <div>
            <p className="font-medium">
              {isPublicPlanRequest(request)
                ? "درخواست مهمان (وب عمومی)"
                : "درخواست کاربر واردشده"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {intakeHint}
            </p>
          </div>
        </div>
      </section>

      {isPublicPlanRequest(request) ? (
        <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">اطلاعات تماس مهمان</h3>
          <p className="text-xs text-muted-foreground">
            برای اتصال درخواست، همین شماره یا ایمیل را در{" "}
            <Link href="/users" className="underline underline-offset-2">
              کاربران
            </Link>{" "}
            جستجو کنید.
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">نام</dt>
              <dd className="mt-1">{request.contactName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">موبایل</dt>
              <dd className="mt-1 w-fit" dir="ltr">
                {request.contactMobile ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">ایمیل</dt>
              <dd className="mt-1 w-fit" dir="ltr">
                {request.contactEmail ?? "—"}
              </dd>
            </div>
            {request.domainHint ? (
              <div>
                <dt className="text-xs text-muted-foreground">دامنه اعلامی</dt>
                <dd className="mt-1 w-fit" dir="ltr">
                  {request.domainHint}
                </dd>
              </div>
            ) : null}
            {request.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">یادداشت مشتری</dt>
                <dd className="mt-1 whitespace-pre-wrap">{request.notes}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">حساب مشتری</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">نام حساب</dt>
              <dd className="mt-1">
                {request.linkedUserName ?? request.contactName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">موبایل ثبت‌شده</dt>
              <dd className="mt-1 w-fit" dir="ltr">
                {request.contactMobile
                  ? maskMobile(request.contactMobile)
                  : "—"}
              </dd>
            </div>
            {request.contactEmail ? (
              <div>
                <dt className="text-xs text-muted-foreground">ایمیل</dt>
                <dd className="mt-1 w-fit" dir="ltr">
                  {maskEmail(request.contactEmail)}
                </dd>
              </div>
            ) : null}
            {request.domainHint ? (
              <div>
                <dt className="text-xs text-muted-foreground">دامنه اعلامی</dt>
                <dd className="mt-1 w-fit" dir="ltr">
                  {request.domainHint}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">وضعیت فعال‌سازی</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">پلن انتخاب‌شده</dt>
            <dd className="mt-1 w-fit font-medium" dir="ltr">
              {request.chosenPlanName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">اقدام بعدی</dt>
            <dd className="mt-1">{request.nextAction}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">ثبت</dt>
            <dd className="mt-1">{request.submittedAt}</dd>
          </div>
          {request.linkedUserName || request.linkedUserId ? (
            <div>
              <dt className="text-xs text-muted-foreground">کاربر متصل</dt>
              <dd className="mt-1">
                {request.linkedUserName ?? "کاربر متصل"}
                {request.linkedUserId ? (
                  <span className="ms-2 text-muted-foreground" dir="ltr">
                    {request.linkedUserId}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {request.linkedTenantName ? (
            <div>
              <dt className="text-xs text-muted-foreground">مستأجر</dt>
              <dd className="mt-1">{request.linkedTenantName}</dd>
            </div>
          ) : null}
          {request.targetWebsiteDomain ? (
            <div>
              <dt className="text-xs text-muted-foreground">وب‌سایت هدف</dt>
              <dd className="mt-1 w-fit" dir="ltr">
                {request.targetWebsiteDomain}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}

function PlanRequestDetailsBody({
  request: initialRequest,
}: {
  request: PlanRequestType;
}) {
  const router = useRouter();
  const canEnable = hasCapability(STAFF_CAPABILITY.ENABLE_PLAN_REQUEST);
  const [request, setRequest] = useState(initialRequest);
  const [websiteQuery, setWebsiteQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [websites, setWebsites] = useState<PlanRequestWebsiteOption[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websitesError, setWebsitesError] = useState<string | null>(null);
  const [pendingWebsiteId, setPendingWebsiteId] = useState<string | null>(null);
  const [refuseKind, setRefuseKind] = useState<"declined" | "cancelled" | null>(
    null,
  );
  const [refuseReason, setRefuseReason] = useState("");
  const [refuseError, setRefuseError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEnable, setConfirmEnable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const websiteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(websiteQuery), 250);
    return () => window.clearTimeout(timer);
  }, [websiteQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadWebsites() {
      if (!request.linkedUserId && !request.linkedTenantId) {
        setWebsites([]);
        setWebsitesError(null);
        setWebsitesLoading(false);
        return;
      }

      setWebsitesLoading(true);
      setWebsitesError(null);

      try {
        const result = await listWebsitesForPlanRequestAction({
          linkedUserId: request.linkedUserId,
          linkedTenantId: request.linkedTenantId,
          search: debouncedQuery,
        });
        if (cancelled) return;

        if (!result.ok) {
          setWebsites([]);
          setWebsitesError(result.message);
          return;
        }

        setWebsites(result.websites);
      } finally {
        if (!cancelled) {
          setWebsitesLoading(false);
        }
      }
    }

    void loadWebsites();
    return () => {
      cancelled = true;
    };
  }, [request.linkedUserId, request.linkedTenantId, debouncedQuery]);

  const selectedWebsite =
    websites.find((website) => website.id === request.targetWebsiteId) ??
    websites.find((website) => website.id === pendingWebsiteId) ??
    null;

  const blockers = resolveEnablementBlockers(request, selectedWebsite);
  const isTerminal = isTerminalPlanRequestStatus(request.status);
  const canActivate =
    canEnable &&
    blockers.length === 0 &&
    !isTerminal &&
    Boolean(request.targetWebsiteId || selectedWebsite);

  const rowVirtualizer = useVirtualizer({
    count: websites.length,
    getScrollElement: () => websiteListRef.current,
    estimateSize: () => WEBSITE_ROW_HEIGHT,
    overscan: 6,
  });

  const syncRequest = (next: PlanRequestType) => {
    setRequest(next);
    setConfirmEnable(false);
    setPendingWebsiteId(null);
    setRefuseKind(null);
    setRefuseReason("");
    router.refresh();
  };

  const openRefusePanel = (kind: "declined" | "cancelled") => {
    setFormError(null);
    setRefuseError(null);
    setRefuseKind(kind);
  };

  const closeRefusePanel = () => {
    setRefuseKind(null);
    setRefuseReason("");
    setRefuseError(null);
  };

  const handleSelectWebsite = async (website: PlanRequestWebsiteOption) => {
    setFormError(null);
    if (!request.linkedUserId && !request.linkedTenantId) {
      setFormError("ابتدا کاربر/مستأجر باید به درخواست متصل باشد.");
      return;
    }

    setSubmitting(true);
    setPendingWebsiteId(website.id);

    try {
      const result = await linkPlanRequestWebsiteAction({
        requestId: request.id,
        tenantId: website.tenantId,
        websiteId: website.id,
        linkedUserId: request.linkedUserId,
      });

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        setPendingWebsiteId(null);
        return;
      }

      syncRequest(result.request);
      toast.success("وب‌سایت هدف انتخاب شد و به درخواست متصل شد.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable = async () => {
    setFormError(null);

    if (!canEnable) {
      setFormError(
        "فعال‌سازی پلن برای نقش فعلی فعال نیست و باید به همکار دارای این دسترسی ارجاع شود.",
      );
      return;
    }

    if (blockers.length > 0) {
      setFormError("ابتدا موانع فعال‌سازی را برطرف کنید.");
      return;
    }

    const websiteId = request.targetWebsiteId ?? selectedWebsite?.id;
    if (!websiteId) {
      setFormError("وب‌سایت هدف مشخص نیست.");
      return;
    }

    if (!confirmEnable) {
      setConfirmEnable(true);
      return;
    }

    setSubmitting(true);
    try {
      const result = await enablePlanRequestAction({
        requestId: request.id,
        websiteId,
        tenantId: request.linkedTenantId ?? selectedWebsite?.tenantId,
      });

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        setConfirmEnable(false);
        return;
      }

      syncRequest(result.request);
      toast.success(`پلن ${result.request.chosenPlanName} روی وب‌سایت فعال شد.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    if (!refuseKind) {
      return;
    }

    const trimmedReason = refuseReason.trim();
    if (!trimmedReason) {
      setRefuseError("برای رد یا لغو، ثبت دلیل الزامی است.");
      return;
    }

    setRefuseError(null);
    setSubmitting(true);

    try {
      const result = await declinePlanRequestAction({
        requestId: request.id,
        reason: trimmedReason,
        kind: refuseKind,
      });

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }

      syncRequest(result.request);
      toast.success(
        refuseKind === "declined" ? "درخواست رد شد." : "درخواست لغو شد.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Website list can load from linked user alone; enablement still needs tenant + user.
  const canBrowseWebsites = Boolean(
    request.linkedUserId || request.linkedTenantId,
  );

  return (
    <>
      <div className="app-scrollbar flex-1 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-6">
          <PlanRequestSummary request={request} />

          {blockers.length > 0 && (
            <section
              className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              role="status"
            >
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4" aria-hidden />
                موانع فعال‌سازی
              </p>
              <ul className="list-disc pr-5">
                {blockers.map((blocker) => (
                  <li key={blocker}>{PLAN_REQUEST_BLOCKER_LABELS[blocker]}</li>
                ))}
              </ul>
              {blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_USER) && (
                <p className="text-xs text-destructive/90">
                  {isPublicPlanRequest(request) ? (
                    <>
                      برای درخواست مهمان، کاربر موجود را با موبایل/ایمیل بالا در{" "}
                      <Link href="/users" className="underline underline-offset-2">
                        کاربران
                      </Link>{" "}
                      پیدا کنید و به درخواست متصل کنید؛ این صفحه کاربر جدید
                      نمی‌سازد.
                    </>
                  ) : (
                    <>
                      اگر حساب مالک وب‌سایت وجود ندارد، ابتدا در{" "}
                      <Link href="/users" className="underline underline-offset-2">
                        کاربران
                      </Link>{" "}
                      ایجاد کنید؛ این صفحه کاربر جدید نمی‌سازد.
                    </>
                  )}
                </p>
              )}
              {blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_TENANT) && (
                <p className="text-xs text-destructive/90">
                  فعال‌سازی تا تأیید احراز هویت و ایجاد مستأجر مسدود است.{" "}
                  {(() => {
                    const authCase = request.linkedUserId
                      ? findAuthorizationCaseByUserId(request.linkedUserId)
                      : undefined;
                    if (authCase) {
                      return (
                        <Link
                          href={`/users/authorization/${authCase.id}`}
                          className="underline underline-offset-2"
                        >
                          باز کردن پرونده احراز هویت
                        </Link>
                      );
                    }
                    return (
                      <Link
                        href="/users/authorization"
                        className="underline underline-offset-2"
                      >
                        صف احراز هویت
                      </Link>
                    );
                  })()}
                  {request.linkedUserId ? (
                    <>
                      {" "}
                      یا{" "}
                      <Link
                        href={`/users/${request.linkedUserId}`}
                        className="underline underline-offset-2"
                      >
                        پرونده کاربر
                      </Link>
                    </>
                  ) : null}
                  .
                </p>
              )}
            </section>
          )}

          {!isTerminal && (
            <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="size-4" aria-hidden />
                وب‌سایت‌های کاربر متصل
              </h3>

              {canBrowseWebsites ? (
                <>
                  {selectedWebsite || request.targetWebsiteDomain ? (
                    <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      انتخاب‌شده:{" "}
                      <span dir="ltr" className="font-medium">
                        {selectedWebsite?.domain ?? request.targetWebsiteDomain}
                      </span>
                      {selectedWebsite ? (
                        <span className="ms-2 text-muted-foreground">
                          {selectedWebsite.hasActivePlan
                            ? "— دارای پلن فعال"
                            : "— بدون پلن"}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  <SearchInput
                    value={websiteQuery}
                    onChange={(event) => setWebsiteQuery(event.target.value)}
                    placeholder="جستجوی دامنه یا عنوان…"
                    aria-label="جستجوی وب‌سایت کاربر"
                    autoComplete="off"
                  />

                  {websitesError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {websitesError}
                    </p>
                  ) : null}

                  <div
                    ref={websiteListRef}
                    className="app-scrollbar h-64 overflow-y-auto rounded-lg border border-border"
                    role="listbox"
                    aria-label="فهرست وب‌سایت‌های کاربر"
                  >
                    {websitesLoading ? (
                      <p className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                        <LoaderCircle className="size-4 animate-spin" />
                        در حال بارگذاری وب‌سایت‌ها…
                      </p>
                    ) : websites.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        وب‌سایتی برای این کاربر پیدا نشد.
                      </p>
                    ) : (
                      <div
                        className="relative w-full"
                        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const website = websites[virtualRow.index];
                          const isSelected =
                            website.id === request.targetWebsiteId ||
                            website.id === pendingWebsiteId;

                          return (
                            <div
                              key={website.id}
                              role="option"
                              aria-selected={isSelected}
                              className="absolute start-0 top-0 w-full px-1"
                              style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => void handleSelectWebsite(website)}
                                className={cn(
                                  "flex h-[calc(100%-0.25rem)] w-full flex-col justify-center rounded-md px-3 py-2 text-start transition-colors hover:bg-muted/60 disabled:opacity-60",
                                  isSelected && "bg-primary/10 text-primary",
                                )}
                              >
                                <span
                                  className="truncate text-sm font-medium"
                                  dir="ltr"
                                >
                                  {website.domain}
                                  {isSelected ? " (انتخاب‌شده)" : ""}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {website.tenantName}
                                  {" · "}
                                  {website.hasActivePlan
                                    ? `دارای پلن فعال${website.activePlanLabel ? ` (${website.activePlanLabel})` : ""}`
                                    : "بدون پلن"}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isPublicPlanRequest(request)
                    ? "پس از اتصال کاربر موجود، وب‌سایت‌های او اینجا نمایش داده می‌شود."
                    : "برای نمایش وب‌سایت‌ها، درخواست باید به کاربر یا مستأجر متصل باشد."}
                </p>
              )}
            </section>
          )}

          {request.terminalReason && (
            <section className="rounded-xl border border-border p-4 text-sm">
              <h3 className="font-semibold">دلیل پایانی</h3>
              <p className="mt-2 text-muted-foreground">
                {request.terminalReason}
              </p>
            </section>
          )}

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      </div>

      {refuseKind && !isTerminal ? (
        <PlanRequestRefusePanel
          refuseKind={refuseKind}
          refuseReason={refuseReason}
          refuseError={refuseError}
          submitting={submitting}
          onRefuseReasonChange={(reason) => {
            setRefuseReason(reason);
            if (refuseError) {
              setRefuseError(null);
            }
          }}
          onCancel={closeRefusePanel}
          onConfirm={() => void handleRefuse()}
        />
      ) : null}

      <div className="border-t border-border px-4 py-4">
        {!isTerminal ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/plan-requests"
              className={buttonVariants({ variant: "outline" })}
            >
              بازگشت
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={submitting}
                className={buttonVariants({
                  variant: "outline",
                  className: "gap-1.5",
                })}
              >
                <XCircle className="size-4" aria-hidden />
                رد یا لغو
                <ChevronDown className="size-4 opacity-60" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>نوع انصراف</DropdownMenuLabel>
                  {REFUSE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.kind}
                      variant="destructive"
                      onClick={() => openRefusePanel(option.kind)}
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              disabled={!canActivate || submitting}
              onClick={() => void handleEnable()}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {confirmEnable ? "تأیید فعال‌سازی" : "فعال‌سازی پلن"}
            </Button>
          </div>
        ) : (
          <Link
            href="/plan-requests"
            className={buttonVariants({ variant: "outline" })}
          >
            بازگشت
          </Link>
        )}
        {!canEnable && !isTerminal ? (
          <p className="w-full text-xs text-muted-foreground">
            فعال‌سازی برای نقش فعلی در دسترس نیست.
          </p>
        ) : null}
        {!isTerminal && blockers.length > 0 ? (
          <p className="w-full text-xs text-muted-foreground">
            دکمه فعال‌سازی پس از انتخاب وب‌سایت بدون پلن فعال در دسترس قرار
            می‌گیرد.
          </p>
        ) : null}
        {confirmEnable && canActivate ? (
          <p className="w-full text-xs text-muted-foreground" role="status">
            با تأیید، پلن {request.chosenPlanName} پلن فعال وب‌سایت می‌شود.
          </p>
        ) : null}
      </div>
    </>
  );
}

function PlanRequestRefusePanel({
  refuseKind,
  refuseReason,
  refuseError,
  submitting,
  onRefuseReasonChange,
  onCancel,
  onConfirm,
}: {
  refuseKind: "declined" | "cancelled";
  refuseReason: string;
  refuseError: string | null;
  submitting: boolean;
  onRefuseReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const selectedOption = getRefuseOption(refuseKind);
  const reasonFieldId = "plan-request-refuse-reason";
  const reasonErrorId = `${reasonFieldId}-error`;

  return (
    <section
      aria-labelledby="plan-request-refuse-heading"
      className="border-t border-destructive/20 bg-destructive/5 px-4 py-4"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3
            id="plan-request-refuse-heading"
            className="text-sm font-semibold text-destructive"
          >
            تأیید {selectedOption.label}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {selectedOption.description}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm" htmlFor={reasonFieldId}>
          <span>دلیل</span>
          <textarea
            id={reasonFieldId}
            value={refuseReason}
            onChange={(event) => onRefuseReasonChange(event.target.value)}
            rows={3}
            required
            aria-invalid={Boolean(refuseError)}
            aria-describedby={refuseError ? reasonErrorId : undefined}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            aria-required
          />
          {refuseError ? (
            <p id={reasonErrorId} className="text-xs text-destructive" role="alert">
              {refuseError}
            </p>
          ) : null}
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? "در حال ثبت…" : `ثبت ${selectedOption.label}`}
          </Button>
        </div>
      </div>
    </section>
  );
}
