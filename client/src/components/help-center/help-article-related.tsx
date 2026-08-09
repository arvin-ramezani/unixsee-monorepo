import { BookOpen, FileText, ListChecks, ListOrdered } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { HelpArticleType } from "@/lib/data/help-center/help-center-data";

const typeIcons: Record<HelpArticleType, typeof BookOpen> = {
  stepByStep: ListOrdered,
  explainer: BookOpen,
  checklist: ListChecks,
  reference: FileText,
};

export interface RelatedArticleRow {
  id: string;
  type: HelpArticleType;
  title: string;
  description: string;
  category: string;
  updated: string;
  href: string;
}

interface HelpArticleRelatedProps {
  heading: string;
  articles: RelatedArticleRow[];
  className?: string;
}

/**
 * "Related articles" section at the end of the article page (UX spec §13).
 * Shows 2–4 eligible articles, same topic, selected by task relationship.
 * Uses the same card pattern as the topic page article list for consistency.
 */
export function HelpArticleRelated({
  heading,
  articles,
  className,
}: HelpArticleRelatedProps) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-labelledby="related-articles-heading"
      className={cn("mt-10", className)}
    >
      <h2
        id="related-articles-heading"
        className="mb-4 text-start text-lg font-semibold"
        dir="auto"
      >
        {heading}
      </h2>
      <div className="bg-muted/50 dark:bg-card/40 overflow-hidden rounded-2xl shadow-sm">
        <ul className="divide-border/40 divide-y">
          {articles.map((article) => {
            const Icon = typeIcons[article.type];
            return (
              <li key={article.id}>
                <Link
                  href={article.href}
                  className="group hover:bg-accent/60 focus-visible:ring-ring flex items-start gap-4 p-5.5 transition-colors duration-200 outline-none focus-visible:ring-2"
                >
                  <span className="dark:bg-link/12 dark:text-link bg-card/40 text-primary group-hover:bg-card/60 grid size-9 shrink-0 place-items-center rounded-xl transition-colors">
                    <Icon
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.75}
                    />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold" dir="auto">
                        {article.title}
                      </p>
                      <p
                        className="text-muted-foreground mt-0.5 text-sm leading-5"
                        dir="auto"
                      >
                        {article.description}
                      </p>
                    </div>

                    <div className="sm:align-start mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs sm:mt-0 sm:justify-start">
                      <span className="text-foreground font-medium" dir="auto">
                        {article.category}
                      </span>
                      <span className="text-muted-foreground">
                        {article.updated}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
