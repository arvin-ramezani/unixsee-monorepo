import { UsersView } from "@/components/users/users-view";

export type UsersPageProps = object;

export default function UsersPage({}: UsersPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">کاربران</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          یافتن و ایجاد مشتری، مدیریت مستأجر و عضویت‌ها و اقدام‌های امنیتی حساب
        </p>
      </div>

      <UsersView />
    </div>
  );
}
