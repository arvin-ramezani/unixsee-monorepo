"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarClock, Globe2, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceRequestType,
} from "@/lib/data/complementary-services-data";
import {
  createRuntimeComplementaryAssignment,
  hasRuntimeDuplicateAssignment,
} from "@/lib/data/complementary-services-runtime";
import { toast } from "sonner";
import { CreateServiceDialog } from "./create-service-dialog";
import { ServiceStatusBadge } from "./service-status-badge";

type RequestDetailsViewProps = {
  initialRequest: ComplementaryServiceRequestType;
};

export function RequestDetailsView({
  initialRequest,
}: RequestDetailsViewProps) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = request.status === SERVICE_REQUEST_STATUS.ACCEPTED;
  const hasDuplicateAssignment = hasRuntimeDuplicateAssignment(
    request.websiteId,
    request.family,
  );

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
              <p
                className="mt-1 w-fit text-sm text-muted-foreground"
                dir="ltr"
              >
                {request.websiteDomain}
              </p>
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
            <h2 className="text-sm font-semibold">یادداشت قابل مشاهده مشتری</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {request.customerNote}
            </p>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:justify-end">
        {canCreate ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            ایجاد سرویس برای این وب‌سایت
          </Button>
        ) : (
          <p className="text-xs leading-5 text-muted-foreground sm:me-auto">
            ایجاد سرویس پس از ثبت پذیرش پیشنهاد در دسترس قرار می‌گیرد.
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
        request={request}
        hasDuplicateAssignment={hasDuplicateAssignment}
        onOpenChange={setCreateOpen}
        onCreate={(currentRequest, values) => {
          const result = createRuntimeComplementaryAssignment({
            requestId: currentRequest.id,
            ownerName: values.ownerName,
            commercialModel: values.commercialModel,
            startDate: values.startDate,
            agreedAmount: values.agreedAmount,
          });
          if (!result) return;
          setRequest(result.request);
          setCreateOpen(false);
          toast.success(
            `سرویس «${currentRequest.title}» برای ${currentRequest.websiteDomain} ایجاد و زمان‌بندی شد.`,
          );
          router.refresh();
        }}
      />
    </div>
  );
}
