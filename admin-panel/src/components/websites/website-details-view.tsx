"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  Monitor,
  Rocket,
  Server,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WEBSITE_STATUS,
  type WebsiteStatusType,
  type WebsiteType,
} from "@/lib/data/websites-data";
import { cn } from "@/lib/utils";
import WebsiteNavicon from "./website-navicon";

const statusConfig: Record<
  WebsiteStatusType,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  [WEBSITE_STATUS.ONLINE]: {
    label: "آنلاین",
    icon: CheckCircle2,
    className: "bg-accent/10 text-accent-foreground",
  },
  [WEBSITE_STATUS.NEEDS_ATTENTION]: {
    label: "نیازمند توجه",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive",
  },
  [WEBSITE_STATUS.MAINTENANCE]: {
    label: "در حال نگهداری",
    icon: Wrench,
    className: "bg-secondary/70 text-secondary-foreground",
  },
  [WEBSITE_STATUS.PENDING_SETUP]: {
    label: "در انتظار راه‌اندازی",
    icon: Rocket,
    className: "bg-primary/10 text-primary",
  },
};

const ADMIN_STATUS_OPTIONS = [
  {
    value: WEBSITE_STATUS.ONLINE,
    label: "آنلاین",
    icon: CheckCircle2,
  },
  {
    value: WEBSITE_STATUS.NEEDS_ATTENTION,
    label: "نیازمند توجه",
    icon: AlertTriangle,
  },
  {
    value: WEBSITE_STATUS.MAINTENANCE,
    label: "در حال نگهداری",
    icon: Wrench,
  },
  {
    value: WEBSITE_STATUS.PENDING_SETUP,
    label: "در انتظار راه‌اندازی",
    icon: Rocket,
  },
] as const;

const surfaceClassName = "rounded-2xl border border-border bg-card/90";
const mutedSurfaceClassName = "rounded-2xl border border-border bg-muted/30";

const WEBSITE_SERVICE_FIELDS = [
  {
    key: "domain",
    label: "دامنه",
    getValue: (website: WebsiteType) => website.domain,
  },
  {
    key: "tenantName",
    label: "مستأجر مالک",
    getValue: (website: WebsiteType) => website.tenantName,
  },
  {
    key: "plan",
    label: "پلن",
    getValue: (website: WebsiteType) => website.service.plan,
  },
  {
    key: "server",
    label: "سرور",
    getValue: (website: WebsiteType) => website.service.server,
    href: (website: WebsiteType) => `/servers/${website.serverId}`,
  },
  {
    key: "serverLocation",
    label: "موقعیت",
    getValue: (website: WebsiteType) => website.service.serverLocation,
  },
  {
    key: "controlPanel",
    label: "کنترل پنل",
    getValue: (website: WebsiteType) => website.service.controlPanel,
  },
  {
    key: "webServer",
    label: "وب‌سرور",
    getValue: (website: WebsiteType) => website.service.webServer,
  },
  {
    key: "serviceStartDate",
    label: "تاریخ شروع سرویس",
    getValue: (website: WebsiteType) => website.service.serviceStartDate,
  },
  {
    key: "renewalDate",
    label: "تاریخ تمدید",
    getValue: (website: WebsiteType) => website.service.renewalDate,
  },
  {
    key: "billingPeriod",
    label: "دوره صورتحساب",
    getValue: (website: WebsiteType) => website.service.billingPeriod,
  },
] as const;

function formatHealthLabel(value: "NORMAL" | "WARNING" | "PROBLEM") {
  switch (value) {
    case "WARNING":
      return "دارای هشدار";
    case "PROBLEM":
      return "دارای مشکل";
    default:
      return "بدون مشکل";
  }
}

function formatStatusBadge(status: WebsiteStatusType) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}

export function WebsiteDetailsView({ website }: { website: WebsiteType }) {
  const [adminStatus, setAdminStatus] = useState<WebsiteStatusType>(
    website.status,
  );
  const [hasPendingStatusChange, setHasPendingStatusChange] = useState(false);
  const selectedStatusConfig = statusConfig[adminStatus];
  const SelectedStatusIcon = selectedStatusConfig.icon;

  const handleStatusChange = (value: string | null) => {
    if (value === null) {
      return;
    }

    setAdminStatus(value as WebsiteStatusType);
    setHasPendingStatusChange(value !== website.status);
  };

  const handleSaveStatus = () => {
    setHasPendingStatusChange(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pt-4">
      <header className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-end gap-3">
            <Link
              href="/websites"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
              aria-label="بازگشت به لیست وب‌سایت‌ها"
            >
              <ArrowRight className="size-4" />
            </Link>
            <div>
              <p className="text-sm lg:text-base mb-2 text-muted-foreground">
                وب‌سایت‌ها
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <WebsiteNavicon
                    className="size-9"
                    status={website.status}
                    icon={website.domain.slice(0, 1)}
                  />
                  <h1 className="text-lg font-semibold">{website.domain}</h1>
                </div>
                {formatStatusBadge(adminStatus)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                mutedSurfaceClassName,
                "flex items-center gap-3 px-3 py-2",
              )}
            >
              <Avatar size="sm">
                <AvatarImage
                  src="/avatars/ali-rezaei.jpg"
                  alt={website.tenantName}
                />
                <AvatarFallback>{website.tenantName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{website.tenantName}</p>
                <p className="text-xs text-muted-foreground">مستأجر مالک</p>
              </div>
            </div>

            <div className={cn(mutedSurfaceClassName, "min-w-65 px-3 py-2")}>
              <p className="text-xs text-muted-foreground">وضعیت مدیریتی</p>
              <div className="mt-2 flex items-center gap-2">
                <Select
                  value={adminStatus}
                  onValueChange={(value) =>
                    handleStatusChange(value as WebsiteStatusType)
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="تغییر وضعیت مدیریتی"
                  >
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <SelectedStatusIcon className="size-4" />
                        <span>{selectedStatusConfig.label}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {ADMIN_STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon;

                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="size-4" />
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={!hasPendingStatusChange}
                  onClick={handleSaveStatus}
                >
                  ذخیره
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">وضعیت کلی</p>
            <h2 className="mt-1 text-xl font-semibold">{website.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {website.domain}
            </p>
          </div>
          <div className={cn(mutedSurfaceClassName, "px-4 py-3")}>
            <p className="text-sm text-muted-foreground">وضعیت کلی</p>
            <p className="mt-1 text-lg font-semibold">
              {formatHealthLabel(website.overallHealth)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="size-4" />
              وضعیت وب‌سایت
            </div>
            <p className="mt-3 text-lg font-semibold">
              {formatStatusBadge(
                website.availabilityStatus as WebsiteStatusType,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              آخرین بررسی
            </div>
            <p className="mt-3 text-lg font-semibold">
              {website.lastAvailabilityCheckAt}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="size-4" />
              آخرین داده Agent
            </div>
            <p className="mt-3 text-lg font-semibold">
              {website.lastAgentDataAt}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              وضعیت داده‌ها
            </div>
            <p className="mt-3 text-lg font-semibold">
              {website.monitoring.dataFreshness === "UP_TO_DATE"
                ? "به‌روز"
                : "قدیمی"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
          <div className="flex items-center gap-2">
            <Activity className="size-5" />
            <h3 className="font-semibold">وضعیت فنی</h3>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className={cn(mutedSurfaceClassName, "p-3")}>
              <p className="text-xs text-muted-foreground">WordPress</p>
              <p className="mt-1 text-lg font-semibold">
                {website.technical.wordpress}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-3")}>
              <p className="text-xs text-muted-foreground">PHP</p>
              <p className="mt-1 text-lg font-semibold">
                {website.technical.php}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-3")}>
              <p className="text-xs text-muted-foreground">Imagick</p>
              <p className="mt-1 text-lg font-semibold">
                {website.technical.imagick}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">به‌روزرسانی وردپرس</p>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-lg font-semibold">
                {website.technical.wordpressUpdate.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {website.technical.wordpressUpdate.updatedAt}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">اسکن امنیتی</p>
                <ShieldCheck className="size-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-lg font-semibold">
                {website.technical.securityScan.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {website.technical.securityScan.updatedAt}
              </p>
            </div>
          </div>
        </section>

        <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
          <div className="flex items-center gap-2">
            <Globe2 className="size-5" />
            <h3 className="font-semibold">ترافیک و فعالیت</h3>
          </div>

          <div className="mt-4 space-y-3">
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">فعال در حال حاضر</p>
              <p className="mt-2 text-2xl font-semibold">
                {website.activeVisitors}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">
                بازدیدکنندگان ۲۴ ساعت اخیر
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {website.visitors24h}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
          <div className="flex items-center gap-2">
            <Server className="size-5" />
            <h3 className="font-semibold">اطلاعات سرویس</h3>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {WEBSITE_SERVICE_FIELDS.map((field) => {
              const value = field.getValue(website);
              const href = "href" in field ? field.href(website) : undefined;

              return (
                <div key={field.key} className={cn(mutedSurfaceClassName, "p-3")}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  {href ? (
                    <Link
                      href={href}
                      className="mt-1 inline-flex font-medium text-primary underline-offset-4 hover:underline"
                      dir="ltr"
                    >
                      {value}
                    </Link>
                  ) : (
                    <p className="mt-1 font-medium">{value}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
          <div className="flex items-center gap-2">
            <Monitor className="size-5" />
            <h3 className="font-semibold">Agent / Monitoring</h3>
          </div>

          <div className="mt-4 space-y-3">
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">Agent</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    website.monitoring.agentStatus === "DISCONNECTED"
                      ? "bg-rose-500"
                      : website.monitoring.dataFreshness === "STALE"
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                />
                {website.monitoring.agentStatus === "DISCONNECTED"
                  ? "قطع شده"
                  : website.monitoring.dataFreshness === "STALE"
                    ? "قدیمی"
                    : "متصل"}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">آخرین ارتباط</p>
              <p className="mt-2 text-lg font-semibold">
                {website.monitoring.lastSeenAt}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">وضعیت داده‌ها</p>
              <p className="mt-2 text-lg font-semibold">
                {website.monitoring.dataFreshness === "UP_TO_DATE"
                  ? "به‌روز"
                  : "قدیمی"}
              </p>
            </div>
            <div className={cn(mutedSurfaceClassName, "p-4")}>
              <p className="text-sm text-muted-foreground">سرور مرتبط</p>
              <Link
                href={`/servers/${website.serverId}`}
                className="mt-2 inline-flex text-lg font-semibold text-primary underline-offset-4 hover:underline"
                dir="ltr"
              >
                {website.service.server}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button variant="outline">مشاهده لاگ‌های وب‌سایت</Button>
      </div>
    </div>
  );
}
