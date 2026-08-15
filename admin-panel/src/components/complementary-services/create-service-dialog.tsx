"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe2,
  Paperclip,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLEMENTARY_SERVICE_FAMILY,
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  COMPLEMENTARY_SERVICE_OWNERS,
  DESIGN_SCOPE_OPTIONS,
  SEO_SCOPE_OPTIONS,
  SERVICE_COMMERCIAL_MODEL,
  SERVICE_ENGAGEMENT,
  SERVICE_ENGAGEMENT_LABELS,
  type ComplementaryServiceFamilyType,
  type ComplementaryServiceRequestType,
  type ServiceEngagementType,
} from "@/lib/data/complementary-services-data";
import {
  createRuntimeComplementaryAssignment,
  createRuntimeStaffComplementaryAssignment,
  hasRuntimeDuplicateAssignment,
  hasRuntimeDuplicatePendingRequest,
} from "@/lib/data/complementary-services-runtime";
import { listRuntimeTenants } from "@/lib/data/users-runtime";
import { listRuntimeWebsitesByTenant } from "@/lib/data/websites-runtime";
import { cn } from "@/lib/utils";

export type CreateServiceMode = "request" | "staff";

export type CreateServiceSuccessPayload = {
  mode: CreateServiceMode;
  assignmentId: string;
  title: string;
  websiteDomain: string;
};

type CreateServiceDialogProps = {
  open: boolean;
  mode: CreateServiceMode;
  request?: ComplementaryServiceRequestType | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (payload: CreateServiceSuccessPayload) => void;
};

const FAMILY_OPTIONS = Object.values(COMPLEMENTARY_SERVICE_FAMILY);
const ENGAGEMENT_OPTIONS = Object.values(SERVICE_ENGAGEMENT);
const DEFAULT_OWNER = COMPLEMENTARY_SERVICE_OWNERS[0];
const DEFAULT_COMMERCIAL_MODEL = SERVICE_COMMERCIAL_MODEL.CUSTOM_QUOTE;

const ACCEPTED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

type FormStep = "edit" | "confirm";

function ChoiceCard({
  id,
  name,
  value,
  checked,
  onChange,
  children,
}: {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "box-border flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors",
        checked
          ? "border-primary bg-accent text-accent-foreground"
          : "bg-background hover:bg-muted/40",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4 shrink-0 accent-primary"
      />
      <span className="min-w-0 flex-1 text-start leading-5 break-words">
        {children}
      </span>
    </label>
  );
}

function mapPreferredEngagement(
  label: string | null | undefined,
): ServiceEngagementType | "" {
  if (!label) return "";
  if (label.includes("مستمر")) return SERVICE_ENGAGEMENT.RECURRING;
  if (label.includes("یک")) return SERVICE_ENGAGEMENT.ONE_TIME;
  return "";
}

function CreateServiceForm({
  mode,
  request,
  onCancel,
  onSuccess,
}: {
  mode: CreateServiceMode;
  request: ComplementaryServiceRequestType | null;
  onCancel: () => void;
  onSuccess: CreateServiceDialogProps["onSuccess"];
}) {
  const tenants = useMemo(() => listRuntimeTenants(), []);
  const [step, setStep] = useState<FormStep>("edit");
  const [tenantId, setTenantId] = useState("");
  const [websiteId, setWebsiteId] = useState(request?.websiteId ?? "");
  const [family, setFamily] = useState<ComplementaryServiceFamilyType | "">(
    request?.family ?? "",
  );
  const [engagement, setEngagement] = useState<ServiceEngagementType | "">(
    mapPreferredEngagement(request?.preferredEngagement),
  );
  const [serviceScope, setServiceScope] = useState("");
  const [title, setTitle] = useState(request?.title ?? "");
  const [description, setDescription] = useState(request?.description ?? "");
  const [startDate, setStartDate] = useState("");
  const [agreedAmount, setAgreedAmount] = useState("");
  const [scopeSummary, setScopeSummary] = useState(request?.description ?? "");
  const [exclusions, setExclusions] = useState("");
  const [createReason, setCreateReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ownerName = request?.ownerName ?? DEFAULT_OWNER;
  const commercialModel = DEFAULT_COMMERCIAL_MODEL;

  const websites = useMemo(
    () => (tenantId ? listRuntimeWebsitesByTenant(tenantId) : []),
    [tenantId],
  );
  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const selectedWebsite = websites.find((item) => item.id === websiteId);
  const selectedWebsiteLabel = selectedWebsite
    ? `${selectedWebsite.title} — ${selectedWebsite.domain}`
    : "";
  const lockedWebsiteLabel = request
    ? `${request.websiteTitle} — ${request.websiteDomain}`
    : selectedWebsiteLabel;

  const effectiveWebsiteId = mode === "request" ? request!.websiteId : websiteId;
  const effectiveFamily =
    mode === "request" ? request!.family : (family as ComplementaryServiceFamilyType);
  const hasDuplicateAssignment =
    Boolean(effectiveWebsiteId && effectiveFamily) &&
    hasRuntimeDuplicateAssignment(effectiveWebsiteId, effectiveFamily);
  const hasDuplicatePending =
    Boolean(effectiveWebsiteId && effectiveFamily) &&
    hasRuntimeDuplicatePendingRequest(
      effectiveWebsiteId,
      effectiveFamily,
      mode === "request" ? request?.id : undefined,
    );

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (mode === "staff") {
      if (!tenantId) nextErrors.tenantId = "مستأجر را انتخاب کنید.";
      if (!websiteId) nextErrors.websiteId = "وب‌سایت را انتخاب کنید.";
      if (!family) nextErrors.family = "نوع سرویس را انتخاب کنید.";
      if (!createReason.trim()) {
        nextErrors.createReason = "دلیل ایجاد بدون درخواست مشتری الزامی است.";
      }
    }

    if (!engagement) nextErrors.engagement = "نوع همکاری را انتخاب کنید.";
    if (!title.trim()) nextErrors.title = "عنوان الزامی است.";
    if (description.trim().length < 20) {
      nextErrors.description = "توضیحات باید حداقل ۲۰ نویسه باشد.";
    }
    if (!startDate) nextErrors.startDate = "تاریخ شروع الزامی است.";
    if (!agreedAmount.trim()) nextErrors.agreedAmount = "مبلغ توافق‌شده الزامی است.";
    if (!scopeSummary.trim()) {
      nextErrors.scopeSummary = "محدوده مورد توافق الزامی است.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function addFiles(fileList: FileList | null) {
    const next = Array.from(fileList ?? []);
    const invalid = next.find(
      (file) =>
        file.size > 5 * 1024 * 1024 || !ACCEPTED_FILE_TYPES.has(file.type),
    );
    if (invalid) {
      setFileError(
        "فقط تصویر، PDF، CSV یا Excel تا ۵ مگابایت و حداکثر ۵ فایل مجاز است.",
      );
      return;
    }
    setFileError("");
    setFiles((current) => [...current, ...next].slice(0, 5));
  }

  function goToConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    if (hasDuplicateAssignment) {
      setSubmitError(
        "برای این وب‌سایت سرویس هم‌نوع فعال یا زمان‌بندی‌شده وجود دارد. ایجاد سرویس جدید مسدود است.",
      );
      return;
    }
    setStep("confirm");
  }

  function submitConfirmed() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");

    if (mode === "request" && request) {
      const result = createRuntimeComplementaryAssignment({
        requestId: request.id,
        ownerName,
        commercialModel,
        startDate,
        agreedAmount,
        title,
        description,
        engagement: engagement || null,
        serviceScope: serviceScope || null,
        scopeSummary,
        exclusions,
      });

      setSubmitting(false);

      if (!result || !("ok" in result)) return;
      if (!result.ok) {
        setSubmitError(
          result.reason === "duplicate"
            ? "سرویس هم‌نوع از قبل وجود دارد."
            : "درخواست برای ایجاد سرویس واجد شرایط نیست.",
        );
        setStep("edit");
        return;
      }

      onSuccess({
        mode,
        assignmentId: result.assignment.id,
        title: result.assignment.title,
        websiteDomain: result.assignment.websiteDomain,
      });
      return;
    }

    if (!family || !engagement) {
      setSubmitting(false);
      setStep("edit");
      return;
    }

    const result = createRuntimeStaffComplementaryAssignment({
      websiteId,
      family,
      title,
      description,
      engagement,
      serviceScope: serviceScope || null,
      scopeSummary,
      exclusions,
      ownerName,
      commercialModel,
      startDate,
      agreedAmount,
      createReason,
    });

    setSubmitting(false);

    if (!result.ok) {
      const messages = {
        website_missing: "وب‌سایت پیدا نشد.",
        tenant_required: "اتصال سرویس فقط برای وب‌سایت دارای مستأجر مجاز است.",
        duplicate: "سرویس هم‌نوع از قبل وجود دارد.",
      } as const;
      setSubmitError(messages[result.reason]);
      setStep("edit");
      return;
    }

    onSuccess({
      mode,
      assignmentId: result.assignment.id,
      title: result.assignment.title,
      websiteDomain: result.assignment.websiteDomain,
    });
  }

  if (step === "confirm") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip">
          <div className="box-border w-full max-w-full space-y-4 px-4 pb-6">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">بازبینی اتصال سرویس</p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">وب‌سایت</dt>
                <dd className="mt-1" dir="ltr">
                  {mode === "request"
                    ? request?.websiteDomain
                    : selectedWebsite?.domain}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">سرویس</dt>
                <dd className="mt-1">
                  {COMPLEMENTARY_SERVICE_FAMILY_LABELS[effectiveFamily]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">عنوان</dt>
                <dd className="mt-1">{title}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">مبلغ</dt>
                <dd className="mt-1">{agreedAmount}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">تاریخ شروع</dt>
                <dd className="mt-1" dir="ltr">
                  {startDate}
                </dd>
              </div>
            </dl>
          </div>
          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={submitConfirmed}
            disabled={submitting}
          >
            {submitting
              ? mode === "request"
                ? "در حال فعالسازی..."
                : "در حال ایجاد..."
              : mode === "request"
                ? "تأیید و فعالسازی سرویس"
                : "تأیید و ایجاد سرویس"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("edit")}
            disabled={submitting}
          >
            بازگشت به فرم
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      onSubmit={goToConfirm}
      noValidate
    >
      <div className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip">
        <div className="box-border w-full max-w-full space-y-5 px-4 pb-6">
        {mode === "request" && request ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe2 className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{request.websiteTitle}</p>
                <p
                  className="mt-1 w-fit truncate text-sm text-muted-foreground"
                  dir="ltr"
                >
                  {request.websiteDomain}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {request.customerName} · درخواست {request.id}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid w-full min-w-0 grid-cols-1 gap-4">
            <div className="min-w-0 space-y-2">
              <label htmlFor="create-tenant" className="text-sm font-medium">
                مستأجر *
              </label>
              <Select
                value={tenantId}
                onValueChange={(value) => {
                  if (!value) return;
                  setTenantId(value);
                  setWebsiteId("");
                  setErrors((current) => ({
                    ...current,
                    tenantId: "",
                    websiteId: "",
                  }));
                }}
              >
                <SelectTrigger
                  id="create-tenant"
                  className="w-full max-w-full min-w-0"
                  aria-invalid={Boolean(errors.tenantId)}
                >
                  <SelectValue
                    placeholder="انتخاب مستأجر"
                    className="text-start"
                  >
                    {selectedTenant?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenantId && (
                <p className="text-xs text-destructive">{errors.tenantId}</p>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="create-website"
                className="text-sm font-medium"
              >
                وب‌سایت *
              </label>
              <Select
                value={websiteId}
                onValueChange={(value) => {
                  if (!value) return;
                  setWebsiteId(value);
                  setErrors((current) => ({ ...current, websiteId: "" }));
                }}
                disabled={!tenantId}
              >
                <SelectTrigger
                  id="create-website"
                  className="w-full max-w-full min-w-0"
                  aria-invalid={Boolean(errors.websiteId)}
                >
                  <SelectValue
                    placeholder={
                      tenantId
                        ? "انتخاب وب‌سایت"
                        : "ابتدا مستأجر را انتخاب کنید"
                    }
                    className="min-w-0 text-start"
                  >
                    {selectedWebsiteLabel || undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.title} — {website.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.websiteId && (
                <p className="text-xs text-destructive">{errors.websiteId}</p>
              )}
              {tenantId && websites.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  برای این مستأجر وب‌سایتی ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        )}

        {mode === "staff" && (
          <div
            className="w-full min-w-0 space-y-2"
            role="group"
            aria-labelledby="family-label"
            aria-describedby={errors.family ? "family-error" : undefined}
          >
            <p id="family-label" className="text-sm font-medium">
              نوع سرویس *
            </p>
            <div className="grid w-full min-w-0 grid-cols-1 gap-2">
              {FAMILY_OPTIONS.map((item) => (
                <ChoiceCard
                  key={item}
                  id={`family-${item}`}
                  name="service-family"
                  value={item}
                  checked={family === item}
                  onChange={(value) => {
                    setFamily(value as ComplementaryServiceFamilyType);
                    setServiceScope("");
                    setErrors((current) => ({ ...current, family: "" }));
                  }}
                >
                  {COMPLEMENTARY_SERVICE_FAMILY_LABELS[item]}
                </ChoiceCard>
              ))}
            </div>
            {errors.family && (
              <p id="family-error" className="text-xs text-destructive">
                {errors.family}
              </p>
            )}
          </div>
        )}

        {(hasDuplicateAssignment || hasDuplicatePending) && (
          <div
            className="flex items-start gap-2 rounded-xl border border-accent bg-accent/20 p-3 text-sm text-accent-foreground"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-medium">سرویس یا درخواست هم‌نوع وجود دارد</p>
              <p className="mt-1 text-xs leading-5">
                {hasDuplicateAssignment
                  ? "برای این وب‌سایت یک سرویس هم‌نوع فعال یا زمان‌بندی‌شده ثبت شده است. ایجاد سرویس جدید مسدود می‌شود."
                  : "برای این وب‌سایت درخواست باز هم‌نوع وجود دارد. قبل از ایجاد، سابقه را بررسی کنید."}
              </p>
            </div>
          </div>
        )}

        <div
          className="w-full min-w-0 space-y-2"
          role="group"
          aria-labelledby="engagement-label"
          aria-describedby={errors.engagement ? "engagement-error" : undefined}
        >
          <p id="engagement-label" className="text-sm font-medium">
            نوع همکاری *
          </p>
          <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
            {ENGAGEMENT_OPTIONS.map((item) => (
              <ChoiceCard
                key={item}
                id={`engagement-${item}`}
                name="service-engagement"
                value={item}
                checked={engagement === item}
                onChange={(value) => {
                  setEngagement(value as ServiceEngagementType);
                  setErrors((current) => ({ ...current, engagement: "" }));
                }}
              >
                {SERVICE_ENGAGEMENT_LABELS[item]}
              </ChoiceCard>
            ))}
          </div>
          {errors.engagement && (
            <p id="engagement-error" className="text-xs text-destructive">
              {errors.engagement}
            </p>
          )}
        </div>

        {effectiveFamily === COMPLEMENTARY_SERVICE_FAMILY.SEO ||
        effectiveFamily === COMPLEMENTARY_SERVICE_FAMILY.GRAPHIC_DESIGN ? (
          <div className="space-y-2">
            <label htmlFor="service-scope">محدوده تخصصی</label>
            <Select
              value={serviceScope}
              onValueChange={(value) => value && setServiceScope(value)}
            >
              <SelectTrigger id="service-scope" className="w-full">
                <SelectValue placeholder="انتخاب محدوده" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {(effectiveFamily === COMPLEMENTARY_SERVICE_FAMILY.SEO
                  ? SEO_SCOPE_OPTIONS
                  : DESIGN_SCOPE_OPTIONS
                ).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {effectiveFamily === COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY ||
        effectiveFamily === COMPLEMENTARY_SERVICE_FAMILY.SOCIAL_MEDIA ? (
          <div className="space-y-2">
            <label htmlFor="service-count">
              {effectiveFamily ===
              COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY
                ? "تعداد تقریبی محصول"
                : "تعداد تقریبی پست"}
            </label>
            <Input
              id="service-count"
              type="number"
              min={1}
              inputMode="numeric"
              value={serviceScope}
              onChange={(event) => setServiceScope(event.target.value)}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="service-title">عنوان سرویس *</label>
          <Input
            id="service-title"
            value={title}
            maxLength={100}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((current) => ({ ...current, title: "" }));
            }}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="service-description">توضیحات *</label>
          <Textarea
            id="service-description"
            value={description}
            maxLength={800}
            rows={5}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: "" }));
            }}
            aria-invalid={Boolean(errors.description)}
            className="min-h-28"
          />
          <div className="flex justify-between gap-3 text-xs text-muted-foreground">
            <span className={errors.description ? "text-destructive" : undefined}>
              {errors.description || "حداقل ۲۰ نویسه؛ هدف، وضعیت فعلی و محدودیت‌ها"}
            </span>
            <span className="tabular-nums">{description.length}/800</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">پیوست‌ها (اختیاری)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            حداکثر ۵ فایل، هر کدام تا ۵ مگابایت (تصویر، PDF، CSV، Excel)
          </p>
          <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm">
            <Paperclip className="size-4" aria-hidden="true" />
            افزودن فایل
            <Input
              type="file"
              multiple
              className="sr-only"
              onChange={(event) => addFiles(event.target.files)}
            />
          </label>
          {fileError && (
            <p className="mt-2 text-xs text-destructive">{fileError}</p>
          )}
          {files.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg bg-muted px-3 text-sm"
                >
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate" dir="auto">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.ceil(file.size / 1024)} KB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`حذف ${file.name}`}
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((item) => item !== file),
                      )
                    }
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="service-start-date">تاریخ شروع *</label>
            <Input
              id="service-start-date"
              type="date"
              dir="ltr"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setErrors((current) => ({ ...current, startDate: "" }));
              }}
              aria-invalid={Boolean(errors.startDate)}
            />
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="agreed-amount">مبلغ توافق‌شده *</label>
            <Input
              id="agreed-amount"
              value={agreedAmount}
              onChange={(event) => {
                setAgreedAmount(event.target.value);
                setErrors((current) => ({ ...current, agreedAmount: "" }));
              }}
              placeholder="مثلاً ۲۵٬۰۰۰٬۰۰۰ تومان"
              aria-invalid={Boolean(errors.agreedAmount)}
            />
            {errors.agreedAmount && (
              <p className="text-xs text-destructive">{errors.agreedAmount}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="service-scope-summary">محدوده مورد توافق *</label>
          <Textarea
            id="service-scope-summary"
            value={scopeSummary}
            onChange={(event) => {
              setScopeSummary(event.target.value);
              setErrors((current) => ({ ...current, scopeSummary: "" }));
            }}
            className="min-h-28"
            aria-invalid={Boolean(errors.scopeSummary)}
          />
          {errors.scopeSummary ? (
            <p className="text-xs text-destructive">{errors.scopeSummary}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              فقط موارد تأییدشده را در محدوده سرویس وارد کنید.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="service-exclusions">موارد خارج از محدوده</label>
          <Textarea
            id="service-exclusions"
            value={exclusions}
            onChange={(event) => setExclusions(event.target.value)}
            placeholder="مواردی که در این توافق انجام نمی‌شوند"
          />
        </div>

        {mode === "staff" && (
          <div className="space-y-2">
            <label htmlFor="create-reason">دلیل ایجاد توسط تیم *</label>
            <Textarea
              id="create-reason"
              value={createReason}
              onChange={(event) => {
                setCreateReason(event.target.value);
                setErrors((current) => ({ ...current, createReason: "" }));
              }}
              placeholder="مثلاً توافق تلفنی با مشتری / تمدید بدون درخواست جدید"
              aria-invalid={Boolean(errors.createReason)}
            />
            {errors.createReason && (
              <p className="text-xs text-destructive">{errors.createReason}</p>
            )}
            <p className="text-xs text-muted-foreground">
              این دلیل داخلی است و برای مشتری نمایش داده نمی‌شود.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            {mode === "request"
              ? "با تأیید نهایی، این درخواست به یک سرویس زمان‌بندی‌شده برای همین وب‌سایت تبدیل می‌شود."
              : `سرویس مستقیماً به وب‌سایت ${lockedWebsiteLabel || "انتخاب‌شده"} متصل می‌شود. این رفتار فعلاً در داده‌های نمایشی صفحه اعمال می‌شود.`}
          </p>
        </div>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">ادامه و بازبینی</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateServiceDialog({
  open,
  mode,
  request = null,
  onOpenChange,
  onSuccess,
}: CreateServiceDialogProps) {
  const formKey =
    mode === "request" ? (request?.id ?? "request") : `staff-${open}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,40rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden"
        aria-describedby="create-service-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>
            {mode === "request"
              ? "فعالسازی سرویس"
              : "ایجاد و اتصال سرویس به وب‌سایت"}
          </DialogTitle>
          <DialogDescription id="create-service-description">
            {mode === "request"
              ? "اطلاعات توافق را بازبینی و سرویس را برای وب‌سایت درخواست‌شده فعال کنید."
              : "مستأجر و وب‌سایت را انتخاب کنید، زمینه سرویس را تکمیل کنید و سپس شرایط تجاری را ثبت نمایید."}
          </DialogDescription>
        </DialogHeader>

        {(mode === "staff" || request) && (
          <CreateServiceForm
            key={formKey}
            mode={mode}
            request={request}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
