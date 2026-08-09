import { BookOpen, FileText, ListChecks, ListOrdered } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { HelpArticleType } from "@/lib/data/help-center/help-center-data";
import { cn } from "@/lib/utils";
import HelpRecoveryLink from "./help-recovery-link";

const articleIcons: Record<HelpArticleType, typeof BookOpen> = {
  stepByStep: ListOrdered,
  explainer: BookOpen,
  checklist: ListChecks,
  reference: FileText,
};

/** Resolved, presentation-ready article row. */
export interface ArticleRow {
  id: string;
  type: HelpArticleType;
  title: string;
  description: string;
  typeLabel: string;
  href: string;
}

/** Resolved, presentation-ready article group. */
export interface ArticleGroupRow {
  id: string;
  heading: string;
  articles: ArticleRow[];
}

interface HelpTopicArticlesProps {
  startHere?: ArticleRow[];
  startHereLabel: string;
  groups: ArticleGroupRow[];
  recoveryAllTopicsLabel: string;
  recoveryAllTopicsHref: string;
  recoverySearchLabel: string;
  recoverySearchHref: string;
  className?: string;
}

function ArticleList({ articles }: { articles: ArticleRow[] }) {
  return (
    <div className="bg-muted/50 dark:bg-card/40 overflow-hidden rounded-2xl shadow-sm">
      <ul className="divide-border/40 divide-y">
        {articles.map((article) => {
          const Icon = articleIcons[article.type];

          return (
            <li key={article.id}>
              <Link
                href={article.href}
                className="group hover:bg-accent/60 focus-visible:ring-ring flex items-start gap-4 p-5.5 transition-colors duration-200 outline-none focus-visible:ring-2"
              >
                <span className="bg-card/40 text-primary group-hover:bg-card/60 dark:text-link dark:bg-link/12 grid size-10 shrink-0 place-items-center rounded-xl transition-colors">
                  <Icon
                    aria-hidden="true"
                    className="size-4.5"
                    strokeWidth={1.75}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-6 font-semibold">
                    {article.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-6">
                    {article.description}
                  </p>
                  <span className="bg-muted text-muted-foreground mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium">
                    {article.typeLabel}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Main content area of a topic page: optional start-here block, goal-grouped
 * article lists, and a recovery row linking back to the Help Center home and
 * the full topic index (UX spec §3, §5, §6, §8).
 */
export function HelpTopicArticles({
  startHere,
  startHereLabel,
  groups,
  recoveryAllTopicsLabel,
  recoveryAllTopicsHref,
  recoverySearchLabel,
  recoverySearchHref,
  className,
}: HelpTopicArticlesProps) {
  return (
    <div className={cn("space-y-10", className)}>
      {startHere && startHere.length > 0 && (
        <section aria-labelledby="start-here-heading">
          <h2
            id="start-here-heading"
            className="mb-4 text-start text-lg font-semibold"
            dir="auto"
          >
            {startHereLabel}
          </h2>
          <ArticleList articles={startHere} />
        </section>
      )}

      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`}>
          <h2
            id={`group-${group.id}`}
            className="mb-4 text-start text-lg font-semibold"
            dir="auto"
          >
            {group.heading}
          </h2>
          <ArticleList articles={group.articles} />
        </section>
      ))}

      {/* Recovery row (spec §3.4 / §8) */}
      <nav
        aria-label={recoveryAllTopicsLabel}
        className="flex flex-wrap gap-3 pt-2 text-sm"
      >
        <HelpRecoveryLink
          variant="search"
          label={recoverySearchLabel}
          href={recoverySearchHref}
        />
        {/* <Link
          href={recoverySearchHref}
          className="text-primary dark:text-link focus-visible:ring-ring rounded underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {recoverySearchLabel}
        </Link> */}
        <span aria-hidden="true" className="text-border dark:text-link">
          ·
        </span>
        <HelpRecoveryLink
          variant="undo"
          label={recoveryAllTopicsLabel}
          href={recoveryAllTopicsHref}
        />
        {/* <Link
          href={recoveryAllTopicsHref}
          className="text-primary focus-visible:ring-ring dark:text-link rounded underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {recoveryAllTopicsLabel}
        </Link> */}
      </nav>
    </div>
  );
}
