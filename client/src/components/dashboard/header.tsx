"use client";

import { useTranslations } from "next-intl";

import { AccountMenu } from "@/components/dashboard/account-menu";
import { LocaleSwitcher } from "@/components/dashboard/locale-switcher";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { useDashboardView } from "@/components/dashboard/views/dashboard-view-context";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import type { NotificationItem } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { GridIcon } from "../common/grid-icon";
import { ModeToggle } from "../ui/theme-toggle";

type ActiveItem =
  | "Activities"
  | "ComplementaryServices"
  | "Dashboard"
  | "Domains"
  | "HelpCenter"
  | "Profile"
  | "Tickets"
  | "UnixseeMessages"
  | "Websites";

interface HeaderProps {
  activeItem?: ActiveItem;
  notifications: readonly NotificationItem[];
  showViewToggle?: boolean;
  userName?: string;
  avatarUrl?: string | null;
  hasUnreadUnixseeMessages?: boolean;
}

/**
 * Pages whose body renders a table/grid list that responds to the shared view
 * preference. The header toggle is hidden elsewhere (e.g. ComplementaryServices,
 * HelpCenter, Profile), where flipping the view would have no visible effect.
 */
const VIEW_TOGGLE_ITEMS: ReadonlySet<ActiveItem> = new Set([
  "Dashboard",
  "Tickets",
  "Websites",
]);

export function Header({
  activeItem = "Dashboard",
  notifications,
  showViewToggle: showViewToggleOverride,
  userName,
  avatarUrl,
  hasUnreadUnixseeMessages = false,
}: HeaderProps) {
  const views = useTranslations("Common.views");
  const { view, toggleView } = useDashboardView();
  const scrolled = useScroll(8);
  const showViewToggle =
    showViewToggleOverride ?? VIEW_TOGGLE_ITEMS.has(activeItem);

  return (
    <header
      className={cn(
        // Frosted, translucent surface built from semantic tokens (no hardcoded
        // white): light uses the app background, dark uses the --color-dark-header
        // token. backdrop-blur is always on; the border + shadow only appear once
        // the page is scrolled, so the header sits flush at the top.
        "bg-background/70 supports-backdrop-filter:bg-background/55 dark:bg-dark-header dark:supports-backdrop-filter:bg-dark-header sticky top-0 z-20 h-16 border-b border-transparent backdrop-blur-lg transition-[background-color,border-color,box-shadow] duration-200 xl:h-22",
        scrolled && "shadow dark:shadow-lg",
      )}
    >
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 xl:ps-7.5 xl:pe-6.5">
        <MobileNav
          activeItem={activeItem}
          hasUnreadUnixseeMessages={hasUnreadUnixseeMessages}
        />
        <GlobalSearch />
        <div className="ms-auto flex h-full items-center gap-1 sm:gap-3 xl:gap-5">
          {showViewToggle && (
            <Button
              type="button"
              variant="ghost"
              size="plain"
              aria-label={views("label")}
              aria-pressed={view === "grid"}
              title={view === "grid" ? views("table") : views("grid")}
              onClick={toggleView}
              className="hover:bg-muted focus-visible:ring-ring hidden size-11 place-items-center rounded-lg focus-visible:ring-2 sm:grid"
            >
              <GridIcon view={view === "table" ? "list" : "grid"} />
            </Button>
          )}
          <NotificationCenter notifications={notifications} />
          <ModeToggle triggerClassName="size-9" />
          <LocaleSwitcher />
          {/* <AccountMenu userName={userName} avatarUrl={avatarUrl} /> */}
        </div>
      </div>
    </header>
  );
}
