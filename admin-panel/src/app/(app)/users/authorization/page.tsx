import Link from "next/link";

import { AuthorizationQueueView } from "@/components/authorization/authorization-queue-view";
import { buttonVariants } from "@/components/ui/button";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminAuthorizationCaseToUi,
  type AdminAuthorizationListResponse,
} from "@/lib/authorization/map-admin-authorization-case";
import { AUTHORIZATION_CASES } from "@/lib/data/authorization-data";
import { getAuthorizationQueueSummary } from "@/lib/data/authorization-runtime";

export default async function AuthorizationQueuePage() {
  let nestCases = AUTHORIZATION_CASES.map((entry) => ({ ...entry }));
  let nestWarning: string | null = null;
  let usedNest = false;

  try {
    const response = await serverFetch<AdminAuthorizationListResponse>(
      "/admin/authorization-cases?skip=0&take=100",
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      nestWarning = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      usedNest = true;
      const live = response.data.items.map(mapAdminAuthorizationCaseToUi);
      const liveUserIds = new Set(live.map((entry) => entry.userId));
      const fixtures = AUTHORIZATION_CASES.filter(
        (entry) => !liveUserIds.has(entry.userId),
      );
      nestCases = [...live, ...fixtures];
    }
  } catch {
    nestWarning = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  const summary = getAuthorizationQueueSummary(nestCases);

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            بررسی احراز هویت (مدارک)
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            صف پرونده‌هایی که مشتری مدارک هویتی (از جمله عکس کارت ملی) را ارسال
            کرده است. ارسال مدارک به‌معنای تأیید نیست — کارکنان باید فایل و
            اطلاعات را ببینند و فقط پس از بررسی دستی تأیید، رد، یا درخواست اصلاح
            کنند. تأیید دستی مستأجر می‌سازد.
          </p>
        </div>
        <Link
          href="/users"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          فهرست کاربران
        </Link>
      </div>

      {nestWarning ? (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
          role="status"
        >
          <p className="font-medium">Nest در دسترس نیست — نمونه‌های محلی</p>
          <p className="mt-1 text-muted-foreground">{nestWarning}</p>
        </div>
      ) : usedNest ? (
        <div
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          پرونده‌های زنده Nest در بالای صف؛ نمونه‌های محلی فقط وقتی کاربر متناظر
          پرونده Nest ندارد نمایش داده می‌شوند.
        </div>
      ) : null}

      <div
        className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
        role="note"
      >
        <p className="font-medium">تأیید خودکار وجود ندارد</p>
        <p className="mt-1 text-muted-foreground">
          وضعیت پیش‌فرض پس از ارسال مشتری «در حال بررسی» است
          {summary.pending > 0
            ? ` — هم‌اکنون ${summary.pending.toLocaleString("fa-IR")} پرونده در انتظار بررسی دستی.`
            : "."}{" "}
          تا وقتی دکمه «تأیید و ایجاد مستأجر» را نزنید، پرونده تأییدشده محسوب
          نمی‌شود.
        </p>
      </div>

      <AuthorizationQueueView initialCases={nestCases} />
    </div>
  );
}
