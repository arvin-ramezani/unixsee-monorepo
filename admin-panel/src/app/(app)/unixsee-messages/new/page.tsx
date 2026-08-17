import { AdminBackLink } from "@/components/common/admin-back-link";
import { UnixseeMessageComposeForm } from "@/components/unixsee-messages/unixsee-message-compose-form";
import { loadUnixseeComposeContextAction } from "@/actions/unixsee-messages/load-compose-context";
import { STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { buildTenantOptionsFromUsers } from "@/lib/unixsee-messages/tenant-options";
import { type AdminUserListResponse } from "@/lib/users/map-admin-user";

async function loadTenantOptions() {
  try {
    const response = await serverFetch<AdminUserListResponse>(
      "/admin/users?skip=0&take=100",
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      return { tenants: [], error: null as string | null };
    }

    return {
      tenants: buildTenantOptionsFromUsers(response.data.items),
      error: null as string | null,
    };
  } catch {
    return {
      tenants: [],
      error: STAFF_API_ERROR_MESSAGES.unavailable,
    };
  }
}

export default async function NewUnixseeMessagePage() {
  const { tenants, error } = await loadTenantOptions();

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <AdminBackLink
        href="/unixsee-messages"
        aria-label="بازگشت به پیام‌های یونیکسی"
      >
        بازگشت به پیام‌های یونیکسی
      </AdminBackLink>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">پیام جدید</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          یک عنوان و متن کوتاه در زبان ترجیحی کاربر بنویسید و در صورت نیاز منتشر
          کنید.
        </p>
      </div>

      {!!error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && tenants.length === 0 && (
        <div className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
          مستأجری برای ارسال پیام یافت نشد.
        </div>
      )}

      {tenants.length > 0 && (
        <UnixseeMessageComposeForm
          mode="create"
          tenants={tenants}
          loadComposeContext={loadUnixseeComposeContextAction}
        />
      )}
    </div>
  );
}
