"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Globe2, UserPlus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SERVER_PLAN_OPTIONS,
  SERVER_STACK,
  type WebsiteDiscoveryType,
} from "@/lib/data/servers-data";
import {
  STAFF_CAPABILITY,
  type MembershipType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  listRuntimeMemberships,
  listRuntimeTenants,
} from "@/lib/data/users-runtime";
import {
  getTenantAssignmentEligibility,
  hasCapability,
} from "@/lib/users-utils";

const TENANT_FIELD_ID = "discovery-tenant";

export type AssignDiscoveryValues = {
  tenantId: string;
  tenantName: string;
  plan: string;
  title: string;
};

type AssignDiscoveryDialogProps = {
  open: boolean;
  discovery: WebsiteDiscoveryType | null;
  serverId: string;
  serverLabel: string;
  initialTenantId?: string | null;
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
          <p
            className="mt-1 truncate text-sm text-muted-foreground w-fit"
            dir="ltr"
          >
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
  serverId,
  serverLabel,
  initialTenantId,
  onCancel,
  onAssign,
}: {
  discovery: WebsiteDiscoveryType;
  serverId: string;
  serverLabel: string;
  initialTenantId?: string | null;
  onCancel: () => void;
  onAssign: AssignDiscoveryDialogProps["onAssign"];
}) {
  const [tenants] = useState(listRuntimeTenants);
  const [memberships] = useState(listRuntimeMemberships);
  const [tenantId, setTenantId] = useState(() => {
    const currentTenants = listRuntimeTenants();
    const currentMemberships = listRuntimeMemberships();
    if (
      initialTenantId &&
      currentTenants.some((tenant) => tenant.id === initialTenantId)
    ) {
      return initialTenantId;
    }
    return findFirstEligibleTenantId(currentTenants, currentMemberships);
  });
  const [plan, setPlan] = useState<string>(SERVER_PLAN_OPTIONS[1]);
  const [title, setTitle] = useState(discovery.title);
  const [statusMessage] = useState<string | null>(() =>
    initialTenantId
      ? "مشتری و مستأجر جدید برای این تخصیص انتخاب شد. وب‌سایت هنوز تخصیص نیافته است؛ برای تکمیل، تخصیص را تأیید کنید."
      : null,
  );

  const canCreateCustomer = hasCapability(STAFF_CAPABILITY.CREATE_CUSTOMER);
  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const eligibility = selectedTenant
    ? getTenantAssignmentEligibility(selectedTenant, memberships)
    : {
        eligible: false,
        reason:
          "مستأجری برای تخصیص انتخاب نشده است. یک مستأجر انتخاب کنید یا مشتری جدید بسازید.",
      };

  const createCustomerHref = `/users/new?returnTo=${encodeURIComponent(`/servers/${serverId}`)}&assign=${encodeURIComponent(discovery.id)}`;

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

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
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

        <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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
            مشتری و مستأجر جدید بسازید و به همین تخصیص با مستأجر انتخاب‌شده
            بازگردید. تخصیص وب‌سایت جداگانه تأیید می‌شود.
          </p>
          {canCreateCustomer ? (
            <Link
              href={createCustomerHref}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "mt-3 gap-2",
              })}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              ایجاد مشتری جدید
            </Link>
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

      <DialogFooter>
        <Button type="submit" disabled={!eligibility.eligible}>
          تخصیص وب‌سایت
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AssignDiscoveryDialog({
  open,
  discovery,
  serverId,
  serverLabel,
  initialTenantId,
  onOpenChange,
  onAssign,
}: AssignDiscoveryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl gap-0"
        aria-describedby="assign-discovery-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>تخصیص وب‌سایت کشف‌شده</DialogTitle>
          <DialogDescription id="assign-discovery-description">
            مستأجر و طرح را مشخص کنید تا کشف Agent به وب‌سایت مدیریت‌شده تبدیل
            شود.
          </DialogDescription>
        </DialogHeader>

        {discovery && (
          <AssignDiscoveryForm
            key={`${discovery.id}:${initialTenantId ?? ""}`}
            discovery={discovery}
            serverId={serverId}
            serverLabel={serverLabel}
            initialTenantId={initialTenantId}
            onCancel={() => onOpenChange(false)}
            onAssign={(item, values) => {
              onAssign(item, values);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
