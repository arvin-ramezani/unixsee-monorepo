import type { Metadata } from "next";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import Header from "@/components/layout/header";
import { YekanBakhFont } from "@/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "یونیکسی | پنل مدیریت",
  description:
    "مدیریت وب‌سایت‌ها، کاربران، تیکت‌ها و زیرساخت‌های تحت مدیریت یونیکسی.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${YekanBakhFont.variable} h-full antialiased app-scrollbar`}
    >
      <body className="min-h-full flex flex-col">
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <Header />

            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
