import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { DashboardPlan } from "@/lib/plans/types";
import { cn } from "@/lib/utils";

export function DashboardPlanCard({
  plan,
  recommended = false,
}: {
  plan: DashboardPlan;
  recommended?: boolean;
}) {
  const t = useTranslations("Plans");

  return (
    <article
      className={cn(
        "relative flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm",
        recommended && "border-primary ring-1 ring-primary",
      )}
    >
      {recommended && (
        <span className="absolute -top-3 inset-s-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          {t("recommended")}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <h2 className="text-lg font-semibold">{plan.name}</h2>
        {Boolean(plan.description) && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </div>

      <Button
        asChild
        variant={recommended ? "default" : "outline"}
        className="w-full"
      >
        <Link href={`/dashboard/plans/checkout?plan=${plan.id}`}>
          {t("select", { plan: plan.name })}
        </Link>
      </Button>
    </article>
  );
}
