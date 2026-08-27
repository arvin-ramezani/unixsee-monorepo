"use client";

import { useState, useTransition } from "react";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { logoutAction } from "@/actions/auth/logout";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLightHeaderStore } from "@/providers/light-header-provider";
import { useTheme } from "next-themes";
import Image from "next/image";

type AccountMenuProps = {
  userName: string;
  avatarUrl?: string | null;
};

export function AccountMenu({ userName, avatarUrl }: AccountMenuProps) {
  const t = useTranslations("Header.accountMenu");
  const router = useRouter();
  const clearClientSession = useAuthStore((state) => state.logout);
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();
  const isThemeDark = resolvedTheme === "dark";

  const headerTone = useLightHeaderStore((state) => state.tone);
  const isHeaderDark = headerTone === "dark" || headerTone === "pending";

  const initial = userName.trim().slice(0, 1) || "?";

  function handleLogout() {
    startTransition(async () => {
      clearClientSession();
      await logoutAction();
      router.replace("/auth");
      router.refresh();
    });
  }

  const dropdownItemClass = "gap-2 px-2 py-2 cursor-pointer";
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={t("open")}
        disabled={isPending}
        className={cn(
          "focus-visible:ring-ring group dark:text-foreground flex h-12 items-center gap-2 rounded-lg px-1.5 outline-none",
          "hover:bg-muted/60 focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <span className="bg-primary text-primary-foreground relative grid size-10 place-items-center overflow-hidden rounded-full text-xs font-semibold xl:size-12">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              className="size-full object-cover"
              fill
              unoptimized
            />
          ) : (
            <UserRound className="size-5 xl:size-7" />
          )}
        </span>
        <span className="hidden text-sm font-medium sm:inline">{userName}</span>
        <motion.span
          aria-hidden="true"
          className="text-muted-foreground inline-flex"
          animate={{ rotate: open ? 180 : 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 28 }
          }
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={isHeaderDark ? "dark" : ""}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className={cn(dropdownItemClass, "text-xs lg:text-sm")}
          >
            <Link href="/dashboard">
              <LayoutDashboard className="shrink-0" />
              {t("dashboard")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className={cn(dropdownItemClass, "text-xs lg:text-sm")}
          >
            <Link href="/dashboard/profile">
              <UserRound className="shrink-0" />
              {t("profile")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator
          className={cn(
            "dark:bg-muted-foreground/50",
            isHeaderDark && "bg-muted-foreground",
          )}
        />
        <DropdownMenuItem
          variant="destructive"
          className={dropdownItemClass}
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
            handleLogout();
          }}
        >
          <LogOut />
          {t("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
