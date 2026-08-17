"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { getAuthSessionUser } from "@/actions/auth/get-auth-session-user";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HeaderAuthControlProps = {
  className?: string;
  onNavigate?: () => void;
  layout?: "inline" | "stacked";
};

function resolveDisplayName(
  user: {
    fullName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
  } | null,
  fallback: string,
) {
  const fullName = user?.fullName?.trim();
  if (fullName) return fullName;
  if (user?.phoneNumber) return user.phoneNumber;
  if (user?.email) return user.email;
  return fallback;
}

export function HeaderAuthControl({
  className,
  onNavigate,
  layout = "inline",
}: HeaderAuthControlProps) {
  const t = useTranslations("Navigation");
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!accessToken || user) {
      return;
    }

    let cancelled = false;

    void getAuthSessionUser().then((sessionUser) => {
      if (!cancelled && sessionUser) {
        setUser(sessionUser);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, setUser, user]);

  if (accessToken) {
    return (
      <AccountMenu
        userName={resolveDisplayName(user, t("accountFallback"))}
      />
    );
  }

  const isStacked = layout === "stacked";

  return (
    <Button
      asChild
      className={cn(isStacked ? "h-12 w-full" : "h-10", className)}
    >
      <Link href="/auth" onClick={onNavigate}>
        {t("authEntry")}
      </Link>
    </Button>
  );
}
