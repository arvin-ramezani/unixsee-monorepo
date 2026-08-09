"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { OverviewAttentionStrip } from "@/components/overview/overview-attention-strip";
import { OverviewDomainSection } from "@/components/overview/overview-domain-section";
import { Button } from "@/components/ui/button";
import {
  buildOverviewSnapshot,
  type OverviewSnapshotType,
} from "@/lib/data/overview-data";

const BROWSE_LINKS = [
  { href: "/tickets", label: "تیکت‌ها" },
  { href: "/plan-requests", label: "درخواست‌های پلن" },
  { href: "/complementary-services", label: "خدمات تکمیلی" },
] as const;

type OverviewViewProps = {
  initialSnapshot: OverviewSnapshotType;
};

export function OverviewView({ initialSnapshot }: OverviewViewProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hasActionableWork = snapshot.sections.some(
    (section) => section.items.length > 0,
  );

  const handleRefresh = () => {
    setSnapshot(buildOverviewSnapshot());
    setStatusMessage("نمای‌کلی با داده‌های نمایشی به‌روزرسانی شد.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          آخرین بازخوانی: {snapshot.generatedAtLabel}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="size-4" aria-hidden="true" />
          بازخوانی
        </Button>
      </div>

      <div className="sr-only" aria-live="polite">
        {statusMessage}
      </div>

      <OverviewAttentionStrip counts={snapshot.attentionCounts} />

      {!hasActionableWork ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-6">
          <h2 className="text-base font-semibold tracking-tight">
            صف توجه خالی است
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            در محدوده دسترسی فعلی مورد فوری در تیکت‌ها، درخواست‌های پلن یا خدمات
            تکمیلی دیده نمی‌شود.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {BROWSE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {snapshot.sections.map((section) => (
          <OverviewDomainSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
