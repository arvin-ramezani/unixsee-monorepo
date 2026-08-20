import { Suspense } from "react";
import { redirect } from "next/navigation";

import { StaffLoginForm } from "@/components/auth/staff-login-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function StaffLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">یونیکسی</h1>
          <p className="text-sm text-muted-foreground">ورود کارکنان</p>
        </div>
        <Suspense fallback={null}>
          <StaffLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
