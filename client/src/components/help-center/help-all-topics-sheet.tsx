"use client";

import { List } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  HelpAllTopics,
  type AllTopicsEntry,
} from "@/components/help-center/help-all-topics";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HelpAllTopicsSheetProps {
  topics: AllTopicsEntry[];
  /** ID of the currently active topic; forwarded to HelpAllTopics. */
  currentId?: string;
  /** Button label; defaults to allTopics.sectionTitle. */
  triggerLabel?: string;
  /** Sheet heading; defaults to allTopics.sectionTitle. */
  title?: string;
  className?: string;
}

/**
 * Mobile entry point to the complete topic index. A button at the top of the
 * page opens a bottom sheet holding the same link list used by the desktop
 * sidebar. Rendered only below the `lg` breakpoint by the parent.
 */
export function HelpAllTopicsSheet({
  topics,
  currentId,
  triggerLabel,
  title,
  className,
}: HelpAllTopicsSheetProps) {
  const t = useTranslations("HelpCenter.allTopics");
  const resolvedTrigger = triggerLabel ?? t("sectionTitle");
  const resolvedTitle = title ?? t("sectionTitle");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={className}
        >
          <List aria-hidden="true" className="size-4.5" />
          {resolvedTrigger}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 rounded-t-2xl border-border p-0"
      >
        <SheetHeader className="text-start">
          <SheetTitle dir="auto">{resolvedTitle}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("description")}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
          <HelpAllTopics topics={topics} currentId={currentId} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
