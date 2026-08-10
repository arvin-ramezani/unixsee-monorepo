"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Link2, XCircle } from "lucide-react";

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
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import {
  enablePlanRequest,
  getPlanRequestBlockers,
  getRuntimePlanRequest,
  linkExistingUserToPlanRequest,
  refusePlanRequest,
  selectWebsiteForPlanRequest,
} from "@/lib/data/plan-requests-runtime";
import { websiteHasActivePlan } from "@/lib/data/plans-data";
import { STAFF_CAPABILITY, type CustomerUserType } from "@/lib/data/users-data";
import { getRuntimeUser, listRuntimeUsers } from "@/lib/data/users-runtime";
import { listRuntimeWebsitesByTenant } from "@/lib/data/websites-runtime";
import { hasCapability, maskEmail, maskMobile } from "@/lib/users-utils";
import { cn } from "@/lib/utils";
import { PlanRequestStatusBadge } from "./plan-request-status-badge";

type PlanRequestDetailsSheetProps = {
  request: PlanRequestType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestChanged: (request: PlanRequestType, message: string) => void;
};

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function matchesUserQuery(user: CustomerUserType, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const compactQuery = normalizedQuery.replace(/[\s-]/g, "");
  const fields = [user.displayName, user.email ?? "", user.mobile, user.id].map(
    normalizeSearchText,
  );

  return fields.some((field) => {
    if (field.includes(normalizedQuery)) return true;
    return field.replace(/[\s-]/g, "").includes(compactQuery);
  });
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
                اتصال کاربر موجود، انتخاب وب‌سایت و فعال‌سازی پلن درخواست‌شده
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
  const [userQuery, setUserQuery] = useState("");
  const [refuseKind, setRefuseKind] = useState<"declined" | "cancelled">(
    "declined",
  );
  const [refuseReason, setRefuseReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEnable, setConfirmEnable] = useState(false);

  const blockers = getPlanRequestBlockers(request);
  const isTerminal =
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED;
  const canActivate = canEnable && blockers.length === 0 && !isTerminal;

  const linkedUser = request.linkedUserId
    ? getRuntimeUser(request.linkedUserId)
    : null;
  const tenantWebsites = request.linkedTenantId
    ? listRuntimeWebsitesByTenant(request.linkedTenantId)
    : [];
  const selectedWebsite = request.targetWebsiteId
    ? tenantWebsites.find((website) => website.id === request.targetWebsiteId)
    : undefined;

  const userCandidates = useMemo(() => {
    const users = listRuntimeUsers();
    const filtered = users.filter((user) => matchesUserQuery(user, userQuery));
    return filtered.slice(0, userQuery.trim() ? 12 : 8);
  }, [userQuery]);

  const syncRequest = (next: PlanRequestType, message: string) => {
    const fresh = getRuntimePlanRequest(next.id) ?? next;
    setRequest(fresh);
    setConfirmEnable(false);
    onRequestChanged(fresh, message);
  };

  const handleLinkUser = (userId: string) => {
    setFormError(null);
    const result = linkExistingUserToPlanRequest(request.id, userId);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setUserQuery("");
    syncRequest(
      result.request,
      `کاربر «${result.user.displayName}» به درخواست متصل شد.`,
    );
  };

  const handleSelectWebsite = (websiteId: string | null) => {
    if (!websiteId) return;
    setFormError(null);

    const result = selectWebsiteForPlanRequest(request.id, websiteId);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    syncRequest(result.request, "وب‌سایت هدف برای فعال‌سازی ثبت شد.");
  };

  const handleEnable = () => {
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
    if (!confirmEnable) {
      setConfirmEnable(true);
      return;
    }

    const result = enablePlanRequest(request.id);
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
  };

  const handleRefuse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = refusePlanRequest(request.id, refuseKind, refuseReason);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    syncRequest(
      result.request,
      refuseKind === "declined" ? "درخواست رد شد." : "درخواست لغو شد.",
    );
    onClose();
  };

  const contactSummary = request.contactMobile
    ? maskMobile(request.contactMobile)
    : request.contactEmail
      ? maskEmail(request.contactEmail)
      : "—";

  const selectedWebsiteLabel = selectedWebsite
    ? `${selectedWebsite.domain}${
        websiteHasActivePlan(selectedWebsite.service.plan)
          ? " — دارای پلن فعال"
          : " — بدون پلن"
      }`
    : "وب‌سایت را انتخاب کنید";

  return (
    <>
      <div className="app-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <section className="space-y-3 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">خلاصه درخواست</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">پلن انتخاب‌شده</dt>
              <dd className="mt-1 font-medium w-fit" dir="ltr">
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
          </dl>
        </section>

        {blockers.length > 0 && (
          <section
            className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            role="status"
          >
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" aria-hidden />
              موانع فعال‌سازی
            </p>
            <ul className="list-disc space-y-1 pr-5">
              {blockers.map((blocker) => (
                <li key={blocker}>{PLAN_REQUEST_BLOCKER_LABELS[blocker]}</li>
              ))}
            </ul>
            {blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_USER) && (
              <p className="text-xs text-destructive/90">
                اگر حساب وجود ندارد، ابتدا در{" "}
                <Link href="/users" className="underline underline-offset-2">
                  کاربران
                </Link>{" "}
                ایجاد کنید؛ این صفحه کاربر جدید نمی‌سازد.
              </p>
            )}
          </section>
        )}

        {!isTerminal && (
          <section className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Link2 className="size-4" aria-hidden />
              اتصال کاربر موجود
            </h3>
            {linkedUser && (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                متصل: {linkedUser.displayName}
                <span className="ms-2 text-muted-foreground" dir="ltr">
                  {linkedUser.id}
                </span>
              </p>
            )}
            <SearchInput
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="جستجوی نام، ایمیل یا موبایل…"
              aria-label="جستجوی کاربر موجود"
              autoComplete="off"
            />
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
              {userCandidates.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  کاربری با این جستجو پیدا نشد.
                </li>
              ) : (
                userCandidates.map((user) => {
                  const isLinked = user.id === request.linkedUserId;
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleLinkUser(user.id)}
                        className={cn(
                          "flex w-full flex-col rounded-md px-3 py-2 text-start transition-colors hover:bg-muted/60",
                          isLinked && "bg-primary/10 text-primary",
                        )}
                      >
                        <span className="text-sm font-medium">
                          {user.displayName}
                          {isLinked ? " (متصل)" : ""}
                        </span>
                        <span
                          className="text-xs text-muted-foreground w-fit"
                          dir="ltr"
                        >
                          {[user.email, user.mobile]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        )}

        {!isTerminal && request.linkedTenantId && (
          <section className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold">وب‌سایت هدف</h3>
            {tenantWebsites.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                برای این مستأجر وب‌سایتی ثبت نشده است. ابتدا در سرورها /
                وب‌سایت‌ها آماده شود.
              </p>
            ) : (
              <Select
                value={request.targetWebsiteId ?? undefined}
                onValueChange={handleSelectWebsite}
              >
                <SelectTrigger aria-label="انتخاب وب‌سایت هدف">
                  <SelectValue placeholder="وب‌سایت را انتخاب کنید">
                    {selectedWebsiteLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {tenantWebsites.map((website) => {
                    const hasPlan = websiteHasActivePlan(website.service.plan);
                    return (
                      <SelectItem key={website.id} value={website.id}>
                        <span dir="ltr">{website.domain}</span>
                        {hasPlan ? " — دارای پلن فعال" : " — بدون پلن"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {selectedWebsite && (
              <p
                className={cn(
                  "text-xs",
                  websiteHasActivePlan(selectedWebsite.service.plan)
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                پلن فعلی:{" "}
                <span dir="ltr">
                  {websiteHasActivePlan(selectedWebsite.service.plan)
                    ? selectedWebsite.service.plan
                    : "—"}
                </span>
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

        <section className="space-y-3 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">سابقه</h3>
          <ol className="space-y-3">
            {request.history.map((entry) => (
              <li
                key={entry.id}
                className="border-r-2 border-border pr-3 text-sm"
              >
                <p className="font-medium">{entry.action}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.actorName} · {entry.at}
                </p>
                {entry.note && (
                  <p className="mt-1 text-muted-foreground">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {!isTerminal ? (
          <form
            className="space-y-3 rounded-xl border border-border p-4"
            onSubmit={handleRefuse}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <XCircle className="size-4" aria-hidden />
              رد یا لغو
            </h3>
            <Select
              value={refuseKind}
              onValueChange={(value) => {
                if (value === "declined" || value === "cancelled") {
                  setRefuseKind(value);
                }
              }}
            >
              <SelectTrigger aria-label="نوع انصراف">
                <SelectValue>
                  {refuseKind === "declined" ? "رد درخواست" : "لغو درخواست"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="declined">رد درخواست</SelectItem>
                <SelectItem value="cancelled">لغو درخواست</SelectItem>
              </SelectContent>
            </Select>
            <label className="block space-y-1.5 text-sm">
              <span>دلیل</span>
              <textarea
                value={refuseReason}
                onChange={(event) => setRefuseReason(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-required
              />
            </label>
            <Button type="submit" variant="outline">
              ثبت رد / لغو
            </Button>
          </form>
        ) : null}

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      <SheetFooter className="border-t border-border px-4 py-4">
        {!isTerminal ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              بستن
            </Button>
            <Button
              type="button"
              disabled={!canActivate}
              onClick={handleEnable}
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
            فعال‌سازی برای نقش فعلی در دسترس نیست (نمونه دسترسی UI، نه مجوز
            واقعی).
          </p>
        ) : null}
        {!isTerminal && blockers.length > 0 ? (
          <p className="w-full text-xs text-muted-foreground">
            دکمه فعال‌سازی پس از اتصال کاربر موجود و انتخاب وب‌سایت بدون پلن
            فعال در دسترس قرار می‌گیرد.
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
