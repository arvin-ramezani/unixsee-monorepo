"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import {
  getAgentCommandAction,
  requestWebsiteStackRefreshAction,
  updateWebsiteAdminUrlAction,
  type AdminWebsiteAgentContext,
} from "@/actions/websites/website-agent-actions";
import { AdminBackLink } from "@/components/common/admin-back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <h1 className="mt-1 text-2xl font-semibold" dir="ltr">
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
        <form onSubmit={save}>
          <label htmlFor="wordpress-admin-url" className="text-sm font-medium">
            نشانی مدیریت وردپرس (فقط ادمین)
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="wordpress-admin-url"
              dir="ltr"
              type="url"
              value={adminUrl}
              onChange={(event) => setAdminUrl(event.target.value)}
              placeholder="https://example.com/wp-admin/"
              disabled={pending}
            />
            <Button type="submit" disabled={pending}>
              ذخیره
            </Button>
          </div>
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
