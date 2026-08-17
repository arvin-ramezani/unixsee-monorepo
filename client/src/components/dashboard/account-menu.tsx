"use client";

import { useState, useTransition } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
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

type AccountMenuProps = {
  userName: string;
};

export function AccountMenu({ userName }: AccountMenuProps) {
  const t = useTranslations("Header.accountMenu");
  const router = useRouter();
  const clearClientSession = useAuthStore((state) => state.logout);
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initial = userName.trim().slice(0, 1) || "?";

  function handleLogout() {
    startTransition(async () => {
      clearClientSession();
      await logoutAction();
      router.replace("/auth");
      router.refresh();
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={t("open")}
        disabled={isPending}
        className={cn(
          "focus-visible:ring-ring group flex h-12 items-center gap-2 rounded-lg px-1.5 outline-none",
          "hover:bg-muted/60 focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-full text-xs font-semibold xl:size-12">
          {initial}
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
        className="min-w-44 w-auto"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="gap-2 px-2 py-2">
            <Link href="/dashboard/profile">
              <UserRound />
              {t("profile")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2 px-2 py-2"
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
