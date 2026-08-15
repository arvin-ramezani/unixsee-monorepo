"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, LoaderCircle, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { checkPublicPlanRequestAccountAction } from "@/actions/plans/check-public-plan-request-account";
import { createPlanRequestAction } from "@/actions/plans/create-plan-request";
import {
  requestGuestPlanOtpAction,
  verifyGuestPlanOtpAction,
} from "@/actions/plans/request-guest-plan-otp";
import { OtpInput } from "@/components/auth/otp-input";
import { PhoneField } from "@/components/auth/phone-field";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import {
  isCompleteIranNationalMobile,
  toE164IranFromNational,
} from "@/lib/auth/iran-phone";
import type { FormErrorKey } from "@/lib/form-errors";
import { buildAccountExistsSignInHref } from "@/lib/plans/plan-request-session";
import type { DashboardPlan } from "@/lib/plans/types";
import {
  DATABASE_SIZE_BANDS,
  MONTHLY_VISITOR_BANDS,
  WOOCOMMERCE_OPTIONS,
  guestPlanRequestSchema,
  guestPlanRequestToApiPayload,
  isValidWebsite,
  normalizeWebsite,
  type GuestPlanRequestSchemaType,
} from "@/lib/zod-schemas/guest-plan-request-schema";

const ACCOUNT_CHECK_DEBOUNCE_MS = 450;
const RESEND_COOLDOWN_SECONDS = 30;

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type OtpChannel = "phone" | "email";

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
  const login = useAuthStore((state) => state.login);

  const [otpChannel, setOtpChannel] = useState<OtpChannel | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpPending, setOtpPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifiedChannel, setVerifiedChannel] = useState<OtpChannel | null>(
    null,
  );

  const form = useForm<GuestPlanRequestSchemaType>({
    resolver: zodResolver(guestPlanRequestSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      noWebsiteYet: false,
      website: "",
      databaseSizeBand: "",
      monthlyVisitorsBand: "",
      isWooCommerce: "",
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
  const contactLocked = Boolean(verifiedChannel);

  function redirectForExistingAccount(matchedPhone: string) {
    if (redirectingRef.current) {
      return;
    }
    redirectingRef.current = true;
    router.push(buildAccountExistsSignInHref(matchedPhone));
  }

  useEffect(() => {
    if (noWebsiteYet) {
      form.setValue("website", "");
      form.clearErrors("website");
    }
  }, [form, noWebsiteYet]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (redirectingRef.current || contactLocked) {
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
          const preferPhone =
            result.matchedBy === "phone" ||
            (result.matchedBy !== "email" && phoneReady);
          redirectForExistingAccount(preferPhone ? (phone ?? "") : "");
        }
      });
    }, ACCOUNT_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect uses latest toast/router via closure on each effect run
  }, [contactLocked, email, noWebsiteYet, phone, website]);

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  async function startOtp(channel: OtpChannel) {
    setOtpError(null);

    if (channel === "phone" && !isCompleteIranNationalMobile(phone ?? "")) {
      form.setError("phone", { message: "phoneInvalid" });
      return;
    }
    if (channel === "email" && !isLikelyEmail(email ?? "")) {
      form.setError("email", { message: "emailInvalid" });
      return;
    }

    setOtpPending(true);
    const result = await requestGuestPlanOtpAction(
      channel === "phone" ? { phone } : { email },
    );
    setOtpPending(false);

    if (!result.ok) {
      if (result.errorKey === "rateLimited") {
        toast.error(t("otpRateLimited"));
      } else if (result.errorKey === "unavailable") {
        toast.error(t("otpUnavailable"));
      } else {
        toast.error(t("otpGenericError"));
      }
      return;
    }

    setOtpChannel(channel);
    setOtpCode("");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success(t("otpSent"));
  }

  async function confirmOtp() {
    if (!otpChannel) return;
    setOtpError(null);
    setOtpPending(true);

    const result = await verifyGuestPlanOtpAction({
      code: otpCode,
      ...(otpChannel === "phone" ? { phone } : { email }),
    });

    setOtpPending(false);

    if (!result.ok) {
      setOtpError(
        result.errorKey === "wrongCode" ? t("otpWrongCode") : t("otpGenericError"),
      );
      setOtpCode("");
      return;
    }

    login({
      accessToken: result.accessToken,
      serverClockOffsetInSeconds: result.serverClockOffsetInSeconds,
      user: result.user,
    });

    setVerifiedChannel(result.channel);
    setOtpChannel(null);
    setOtpCode("");
    toast.success(t("otpVerified"));
  }

  async function onSubmit(data: GuestPlanRequestSchemaType) {
    if (!verifiedChannel) {
      toast.error(t("verifyContactFirst"));
      return;
    }

    const payload = guestPlanRequestToApiPayload(data);
    const result = await createPlanRequestAction({
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

  const phoneRequiredIcon =
    !verifiedChannel || verifiedChannel === "phone";
  const emailRequiredIcon =
    !verifiedChannel || verifiedChannel === "email";

  return (
    <motion.div {...motionProps}>
      <form
        className="rounded-3xl border bg-white p-6 dark:bg-card lg:p-8"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-busy={pending || otpPending || undefined}
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
                  disabled={pending}
                />
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <div className="space-y-3">
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <PhoneField
                    id="guest-plan-phone"
                    label={t("phoneLabel")}
                    required={phoneRequiredIcon && !verifiedChannel}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={translateError(fieldState.error?.message)}
                    disabled={pending || contactLocked || otpPending}
                  />
                  {verifiedChannel === "phone" ? (
                    <p className="flex items-center gap-1.5 text-sm text-success">
                      <CheckIcon className="size-4" aria-hidden />
                      {t("phoneVerified")}
                    </p>
                  ) : !contactLocked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="!w-fit"
                      disabled={
                        pending ||
                        otpPending ||
                        !isCompleteIranNationalMobile(phone ?? "")
                      }
                      onClick={() => void startOtp("phone")}
                    >
                      {otpPending && otpChannel === "phone" ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : null}
                      {t("verifyPhone")}
                    </Button>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="guest-plan-email" className="gap-1">
                    {t("emailLabel")}
                    {emailRequiredIcon && !verifiedChannel ? (
                      <RequiredInputIcon />
                    ) : null}
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
                    disabled={pending || contactLocked || otpPending}
                  />
                  {fieldState.error ? (
                    <FieldError>
                      {translateError(fieldState.error.message)}
                    </FieldError>
                  ) : null}
                  {verifiedChannel === "email" ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
                      <CheckIcon className="size-4" aria-hidden />
                      {t("emailVerified")}
                    </p>
                  ) : !contactLocked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 !w-fit"
                      disabled={
                        pending || otpPending || !isLikelyEmail(email ?? "")
                      }
                      onClick={() => void startOtp("email")}
                    >
                      {otpPending && otpChannel === "email" ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : null}
                      {t("verifyEmail")}
                    </Button>
                  ) : null}
                </Field>
              )}
            />

            {otpChannel && !verifiedChannel ? (
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  {otpChannel === "phone"
                    ? t("otpPhoneHint")
                    : t("otpEmailHint")}
                </p>
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  error={otpError ?? undefined}
                  disabled={otpPending}
                  autoFocus
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={otpPending || otpCode.replace(/\D/g, "").length < 6}
                    onClick={() => void confirmOtp()}
                  >
                    {otpPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : null}
                    {t("confirmOtp")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={otpPending || cooldown > 0}
                    onClick={() => void startOtp(otpChannel)}
                  >
                    {cooldown > 0
                      ? t("resendIn", { seconds: cooldown })
                      : t("resendOtp")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={otpPending}
                    onClick={() => {
                      setOtpChannel(null);
                      setOtpCode("");
                      setOtpError(null);
                    }}
                  >
                    {t("cancelOtp")}
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">{t("contactHint")}</p>
          </div>

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

          <p className="text-sm font-medium text-foreground">
            {t("intakeSectionTitle")}
          </p>
          <p className="-mt-3 text-xs text-muted-foreground">
            {t("intakeSectionHint")}
          </p>

          <Controller
            name="databaseSizeBand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("databaseSizeLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("databaseSizePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DATABASE_SIZE_BANDS.map((band) => (
                      <SelectItem key={band} value={band}>
                        {t(`databaseSizeOptions.${band}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="monthlyVisitorsBand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("monthlyVisitorsLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("monthlyVisitorsPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHLY_VISITOR_BANDS.map((band) => (
                      <SelectItem key={band} value={band}>
                        {t(`monthlyVisitorsOptions.${band}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="isWooCommerce"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("woocommerceLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("woocommercePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WOOCOMMERCE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {t(`woocommerceOptions.${option}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error ? (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                ) : null}
              </Field>
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
                    disabled={pending}
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
          disabled={pending || !verifiedChannel || Boolean(otpChannel)}
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
