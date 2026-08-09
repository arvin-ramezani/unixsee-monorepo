"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import { Bell, Newspaper, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { InlineScript } from "@/components/common/inline-script";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { formatRelativeValue } from "@/i18n/formats";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NotificationItem } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import {
  markNotificationAsSeen,
  markNotificationsAsSeen,
  notificationSeenStorageKey,
  useStoredSeenNotificationIds,
} from "@/components/notifications/notification-seen-store";

interface NotificationCenterProps {
  notifications: readonly NotificationItem[];
}

interface NotificationPanelProps extends NotificationCenterProps {
  heading: ReactNode;
  unseenIds: ReadonlySet<string>;
  onMarkAllAsSeen: () => void;
  onMarkAsSeen: (notificationId: string) => void;
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const t = useTranslations("Header");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const storedSeenIds = useStoredSeenNotificationIds();
  const unseenIds = new Set(
    notifications
      .filter(
        (item) =>
          item.seenAt === null && !storedSeenIds.has(item.notificationId),
      )
      .map((item) => item.notificationId),
  );
  const unseenCount = unseenIds.size;
  const triggerLabel = t("notifications", { count: unseenCount });
  const triggerLabels = Array.from(
    { length: notifications.length + 1 },
    (_, count) => t("notifications", { count }),
  );
  const unseenCandidateIds = notifications
    .filter((item) => item.seenAt === null)
    .map((item) => item.notificationId);

  useScrollLock(desktopOpen || mobileOpen, "dashboard-notification-center");

  function markAllAsSeen() {
    markNotificationsAsSeen(notifications.map((item) => item.notificationId));
  }

  function markAsSeen(notificationId: string) {
    markNotificationAsSeen(notificationId);
  }

  const panelProps = {
    notifications,
    unseenIds,
    onMarkAllAsSeen: markAllAsSeen,
    onMarkAsSeen: markAsSeen,
  };

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <NotificationTrigger
            label={triggerLabel}
            labels={triggerLabels}
            hasUnseenCandidate={unseenCandidateIds.length > 0}
            unseenCount={unseenCount}
            className="sm:hidden"
          />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[80dvh] gap-0 rounded-t-2xl border-border p-0 pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          <SheetDescription className="sr-only">
            {t("notificationCenter.description")}
          </SheetDescription>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="plain"
              aria-label={t("notificationCenter.close")}
              className="absolute inset-e-3 top-3 z-10 grid size-10 place-items-center rounded-lg"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </SheetClose>
          <NotificationPanel
            {...panelProps}
            heading={
              <SheetTitle className="text-base font-semibold">
                {t("notificationCenter.title")}
              </SheetTitle>
            }
          />
        </SheetContent>
      </Sheet>

      <Popover open={desktopOpen} onOpenChange={setDesktopOpen}>
        <PopoverTrigger asChild>
          <NotificationTrigger
            label={triggerLabel}
            labels={triggerLabels}
            hasUnseenCandidate={unseenCandidateIds.length > 0}
            unseenCount={unseenCount}
            className="hidden sm:grid"
          />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="hidden w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border-border p-0 shadow-lg sm:block"
        >
          <NotificationPanel
            {...panelProps}
            heading={
              <h2 className="text-base font-semibold">
                {t("notificationCenter.title")}
              </h2>
            }
          />
        </PopoverContent>
      </Popover>

      <InlineScript
        html={`(function(){try{var seen=new Set((localStorage.getItem(${JSON.stringify(notificationSeenStorageKey)})||"").split(",").filter(Boolean));var count=${JSON.stringify(unseenCandidateIds)}.filter(function(id){return !seen.has(id)}).length;document.querySelectorAll("[data-notification-trigger]").forEach(function(trigger){trigger.dataset.unseenCount=String(count);var labels=JSON.parse(trigger.dataset.notificationLabels||"[]");if(labels[count])trigger.setAttribute("aria-label",labels[count])})}catch(error){}})()`}
      />
    </>
  );
}

function NotificationTrigger({
  className,
  labels,
  label,
  hasUnseenCandidate,
  unseenCount,
  ...props
}: ComponentProps<typeof Button> & {
  label: string;
  labels: readonly string[];
  hasUnseenCandidate: boolean;
  unseenCount: number;
}) {
  return (
    <Button
      {...props}
      type="button"
      variant="ghost"
      size="plain"
      aria-label={label}
      data-notification-trigger=""
      data-notification-labels={JSON.stringify(labels)}
      data-unseen-count={unseenCount}
      suppressHydrationWarning
      className={cn(
        "group/notification-trigger relative size-11 place-items-center rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Bell aria-hidden="true" className="size-5" />
      {hasUnseenCandidate ? (
        <span
          aria-hidden="true"
          className="absolute inset-e-2.5 top-2 size-2.5 rounded-full border-2 border-background bg-secondary group-data-[unseen-count=0]/notification-trigger:hidden"
        />
      ) : null}
    </Button>
  );
}

function NotificationPanel({
  heading,
  notifications,
  onMarkAllAsSeen,
  onMarkAsSeen,
  unseenIds,
}: NotificationPanelProps) {
  const t = useTranslations("Header.notificationCenter");
  const feeds = useTranslations("Dashboard.feeds");
  const locale = useLocale() as Locale;
  const unseenCount = unseenIds.size;

  function getCopy(item: NotificationItem) {
    const titleByKind = {
      platformUpdate: feeds("platformUpdateTitle"),
      seoGuide: feeds("seoGuideTitle"),
      designShowcase: feeds("designShowcaseTitle"),
      socialMediaTrends: feeds("socialMediaTrendsTitle"),
    };
    const detailByKind = {
      platformUpdate: feeds("platformUpdateDetail"),
      seoGuide: feeds("seoGuideDetail"),
      designShowcase: feeds("designShowcaseDetail"),
      socialMediaTrends: feeds("socialMediaTrendsDetail"),
    };

    return { title: titleByKind[item.kind], detail: detailByKind[item.kind] };
  }

  return (
    <section aria-label={t("title")}>
      <div className="flex min-h-16 items-center gap-3 border-b border-border px-4 pe-13 sm:pe-4">
        <div className="min-w-0">
          {heading}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("unseenCount", { count: unseenCount })}
          </p>
        </div>
        {unseenCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsSeen}
            className="ms-auto h-auto min-h-9 shrink-0 whitespace-normal px-2 text-xs text-link"
          >
            {t("markAllSeen")}
          </Button>
        ) : null}
      </div>

      {notifications.length > 0 ? (
        <ScrollArea className="h-[min(27rem,calc(80dvh-4rem))] sm:h-auto sm:max-h-108">
          <ol aria-label={t("listLabel")} className="divide-y divide-border">
            {notifications.map((item) => {
              const copy = getCopy(item);
              const isUnseen = unseenIds.has(item.notificationId);

              return (
                <li
                  key={item.notificationId}
                  className={cn(isUnseen && "bg-primary/5 dark:bg-link/8")}
                >
                  <Link
                    href={
                      item.href ??
                      `/dashboard/notifications/${item.notificationId}`
                    }
                    onClick={() => onMarkAsSeen(item.notificationId)}
                    className="relative flex min-h-20 items-start gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/8 text-primary dark:bg-link/15 dark:text-link">
                      <item.icon aria-hidden="true" className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="line-clamp-2 text-sm font-semibold leading-5">
                          {copy.title}
                        </p>
                        {isUnseen ? (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary dark:bg-link">
                            <span className="sr-only">{t("unseen")}</span>
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {copy.detail}
                      </p>
                      {item.relative ? (
                        <time
                          dateTime={item.occurredAt}
                          className="mt-1 block text-[0.7rem] text-muted-foreground"
                        >
                          {formatRelativeValue(
                            locale,
                            item.relative.value,
                            item.relative.unit,
                            "long",
                          )}
                        </time>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      ) : (
        <div className="px-6 py-12 text-center">
          <Newspaper
            aria-hidden="true"
            className="mx-auto size-6 text-muted-foreground"
          />
          <p className="mt-3 text-sm font-semibold">{t("emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-64 text-xs leading-5 text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
      )}
    </section>
  );
}
