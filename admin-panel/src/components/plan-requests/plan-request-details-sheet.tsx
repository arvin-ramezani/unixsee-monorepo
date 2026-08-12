"use client";

import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  LoaderCircle,
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PLAN_REQUEST_BLOCKER,
  PLAN_REQUEST_BLOCKER_LABELS,
  PLAN_REQUEST_STATUS,
  type PlanRequestBlockerType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import { STAFF_CAPABILITY } from "@/lib/data/users-data";
import { hasCapability, maskEmail, maskMobile } from "@/lib/users-utils";
import { cn } from "@/lib/utils";
import { PlanRequestStatusBadge } from "./plan-request-status-badge";

type PlanRequestDetailsSheetProps = {
  request: PlanRequestType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestChanged: (request: PlanRequestType, message: string) => void;
};

const WEBSITE_ROW_HEIGHT = 72;

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

  if (!request.linkedUserId || !request.linkedTenantId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_USER);
  }

  if (!request.targetWebsiteId && !selectedWebsite) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE);
  }

  if (selectedWebsite?.hasActivePlan) {
    blockers.push(PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT);
  }

  return blockers;
}

export function PlanRequestDetailsSheet({
  request,
  open,
  onOpenChange,
  onRequestChanged,
}: PlanRequestDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-lg"
      >
        {request && (
          <>
            <SheetHeader className="border-b border-border px-4 py-4 pe-12 text-right">
              <SheetTitle className="flex flex-wrap items-center gap-2">
                <span className="w-fit" dir="ltr">
                  {request.chosenPlanName}
                </span>
                <PlanRequestStatusBadge status={request.status} />
              </SheetTitle>
              <SheetDescription>
                انتخاب وب‌سایت کاربر متصل، فعال‌سازی یا رد درخواست
              </SheetDescription>
            </SheetHeader>

            <PlanRequestDetailsBody
              key={request.id}
              request={request}
              onRequestChanged={onRequestChanged}
              onClose={() => onOpenChange(false)}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PlanRequestSummary({ request }: { request: PlanRequestType }) {
  const contactSummary = request.contactMobile
    ? maskMobile(request.contactMobile)
    : request.contactEmail
      ? maskEmail(request.contactEmail)
      : "—";

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">خلاصه درخواست</h3>
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
          <dt className="text-xs text-muted-foreground">نام تماس</dt>
          <dd className="mt-1">{request.contactName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">شناسه تماس</dt>
          <dd className="mt-1 w-fit" dir="ltr">
            {contactSummary}
          </dd>
        </div>
        {request.domainHint ? (
          <div>
            <dt className="text-xs text-muted-foreground">راهنمای دامنه</dt>
            <dd className="mt-1 w-fit" dir="ltr">
              {request.domainHint}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-muted-foreground">ثبت</dt>
          <dd className="mt-1">{request.submittedAt}</dd>
        </div>
        {request.linkedUserName || request.linkedUserId ? (
          <div className="sm:col-span-2">
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
  );
}

function PlanRequestDetailsBody({
  request: initialRequest,
  onRequestChanged,
  onClose,
}: {
  request: PlanRequestType;
  onRequestChanged: PlanRequestDetailsSheetProps["onRequestChanged"];
  onClose: () => void;
}) {
  const canEnable = hasCapability(STAFF_CAPABILITY.ENABLE_PLAN_REQUEST);
  const [request, setRequest] = useState(initialRequest);
  const [websiteQuery, setWebsiteQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [websites, setWebsites] = useState<PlanRequestWebsiteOption[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websitesError, setWebsitesError] = useState<string | null>(null);
  const [pendingWebsiteId, setPendingWebsiteId] = useState<string | null>(null);
  const [refuseKind, setRefuseKind] = useState<"declined" | "cancelled">(
    "declined",
  );
  const [refuseReason, setRefuseReason] = useState("");
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

  const syncRequest = (next: PlanRequestType, message: string) => {
    setRequest(next);
    setConfirmEnable(false);
    setPendingWebsiteId(null);
    onRequestChanged(next, message);
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
        setFormError(result.message);
        setPendingWebsiteId(null);
        return;
      }

      syncRequest(
        result.request,
        "وب‌سایت هدف انتخاب شد و به درخواست متصل شد.",
      );
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
        setFormError(result.message);
        setConfirmEnable(false);
        return;
      }

      syncRequest(
        result.request,
        `پلن ${result.request.chosenPlanName} روی وب‌سایت فعال شد.`,
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const result = await declinePlanRequestAction({
        requestId: request.id,
        reason: refuseReason,
        kind: refuseKind,
      });

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      syncRequest(
        result.request,
        refuseKind === "declined" ? "درخواست رد شد." : "درخواست لغو شد.",
      );
      onClose();
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
                  اگر حساب مالک وب‌سایت وجود ندارد، ابتدا در{" "}
                  <Link href="/users" className="underline underline-offset-2">
                    کاربران
                  </Link>{" "}
                  ایجاد کنید؛ این صفحه کاربر جدید نمی‌سازد.
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
                  برای نمایش وب‌سایت‌ها، درخواست باید به کاربر یا مستأجر متصل
                  باشد.
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

          {!isTerminal ? (
            <form
              className="flex flex-col gap-3 rounded-xl border border-border p-4"
              onSubmit={(event) => void handleRefuse(event)}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="size-4" aria-hidden />
                رد یا لغو
              </h3>
              <RadioGroup
                value={refuseKind}
                onValueChange={(value) => {
                  if (value === "declined" || value === "cancelled") {
                    setRefuseKind(value);
                  }
                }}
                aria-label="نوع انصراف"
                className="gap-2"
              >
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/80 p-3 transition-colors hover:bg-muted/40",
                    refuseKind === "declined" &&
                      "border-primary/40 bg-primary/5",
                  )}
                >
                  <RadioGroupItem
                    value="declined"
                    className="mt-0.5"
                    aria-label="رد درخواست"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">رد درخواست</span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      درخواست نامناسب است یا شرایط فعال‌سازی فراهم نیست.
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/80 p-3 transition-colors hover:bg-muted/40",
                    refuseKind === "cancelled" &&
                      "border-primary/40 bg-primary/5",
                  )}
                >
                  <RadioGroupItem
                    value="cancelled"
                    className="mt-0.5"
                    aria-label="لغو درخواست"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">لغو درخواست</span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      مشتری منصرف شده یا دیگر نیازی به پیگیری نیست.
                    </span>
                  </span>
                </label>
              </RadioGroup>
              <label className="flex flex-col gap-1.5 text-sm">
                <span>دلیل</span>
                <textarea
                  value={refuseReason}
                  onChange={(event) => setRefuseReason(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-required
                />
              </label>
              <Button type="submit" variant="outline" disabled={submitting}>
                {submitting ? "در حال ثبت…" : "ثبت رد / لغو"}
              </Button>
            </form>
          ) : null}

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      </div>

      <SheetFooter className="border-t border-border px-4 py-4">
        {!isTerminal ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              بستن
            </Button>
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
          <Button type="button" variant="outline" onClick={onClose}>
            بستن
          </Button>
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
      </SheetFooter>
    </>
  );
}
