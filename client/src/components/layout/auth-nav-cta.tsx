"use client";

import { useTranslations } from "next-intl";

import { useAuthStore } from "@/components/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AuthNavCtaProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AuthNavCta({ className, onNavigate }: AuthNavCtaProps) {
  const t = useTranslations("Navigation");
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));

  return (
    <Button asChild variant="outline" className={cn(className)}>
      <Link href={isLoggedIn ? "/dashboard" : "/sign-in"} onClick={onNavigate}>
        {isLoggedIn ? t("dashboard") : t("signIn")}
      </Link>
    </Button>
  );
}
