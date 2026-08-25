import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";

export interface DashboardBreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardBreadcrumbProps {
  ariaLabel: string;
  items: readonly DashboardBreadcrumbItem[];
  className?: string;
}

/** Shared responsive breadcrumb for dashboard section and nested pages. */
export function DashboardBreadcrumb({
  ariaLabel,
  items,
  className,
}: DashboardBreadcrumbProps) {
  return (
    <Breadcrumb aria-label={ariaLabel} className={className}>
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <Fragment key={`${item.href ?? "current"}-${item.label}`}>
              {index > 0 && (
                <BreadcrumbSeparator className="shrink-0">/</BreadcrumbSeparator>
              )}
              <BreadcrumbItem className="min-w-0">
                {current ? (
                  <BreadcrumbPage
                    dir="auto"
                    className="block max-w-[18ch] truncate sm:max-w-[32ch]"
                  >
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href ?? "/dashboard"}
                      dir="auto"
                      className="block max-w-[12ch] truncate sm:max-w-[24ch]"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
