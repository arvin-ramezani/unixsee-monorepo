import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

const itemKeys = [
  "serviceConfiguration",
  "campaignAddOns",
  "enterpriseAssessment",
] as const;

export default function PlansAdditionalNotes({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("ManagedServerPage.PlansSection.additionalNotes");
  const items = itemKeys.map((key) => t(`items.${key}`));

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)}>
      <div
        className={cn(
          "flex flex-col items-start gap-6 rounded-2xl p-6 sm:p-8",
          "bg-card border-border border",
        )}
      >
        <div className="flex gap-4">
          <Info className="text-muted-foreground h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-foreground mb-3 text-xl font-bold">
              {t("title")}
            </h3>
            <ul className="text-muted-foreground marker:text-muted-foreground list-inside list-disc space-y-2 text-[13px] font-light">
              {items.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
