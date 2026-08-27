"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import {
  getAgentCommandAction,
  requestWebsiteStackRefreshAction,
  updateWebsiteAdminUrlAction,
  updateWebsiteCredentialsAction,
  updateWebsiteManagementCoverageAction,
  type AdminWebsiteAgentContext,
} from "@/actions/websites/website-agent-actions";
import { AdminBackLink } from "@/components/common/admin-back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const wait = () => new Promise((resolve) => setTimeout(resolve, 2000));
const value = (input?: string | null) => input || "—";
const formatPlanActivation = (input?: string | null) => {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function LiveWebsiteDetailsView({
  website,
}: {
  website: AdminWebsiteAgentContext;
}) {
  const router = useRouter();
  const discovery = website.discoveries?.[0];
  const traffic = discovery?.trafficSnapshot;
  const [adminUrl, setAdminUrl] = useState(website.wordpressAdminUrl ?? "");
  const [wpUsername, setWpUsername] = useState(website.wordpressAdminUsername ?? "");
  const [wpPassword, setWpPassword] = useState(website.wordpressAdminPassword ?? "");
  const [daUrl, setDaUrl] = useState(website.directAdminUrl ?? "");
  const [daUsername, setDaUsername] = useState(website.directAdminUsername ?? "");
  const [daPassword, setDaPassword] = useState(website.directAdminPassword ?? "");
  const [managementCoverage, setManagementCoverage] = useState<
    "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED"
  >(website.managementCoverage ?? "UNCLASSIFIED");
  const COVERAGE_LABELS: Record<string, string> = {
    UNIXSEE_MANAGED: "مدیریت شده توسط یونیکسی",
    EXTERNAL_INFRASTRUCTURE: "زیرساخت خارجی",
    UNCLASSIFIED: "نامشخص",
  };
  const selectedCoverageLabel = COVERAGE_LABELS[managementCoverage] ?? "نامشخص";
  const isManaged = managementCoverage === "UNIXSEE_MANAGED";
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const save = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateWebsiteAdminUrlAction({
        websiteId: website.id,
        wordpressAdminUrl: adminUrl,
      });
      if (!result.ok) setMessage(result.message);
      else {
        setAdminUrl(result.data.wordpressAdminUrl ?? "");
        setMessage("نشانی مدیریت وردپرس ذخیره شد.");
      }
    });
  };
  const saveCredentials = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateWebsiteCredentialsAction({
        websiteId: website.id,
        wordpressAdminUrl: adminUrl || null,
        wordpressAdminUsername: wpUsername || null,
        wordpressAdminPassword: wpPassword || null,
        directAdminUrl: daUrl || null,
        directAdminUsername: daUsername || null,
        directAdminPassword: daPassword || null,
      });
      if (!result.ok) setMessage(result.message);
      else {
        setMessage("اطلاعات مدیریتی ذخیره شد.");
        router.refresh();
      }
    });
  };
  const saveManagementCoverage = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateWebsiteManagementCoverageAction({
        websiteId: website.id,
        managementCoverage,
      });
      if (!result.ok) setMessage(result.message);
      else {
        setMessage("پوشش مدیریتی ذخیره شد.");
        router.refresh();
      }
    });
  };
  const refresh = () => {
    setMessage("درخواست تازه‌سازی در صف قرار گرفت…");
    startTransition(async () => {
      const requested = await requestWebsiteStackRefreshAction(website.id);
      if (!requested.ok) {
        setMessage(requested.message);
        return;
      }
      for (let attempt = 0; attempt < 300; attempt++) {
        const checked = await getAgentCommandAction(requested.data.id);
        if (!checked.ok) {
          setMessage(checked.message);
          return;
        }
        if (checked.data.status === "SUCCEEDED") {
          setMessage("اطلاعات فنی با موفقیت تازه شد.");
          router.refresh();
          return;
        }
        if (["FAILED", "EXPIRED"].includes(checked.data.status)) {
          setMessage(
            `تازه‌سازی ناموفق بود (${checked.data.errorCode ?? checked.data.status}). مقادیر موفق قبلی حفظ شدند.`,
          );
          return;
        }
        setMessage(
          checked.data.status === "RUNNING"
            ? "Agent در حال بررسی پشته است…"
            : "در انتظار دریافت فرمان توسط Agent…",
        );
        await wait();
      }
      setMessage("مهلت پیگیری تمام شد؛ وضعیت فرمان را دوباره بررسی کنید.");
    });
  };
  const coverage = Math.min(
    100,
    Math.round(((traffic?.visitors24hCoverageSeconds ?? 0) / 86400) * 100),
  );
  const hasLinkedPlan = Boolean(website.plan);
  const hasActivePlan = Boolean(website.plan && website.planActivatedAt);
  const planState = hasActivePlan
    ? "فعال"
    : hasLinkedPlan
      ? "متصل و غیرفعال"
      : "بدون پلن";
  return (
    <div className="flex flex-col gap-4 pt-4" dir="rtl">
      <AdminBackLink href="/websites">بازگشت به وب‌سایت‌ها</AdminBackLink>
      <header className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">وب‌سایت واقعی / NestJS</p>
        <h1 className="mt-1 text-2xl font-semibold w-fit" dir="ltr">
          {website.domain}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {website.tenant?.name ?? "بدون مستأجر"} ·{" "}
          {website.vpsNode?.server?.name ?? "بدون سرور"}
        </p>
      </header>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">پلن وب‌سایت</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">پلن متصل</dt>
            <dd className="mt-1 font-medium" dir="ltr">
              {website.plan?.nameEn ?? website.plan?.code ?? "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">وضعیت پلن</dt>
            <dd className="mt-1 font-medium">{planState}</dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">
              زمان شروع و فعال‌سازی
            </dt>
            <dd className="mt-1">
              {formatPlanActivation(website.planActivatedAt)}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">پوشش مدیریتی</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          آیا سرور این وب‌سایت توسط ما مدیریت می‌شود؟
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={managementCoverage}
            onValueChange={(v) =>
              setManagementCoverage(v as typeof managementCoverage)
            }
          >
            <SelectTrigger className="w-full sm:w-64" aria-label="پوشش مدیریتی">
              <SelectValue>{selectedCoverageLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="UNIXSEE_MANAGED">
                مدیریت شده توسط یونیکسی
              </SelectItem>
              <SelectItem value="EXTERNAL_INFRASTRUCTURE">
                زیرساخت خارجی
              </SelectItem>
              <SelectItem value="UNCLASSIFIED">نامشخص</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            disabled={
              pending ||
              managementCoverage ===
                (website.managementCoverage ?? "UNCLASSIFIED")
            }
            onClick={saveManagementCoverage}
          >
            ذخیره
          </Button>
        </div>
      </section>
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">اطلاعات مدیریتی</h2>
        {!isManaged && (
          <p className="mt-2 text-sm text-muted-foreground">
            این بخش فقط برای وب‌سایت‌هایی با سرور مدیریت‌شده توسط یونیکسی قابل تنظیم است.
          </p>
        )}
        <form onSubmit={saveCredentials} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="wp-admin-url" className="text-xs text-muted-foreground">نشانی مدیریت وردپرس</label>
              <Input id="wp-admin-url" dir="ltr" type="url" value={adminUrl} onChange={(e) => setAdminUrl(e.target.value)} placeholder="https://example.com/wp-admin/" disabled={pending || !isManaged} />
            </div>
            <div className="space-y-2">
              <label htmlFor="wp-admin-user" className="text-xs text-muted-foreground">نام کاربری وردپرس</label>
              <Input id="wp-admin-user" dir="ltr" value={wpUsername} onChange={(e) => setWpUsername(e.target.value)} placeholder="admin" disabled={pending || !isManaged} />
            </div>
            <div className="space-y-2">
              <label htmlFor="wp-admin-pass" className="text-xs text-muted-foreground">رمز عبور وردپرس</label>
              <Input id="wp-admin-pass" dir="ltr" type="password" value={wpPassword} onChange={(e) => setWpPassword(e.target.value)} placeholder="••••••••" disabled={pending || !isManaged} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="da-url" className="text-xs text-muted-foreground">نشانی DirectAdmin</label>
              <Input id="da-url" dir="ltr" value={daUrl} onChange={(e) => setDaUrl(e.target.value)} placeholder="https://panel.example.com:2222" disabled={pending || !isManaged} />
            </div>
            <div className="space-y-2">
              <label htmlFor="da-user" className="text-xs text-muted-foreground">نام کاربری DirectAdmin</label>
              <Input id="da-user" dir="ltr" value={daUsername} onChange={(e) => setDaUsername(e.target.value)} placeholder="admin" disabled={pending || !isManaged} />
            </div>
            <div className="space-y-2">
              <label htmlFor="da-pass" className="text-xs text-muted-foreground">رمز عبور DirectAdmin</label>
              <Input id="da-pass" dir="ltr" type="password" value={daPassword} onChange={(e) => setDaPassword(e.target.value)} placeholder="••••••••" disabled={pending || !isManaged} />
            </div>
          </div>
          <Button type="submit" disabled={pending || !isManaged}>ذخیره</Button>
        </form>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">اطلاعات فنی Agent</h2>
            <p className="text-sm text-muted-foreground">
              {discovery?.isPresent === false
                ? "از موجودی OLS حذف شده"
                : "موجود در OpenLiteSpeed"}
            </p>
          </div>
          <Button
            type="button"
            onClick={refresh}
            disabled={pending || !discovery}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {pending ? "در حال پیگیری…" : "تازه‌سازی"}
          </Button>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">WordPress</dt>
            <dd className="mt-1" dir="ltr">
              {value(discovery?.wordpressVersion)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">PHP</dt>
            <dd className="mt-1" dir="ltr">
              {value(discovery?.phpVersion)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">Imagick</dt>
            <dd className="mt-1" dir="ltr">
              {value(discovery?.imagickVersion)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          آخرین بررسی: {value(discovery?.stackCheckedAt)} · آخرین موفقیت:{" "}
          {value(discovery?.stackLastSucceededAt)}
        </p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">ترافیک محلی و ناشناس</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">فعال در ۳ دقیقه</dt>
            <dd className="mt-1 text-xl font-semibold">
              {traffic?.activeVisitorCount ?? "—"}
            </dd>
            <p className="text-xs text-muted-foreground">
              {value(traffic?.activeMeasuredAt)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">یکتا در ۲۴ ساعت</dt>
            <dd className="mt-1 text-xl font-semibold">
              {traffic?.uniqueVisitors24h ?? "—"}
            </dd>
            <p className="text-xs text-muted-foreground">
              پوشش {coverage.toLocaleString("fa-IR")}٪{" "}
              {coverage < 100 ? "· در حال گرم‌شدن" : ""}
            </p>
          </div>
        </dl>
      </section>
    </div>
  );
}
