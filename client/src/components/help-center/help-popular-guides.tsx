import { Globe, Gauge, ServerCog, ShieldCheck } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { HelpGuideIcon } from "@/lib/data/help-center/help-center-data";
import { cn } from "@/lib/utils";

const guideIcons: Record<HelpGuideIcon, typeof Globe> = {
  domain: Globe,
  performance: Gauge,
  security: ShieldCheck,
  migration: ServerCog,
};

/** Resolved, presentation-ready guide row. */
export interface GuideRow {
  id: string;
  icon: HelpGuideIcon;
  title: string;
  description: string;
  /** Owning-topic chip label, e.g. "۲. دامنه‌ها، DNS و SSL". */
  category: string;
  /** Guide-type chip label. */
  type: string;
  /** Preformatted "Last updated: …" string. */
  updated: string;
  href: string;
}

interface HelpPopularGuidesProps {
  guides: GuideRow[];
  className?: string;
}

/**
 * Popular guides as one calm shared surface. Rows are separated by inset
 * hairline dividers rather than individual boxes; each row is a single link.
 * Chips are metadata only and never independently interactive.
 */
export function HelpPopularGuides({
  guides,
  className,
}: HelpPopularGuidesProps) {
  return (
    <div
      className={cn(
        "bg-muted/50 dark:bg-card/40 overflow-hidden rounded-2xl shadow-sm",
        className,
      )}
    >
      <ul className="divide-border/40 divide-y">
        {guides.map((guide) => {
          const Icon = guideIcons[guide.icon];
          return (
            <li key={guide.id}>
              <Link
                href={guide.href}
                className="group hover:bg-accent/60 focus-visible:ring-ring flex items-start gap-4 p-5.5 transition-colors duration-200 outline-none focus-visible:ring-2 sm:gap-5"
              >
                <span className="bg-card/40 text-primary group-hover:bg-card/60 dark:bg-link/12 dark:text-link grid size-11 shrink-0 place-items-center rounded-xl transition-colors">
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={1.75}
                  />
                </span>

                <div className="3xl:flex 3xl:w-full items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-[15px] leading-6 font-semibold"
                      dir="auto"
                    >
                      {guide.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {guide.description}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 self-center text-xs">
                    <span
                      className="bg-accent text-accent-foreground rounded-md px-2 py-1 font-medium"
                      dir="auto"
                    >
                      {guide.category}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 font-medium">
                      {guide.type}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {guide.updated}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
