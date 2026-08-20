import type { Metadata } from "next";

import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import { Toaster } from "@/components/ui/sonner";
import { YekanBakhFont } from "@/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "یونیکسی | پنل مدیریت",
  description:
    "مدیریت وب‌سایت‌ها، کاربران، تیکت‌ها و زیرساخت‌های تحت مدیریت یونیکسی.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${YekanBakhFont.variable} h-full antialiased app-scrollbar`}
    >
      <body className="flex min-h-full flex-col">
        <AuthStoreProvider>{children}</AuthStoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
