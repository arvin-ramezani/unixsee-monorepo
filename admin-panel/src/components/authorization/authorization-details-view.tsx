"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CircleAlert,
  IdCard,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import {
  approveAuthorizationCaseAction,
  needsInfoAuthorizationCaseAction,
  rejectAuthorizationCaseAction,
} from "@/actions/authorization/authorization-case-actions";
import { AuthorizationStatusBadge } from "@/components/authorization/authorization-status-badge";
import { AdminBackLink } from "@/components/common/admin-back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/components/ui/sidebar";
import {
  AUTHORIZATION_FIX_FIELD,
  AUTHORIZATION_FIX_FIELD_LABELS,
  AUTHORIZATION_STATUS,
  CONTACT_CHALLENGE_LABELS,
  type AuthorizationCaseType,
  type AuthorizationFixFieldType,
} from "@/lib/data/authorization-data";
import {
  approveAuthorizationCase,
  getRuntimeAuthorizationCase,
  rejectAuthorizationCase,
  requestAuthorizationMoreInfo,
} from "@/lib/data/authorization-runtime";
import { STAFF_CAPABILITY } from "@/lib/data/users-data";
import { hasCapability } from "@/lib/users-utils";

const PACKAGE_FIELDS = [
  { key: "nationalId", label: "کد ملی", ltr: true },
  { key: "birthDate", label: "تاریخ تولد", ltr: true },
  { key: "mobile", label: "موبایل", ltr: true },
  { key: "email", label: "ایمیل", ltr: true },
  { key: "province", label: "استان" },
  { key: "city", label: "شهر" },
  { key: "address", label: "آدرس کامل" },
  { key: "postalCode", label: "کد پستی", ltr: true },
] as const;

const FIX_FIELD_OPTIONS = Object.values(AUTHORIZATION_FIX_FIELD);

type AuthorizationDetailsViewProps = {
  initialCase: AuthorizationCaseType;
  source?: "nest" | "fixture";
};

export function AuthorizationDetailsView({
  initialCase,
  source = "fixture",
}: AuthorizationDetailsViewProps) {
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const [authCase, setAuthCase] = useState(initialCase);
  const [approveOpen, setApproveOpen] = useState(false);
  const [needsInfoOpen, setNeedsInfoOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [fieldsToFix, setFieldsToFix] = useState<AuthorizationFixFieldType[]>(
    [],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const canApprove = hasCapability(STAFF_CAPABILITY.APPROVE_AUTHORIZATION);
  const canReview = hasCapability(STAFF_CAPABILITY.REVIEW_AUTHORIZATION);
  const canViewDocument = hasCapability(
    STAFF_CAPABILITY.VIEW_AUTHORIZATION_DOCUMENT,
  );
  const isPending = authCase.status === AUTHORIZATION_STATUS.PENDING_REVIEW;

  function refreshFromRuntime() {
    const latest = getRuntimeAuthorizationCase(authCase.id);
    if (latest) setAuthCase(latest);
  }

  async function handleApprove() {
    setBusy(true);
    setFormError(null);
    const result =
      source === "nest"
        ? await approveAuthorizationCaseAction(authCase.id)
        : approveAuthorizationCase(authCase.id);
    if (source !== "nest") {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
    setBusy(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setApproveOpen(false);
    setAuthCase(result.case);
    setFlash("پرونده تأیید شد و مستأجر ایجاد/فعال شد.");
    router.refresh();
  }

  async function handleNeedsInfo(event: FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setFormError("دلیل الزامی است.");
      return;
    }
    setBusy(true);
    setFormError(null);
    const result =
      source === "nest"
        ? await needsInfoAuthorizationCaseAction({
            caseId: authCase.id,
            reason,
            fieldsToFix,
          })
        : requestAuthorizationMoreInfo({
            id: authCase.id,
            reason,
            fieldsToFix,
          });
    if (source !== "nest") {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
    setBusy(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setNeedsInfoOpen(false);
    setReason("");
    setFieldsToFix([]);
    setAuthCase(result.case);
    setFlash("درخواست اصلاح برای مشتری ارسال شد.");
    router.refresh();
  }

  async function handleReject(event: FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setFormError("دلیل الزامی است.");
      return;
    }
    setBusy(true);
    setFormError(null);
    const result =
      source === "nest"
        ? await rejectAuthorizationCaseAction({
            caseId: authCase.id,
            reason,
          })
        : rejectAuthorizationCase({
            id: authCase.id,
            reason,
          });
    if (source !== "nest") {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
    setBusy(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setRejectOpen(false);
    setReason("");
    setAuthCase(result.case);
    setFlash("پرونده رد شد.");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-24">
      <AdminBackLink
        href="/users/authorization"
        aria-label="بازگشت به صف احراز هویت"
      >
        بازگشت به صف احراز هویت
      </AdminBackLink>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
              {authCase.userDisplayName}
              <AuthorizationStatusBadge status={authCase.status} />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm w-fit" dir="ltr">
              {authCase.id} · {authCase.userId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/users/${authCase.userId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              پرونده کاربر
            </Link>
            {authCase.relatedPlanRequestIds.map((planRequestId) => (
              <Link
                key={planRequestId}
                href={`/plan-requests/${planRequestId}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                درخواست پلن
              </Link>
            ))}
          </div>
        </div>
        {!!flash && (
          <p
            className="text-success-foreground dark:text-success mt-3 text-sm"
            role="status"
          >
            {flash}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">بسته هویتی</h2>
        <dl className="grid gap-3 sm:grid-cols-2 sm:items-start">
          {PACKAGE_FIELDS.map((field) => {
            const value =
              authCase.package[field.key as keyof typeof authCase.package];
            const isAddress = field.key === "address";
            return (
              <div
                key={field.key}
                className={
                  isAddress
                    ? "flex flex-col gap-1 rounded-xl border px-3 py-2"
                    : "flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                }
              >
                <dt className="text-muted-foreground shrink-0 text-xs">
                  {field.label}
                </dt>
                <dd
                  className={
                    isAddress
                      ? "text-sm font-medium leading-6"
                      : "min-w-0 text-sm font-medium text-start"
                  }
                  dir={"ltr" in field && field.ltr ? "ltr" : undefined}
                >
                  {String(value)}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
            <p className="text-muted-foreground shrink-0 text-xs">
              تأیید موبایل
            </p>
            <p className="min-w-0 font-medium text-start">
              {CONTACT_CHALLENGE_LABELS[authCase.package.mobileChallenge]}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
            <p className="text-muted-foreground shrink-0 text-xs">
              تأیید ایمیل
            </p>
            <p className="min-w-0 font-medium text-start">
              {CONTACT_CHALLENGE_LABELS[authCase.package.emailChallenge]}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <IdCard className="size-4" aria-hidden />
          عکس کارت ملی
        </h2>
        {canViewDocument ? (
          <div className="bg-muted/40 flex min-h-48 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm">
            <div>
              <p className="font-medium">
                {authCase.package.nationalIdCardPreviewLabel}
              </p>
              <p className="text-muted-foreground mt-1" dir="ltr">
                {authCase.package.nationalIdCardFileName}
              </p>
              <p className="text-muted-foreground mt-3 text-xs">
                نمونه رابط — بایت واقعی تصویر فقط از طریق Nest و با قابلیت
                اختصاصی ارائه می‌شود.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground flex items-center gap-2 rounded-xl border p-4 text-sm">
            <ShieldAlert className="size-4 shrink-0" aria-hidden />
            مشاهده مدرک برای نقش فعلی مجاز نیست.
          </div>
        )}
      </section>

      {authCase.staffReason ? (
        <section className="border-warning/40 bg-warning/10 rounded-2xl border p-4 text-sm">
          <p className="font-medium">دلیل کارکنان</p>
          <p className="mt-1">{authCase.staffReason}</p>
        </section>
      ) : null}

      {authCase.status === AUTHORIZATION_STATUS.APPROVED && (
        <section className="border-success/30 bg-success/10 rounded-2xl border p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4" aria-hidden />
            مستأجر تأییدشده
          </p>
          <p className="mt-1">
            {authCase.tenantName} <span dir="ltr">({authCase.tenantId})</span>
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            تصمیم‌گیرنده: {authCase.decidedBy} · {authCase.decidedAt}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">تاریخچه تصمیم‌ها</h2>
        <ul className="space-y-2 text-sm">
          {authCase.history.map((entry) => (
            <li key={entry.id} className="rounded-xl border px-3 py-2">
              <p className="font-medium">{entry.action}</p>
              <p className="text-muted-foreground text-xs">
                {entry.actorName} · {entry.at}
              </p>
              {entry.note ? <p className="mt-1 text-xs">{entry.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      {isPending && canReview && (
        <div
          className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed bottom-0 left-0 z-20 border-t p-3 backdrop-blur transition-[right] duration-200 ease-linear"
          style={{
            right: isMobile
              ? 0
              : state === "collapsed"
                ? "var(--sidebar-width-icon)"
                : "var(--sidebar-width)",
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-wrap gap-2">
            {canApprove && (
              <Button
                type="button"
                className="min-h-11"
                onClick={() => {
                  setFormError(null);
                  setApproveOpen(true);
                }}
              >
                تأیید و ایجاد مستأجر
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setFormError(null);
                setReason("");
                setFieldsToFix([]);
                setNeedsInfoOpen(true);
              }}
            >
              درخواست اصلاح
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              onClick={() => {
                setFormError(null);
                setReason("");
                setRejectOpen(true);
              }}
            >
              رد کردن
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید دستی احراز هویت؟</AlertDialogTitle>
            <AlertDialogDescription>
              فقط پس از بررسی فایل‌ها و اطلاعات این بسته تأیید کنید. ارسال مدارک
              توسط مشتری به‌معنی تأیید خودکار نیست. با تأیید، مستأجر برای «
              {authCase.userDisplayName}» ایجاد می‌شود. این اقدام جایگزین
              فعال‌سازی پلن نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {formError ? (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setApproveOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleApprove()}
            >
              {busy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  در حال تأیید…
                </>
              ) : (
                "تأیید نهایی"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={needsInfoOpen} onOpenChange={setNeedsInfoOpen}>
        <DialogContent>
          <form onSubmit={(event) => void handleNeedsInfo(event)}>
            <DialogHeader>
              <DialogTitle>درخواست اطلاعات بیشتر</DialogTitle>
              <DialogDescription>
                دلیل و فیلدهای نیازمند اصلاح برای مشتری نمایش داده می‌شود.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 px-4">
              <div className="space-y-2">
                <label
                  htmlFor="needs-info-reason"
                  className="text-sm font-medium"
                >
                  دلیل
                </label>
                <Textarea
                  id="needs-info-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  required
                />
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  فیلدهای نیازمند اصلاح
                </legend>
                {FIX_FIELD_OPTIONS.map((field) => {
                  const checked = fieldsToFix.includes(field);
                  return (
                    <label
                      key={field}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={checked}
                        onChange={(event) => {
                          setFieldsToFix((prev) =>
                            event.target.checked
                              ? [...prev, field]
                              : prev.filter((item) => item !== field),
                          );
                        }}
                      />
                      {AUTHORIZATION_FIX_FIELD_LABELS[field]}
                    </label>
                  );
                })}
              </fieldset>
              {formError ? (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              ) : null}
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setNeedsInfoOpen(false)}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={busy}>
                ارسال به مشتری
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <form onSubmit={(event) => void handleReject(event)}>
            <AlertDialogHeader>
              <AlertDialogTitle>رد احراز هویت؟</AlertDialogTitle>
              <AlertDialogDescription>
                دلیل رد برای مشتری قابل مشاهده خواهد بود. رمز یا توکن نمایش داده
                نمی‌شود.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-3 space-y-2 px-4">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                دلیل رد
              </label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                required
              />
              {formError ? (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              ) : null}
            </div>
            <AlertDialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setRejectOpen(false)}
              >
                انصراف
              </Button>
              <Button type="submit" variant="destructive" disabled={busy}>
                تأیید رد
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {!isPending && authCase.status !== AUTHORIZATION_STATUS.APPROVED && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <CircleAlert className="size-4" aria-hidden />
          این پرونده در وضعیت قابل تصمیم فوری نیست.{" "}
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => {
              refreshFromRuntime();
              router.refresh();
            }}
          >
            تازه‌سازی
          </button>
        </p>
      )}
    </div>
  );
}
