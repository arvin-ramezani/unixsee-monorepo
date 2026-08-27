import { useTranslations } from "next-intl";

export function BillingPageHeader() {
  const t = useTranslations("Billing");

  return (
    <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[2rem] font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-6">
          {t("description")}
        </p>
      </div>
    </section>
  );
}
