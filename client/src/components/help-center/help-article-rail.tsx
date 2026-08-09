import { ChevronLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TocItem } from "./help-article-toc";

interface HelpArticleRailProps {
  /** Label for the parent-topic back link, e.g. "Back to Performance & Caching". */
  // backToTopicLabel: string;
  // topicHref: string;
  allTopicsLabel: string;
  allTopicsHref: string;
  /** TOC items; the rail renders them only when there are ≥ 3 (spec §6). */
  tocItems?: TocItem[];
  /** Label for the "On this page" section, e.g. "On this page". */
  onThisPageLabel?: string;
  className?: string;
}

/**
 * Contextual right rail for the article page on desktop (UX spec §6).
 * Contains: back-to-topic link, optional TOC (≥ 3 headings), all-topics link.
 * Deliberately compact — it is secondary to the article content and must not
 * repeat the full topic sidebar.
 */
export function HelpArticleRail({
  // backToTopicLabel,
  // topicHref,
  allTopicsLabel,
  allTopicsHref,
  tocItems,
  onThisPageLabel,
  className,
}: HelpArticleRailProps) {
  const hasToc = tocItems && tocItems.length >= 3 && onThisPageLabel;

  return (
    <div className={cn("space-y-6", className)}>
      {/* On this page — only when article has ≥ 3 headings (spec §6, §11). */}
      {hasToc && (
        <div>
          <h2
            className="text-foreground mb-2 text-start text-sm font-semibold"
            dir="auto"
          >
            {onThisPageLabel}
          </h2>
          <nav aria-label={onThisPageLabel}>
            <ul className="space-y-1">
              {tocItems!.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`#${item.id}`}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring block rounded py-1 text-sm underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                    dir="auto"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Browse all topics */}
      <Link
        href={allTopicsHref}
        className="text-primary dark:text-link focus-visible:ring-ring dark:hover:text-primary-foreground block rounded text-sm underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {allTopicsLabel}
      </Link>
    </div>
  );
}
