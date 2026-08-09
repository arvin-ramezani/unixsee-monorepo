import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from "lucide-react";

import type {
  WebsiteAvailability,
  WebsiteServiceDetails,
} from "@/lib/data/websites/website-service-details";

export const monogramStyles: Record<WebsiteServiceDetails["tone"], string> = {
  green: "bg-success/15 text-success-foreground dark:text-success",
  violet: "bg-primary/15 text-link",
  blue: "bg-link/15 text-link",
  red: "bg-destructive/15 text-destructive",
  orange: "bg-warning/20 text-warning-foreground dark:text-warning",
};

export const availabilityStyles: Record<WebsiteAvailability, string> = {
  online:
    "border-success/30 bg-success/10 text-success-foreground dark:text-success",
  needsAttention:
    "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning",
  unavailable: "border-destructive/30 bg-destructive/10 text-destructive",
  unknown: "border-border bg-muted text-muted-foreground",
};

export function AvailabilityIcon({ status }: { status: WebsiteAvailability }) {
  if (status === "online") return <CheckCircle2 aria-hidden="true" />;
  if (status === "needsAttention") return <AlertTriangle aria-hidden="true" />;
  if (status === "unavailable") return <XCircle aria-hidden="true" />;
  return <CircleHelp aria-hidden="true" />;
}

export function SectionHeading({
  id,
  icon,
  title,
  description,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted dark:bg-link/12 dark:text-link text-foreground grid size-10 shrink-0 place-items-center rounded-lg [&>svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DetailRows({
  rows,
}: {
  rows: Array<{
    label: string;
    value: ReactNode;
    valueDirection?: "ltr";
  }>;
}) {
  return (
    <dl className="divide-border border-border mt-5 divide-y border-y">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-1 py-3 sm:grid sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center"
        >
          <dt className="text-muted-foreground text-sm">{row.label}</dt>
          <dd className="min-w-0 text-sm font-medium wrap-break-word sm:text-end">
            {row.valueDirection === "ltr" ? (
              <span dir="ltr" className="inline-block text-start">
                {row.value}
              </span>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
