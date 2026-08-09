"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Globe2, UserPlus } from "lucide-react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CustomerCreateForm } from "@/components/users/customer-create-form";
import {
  SERVER_PLAN_OPTIONS,
  SERVER_STACK,
  type WebsiteDiscoveryType,
} from "@/lib/data/servers-data";
import {
  STAFF_CAPABILITY,
  type CustomerUserType,
  type MembershipType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  listRuntimeMemberships,
  listRuntimeTenants,
  type CreateCustomerResultType,
} from "@/lib/data/users-runtime";
import {
  getTenantAssignmentEligibility,
  getUserTenantMemberships,
  hasCapability,
} from "@/lib/users-utils";

const TENANT_FIELD_ID = "discovery-tenant";

const ASSIGN_STEP = {
  ASSIGN: "ASSIGN",
  CREATE: "CREATE",
} as const;

type AssignStepType = (typeof ASSIGN_STEP)[keyof typeof ASSIGN_STEP];

export type AssignDiscoveryValues = {
  tenantId: string;
  tenantName: string;
  plan: string;
  title: string;
};

type AssignDiscoverySheetProps = {
  open: boolean;
  discovery: WebsiteDiscoveryType | null;
  serverLabel: string;
  onOpenChange: (open: boolean) => void;
  onAssign: (
    discovery: WebsiteDiscoveryType,
    values: AssignDiscoveryValues,
  ) => void;
};

function findFirstEligibleTenantId(
  tenants: TenantType[],
  memberships: MembershipType[],
) {
  const eligibleTenant = tenants.find(
    (tenant) => getTenantAssignmentEligibility(tenant, memberships).eligible,
  );

  return eligibleTenant?.id ?? tenants[0]?.id ?? "";
}

function getTenantOptionLabel(
  tenant: TenantType,
  memberships: MembershipType[],
) {
  const eligibility = getTenantAssignmentEligibility(tenant, memberships);

  return eligibility.eligible ? tenant.name : `${tenant.name} — غیرقابل تخصیص`;
}

function DiscoveryContextCard({
  discovery,
  serverLabel,
}: {
  discovery: WebsiteDiscoveryType;
  serverLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Globe2 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">{discovery.title}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground" dir="ltr">
            {discovery.domain}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            سرور <span dir="ltr">{serverLabel}</span> ·{" "}
            {SERVER_STACK.APPLICATION} · {SERVER_STACK.CONTROL_PANEL} ·{" "}
            {SERVER_STACK.WEB_SERVER}
          </p>
        </div>
      </div>
    </div>
  );
}

function AssignDiscoveryForm({
  discovery,
  serverLabel,
  onCancel,
  onAssign,
}: {
  discovery: WebsiteDiscoveryType;
  serverLabel: string;
  onCancel: () => void;
  onAssign: AssignDiscoverySheetProps["onAssign"];
}) {
  const [step, setStep] = useState<AssignStepType>(ASSIGN_STEP.ASSIGN);
  const [tenants, setTenants] = useState(listRuntimeTenants);
  const [memberships, setMemberships] = useState(listRuntimeMemberships);
  const [tenantId, setTenantId] = useState(() =>
    findFirstEligibleTenantId(listRuntimeTenants(), listRuntimeMemberships()),
  );
  const [plan, setPlan] = useState<string>(SERVER_PLAN_OPTIONS[1]);
  const [title, setTitle] = useState(discovery.title);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const shouldFocusTenant = useRef(false);

  useEffect(() => {
    if (!shouldFocusTenant.current) return;

    shouldFocusTenant.current = false;
    document.getElementById(TENANT_FIELD_ID)?.focus();
  });

  const canCreateCustomer = hasCapability(STAFF_CAPABILITY.CREATE_CUSTOMER);
  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const eligibility = selectedTenant
    ? getTenantAssignmentEligibility(selectedTenant, memberships)
    : {
        eligible: false,
        reason:
          "مستأجری برای تخصیص انتخاب نشده است. یک مستأجر انتخاب کنید یا مشتری جدید بسازید.",
      };

  const returnToAssign = (message: string | null) => {
    setStep(ASSIGN_STEP.ASSIGN);
    setStatusMessage(message);
    shouldFocusTenant.current = true;
  };

  const handleCreated = (result: CreateCustomerResultType) => {
    setTenants(listRuntimeTenants());
    setMemberships(listRuntimeMemberships());
    setTenantId(result.tenant.id);
    returnToAssign(
      `مشتری ${result.user.displayName} و مستأجر ${result.tenant.name} ایجاد و برای این تخصیص انتخاب شد. وب‌سایت هنوز تخصیص نیافته است؛ برای تکمیل، تخصیص را تأیید کنید.`,
    );
  };

  const handleSelectExistingCustomer = (existingUser: CustomerUserType) => {
    const existingTenants = getUserTenantMemberships(
      existingUser.id,
      tenants,
      memberships,
    );

    if (existingTenants.length === 0) {
      returnToAssign(
        `${existingUser.displayName} از قبل وجود دارد اما عضو هیچ مستأجری نیست. ابتدا مستأجر و مالک او را تعیین کنید.`,
      );
      return;
    }

    const [firstTenant] = existingTenants;
    setTenantId(firstTenant.tenant.id);
    returnToAssign(
      `مستأجر ${firstTenant.tenant.name} از حساب موجود ${existingUser.displayName} انتخاب شد. رکورد تکراری ساخته نشد.`,
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenant || !eligibility.eligible) return;

    onAssign(discovery, {
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      plan,
      title: title.trim() || discovery.title,
    });
  };

  if (step === ASSIGN_STEP.CREATE) {
    return (
      <CustomerCreateForm
        contextSlot={
          <>
            <DiscoveryContextCard
              discovery={discovery}
              serverLabel={serverLabel}
            />
            <div
              className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground"
              role="note"
            >
              <UserPlus className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                اطلاعات تخصیص شما حفظ می‌شود. پس از ایجاد مشتری، به همین تخصیص
                با مستأجر انتخاب‌شده بازمی‌گردید و تخصیص وب‌سایت جداگانه تأیید
                می‌شود.
              </p>
            </div>
          </>
        }
        cancelLabel="بازگشت به تخصیص"
        onCancel={() =>
          returnToAssign(
            "ایجاد مشتری لغو شد. هیچ حسابی ساخته نشد و اطلاعات تخصیص حفظ شده است.",
          )
        }
        onCreated={handleCreated}
        onSelectExistingCustomer={handleSelectExistingCustomer}
      />
    );
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <DiscoveryContextCard discovery={discovery} serverLabel={serverLabel} />

        <div role="status" aria-live="polite" aria-atomic="true">
          {statusMessage && (
            <div className="rounded-xl border border-accent bg-accent/20 px-3 py-3 text-sm text-accent-foreground">
              {statusMessage}
            </div>
          )}
        </div>

        <div
          className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground"
          role="note"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            کشف Agent به‌تنهایی وب‌سایت را برای مشتری فعال نمی‌کند. تا تخصیص
            مستأجر و طرح، این مورد فقط برای کارکنان قابل مشاهده است.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="discovery-title" className="text-sm font-medium">
            عنوان نمایشی
          </label>
          <Input
            id="discovery-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={TENANT_FIELD_ID} className="text-sm font-medium">
              مستأجر مالک
            </label>
            {tenants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                مستأجر واجد شرایطی در دسترس نیست. برای ادامه، مشتری جدید بسازید.
              </p>
            ) : (
              <Select
                value={tenantId}
                onValueChange={(value) => value && setTenantId(value)}
              >
                <SelectTrigger
                  id={TENANT_FIELD_ID}
                  className="w-full"
                  aria-label="مستأجر مالک"
                >
                  <SelectValue>{selectedTenant?.name ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {getTenantOptionLabel(tenant, memberships)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              مالکیت وب‌سایت به مستأجر داده می‌شود، نه به کاربر.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="discovery-plan" className="text-sm font-medium">
              طرح سرویس
            </label>
            <Select
              value={plan}
              onValueChange={(value) => value && setPlan(value)}
            >
              <SelectTrigger
                id="discovery-plan"
                className="w-full"
                aria-label="طرح سرویس"
              >
                <SelectValue>{plan}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {SERVER_PLAN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!eligibility.eligible && (
          <div
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>{eligibility.reason}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-medium">مشتری موردنظر پیدا نمی‌شود؟</p>
          <p className="mt-1 text-sm text-muted-foreground">
            بدون خروج از این تخصیص، مشتری و مستأجر جدید بسازید و به همین صفحه
            بازگردید.
          </p>
          {canCreateCustomer ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              onClick={() => {
                setStatusMessage(null);
                setStep(ASSIGN_STEP.CREATE);
              }}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              ایجاد مشتری جدید
            </Button>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              دسترسی ایجاد مشتری برای نقش فعلی فعال نیست. این تخصیص باز می‌ماند؛
              ایجاد حساب را به همکار دارای این دسترسی ارجاع دهید.
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p>
            پس از تأیید، کشف به وب‌سایت مدیریت‌شده تبدیل می‌شود و در فهرست
            وب‌سایت‌ها قابل پیگیری است.
          </p>
        </div>
      </div>

      <SheetFooter className="border-t border-border bg-card">
        <Button type="submit" disabled={!eligibility.eligible}>
          تخصیص وب‌سایت
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </SheetFooter>
    </form>
  );
}

export function AssignDiscoverySheet({
  open,
  discovery,
  serverLabel,
  onOpenChange,
  onAssign,
}: AssignDiscoverySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl"
        aria-describedby="assign-discovery-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>تخصیص وب‌سایت کشف‌شده</SheetTitle>
          <SheetDescription id="assign-discovery-description">
            مستأجر و طرح را مشخص کنید تا کشف Agent به وب‌سایت مدیریت‌شده تبدیل
            شود.
          </SheetDescription>
        </SheetHeader>

        {discovery && (
          <AssignDiscoveryForm
            key={discovery.id}
            discovery={discovery}
            serverLabel={serverLabel}
            onCancel={() => onOpenChange(false)}
            onAssign={(item, values) => {
              onAssign(item, values);
              onOpenChange(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
