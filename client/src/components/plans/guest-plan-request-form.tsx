"use client";

import { useEffect, useRef, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { checkPublicPlanRequestAccountAction } from "@/actions/plans/check-public-plan-request-account";
import { createPublicPlanRequestAction } from "@/actions/plans/create-public-plan-request";
import { PhoneField } from "@/components/auth/phone-field";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import {
  isCompleteIranNationalMobile,
  toE164IranFromNational,
} from "@/lib/auth/iran-phone";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import { buildAccountExistsSignInHref } from "@/lib/plans/plan-request-session";
import type { DashboardPlan } from "@/lib/plans/types";
import {
  guestPlanRequestSchema,
  guestPlanRequestToApiPayload,
  isValidWebsite,
  normalizeWebsite,
  type GuestPlanRequestSchemaType,
} from "@/lib/zod-schemas/guest-plan-request-schema";

const ACCOUNT_CHECK_DEBOUNCE_MS = 450;

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function GuestPlanRequestForm({
  plan,
}: {
  plan: DashboardPlan;
}) {
  const t = useTranslations("GuestPlanRequestPage.form");
  const tApiErrors = useTranslations("ApiErrors");
  const tFormErrors = useTranslations("FormErrors");
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const redirectingRef = useRef(false);
  const [, startAccountCheck] = useTransition();

  const form = useForm<GuestPlanRequestSchemaType>({
    resolver: zodResolver(guestPlanRequestSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      noWebsiteYet: false,
      website: "",
      description: "",
    },
  });

  const noWebsiteYet = useWatch({
    control: form.control,
    name: "noWebsiteYet",
  });
  const phone = useWatch({ control: form.control, name: "phone" });
  const email = useWatch({ control: form.control, name: "email" });
  const website = useWatch({ control: form.control, name: "website" });
  const pending = form.formState.isSubmitting;

  function redirectForExistingAccount(matchedPhone: string) {
    if (redirectingRef.current) {
      return;
    }
    redirectingRef.current = true;
    // Toast is shown on sign-in via `notice=` so it survives refresh.
    router.push(buildAccountExistsSignInHref(matchedPhone));
  }

  useEffect(() => {
    if (noWebsiteYet) {
      form.setValue("website", "");
      form.clearErrors("website");
    }
  }, [form, noWebsiteYet]);

  useEffect(() => {
    if (redirectingRef.current) {
      return;
    }

    const phoneReady = isCompleteIranNationalMobile(phone ?? "");
    const emailReady = isLikelyEmail(email ?? "");
    const websiteReady =
      !noWebsiteYet && Boolean(website?.trim()) && isValidWebsite(website);

    if (!phoneReady && !emailReady && !websiteReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      startAccountCheck(async () => {
        if (redirectingRef.current) {
          return;
        }

        const result = await checkPublicPlanRequestAccountAction({
          ...(phoneReady
            ? { contactPhone: toE164IranFromNational(phone) }
            : {}),
          ...(emailReady ? { contactEmail: email.trim() } : {}),
          ...(websiteReady
            ? { websiteDomain: normalizeWebsite(website) }
            : {}),
        });

        if (result.ok && result.exists) {
          redirectForExistingAccount(phone ?? "");
        }
      });
    }, ACCOUNT_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect uses latest toast/router via closure on each effect run
  }, [email, noWebsiteYet, phone, website]);

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  async function onSubmit(data: GuestPlanRequestSchemaType) {
    const payload = guestPlanRequestToApiPayload(data);
    const result = await createPublicPlanRequestAction({
      planId: plan.id,
      ...payload,
    });

    if (!result.ok) {
      if (result.error.key === "accountExists") {
        redirectForExistingAccount(data.phone);
        return;
      }

      toastMappedApiError(result.error, tApiErrors);
      return;
    }

    router.push(
      `/services/managed-woocommerce-server/request/success?plan=${plan.id}&request=${result.data.id}`,
    );
    router.refresh();
  }

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: "easeOut" as const },
      };

  return (
    <motion.div {...motionProps}>
      <form
        className="rounded-3xl border bg-white p-6 dark:bg-card lg:p-8"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-busy={pending || undefined}
      >
        <FieldGroup className="gap-5">
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-plan-full-name" className="gap-1">
                  {t("fullNameLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Input
                  {...field}
                  id="guest-plan-full-name"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  className="h-12"
                  placeholder={t("fullNamePlaceholder")}
                />
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <PhoneField
                id="guest-plan-phone"
                label={t("phoneLabel")}
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={translateError(fieldState.error?.message)}
                disabled={pending}
              />
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-plan-email" className="gap-1">
                  {t("emailLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Input
                  {...field}
                  id="guest-plan-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  className="h-12"
                  placeholder={t("emailPlaceholder")}
                />
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="website"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-plan-website" className="gap-1">
                  {t("websiteLabel")}
                  {!noWebsiteYet ? <RequiredInputIcon /> : null}
                </FieldLabel>
                <Input
                  {...field}
                  id="guest-plan-website"
                  type="url"
                  dir="ltr"
                  disabled={noWebsiteYet || pending}
                  aria-invalid={fieldState.invalid}
                  className="h-12"
                  placeholder={t("websitePlaceholder")}
                />
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="noWebsiteYet"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="guest-plan-no-website"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                  aria-describedby="guest-plan-no-website-hint"
                  disabled={pending}
                />
                <Label
                  htmlFor="guest-plan-no-website"
                  id="guest-plan-no-website-hint"
                  className="text-sm leading-6 font-normal"
                >
                  {t("noWebsiteLabel")}
                </Label>
              </div>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-plan-description">
                  {t("descriptionLabel")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="guest-plan-description"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("descriptionPlaceholder")}
                  />
                </InputGroup>
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>

        <RadialRevealButton
          type="submit"
          size="lg"
          disabled={pending}
          className="mt-8 h-12 w-full gap-2 text-base font-bold"
        >
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {pending ? t("processing") : t("submit")}
        </RadialRevealButton>

        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-success"
          />
          {t("reassurance")}
        </p>
      </form>
    </motion.div>
  );
}
