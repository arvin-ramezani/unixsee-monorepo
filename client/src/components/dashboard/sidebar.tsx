import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Brand } from "@/components/dashboard/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "@/lib/dashboard-data";

interface SidebarContentProps {
  activeItem?:
    | "Activities"
    | "ComplementaryServices"
    | "Dashboard"
    | "Domains"
    | "HelpCenter"
    | "Profile"
    | "Tickets"
    | "Websites";
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarContent({
  activeItem = "Dashboard",
  collapsed = false,
  onCollapsedChange,
}: SidebarContentProps) {
  const t = useTranslations("Navigation");

  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="flex h-22 items-center px-7">
        <Brand compact={collapsed} />
      </div>
      <TooltipProvider delayDuration={300}>
        <nav
          aria-label={t("primary")}
          className="space-y-1.75 py-2.75 ps-3 pe-3.75"
        >
          {navigation.map((item) => {
            const disabled = "disabled" in item && item.disabled;
            const label = (
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
                  item.key === "complementaryServices" &&
                    "ltr:text-sm ltr:leading-4! ltr:whitespace-normal",
                  item.key === "activities" &&
                    "rtl:text-sm rtl:leading-4.5! rtl:whitespace-normal",
                  collapsed
                    ? "max-w-0 -translate-x-1 opacity-0 rtl:translate-x-1"
                    : "max-w-36 translate-x-0 opacity-100 delay-100",
                )}
                aria-hidden={collapsed}
              >
                {t(item.key)}
              </span>
            );

            return (
              <Tooltip key={item.key} open={collapsed ? undefined : false}>
                <TooltipTrigger asChild>
                  {disabled ? (
                    <div
                      aria-disabled="true"
                      className="text-muted-foreground/60 relative flex h-12 cursor-not-allowed items-center gap-4 overflow-visible rounded-lg px-5 text-[0.94rem] font-medium"
                      aria-label={
                        collapsed
                          ? `${t(item.key)} — ${t("comingSoon")}`
                          : undefined
                      }
                    >
                      <item.icon
                        aria-hidden="true"
                        className="size-[1.3rem] shrink-0"
                        strokeWidth={1.7}
                      />
                      {label}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "absolute -inset-e-2 top-1/3 ms-auto -translate-y-1/2 transition-[max-width,opacity] duration-200 ease-out rtl:inset-e-4",
                          collapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-28 opacity-100 delay-100",
                        )}
                        aria-hidden={collapsed}
                      >
                        {t("comingSoon")}
                      </Badge>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={
                        item.activeItem === activeItem ? "page" : undefined
                      }
                      className={cn(
                        "hover:bg-muted/50 focus-visible:ring-ring relative flex h-12 items-center gap-4 overflow-visible rounded-lg px-5 text-[0.94rem] font-medium transition-colors focus-visible:ring-2",
                        item.activeItem === activeItem &&
                          "bg-muted/70 hover:bg-muted/70 text-foreground after:absolute after:inset-y-0 after:-inset-e-3.75 after:w-1 after:rounded-s-sm after:bg-[color-mix(in_oklch,var(--success)_52%,var(--warning))] after:brightness-115 after:saturate-120",
                      )}
                      aria-label={collapsed ? t(item.key) : undefined}
                    >
                      <item.icon
                        aria-hidden="true"
                        className="size-[1.3rem] shrink-0"
                        strokeWidth={1.7}
                      />
                      {label}
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent sideOffset={10}>
                  {disabled
                    ? `${t(item.key)} — ${t("comingSoon")}`
                    : t(item.key)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>
      {onCollapsedChange && (
        <div
          className={cn(
            "mt-auto pb-12 transition-[padding] duration-300 ease-in-out",
            collapsed ? "px-4" : "ps-5.25 pe-7.75",
          )}
        >
          <Button
            type="button"
            variant="plain"
            size="plain"
            aria-expanded={!collapsed}
            aria-label={collapsed ? t("expand") : t("collapse")}
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "border-border bg-background text-muted-foreground hover:bg-muted focus-visible:ring-ring dark:hover:border-ring/50 dark:hover:bg-accent dark:hover:text-accent-foreground flex h-14 w-full items-center overflow-hidden rounded-lg border text-sm transition-[padding,background-color] duration-300 focus-visible:ring-2",
              collapsed ? "justify-center px-0" : "px-4",
            )}
          >
            <span className="relative size-4 shrink-0">
              <ArrowLeft
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 size-4 transition-[opacity,transform] duration-200",
                  collapsed
                    ? "opacity-0"
                    : "opacity-100 delay-100 rtl:rotate-180",
                )}
              />
              <ArrowRight
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 size-4 transition-[opacity,transform] duration-200",
                  collapsed
                    ? "opacity-100 delay-100 rtl:rotate-180"
                    : "opacity-0",
                )}
              />
            </span>
            <span
              className={cn(
                "overflow-hidden text-start whitespace-nowrap transition-[max-width,margin,opacity,transform] duration-200 ease-out",
                collapsed
                  ? "ms-0 max-w-0 -translate-x-1 opacity-0 rtl:translate-x-1"
                  : "ms-3 max-w-28 translate-x-0 opacity-100 delay-100",
              )}
            >
              {t("collapseLabel")}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

export function DesktopSidebar(props: SidebarContentProps) {
  return (
    <aside
      className={cn(
        "border-border bg-background fixed inset-y-0 inset-s-0 z-30 hidden overflow-hidden border-e transition-[width] duration-300 ease-in-out xl:block",
        props.collapsed ? "w-22" : "w-57",
      )}
    >
      <SidebarContent {...props} />
    </aside>
  );
}
