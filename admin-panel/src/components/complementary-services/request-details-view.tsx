"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarClock, Globe2, Plus, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceRequestType,
} from "@/lib/data/complementary-services-data";
import { declineRuntimeComplementaryRequest } from "@/lib/data/complementary-services-runtime";
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

  const canActivate = request.status === SERVICE_REQUEST_STATUS.ACCEPTED;
  const canReject =
    request.status !== SERVICE_REQUEST_STATUS.ACTIVATED &&
    request.status !== SERVICE_REQUEST_STATUS.DECLINED;

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

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت دلیل رد الزامی است.");
      return;
    }

    setRejecting(true);
    const result = declineRuntimeComplementaryRequest({
      requestId: request.id,
      reason: trimmed,
    });
    setRejecting(false);

    if (!result.ok) {
      setRejectError(
        result.reason === "not_rejectable"
          ? "این درخواست در وضعیت قابل رد نیست."
          : "رد درخواست انجام نشد.",
      );
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
      <Link
        href="/complementary-services"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "w-fit gap-2",
        })}
        aria-label="بازگشت به خدمات تکمیلی"
      >
        <ArrowRight data-icon="inline-start" />
        بازگشت به خدمات تکمیلی
      </Link>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2">
          <ServiceStatusBadge kind="request" status={request.status} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{request.title}</h1>
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
        <Link
          href="/complementary-services"
          className={buttonVariants({ variant: "outline" })}
        >
          بازگشت
        </Link>
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
              <Button
                type="submit"
                variant="destructive"
                disabled={rejecting}
              >
                {rejecting ? "در حال ثبت..." : "تأیید رد"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
