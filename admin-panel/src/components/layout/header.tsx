"use client";

import { MenuIcon } from "lucide-react";
import { PropsWithChildren } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export type HeaderProps = {} & PropsWithChildren;

export default function Header({ children }: HeaderProps) {
  return (
    <header className="flex h-16 border-b sticky top-0 z-20 bg-background shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger
          size="icon"
          variant="outline"
          className="xl:hidden border-border bg-background text-foreground hover:bg-muted hover:text-foreground"
          aria-label="باز کردن منو"
        >
          <MenuIcon className="size-4" />
          <span className="sr-only">باز کردن منو</span>
        </SidebarTrigger>

        {children}

        {children ? (
          <Separator
            orientation="vertical"
            className="me-2 data-[orientation=vertical]:h-4"
          />
        ) : null}

        <strong>Unixsee</strong>
      </div>
    </header>
  );
}
