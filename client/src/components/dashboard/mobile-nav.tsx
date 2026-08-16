"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { SidebarContent } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useScrollLock } from "@/hooks/use-scroll-lock";

export function MobileNav({
  activeItem = "Dashboard",
}: {
  activeItem?:
    | "Activities"
    | "ComplementaryServices"
    | "Dashboard"
    | "Domains"
    | "HelpCenter"
    | "Profile"
    | "Tickets"
    | "Websites";
}) {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const [open, setOpen] = useState(false);

  useScrollLock(open, "dashboard-mobile-nav");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t("open")}
          className="border-border bg-background size-11 rounded-lg xl:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        data-dashboard-mobile-nav
        side={locale === "fa" ? "right" : "left"}
        showCloseButton={false}
        aria-label={t("mobile")}
        className="border-border h-dvh w-[min(19rem,88vw)] gap-0 p-0 sm:max-w-none xl:hidden"
      >
        <SheetTitle className="sr-only">{t("mobile")}</SheetTitle>
        <SheetDescription className="sr-only">{t("primary")}</SheetDescription>
        <SheetClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={t("close")}
            className="absolute inset-e-3 top-5 z-10 size-11 rounded-lg"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </SheetClose>
        <SidebarContent
          activeItem={activeItem}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
