import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading chrome for `/dashboard/authorization`.
 *
 * Mirrors the default status landing: status icon + title/body, badge, and
 * primary/secondary actions. (Wizard chrome is client-only after interaction.)
 */
export function AuthorizationLoadingSkeleton() {
  const t = useTranslations("Authorization");

  return (
    <div className="mt-8" aria-busy="true" aria-label={t("loading")}>
      <Panel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-6 w-64 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-4/5 max-w-xl" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </Panel>
    </div>
  );
}
