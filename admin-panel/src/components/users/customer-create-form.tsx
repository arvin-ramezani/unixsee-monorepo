"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Info, MailCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CUSTOMER_LOCALE,
  CUSTOMER_LOCALE_LABELS,
  type CustomerLocaleType,
  type CustomerUserType,
} from "@/lib/data/users-data";
import {
  createCustomerAccount,
  findDuplicateCustomer,
  type CreateCustomerResultType,
} from "@/lib/data/users-runtime";
import { formatContactSummary, normalizeMobile } from "@/lib/users-utils";

const CREATE_STEP = {
  FORM: "FORM",
  REVIEW: "REVIEW",
} as const;

type CreateStepType = (typeof CREATE_STEP)[keyof typeof CREATE_STEP];

type CreateFieldType = "displayName" | "contact" | "tenantName";

type CreateFieldErrorsType = Partial<Record<CreateFieldType, string>>;

const LOCALE_OPTIONS = [
  {
    value: CUSTOMER_LOCALE.FA_IR,
    label: CUSTOMER_LOCALE_LABELS[CUSTOMER_LOCALE.FA_IR],
  },
  {
    value: CUSTOMER_LOCALE.EN_US,
    label: CUSTOMER_LOCALE_LABELS[CUSTOMER_LOCALE.EN_US],
  },
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^09\d{9}$/;

type CreateFormValuesType = {
  displayName: string;
  email: string;
  mobile: string;
  tenantName: string;
};

function validateCreateValues(
  values: CreateFormValuesType,
): CreateFieldErrorsType {
  const errors: CreateFieldErrorsType = {};

  if (!values.displayName.trim()) {
    errors.displayName = "نام مشتری را وارد کنید.";
  }

  const email = values.email.trim();
  const mobile = normalizeMobile(values.mobile);

  if (!email && !mobile) {
    errors.contact = "حداقل یکی از ایمیل یا شماره موبایل لازم است.";
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.contact = "قالب ایمیل معتبر نیست.";
  } else if (mobile && !MOBILE_PATTERN.test(mobile)) {
    errors.contact = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.";
  }

  if (!values.tenantName.trim()) {
    errors.tenantName = "نام مستأجر را وارد کنید.";
  }

  return errors;
}

type CustomerCreateFormProps = {
  /** Read-only context from a parent flow, such as a discovery being assigned. */
  contextSlot?: ReactNode;
  onCancel: () => void;
  onCreated: (result: CreateCustomerResultType) => void;
  /** Offered when the parent flow can continue with an already existing match. */
  onSelectExistingCustomer?: (user: CustomerUserType) => void;
  cancelLabel?: string;
};

export function CustomerCreateForm({
  contextSlot,
  onCancel,
  onCreated,
  onSelectExistingCustomer,
  cancelLabel = "انصراف",
}: CustomerCreateFormProps) {
  const [step, setStep] = useState<CreateStepType>(CREATE_STEP.FORM);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [isTenantNameEdited, setIsTenantNameEdited] = useState(false);
  const [locale, setLocale] = useState<CustomerLocaleType>(
    CUSTOMER_LOCALE.FA_IR,
  );
  const [internalNote, setInternalNote] = useState("");
  const [errors, setErrors] = useState<CreateFieldErrorsType>({});
  const [duplicate, setDuplicate] = useState<CustomerUserType | null>(null);

  const values: CreateFormValuesType = {
    displayName,
    email,
    mobile,
    tenantName,
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!isTenantNameEdited) setTenantName(value);
  };

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateCreateValues(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setDuplicate(null);
      return;
    }

    const existingCustomer = findDuplicateCustomer({
      email: email.trim(),
      mobile: normalizeMobile(mobile),
    });

    if (existingCustomer) {
      setDuplicate(existingCustomer);
      return;
    }

    setDuplicate(null);
    setStep(CREATE_STEP.REVIEW);
  };

  const handleConfirm = () => {
    onCreated(
      createCustomerAccount({
        displayName: displayName.trim(),
        email: email.trim(),
        mobile: normalizeMobile(mobile),
        locale,
        tenantName: tenantName.trim(),
        internalNote: internalNote.trim(),
      }),
    );
  };

  const localeLabel = CUSTOMER_LOCALE_LABELS[locale];

  if (step === CREATE_STEP.REVIEW) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
          {contextSlot}

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="font-medium">بازبینی پیش از ایجاد</p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">نام مشتری</dt>
                <dd className="mt-1 text-sm font-medium">
                  {displayName.trim()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">نام مستأجر</dt>
                <dd className="mt-1 text-sm font-medium">
                  {tenantName.trim()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">ایمیل</dt>
                <dd className="mt-1 text-sm font-medium" dir="ltr">
                  {email.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">موبایل</dt>
                <dd className="mt-1 text-sm font-medium" dir="ltr">
                  {normalizeMobile(mobile) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">زبان مشتری</dt>
                <dd className="mt-1 text-sm font-medium">{localeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">نقش اولیه</dt>
                <dd className="mt-1 text-sm font-medium">
                  مالک مستأجر (پیش‌فرض)
                </dd>
              </div>
            </dl>
          </div>

          <div
            className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground"
            role="note"
          >
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              حساب به‌صورت دعوت‌نامه‌ای ساخته می‌شود: تا تکمیل دعوت توسط مشتری،
              ایمیل و موبایل تأییدشده در نظر گرفته نمی‌شود و هیچ رمز یا کد
              ورودی در پنل نمایش داده نمی‌شود.
            </p>
          </div>

          <div
            className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground"
            role="note"
          >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              این اقدام فقط مشتری، مستأجر و عضویت مالک را ایجاد می‌کند و هیچ
              وب‌سایتی را تخصیص نمی‌دهد.
            </p>
          </div>
        </div>

        <SheetFooter className="border-t border-border bg-card">
          <Button type="button" autoFocus onClick={handleConfirm}>
            تأیید و ایجاد مشتری
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(CREATE_STEP.FORM)}
          >
            بازگشت به ویرایش
          </Button>
        </SheetFooter>
      </div>
    );
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleReview}>
      <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        {contextSlot}

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">حداقل اطلاعات لازم</p>
              <p className="mt-1 text-sm text-muted-foreground">
                مشتری، مستأجر و عضویت مالک با هم ساخته می‌شوند. کاربر و مستأجر
                دو موجودیت جدا هستند.
              </p>
            </div>
          </div>
        </div>

        {duplicate && (
          <div
            className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                مشتری دیگری با همین شناسه تماس وجود دارد:{" "}
                <span className="font-medium">{duplicate.displayName}</span> (
                <span dir="ltr">{formatContactSummary(duplicate)}</span>). برای
                جلوگیری از رکورد تکراری، از همان حساب استفاده کنید.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onSelectExistingCustomer && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSelectExistingCustomer(duplicate)}
                >
                  استفاده از همین مشتری
                </Button>
              )}
              <Link
                href={`/users/${duplicate.id}`}
                className="inline-flex items-center rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium"
              >
                مشاهده حساب موجود
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="customer-display-name" className="text-sm font-medium">
            نام مشتری
          </label>
          <Input
            id="customer-display-name"
            autoFocus
            value={displayName}
            onChange={(event) => handleDisplayNameChange(event.target.value)}
            aria-required="true"
            aria-invalid={!!errors.displayName}
            aria-describedby={
              errors.displayName ? "customer-display-name-error" : undefined
            }
            placeholder="مثلاً علی رضایی"
          />
          {errors.displayName && (
            <p
              id="customer-display-name-error"
              className="text-xs text-destructive"
            >
              {errors.displayName}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="customer-email" className="text-sm font-medium">
              ایمیل
            </label>
            <Input
              id="customer-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={!!errors.contact}
              aria-describedby={errors.contact ? "customer-contact-error" : undefined}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-mobile" className="text-sm font-medium">
              موبایل
            </label>
            <Input
              id="customer-mobile"
              dir="ltr"
              inputMode="numeric"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              aria-invalid={!!errors.contact}
              aria-describedby={errors.contact ? "customer-contact-error" : undefined}
              placeholder="09121234567"
            />
          </div>
        </div>

        <p
          id="customer-contact-error"
          className={
            errors.contact
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {errors.contact ??
            "شناسه تماس برای بررسی تکراری‌نبودن مشتری و ارسال دعوت‌نامه استفاده می‌شود."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="customer-tenant-name" className="text-sm font-medium">
              نام مستأجر
            </label>
            <Input
              id="customer-tenant-name"
              value={tenantName}
              onChange={(event) => {
                setIsTenantNameEdited(true);
                setTenantName(event.target.value);
              }}
              aria-required="true"
              aria-invalid={!!errors.tenantName}
              aria-describedby={
                errors.tenantName
                  ? "customer-tenant-name-error"
                  : "customer-tenant-name-hint"
              }
              placeholder="مثلاً فروشگاه آرتین"
            />
            {errors.tenantName ? (
              <p
                id="customer-tenant-name-error"
                className="text-xs text-destructive"
              >
                {errors.tenantName}
              </p>
            ) : (
              <p
                id="customer-tenant-name-hint"
                className="text-xs text-muted-foreground"
              >
                پیش‌فرض از نام مشتری پر می‌شود و قابل تغییر است.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-locale" className="text-sm font-medium">
              زبان مشتری
            </label>
            <Select
              value={locale}
              onValueChange={(value) =>
                value && setLocale(value as CustomerLocaleType)
              }
            >
              <SelectTrigger
                id="customer-locale"
                className="w-full"
                aria-label="زبان مشتری"
              >
                <SelectValue>{localeLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {LOCALE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="customer-internal-note" className="text-sm font-medium">
            یادداشت داخلی (اختیاری)
          </label>
          <Textarea
            id="customer-internal-note"
            value={internalNote}
            onChange={(event) => setInternalNote(event.target.value)}
            className="min-h-24"
            aria-describedby="customer-internal-note-hint"
            placeholder="زمینه عملیاتی برای تیم"
          />
          <p
            id="customer-internal-note-hint"
            className="text-xs text-muted-foreground"
          >
            یادداشت‌های داخلی هرگز برای مشتری نمایش داده نمی‌شوند.
          </p>
        </div>
      </div>

      <SheetFooter className="border-t border-border bg-card">
        <Button type="submit">بازبینی و ادامه</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </SheetFooter>
    </form>
  );
}
