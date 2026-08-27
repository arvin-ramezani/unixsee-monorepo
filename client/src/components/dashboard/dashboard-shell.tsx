"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Header } from "@/components/dashboard/header";
import { DesktopSidebar } from "@/components/dashboard/sidebar";
import {
  DashboardBreadcrumb,
  type DashboardBreadcrumbItem,
} from "@/components/dashboard/dashboard-breadcrumb";
import { DashboardViewProvider } from "@/components/dashboard/views/dashboard-view-context";
import { UnixseeMessagesPresence } from "@/components/unixsee-messages/unixsee-messages-presence";
import { notifications } from "@/lib/dashboard-data";
import type { DashboardActiveItem } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  activeItem: DashboardActiveItem;
  children: ReactNode;
  breadcrumbs?: readonly DashboardBreadcrumbItem[];
  searchPlaceholder?: string;
  previewTheme?: "dark" | "light";
  userName?: string;
  avatarUrl?: string | null;
  showViewToggle?: boolean;
}

let sidebarCollapsedPreference = false;

export function DashboardShell({
  activeItem,
  breadcrumbs,
  children,
  previewTheme,
  showViewToggle,
  userName,
  avatarUrl,
}: DashboardShellProps) {
  const navigation = useTranslations("Navigation");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => sidebarCollapsedPreference,
  );
  const [hasUnreadUnixseeMessages, setHasUnreadUnixseeMessages] =
    useState(false);

  function handleSidebarCollapsedChange(collapsed: boolean) {
    sidebarCollapsedPreference = collapsed;
    setIsSidebarCollapsed(collapsed);
  }

  return (
    <div
      className={cn(
        "unixsee-dashboard-shell bg-background text-foreground min-h-dvh",
        previewTheme === "dark" && "dark",
      )}
    >
      <UnixseeMessagesPresence onUnreadChange={setHasUnreadUnixseeMessages} />
      <DesktopSidebar
        activeItem={activeItem}
        collapsed={isSidebarCollapsed}
        onCollapsedChange={handleSidebarCollapsedChange}
        hasUnreadUnixseeMessages={hasUnreadUnixseeMessages}
      />
      <div
        className={
          isSidebarCollapsed
            ? "min-w-0 transition-[padding-inline-start] duration-300 ease-in-out xl:ps-22"
            : "min-w-0 transition-[padding-inline-start] duration-300 ease-in-out xl:ps-57"
        }
      >
        <DashboardViewProvider>
          <Header
            activeItem={activeItem}
            notifications={notifications}
            showViewToggle={showViewToggle}
            userName={userName || navigation("accountFallback")}
            avatarUrl={avatarUrl}
            hasUnreadUnixseeMessages={hasUnreadUnixseeMessages}
          />
          <main className="px-4 pb-8 sm:px-6 xl:ps-5.75 xl:pe-6.5">
            {!!breadcrumbs?.length && (
              <DashboardBreadcrumb
                ariaLabel={navigation("breadcrumb")}
                items={[
                  {
                    label: navigation("dashboard"),
                    href: "/dashboard",
                  },
                  ...breadcrumbs,
                ]}
                className="px-1.5 pt-5"
              />
            )}
            {children}
          </main>
        </DashboardViewProvider>
      </div>
    </div>
  );
}
