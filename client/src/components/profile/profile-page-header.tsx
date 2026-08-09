import { useTranslations } from "next-intl";

export function ProfilePageHeader() {
  const t = useTranslations("Profile");
  return (
    <header className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
    </header>
  );
}
