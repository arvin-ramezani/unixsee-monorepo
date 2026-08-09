import { cn } from "@/lib/utils";
import HelpRecoveryLink from "./help-recovery-link";

interface HelpArticleRecoveryProps {
  title: string;
  searchLabel: string;
  searchHref: string;
  backToTopicLabel: string;
  topicHref: string;
  allTopicsLabel: string;
  allTopicsHref: string;
  className?: string;
}

/**
 * Recovery section at the bottom of every article page (UX spec §14).
 * Provides three escape paths: search, parent topic, all topics.
 * No ticket creation or chat — this stays inside the read-only knowledge
 * surface unless the product boundary changes.
 */
export function HelpArticleRecovery({
  title,
  searchLabel,
  searchHref,
  backToTopicLabel,
  topicHref,
  allTopicsLabel,
  allTopicsHref,
  className,
}: HelpArticleRecoveryProps) {
  return (
    <div
      className={cn(
        "border-border bg-card/30 mt-10 rounded-2xl border px-5 py-4",
        className,
      )}
    >
      <p
        className="text-muted-foreground mb-4 text-start text-sm font-semibold"
        dir="auto"
      >
        {title}
      </p>
      <nav aria-label={title}>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <HelpRecoveryLink
              variant="search"
              label={searchLabel}
              href={searchHref}
            />
          </li>
          <li>
            <HelpRecoveryLink
              label={backToTopicLabel}
              href={topicHref}
              variant="back"
            />
          </li>
          <li>
            <HelpRecoveryLink
              variant="undo"
              label={allTopicsLabel}
              href={allTopicsHref}
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}
