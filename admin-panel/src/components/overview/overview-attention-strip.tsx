import Link from "next/link";
import { ClipboardList, LifeBuoy, PackagePlus } from "lucide-react";

import type { OverviewAttentionCountType } from "@/lib/data/overview-data";
import { toPersianDigits } from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";

const ATTENTION_ICONS: Record<string, typeof LifeBuoy> = {
  tickets: LifeBuoy,
  "plan-requests": PackagePlus,
  complementary: ClipboardList,
};

const ATTENTION_TONES: Record<
  string,
  {
    active: string;
    hint: string;
    icon: string;
  }
> = {
  tickets: {
    active:
      "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15",
    hint: "text-destructive/80",
    icon: "text-destructive",
  },
  "plan-requests": {
    active:
      "border-amber-500/25 bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:text-amber-300",
    hint: "text-amber-800/80 dark:text-amber-300/80",
    icon: "text-amber-700 dark:text-amber-300",
  },
  complementary: {
    active:
      "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
    hint: "text-primary/80",
    icon: "text-primary",
  },
};

const QUIET_TONE = {
  active: "border-border bg-card text-foreground hover:bg-muted/30",
  hint: "text-muted-foreground",
  icon: "text-muted-foreground",
} as const;

type OverviewAttentionStripProps = {
  counts: OverviewAttentionCountType[];
};

export function OverviewAttentionStrip({ counts }: OverviewAttentionStripProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="خلاصه نیازمند توجه"
    >
      {counts.map((item) => {
        const Icon = ATTENTION_ICONS[item.id] ?? ClipboardList;
        const tone =
          item.count > 0
            ? (ATTENTION_TONES[item.id] ?? ATTENTION_TONES.complementary)
            : QUIET_TONE;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              tone.active,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className={cn("mt-1 text-xs", tone.hint)}>{item.hint}</p>
              </div>
              <Icon
                className={cn("size-5 shrink-0", tone.icon)}
                aria-hidden="true"
              />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {toPersianDigits(item.count)}
            </p>
          </Link>
        );
      })}
    </section>
  );
}
