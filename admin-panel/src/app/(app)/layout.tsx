import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.fullName?.trim() || user.username?.trim() || "کاربر";
  const displayEmail =
    user.email?.trim() || user.username?.trim() || user.role;

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: displayName,
          email: displayEmail,
        }}
      />

      <SidebarInset>
        <Header />

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
