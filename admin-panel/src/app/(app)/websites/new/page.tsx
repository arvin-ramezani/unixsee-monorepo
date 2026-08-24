import { AdminBackLink } from "@/components/common/admin-back-link";
import { CreateWebsiteForm } from "@/components/websites/create-website-form";
import { serverFetch } from "@/lib/api/server-fetch";

type UserItem = { id: string; fullName: string | null; phoneNumber: string | null; email: string | null };
type PlanItem = { id: string; nameFa: string; nameEn: string };

async function fetchUsers(): Promise<UserItem[]> {
  try {
    const response = await serverFetch<{ items: UserItem[] }>(
      "/admin/users",
      { method: "GET" },
    );
    if (response.success && response.data) {
      return response.data.items;
    }
  } catch {
    console.error("Failed to fetch users");
  }
  return [];
}

async function fetchPlans(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await serverFetch<{ items: PlanItem[] }>("/admin/plans", {
      method: "GET",
    });
    if (response.success && response.data) {
      return response.data.items.map((p) => ({
        id: p.id,
        name: p.nameFa || p.nameEn,
      }));
    }
  } catch {
    console.error("Failed to fetch plans");
  }
  return [];
}

export default async function CreateWebsitePage() {
  const [users, plans] = await Promise.all([fetchUsers(), fetchPlans()]);
  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <AdminBackLink
        href="/websites"
        className="mt-4"
        aria-label="بازگشت به وب‌سایت‌ها"
      >
        بازگشت به وب‌سایت‌ها
      </AdminBackLink>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          افزودن وب‌سایت
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          یک وب‌سایت جدید برای یکی از کاربران ایجاد کنید
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
        <CreateWebsiteForm users={users} plans={plans} />
      </div>
    </div>
  );
}
