"use client";

import { ArrowUpRight, Globe2, MessagesSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardButtonLink } from "@/components/dashboard/dashboard-button-link";
import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import { cn } from "@/lib/utils";

export type UnixseeMessagesAsideProps = {
  className?: string;
  /** When set, website action opens that site; otherwise `/dashboard/websites`. */
  websiteId?: string | null;
  websiteLabel?: string | null;
};

export function UnixseeMessagesAside({
  className,
  websiteId,
  websiteLabel,
}: UnixseeMessagesAsideProps) {
  const t = useTranslations("UnixseeMessages.aside");
  const hasWebsite = !!websiteId;
  const websiteHref = hasWebsite
    ? `/dashboard/websites/${websiteId}`
    : "/dashboard/websites";

  return (
    <DashboardFadeIn className={cn(className)}>
      <aside aria-label={t("label")} className="grid gap-5">
        <Panel className="p-5">
          <h2 className="text-lg font-semibold">{t("quickActions.title")}</h2>

          <nav
            aria-label={t("quickActions.label")}
            className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1"
          >
            <DashboardButtonLink
              variant="outline"
              href="/dashboard/tickets"
              revealClassName="bg-muted dark:bg-accent"
              className="group border-border hover:text-foreground! focus-visible:ring-ring flex min-h-11 items-center justify-start gap-3 border px-3.5 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ltr:font-medium [&_span]:w-full"
            >
              <MessagesSquare
                aria-hidden="true"
                className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
              />
              <span className="min-w-0 flex-1 text-start">
                {t("quickActions.tickets")}
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="text-muted-foreground ms-auto size-4 shrink-0 rtl:-scale-x-100"
              />
            </DashboardButtonLink>

            <DashboardButtonLink
              variant="outline"
              href={websiteHref}
              revealClassName="bg-muted dark:bg-accent"
              className="group border-border hover:text-foreground! focus-visible:ring-ring flex min-h-11 items-center justify-start gap-3 border px-3.5 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ltr:font-medium [&_span]:w-full"
            >
              <Globe2
                aria-hidden="true"
                className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
              />
              <span className="min-w-0 flex-1 text-start">
                {hasWebsite
                  ? t("quickActions.relatedWebsite", {
                      website:
                        websiteLabel?.trim() ||
                        t("quickActions.websiteFallback"),
                    })
                  : t("quickActions.websites")}
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="text-muted-foreground ms-auto size-4 shrink-0 rtl:-scale-x-100"
              />
            </DashboardButtonLink>
          </nav>
        </Panel>
      </aside>
    </DashboardFadeIn>
  );
}
