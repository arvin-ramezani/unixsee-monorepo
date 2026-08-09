import { useFormatter, useTranslations } from "next-intl";

import {
  activityIcons,
  activityIconToneClasses,
} from "@/components/activity/activity-visuals";
import { Panel } from "@/components/dashboard/panel";
import { Link, type IntlLinkProps } from "@/i18n/navigation";
import type { ActivityRecord } from "@/lib/data/activity/activity-records";
import { cn } from "@/lib/utils";

/**
 * Compact activity strip for the dashboard overview.
 *
 * Renders the same `ActivityRecord` shape and shares the icon/tone registry with
 * the full history page, so a given activity type looks identical on both
 * surfaces and stays correct in light and dark mode. Copy is resolved from the
 * same `ActivityHistory.records.*` messages the full page uses; this card only
 * changes the layout, never the data model.
 */
export function ActivityFeedCard({
  className,
  title,
  items,
  linkLabel,
  linkHref,
}: {
  className?: string;
  title: string;
  items: ActivityRecord[];
  linkLabel: string;
  linkHref: IntlLinkProps["href"];
}) {
  const t = useTranslations("ActivityHistory");
  const format = useFormatter();

  return (
    <Panel className={cn("flex h-77.5 flex-col px-4.75 pt-4 pb-5", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <ol className="mt-1 flex-1 space-y-1">
        {items.map((item) => {
          const Icon = activityIcons[item.icon];
          const occurredAt = new Date(item.occurredAt);

          return (
            <li key={item.id}>
              <div className="flex min-h-12 items-start gap-3 py-1 lg:items-center">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    activityIconToneClasses[item.outcome],
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {t(`records.${item.titleKey}`, item.titleValues)}
                  </p>
                  <p className="text-muted-foreground mt-1 flex min-w-0 items-center gap-1.5 text-xs">
                    {item.resource && (
                      <>
                        <span
                          className="truncate"
                          dir={item.resource.technical ? "ltr" : "auto"}
                        >
                          {item.resource.label}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <time
                      dateTime={item.occurredAt}
                      className="shrink-0 tabular-nums"
                    >
                      {format.dateTime(occurredAt, "dateTime")}
                    </time>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        href={linkHref}
        className="border-border text-link flex h-9 items-end gap-3 border-t pt-3 text-xs font-semibold"
      >
        {linkLabel}{" "}
        <span aria-hidden="true" className="rtl:rotate-180">
          →
        </span>
      </Link>
    </Panel>
  );
}
