import { ArrowUpRight, Headphones } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { SupportContactDialog } from "@/components/dashboard/support-contact-dialog";
import { getWebsiteStatusSummary, supportContact } from "@/lib/dashboard-data";
import { Link } from "@/i18n/navigation";

/**
 * Semantic per-tone styles for the Website Status rows.
 *
 * Icons follow the project idiom `text-{tone}-foreground dark:text-{tone}`:
 * the deep `-foreground` hue keeps contrast on the light card, while the
 * brighter base token reads on the dark card. `--link` already flips per-mode,
 * so the `info` tone uses it directly. Dots stay as solid base-token fills.
 */
const toneStyles = {
  success: {
    icon: "text-success-foreground dark:text-success",
    dot: "bg-success",
  },
  warning: {
    icon: "text-warning-foreground dark:text-warning",
    dot: "bg-warning",
  },
  info: {
    icon: "text-link",
    dot: "bg-link",
  },
} as const;

export function RightRail() {
  const t = useTranslations("Dashboard");
  const format = useFormatter();
  const { total, statusRows } = getWebsiteStatusSummary();

  return (
    <aside className="sticky top-28 space-y-4.5 lg:grid lg:grid-cols-2 lg:gap-4.5 xl:grid-cols-1">
      <Panel className="hidden h-74.25 p-4.75 lg:block">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("status.title")}
          </h2>
          <span className="text-muted-foreground text-xs font-medium">
            {t("status.total", { count: format.number(total, "integer") })}
          </span>
        </div>

        <div className="mt-3 space-y-0.5">
          {statusRows.map((row) => (
            <div
              key={row.status}
              className="flex h-10 items-center gap-3 text-xs"
            >
              <row.icon
                aria-hidden="true"
                className={`size-[1.1rem] ${toneStyles[row.tone].icon}`}
                strokeWidth={1.7}
              />
              <span className="flex-1">{t(`status.${row.status}`)}</span>
              <span className="font-semibold tabular-nums">
                {format.number(row.count, "integer")}
              </span>
              <span
                className={`ms-2 size-2 rounded-full ${toneStyles[row.tone].dot}`}
              />
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/websites"
          className="text-link border-border mt-2 flex h-11 items-end justify-between border-t pt-4 text-xs font-semibold"
        >
          {t("status.viewAll")}{" "}
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </Link>
      </Panel>

      <Panel id="help" className="relative overflow-hidden p-4.75 lg:h-57.25">
        <div className="-translate-y-1 md:grid md:grid-cols-2 md:items-center lg:grid-cols-1">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Headphones
                aria-hidden="true"
                className="text-secondary size-6 lg:hidden"
              />
              <span className="font-semibold">{t("help.title")}</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-37.5 text-xs leading-5">
              {t("help.description")}
            </p>
          </div>
          <div>
            <SupportContactDialog
              displayPhoneNumber={supportContact.displayPhoneNumber}
              phoneNumber={supportContact.phoneNumber}
            />

            <Link
              href="help-center"
              className="text-link mt-2 flex items-center gap-2 text-xs font-medium lg:mt-8"
            >
              {t("help.visit")}{" "}
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 rtl:-rotate-90"
              />
            </Link>
          </div>
        </div>

        <span className="text-secondary absolute inset-e-1 top-11 hidden size-24 place-items-center lg:grid">
          <Headphones
            aria-hidden="true"
            className="size-24"
            strokeWidth={1.3}
          />
        </span>
      </Panel>
    </aside>
  );
}
