import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { DirectionalImage } from "../common/directional-image";

interface HelpArticleHeaderProps {
  title: string;
  summary: string;
  typeLabel: string;
  topicLabel: string;
  topicHref: string;
  /** Pre-formatted reading time string, e.g. "6 min read". Optional. */
  readingTime?: string;
  /** Pre-formatted last-reviewed date string. Optional. */
  lastReviewed?: string;
  /** Optional hero image shown beside the header text (article-specific). */
  imageSrc?: {
    ltr: string;
    rtl: string;
  };
}

/**
 * Article header: h1, summary paragraph, and a chip row with content type,
 * parent-topic link, optional reading time, and optional review date
 * (UX spec §5 — Required article header content, Metadata rules).
 *
 * The h1 carries `id="help-topic-heading"` so TopicHeadingFocus can move
 * keyboard focus here on in-app navigation (same pattern as topic pages).
 */
export function HelpArticleHero({
  title,
  summary,
  typeLabel,
  topicLabel,
  topicHref,
  readingTime,
  lastReviewed,
  imageSrc,
}: HelpArticleHeaderProps) {
  const meta = (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
      <Badge variant="secondary" className="font-medium">
        {typeLabel}
      </Badge>
      <span className="h-7 text-3xl" aria-hidden="true">
        ·
      </span>
      <Link
        href={topicHref}
        className="hover:text-primary dark:hover:text-primary-foreground text-link underline-offset-4 transition-colors"
      >
        {topicLabel}
      </Link>
      {!!readingTime && (
        <>
          <span aria-hidden="true">·</span>
          <span>{readingTime}</span>
        </>
      )}
      {!!lastReviewed && (
        <>
          <span aria-hidden="true">·</span>
          <span>{lastReviewed}</span>
        </>
      )}
    </div>
  );

  if (imageSrc?.ltr) {
    return (
      <section className="bg-muted/40 border-border/60 mb-8 rounded-2xl border-b px-6 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row">
          <div className="min-w-0 flex-1">
            <h1
              id="help-topic-heading"
              tabIndex={-1}
              className="mb-3 text-start text-2xl leading-tight font-bold outline-none sm:text-3xl"
            >
              {title}
            </h1>
            <p
              className="text-muted-foreground mb-4 text-start text-base leading-7"
              dir="auto"
            >
              {summary}
            </p>
            {meta}
          </div>
          <div className="relative aspect-video w-full max-w-100 shrink-0 overflow-hidden rounded-xl lg:w-[48%] lg:max-w-[unset]">
            <DirectionalImage
              src={{
                ltr: imageSrc.ltr,
                rtl: imageSrc?.rtl || imageSrc.ltr,
              }}
              alt=""
              fill
              sizes="(min-width: 1024px) 48vw, (min-width: 400px) 400px, 100vw"
              className="object-cover object-center"
              loading="eager"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <header className="border-border/60 mb-8 border-b pb-6">
      <h1
        id="help-topic-heading"
        tabIndex={-1}
        className="mb-3 text-start text-2xl leading-tight font-bold outline-none sm:text-3xl"
        dir="auto"
      >
        {title}
      </h1>
      <p
        className="text-muted-foreground mb-4 text-start text-base leading-7"
        dir="auto"
      >
        {summary}
      </p>
      {meta}
    </header>
  );
}
