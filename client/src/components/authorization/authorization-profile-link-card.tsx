"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function AuthorizationProfileLinkCard() {
  const t = useTranslations("Authorization.profileLink");

  return (
    <Panel className="mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-full">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("description")}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="min-h-11 shrink-0">
        <Link href="/dashboard/authorization">{t("cta")}</Link>
      </Button>
    </Panel>
  );
}
