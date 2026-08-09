import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";

import { DirectionalImage } from "@/components/common/directional-image";
import { NotificationSeenMarker } from "@/components/notifications/notification-seen-marker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { NotificationKind } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export interface NotificationArticleSectionView {
  id: string;
  title: string;
  paragraphs: readonly string[];
}

export interface RelatedNotificationView {
  id: string;
  kind: NotificationKind;
  title: string;
  summary: string;
  date: string;
}

interface NotificationArticleProps {
  notificationId: string;
  title: string;
  summary: string;
  category: string;
  published: string;
  readingTime: string;
  image?: {
    src: {
      ltr: string;
      rtl: string;
    };
    alt: string;
  };
  sections: readonly NotificationArticleSectionView[];
  related: readonly RelatedNotificationView[];
  labels: {
    back: string;
    more: string;
    relatedLabel: string;
  };
}

export function NotificationArticle({
  notificationId,
  title,
  summary,
  category,
  published,
  readingTime,
  image,
  sections,
  related,
  labels,
}: NotificationArticleProps) {
  return (
    <div className="mx-auto w-full max-w-360 pt-6 pb-10 sm:pt-8">
      <NotificationSeenMarker notificationId={notificationId} />

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground -ms-2 mb-5 w-fit gap-2"
      >
        <Link href="/dashboard/notifications">
          <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          {labels.back}
        </Link>
      </Button>

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
        <article aria-labelledby="notification-heading" className="min-w-0">
          <header
            className={cn(
              "border-border border-b",
              image ? "pb-3 sm:pb-4" : "pb-7 sm:pb-8",
            )}
          >
            <Badge
              variant="secondary"
              className="bg-primary/8 text-primary px-3 py-1 dark:bg-link/15 dark:text-link"
            >
              {category}
            </Badge>
            <h1
              id="notification-heading"
              tabIndex={-1}
              dir="auto"
              className="mt-4 max-w-3xl text-start text-2xl leading-tight font-semibold tracking-tight outline-none sm:text-3xl lg:text-[2.25rem]"
            >
              {title}
            </h1>
            <p
              dir="auto"
              className="text-muted-foreground mt-4 max-w-2xl text-start text-base leading-7 sm:text-lg sm:leading-8"
            >
              {summary}
            </p>
            <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                {published}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4" />
                {readingTime}
              </span>
            </div>
            {image && (
              <figure className="border-border bg-muted/30 relative me-auto mt-4 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border sm:mt-5">
                <DirectionalImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 672px, (min-width: 640px) calc(100vw - 80px), calc(100vw - 32px)"
                  className="object-contain"
                />
              </figure>
            )}
          </header>

          <div
            className={cn(
              "max-w-prose",
              image ? "pt-4 pb-8 sm:pt-5 sm:pb-10" : "py-8 sm:py-10",
            )}
          >
            {sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={section.id}
                className="mb-9 last:mb-0"
              >
                <h2
                  id={section.id}
                  dir="auto"
                  className="text-start text-xl font-semibold tracking-tight sm:text-2xl"
                >
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      dir="auto"
                      className="text-foreground/85 text-start text-base leading-7"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="border-border border-t pt-6 xl:hidden">
            <RelatedNotifications related={related} labels={labels} />
          </div>
        </article>

        <aside className="border-border bg-muted/40 sticky top-24 hidden rounded-2xl border py-5 xl:block">
          <RelatedNotifications
            titleClassName="px-5"
            linkItemClassName="px-5"
            related={related}
            labels={labels}
          />
        </aside>
      </div>
    </div>
  );
}

function RelatedNotifications({
  className,
  titleClassName,
  linkItemClassName,
  related,
  labels,
}: {
  className?: string;
  titleClassName?: string;
  linkItemClassName?: string;
  related: readonly RelatedNotificationView[];
  labels: NotificationArticleProps["labels"];
}) {
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="more-notifications-heading" className={className}>
      <h2
        id="more-notifications-heading"
        className={cn("text-base font-semibold", titleClassName)}
      >
        {labels.more}
      </h2>
      <ul
        aria-label={labels.relatedLabel}
        className="divide-border mt-3 divide-y"
      >
        {related.map((item) => (
          <li key={item.id}>
            <Link
              href={`/dashboard/notifications/${item.id}`}
              className={cn(
                "group hover:bg-muted hover:text-primary dark:hover:text-link focus-visible:ring-ring block py-4 transition-colors outline-none focus-visible:ring-2 xl:px-2",
                linkItemClassName,
              )}
            >
              <p
                dir="auto"
                className="text-start text-sm leading-5 font-semibold"
              >
                {item.title}
              </p>
              <p
                dir="auto"
                className="text-muted-foreground mt-1 line-clamp-2 text-start text-xs leading-5"
              >
                {item.summary}
              </p>
              <time className="text-muted-foreground mt-2 block text-xs">
                {item.date}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
