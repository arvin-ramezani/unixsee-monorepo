import { ChevronLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Resolved, presentation-ready taxonomy entry. */
export interface AllTopicsEntry {
  id: string;
  /** Includes the visible ordinal, e.g. "۱. شروع کار با Unixsee". */
  label: string;
  href: string;
}

interface HelpAllTopicsProps {
  topics: AllTopicsEntry[];
  /** ID of the currently active topic; adds aria-current + active tonal state. */
  currentId?: string;
  className?: string;
}

/**
 * Complete topic index as a flat list of navigation links — never an accordion
 * or disclosure (UX spec §4). Compact, label-only rows so the list fits a
 * secondary sidebar on desktop and a bottom sheet on mobile. One tonal panel,
 * inset hairline dividers, a trailing chevron as a persistent "go to" cue.
 * The current topic is highlighted tonally AND via aria-current (spec §11).
 */
export function HelpAllTopics({
  topics,
  currentId,
  className,
}: HelpAllTopicsProps) {
  return (
    <nav
      className={cn(
        "bg-muted/50 dark:bg-card/40 overflow-hidden rounded-2xl shadow-sm",
        className,
      )}
    >
      <ul className="divide-border/40 divide-y">
        {topics.map((topic) => {
          const isCurrent = topic.id === currentId;

          return (
            <li key={topic.id}>
              <Link
                href={topic.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "group focus-visible:ring-ring flex items-center gap-3 px-4.5 py-4.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2",
                  isCurrent
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60",
                )}
              >
                <span dir="auto" className="min-w-0 flex-1 leading-6">
                  {topic.label}
                </span>
                <ChevronLeft
                  aria-hidden="true"
                  className={cn(
                    "size-4.5 shrink-0 transition-colors ltr:-scale-x-100",
                    isCurrent
                      ? "text-accent-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  strokeWidth={2}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
