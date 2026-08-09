"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  text: string;
}

interface ArticleChecklistProps {
  items: ChecklistItem[];
  /** Shown below the list to clarify that state is not persisted (spec §8.3). */
  hint: string;
  className?: string;
}

/**
 * Interactive checklist with local-only checkbox state (UX spec §8.3).
 * Checkboxes are cosmetic: they do not imply Unixsee has saved or verified
 * anything. Completed items receive a strikethrough cue plus a muted color.
 */
export function ArticleChecklist({ items, hint, className }: ArticleChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className={cn("space-y-1", className)}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <Checkbox
              id={`check-${item.id}`}
              checked={!!checked[item.id]}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5 shrink-0"
            />
            <Label
              htmlFor={`check-${item.id}`}
              className={cn(
                "flex-1 cursor-pointer text-sm leading-6 transition-colors",
                checked[item.id] && "text-muted-foreground line-through",
              )}
              dir="auto"
            >
              {item.text}
            </Label>
          </li>
        ))}
      </ul>
      <p className="pt-2 text-xs text-muted-foreground" dir="auto">
        {hint}
      </p>
    </div>
  );
}
