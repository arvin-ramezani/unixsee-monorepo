"use client";

import { Megaphone, Newspaper, Palette, Search } from "lucide-react";
import { useId } from "react";

import { InlineScript } from "@/components/common/inline-script";
import {
  markNotificationAsSeen,
  notificationSeenStorageKey,
  useStoredSeenNotificationIds,
} from "@/components/notifications/notification-seen-store";
import { Link } from "@/i18n/navigation";
import type { NotificationKind } from "@/lib/dashboard-data";

export interface NotificationListItemView {
  id: string;
  kind: NotificationKind;
  title: string;
  summary: string;
  category: string;
  date: string;
  isSeen: boolean;
}

const notificationIcons = {
  platformUpdate: Newspaper,
  seoGuide: Search,
  designShowcase: Palette,
  socialMediaTrends: Megaphone,
} satisfies Record<NotificationKind, typeof Newspaper>;

export function NotificationList({
  items,
  listLabel,
  unseenLabel,
}: {
  items: readonly NotificationListItemView[];
  listLabel: string;
  unseenLabel: string;
}) {
  const listId = useId();
  const storedSeenIds = useStoredSeenNotificationIds();

  return (
    <>
      <ol
        id={listId}
        aria-label={listLabel}
        className="overflow-hidden rounded-2xl border border-border bg-background divide-y divide-border dark:shadow-sticky-card"
      >
        {items.map((item) => {
          const Icon = notificationIcons[item.kind];
          const isUnseen = !item.isSeen && !storedSeenIds.has(item.id);

          return (
            <li
              key={item.id}
              data-notification-id={item.id}
              data-is-unseen={isUnseen}
              suppressHydrationWarning
              className="group/notification data-[is-unseen=true]:bg-primary/5 dark:data-[is-unseen=true]:bg-link/8"
            >
              <Link
                href={`/dashboard/notifications/${item.id}`}
                onClick={() => markNotificationAsSeen(item.id)}
                className="group flex min-h-28 items-start gap-4 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:items-center sm:p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary sm:size-11 dark:bg-link/15 dark:text-link">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1 md:grid md:grid-cols-[minmax(0,1fr)_9rem] md:items-start md:gap-6">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <p
                        dir="auto"
                        className="min-w-0 max-w-3xl text-start text-sm font-semibold leading-6 sm:text-base"
                      >
                        {item.title}
                      </p>
                      {!item.isSeen ? (
                        <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary dark:bg-link group-data-[is-unseen=false]/notification:hidden">
                          <span className="sr-only">{unseenLabel}</span>
                        </span>
                      ) : null}
                    </div>
                    <p
                      dir="auto"
                      className="mt-1 line-clamp-2 max-w-3xl text-start text-sm leading-6 text-muted-foreground"
                    >
                      {item.summary}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:mt-0 md:flex-col md:items-start md:gap-y-1 md:pt-0.5 md:text-start">
                    <span className="font-medium text-foreground/75">
                      {item.category}
                    </span>
                    <span aria-hidden="true" className="md:hidden">
                      ·
                    </span>
                    <time>{item.date}</time>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <InlineScript
        html={`(function(){try{var root=document.getElementById(${JSON.stringify(listId)});if(!root)return;var seen=new Set((localStorage.getItem(${JSON.stringify(notificationSeenStorageKey)})||"").split(",").filter(Boolean));root.querySelectorAll("[data-notification-id]").forEach(function(row){if(seen.has(row.dataset.notificationId))row.dataset.isUnseen="false"})}catch(error){}})()`}
      />
    </>
  );
}
