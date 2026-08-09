import { useLocale, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { formatRelativeValue } from "@/i18n/formats";
import type { Locale } from "@/i18n/routing";
import type { FeedItem } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { Link, type IntlLinkProps } from "@/i18n/navigation";

export const tones = {
  notification: "bg-primary/8 text-primary dark:bg-link/12 dark:text-link",
};

export function FeedCard({
  className,
  titleClassName,
  cardFooterClassName,
  title,
  items,
  linkLabel,
  linkHref = "#all",
}: {
  className?: string;
  titleClassName?: string;
  cardFooterClassName?: string;
  title: string;
  items: FeedItem[];
  linkLabel: string;
  linkHref?: IntlLinkProps["href"];
}) {
  const t = useTranslations("Dashboard.feeds");
  const locale = useLocale() as Locale;

  function getCopy(item: FeedItem) {
    const titleByKind = {
      platformUpdate: t("platformUpdateTitle"),
      seoGuide: t("seoGuideTitle"),
      designShowcase: t("designShowcaseTitle"),
      socialMediaTrends: t("socialMediaTrendsTitle"),
    };
    const detailByKind = {
      platformUpdate: t("platformUpdateDetail"),
      seoGuide: t("seoGuideDetail"),
      designShowcase: t("designShowcaseDetail"),
      socialMediaTrends: t("socialMediaTrendsDetail"),
    };
    return { title: titleByKind[item.kind], detail: detailByKind[item.kind] };
  }

  return (
    <Panel className={cn("flex flex-col px-4.75 pt-4 pb-5", className)}>
      <h2
        className={cn("text-lg font-semibold tracking-tight", titleClassName)}
      >
        {title}
      </h2>

      <ol className="mt-1 flex-1 space-y-1">
        {items.map((item) => {
          const copy = getCopy(item);
          const content = (
            <>
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full",
                  tones[item.tone],
                )}
              >
                <item.icon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{copy.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {copy.detail}
                </p>
              </div>
              {item.relative && (
                <time
                  dateTime={item.occurredAt}
                  className="text-muted-foreground self-start text-[0.7rem] whitespace-nowrap"
                >
                  {formatRelativeValue(
                    locale,
                    item.relative.value,
                    item.relative.unit,
                    "narrow",
                  )}
                </time>
              )}
            </>
          );

          return (
            <li key={`${item.kind}-${item.occurredAt}`}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:bg-muted focus-visible:ring-ring dark:hover:bg-accent flex min-h-12 items-start gap-3 px-4.75 py-1 transition-colors outline-none focus-visible:ring-2 lg:items-center",
                  )}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex min-h-12 items-start gap-3 py-1">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Link
        href={linkHref}
        className={cn(
          "border-border text-link mt-2 flex h-9 items-end gap-3 border-t pt-3 text-xs font-semibold",
          cardFooterClassName,
        )}
      >
        {linkLabel}{" "}
        <span aria-hidden="true" className="rtl:rotate-180">
          →
        </span>
      </Link>
    </Panel>
  );
}
