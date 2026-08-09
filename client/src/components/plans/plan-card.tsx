import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PlanRecord } from "@/lib/data/plans/plan-records";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanRecord;
}

export function PlanCard({ plan }: PlanCardProps) {
  const t = useTranslations("Plans");
  const common = useTranslations("Common");

  return (
    <article
      className={cn(
        "relative flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm",
        plan.recommended && "border-primary ring-1 ring-primary",
      )}
    >
      {plan.recommended && (
        <span className="absolute -top-3 inset-s-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          {t("recommended")}
        </span>
      )}

      <div>
        <h2 className="text-lg font-semibold">
          {common(`plans.${plan.nameKey}`)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      <div className="flex items-end gap-1">
        <span className="text-4xl font-bold">${plan.priceUsd}</span>
        <span className="mb-1 text-sm text-muted-foreground">
          {t("perMonth")}
        </span>
      </div>

      <ul aria-label={t("featuresLabel")} className="flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={plan.recommended ? "default" : "outline"}
        className="w-full"
      >
        <Link href={`/dashboard/plans/checkout?plan=${plan.id}`}>
          {t("select", { plan: common(`plans.${plan.nameKey}`) })}
        </Link>
      </Button>
    </article>
  );
}
