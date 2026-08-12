"use client";

import { type FormEvent, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { createPlanRequestAction } from "@/actions/plans/create-plan-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import type { DashboardPlan } from "@/lib/plans/types";

type FieldErrors = Partial<Record<"name" | "phone" | "form", string>>;

export function CheckoutForm({
  plan,
  initialName = "",
  initialPhone = "",
}: {
  plan: DashboardPlan;
  initialName?: string;
  initialPhone?: string;
}) {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = t("nameError");
    if (!phone.trim()) next.phone = t("phoneError");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    const result = await createPlanRequestAction({
      planId: plan.id,
      contactName: name,
      contactPhone: phone,
    });

    if (!result.ok) {
      setErrors({ form: t(`errors.${result.error.key}`) });
      setSubmitting(false);
      return;
    }

    router.push(
      `/dashboard/plans/success?plan=${plan.id}&request=${result.data.id}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.form ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="checkout-name">{t("nameLabel")}</Label>
        <Input
          id="checkout-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((prev) => ({ ...prev, name: undefined, form: undefined }));
          }}
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
          className="h-11"
          autoComplete="name"
        />
        {errors.name && (
          <p id="checkout-name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-phone">{t("phoneLabel")}</Label>
        <Input
          id="checkout-phone"
          type="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setErrors((prev) => ({
              ...prev,
              phone: undefined,
              form: undefined,
            }));
          }}
          placeholder={t("phonePlaceholder")}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          className="h-11"
          autoComplete="tel"
          dir="ltr"
        />
        {errors.phone && (
          <p id="checkout-phone-error" className="text-sm text-destructive">
            {errors.phone}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full gap-2">
        {submitting && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {submitting ? t("processing") : t("submit")}
      </Button>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-success"
        />
        {t("reassurance")}
      </p>
    </form>
  );
}
