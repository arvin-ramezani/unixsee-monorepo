import {
  Gauge,
  Globe,
  Megaphone,
  MonitorCheck,
  Newspaper,
  Rocket,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { HelpTopicIcon } from "@/lib/data/help-center/help-center-data";
import { cn } from "@/lib/utils";

const topicIcons: Record<HelpTopicIcon, typeof Rocket> = {
  gettingStarted: Rocket,
  managedWoo: ShoppingCart,
  performance: Gauge,
  monitoring: MonitorCheck,
  wooOperations: Settings2,
  security: ShieldCheck,
  domains: Globe,
  campaign: Megaphone,
  account: UserRound,
  seo: Newspaper,
};

/** Resolved, presentation-ready topic card. */
export interface TopicCard {
  id: string;
  icon: HelpTopicIcon;
  /** Includes the visible ordinal, e.g. "۱. شروع کار با Unixsee". */
  label: string;
  articleCount: string;
  href: string;
}

interface HelpTopicGridProps {
  topics: TopicCard[];
  className?: string;
}

/**
 * Browse-by-topic grid. Six featured tonal cards with no default border: the
 * surface is a soft card tint lifted by a subtle shadow, deepened on hover. The
 * whole card is one link with a single focus stop. Fewer cards render larger.
 */
export function HelpTopicGrid({ topics, className }: HelpTopicGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {topics.map((topic) => {
        const Icon = topicIcons[topic.icon];
        return (
          <li key={topic.id}>
            <Link
              href={topic.href}
              className="group bg-card/15 hover:bg-card/30 focus-visible:ring-ring dark:bg-card/50 dark:hover:bg-card flex h-full min-h-40 flex-col rounded-2xl p-5 shadow-sm ring-1 ring-transparent transition-[background-color,box-shadow] duration-200 outline-none hover:shadow-md focus-visible:ring-2"
            >
              <span className="bg-card/50 text-primary group-hover:bg-card/70 dark:bg-link/12 dark:text-link mb-4 grid size-12 shrink-0 place-items-center rounded-xl transition-colors">
                <Icon
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={1.75}
                />
              </span>
              <span
                className="mt-auto block text-[15px] leading-6 font-semibold text-balance"
                dir="auto"
              >
                {topic.label}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">
                {topic.articleCount}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
