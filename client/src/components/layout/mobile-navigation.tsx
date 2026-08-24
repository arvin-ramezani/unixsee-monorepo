import { createPortal } from "react-dom";
import { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { NavigationMenuLink } from "../ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { NAVIGATION_ITEMS } from "@/lib/translation-keys";
import { cn } from "@/lib/utils";

export type MobileNavigationProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link, usePathname } from "@/i18n/navigation";
import { useScrollLock } from "@/hooks/use-scroll-lock";

type NavigationItem = {
  key: string;
  href?: string;
  items?: readonly {
    key: string;
    href: string;
    comingSoon?: boolean;
  }[];
};

export default function MobileNavigation({
  open,
  setOpen,
}: MobileNavigationProps) {
  // const tHomePage = useTranslations("HomePage");
  const tNavigation = useTranslations("Layout.Navigation");
  const pathname = usePathname();

  const activeAccordionValue = useMemo(() => {
    const activeParent = NAVIGATION_ITEMS.find((navItem) =>
      navItem.items?.some((subItem) => subItem.href === pathname),
    );

    return activeParent?.key;
  }, [pathname]);

  const getLabel = (item: NavigationItem) => {
    if (item.items?.length) {
      return tNavigation(`${item.key}.label` as never);
    }
    return tNavigation(item.key as never);
  };

  const getSubLabel = (parentKey: string, key: string) => {
    return tNavigation(`${parentKey}.items.${key}` as never);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <MobileMenu
      open={open}
      setOpen={setOpen}
      className="no-scrollbar flex flex-col justify-between gap-4 overflow-visible"
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={activeAccordionValue}
      >
        {NAVIGATION_ITEMS.map((item) => {
          const hasChildren = Boolean(item.items?.length);

          return (
            <AccordionItem key={item.key} value={item.key}>
              <AccordionTrigger
                indicator={hasChildren ? "chevron" : "none"}
                className="py-3 text-base font-medium"
                // onClick={() => {
                //   if (!hasChildren) {
                //     window.location.href = item.href;
                //   }
                // }}
              >
                {getLabel(item)}
              </AccordionTrigger>

              {hasChildren && (
                <AccordionContent className="flex flex-col gap-2 ps-4 pb-3">
                  {item.items.map((subItem) => {
                    const isActive = subItem.href === pathname;

                    return (
                      <Link
                        key={subItem.key}
                        href={subItem.href}
                        className={cn(
                          "text-muted-foreground hover:text-foreground text-sm no-underline! transition-colors",
                          isActive && "text-foreground font-extrabold",
                        )}
                        onClick={() => {
                          if (isActive) return;
                          setOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {getSubLabel(item.key, subItem.key)}
                          {"comingSoon" in subItem && subItem.comingSoon && (
                            <Badge
                              variant="secondary"
                              className="min-h-4 shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-none font-semibold"
                            >
                              {tNavigation("comingSoon" as never)}
                            </Badge>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </AccordionContent>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </MobileMenu>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MobileMenu({
  open,
  setOpen,
  children,
  className,
  ...props
}: MobileMenuProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useScrollLock(open, "mobile-navigation");

  if (open && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setIsMounted(true);
        setIsVisible(true);
      });
    } else {
      requestAnimationFrame(() => {
        setIsVisible(false);
      });

      const timeout = setTimeout(() => {
        setIsMounted(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!isMounted || typeof window === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-40 lg:hidden",
        "bg-background/60 backdrop-blur-sm",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      onClick={() => setOpen(false)}
    >
      <div
        className={cn(
          "absolute top-14 bottom-0 w-full max-w-md",
          "bg-background border-y",
          "transition-transform duration-300 ease-out",
          "flex flex-col overflow-y-auto p-4",

          isVisible
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full",

          className,
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

type LinkItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
};

export function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full flex-row gap-x-2 rounded-sm p-2",
        className,
      )}
      {...props}
      asChild
    >
      <a href={href}>
        {Icon && (
          <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
            <Icon className="text-foreground size-5" />
          </div>
        )}
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </a>
    </NavigationMenuLink>
  );
}
