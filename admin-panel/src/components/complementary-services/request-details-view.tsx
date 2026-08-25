"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  Check,
  Globe2,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";

import {
  acceptComplementaryRequestAction,
  rejectComplementaryRequestAction,
} from "@/actions/complementary-services/complementary-service-actions";
import { AdminBackLink } from "@/components/common/admin-back-link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceRequestType,
} from "@/lib/data/complementary-services-data";

import { toast } from "sonner";
import {
  CreateServiceDialog,
  type CreateServiceSuccessPayload,
} from "./create-service-dialog";
import { ServiceStatusBadge } from "./service-status-badge";
import { WebsiteDomainLink } from "./website-domain-link";

type RequestDetailsViewProps = {
  initialRequest: ComplementaryServiceRequestType;
};

export function RequestDetailsView({
  initialRequest,
}: RequestDetailsViewProps) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const apiRequestId = request.apiId ?? request.id;

  const canActivate = request.status === SERVICE_REQUEST_STATUS.ACCEPTED;
  const canAccept =
    request.status !== SERVICE_REQUEST_STATUS.ACCEPTED &&
    request.status !== SERVICE_REQUEST_STATUS.ACTIVATED &&
    request.status !== SERVICE_REQUEST_STATUS.DECLINED;
  const canReject =
    request.status !== SERVICE_REQUEST_STATUS.ACTIVATED &&
    request.status !== SERVICE_REQUEST_STATUS.DECLINED;

  async function handleAccept() {
    if (accepting) return;
    setAccepting(true);
    const result = await acceptComplementaryRequestAction({
      requestId: apiRequestId,
    });
    setAccepting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setRequest(result.request);
    toast.success(
      "درخواست پذیرفته شد. ایجاد وب‌سایت و فعالسازی سرویس همچنان وضعیت‌های جدا هستند.",
    );
    router.refresh();
  }
  function handleSuccess(payload: CreateServiceSuccessPayload) {
    setRequest((current) => ({
      ...current,
      status: SERVICE_REQUEST_STATUS.ACTIVATED,
      nextAction: "مشاهده سرویس ایجادشده",
      updatedAt: "همین حالا",
    }));
    setCreateOpen(false);
    toast.success(
      `سرویس «${payload.title}» برای ${payload.websiteDomain} فعال شد.`,
    );
    router.refresh();
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت دلیل رد الزامی است.");
      return;
    }

    setRejecting(true);
    const result = await rejectComplementaryRequestAction({
      requestId: apiRequestId,
      reason: trimmed,
    });
    setRejecting(false);

    if (!result.ok) {
      setRejectError(result.message);
      return;
    }

    setRequest(result.request);
    setRejectOpen(false);
    setRejectReason("");
    setRejectError("");
    toast.success("درخواست رد شد.");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <AdminBackLink
        href="/complementary-services"
        aria-label="بازگشت به خدمات تکمیلی"
      >
        بازگشت به خدمات تکمیلی
      </AdminBackLink>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2">
          <ServiceStatusBadge kind="request" status={request.status} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {request.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          درخواست {request.id} · آخرین بروزرسانی {request.updatedAt}
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium">{request.websiteTitle}</p>
              <WebsiteDomainLink
                domain={request.websiteDomain}
                className="mt-1 block w-fit text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {request.customerName}
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold">شرح درخواست مشتری</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {request.description}
          </p>
        </section>

        <dl className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">نوع سرویس</dt>
            <dd className="mt-1 text-sm font-medium">
              {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">نوع همکاری</dt>
            <dd className="mt-1 text-sm font-medium">
              {request.preferredEngagement}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">مسئول</dt>
            <dd className="mt-1 text-sm font-medium">
              {request.ownerName ?? "تخصیص داده نشده"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">زمان ثبت</dt>
            <dd className="mt-1 text-sm font-medium">{request.submittedAt}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">نام کامل مشتری</dt>
            <dd className="mt-1 text-sm font-medium">{request.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">راه ارتباطی</dt>
            <dd className="mt-1 text-sm font-medium">
              {[request.customerPhone, request.customerEmail]
                .filter(Boolean)
                .join(" · ") || "ثبت نشده"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">پوشش مدیریتی</dt>
            <dd className="mt-1 text-sm font-medium">
              {request.managementCoverage === "UNIXSEE_MANAGED"
                ? "میزبانی و مدیریت‌شده توسط یونیکسی"
                : "میزبانی خارجی — فقط خدمات تکمیلی"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              وضعیت احراز مالکیت
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {request.authorizationState === "AUTHORIZED"
                ? "مستأجر مجاز"
                : request.authorizationState === "NOT_AUTHORIZED_AT_ACTIVATION"
                  ? "هنگام فعالسازی مجاز نبود"
                  : "هنوز مستأجر مجاز ندارد"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">حل مقصد</dt>
            <dd className="mt-1 text-sm font-medium">
              {request.resolutionState === "LINKED"
                ? "به وب‌سایت متصل"
                : request.resolutionState === "DEFERRED_NO_TENANT"
                  ? "تعویق تا احراز مالکیت"
                  : "در انتظار پذیرش"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">فعالسازی سرویس</dt>
            <dd className="mt-1 text-sm font-medium">
              {request.serviceActivationState === "ACTIVE"
                ? "فعال"
                : request.serviceActivationState === "COMPLETED"
                  ? "تکمیل‌شده"
                  : "شروع نشده"}
            </dd>
          </div>
        </dl>

        <section className="rounded-xl border border-accent bg-accent/15 p-4">
          <p className="text-xs text-accent-foreground">اقدام بعدی</p>
          <p className="mt-1 text-sm font-medium">{request.nextAction}</p>
          {request.dueLabel && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              سررسید: {request.dueLabel}
            </p>
          )}
        </section>

        {request.customerNote && (
          <section className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold">
              {request.status === SERVICE_REQUEST_STATUS.DECLINED
                ? "دلیل رد"
                : "یادداشت قابل مشاهده مشتری"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {request.customerNote}
            </p>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:justify-end">
        {canAccept && (
          <Button type="button" onClick={handleAccept} disabled={accepting}>
            {accepting ? (
              <LoaderCircle
                data-icon="inline-start"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Check data-icon="inline-start" />
            )}
            {accepting ? "در حال پذیرش..." : "پذیرش درخواست"}
          </Button>
        )}{" "}
        {canActivate && (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            فعالسازی سرویس
          </Button>
        )}
        {canReject && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setRejectError("");
              setRejectOpen(true);
            }}
          >
            <X data-icon="inline-start" />
            رد درخواست
          </Button>
        )}
        {!canActivate && !canReject && (
          <p className="text-xs leading-5 text-muted-foreground sm:me-auto">
            {request.status === SERVICE_REQUEST_STATUS.ACTIVATED
              ? "سرویس این درخواست قبلاً فعال شده است."
              : "این درخواست رد شده است."}
          </p>
        )}
        {!canActivate && canReject && (
          <p className="text-xs leading-5 text-muted-foreground sm:me-auto sm:w-full">
            فعالسازی پس از ثبت پذیرش پیشنهاد در دسترس قرار می‌گیرد.
          </p>
        )}
        <AdminBackLink href="/complementary-services">بازگشت</AdminBackLink>
      </div>

      <CreateServiceDialog
        open={createOpen}
        mode="request"
        request={request}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) {
            setRejectError("");
          }
        }}
      >
        <AlertDialogContent>
          <form onSubmit={handleReject}>
            <AlertDialogHeader>
              <AlertDialogTitle>رد درخواست خدمات تکمیلی؟</AlertDialogTitle>
              <AlertDialogDescription>
                دلیل رد برای مشتری قابل مشاهده خواهد بود و درخواست بسته می‌شود.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 px-4">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                دلیل رد *
              </label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  setRejectError("");
                }}
                rows={4}
                required
                aria-invalid={Boolean(rejectError)}
                aria-describedby={
                  rejectError ? "reject-reason-error" : undefined
                }
              />
              {rejectError ? (
                <p
                  id="reject-reason-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {rejectError}
                </p>
              ) : null}
            </div>
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={rejecting}
                onClick={() => setRejectOpen(false)}
              >
                انصراف
              </Button>
              <Button type="submit" variant="destructive" disabled={rejecting}>
                {rejecting ? "در حال ثبت..." : "تأیید رد"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
