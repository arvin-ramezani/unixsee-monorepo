"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export interface TocItem {
  id: string;
  label: string;
}

interface HelpArticleTocMobileProps {
  items: TocItem[];
  /** Pre-resolved label, e.g. "On this page" / "در این راهنما". */
  label: string;
  className?: string;
}

/**
 * Mobile "On this page" disclosure (UX spec §7, §11).
 * Collapsed by default. Shows anchor links to the article's major headings
 * when opened. Selecting an anchor closes the disclosure and moves the reading
 * position to the heading without adding a second persistent mobile toolbar.
 *
 * Only rendered when the parent passes items with length ≥ 3 (spec §11).
 */
export function HelpArticleTocMobile({
  items,
  label,
  className,
}: HelpArticleTocMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-muted/30",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="article-toc-list"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span dir="auto">{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <nav id="article-toc-list" aria-label={label}>
          <ul className="space-y-0.5 border-t border-border px-4 py-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-1.5 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  dir="auto"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
