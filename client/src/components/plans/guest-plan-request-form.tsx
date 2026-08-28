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
import { SlidingPillToggle } from "@/components/common/sliding-pill-toggle";
import { PlanRequestFileUpload } from "@/components/plans/plan-request-file-upload";
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
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
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
import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import {
  isCompleteIranNationalMobile,
  toE164IranMobile,
} from "@/lib/auth/iran-phone";
import { toE164Phone } from "@/lib/phone/international-phone";
import type { FormErrorKey } from "@/lib/form-errors";
import { buildAccountExistsSignInHref } from "@/lib/plans/plan-request-session";
import type { DashboardPlan } from "@/lib/plans/types";
import { cn } from "@/lib/utils";
import {
  DATABASE_SIZE_BANDS,
  DAILY_VISITOR_BANDS,
  WOOCOMMERCE_OPTIONS,
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

type OtpChannel = "phone" | "email";

export function GuestPlanRequestForm({ plan }: { plan: DashboardPlan }) {
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
  const [fileObjects, setFileObjects] = useState<File[]>([]);

  const form = useForm<GuestPlanRequestSchemaType>({
    resolver: zodResolver(guestPlanRequestSchema),
    defaultValues: {
      fullName: "",
      preferredContact: "phone",
      phone: "",
      email: "",
      noWebsiteYet: false,
      website: "",
      databaseSizeBand: "",
      dailyVisitorsBand: "",
      isWooCommerce: "",
      description: "",
      attachments: [],
    },
  });

  const noWebsiteYet = useWatch({
    control: form.control,
    name: "noWebsiteYet",
  });
  const preferredContact = useWatch({
    control: form.control,
    name: "preferredContact",
  });
  const phone = useWatch({ control: form.control, name: "phone" });
  const email = useWatch({ control: form.control, name: "email" });
  const website = useWatch({ control: form.control, name: "website" });
  const pending = form.formState.isSubmitting;
  const contactLocked = Boolean(verifiedChannel);
  const sizingDisabled = noWebsiteYet || pending;

  function redirectForExistingAccount(matchedPhone: string) {
    if (redirectingRef.current) {
      return;
    }
    redirectingRef.current = true;
    router.push(buildAccountExistsSignInHref(matchedPhone));
  }

  useEffect(() => {
    if (!noWebsiteYet) return;
    form.setValue("website", "");
    form.setValue("databaseSizeBand", "");
    form.setValue("dailyVisitorsBand", "");
    form.setValue("isWooCommerce", "");
    form.clearErrors([
      "website",
      "databaseSizeBand",
      "dailyVisitorsBand",
      "isWooCommerce",
    ]);
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
            ? { contactPhone: toE164Phone(phone) ?? toE164IranMobile(phone) }
            : {}),
          ...(emailReady ? { contactEmail: email.trim() } : {}),
          ...(websiteReady ? { websiteDomain: normalizeWebsite(website) } : {}),
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

  function resetOtpUi() {
    setOtpChannel(null);
    setOtpCode("");
    setOtpError(null);
  }

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
      if (
        result.errorKey === "rateLimited" &&
        result.retryAfterSeconds != null &&
        result.retryAfterSeconds > 0
      ) {
        setCooldown(result.retryAfterSeconds);
      }
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
    setCooldown(Math.max(0, result.retryAfterSeconds));
    // toast.success(t("otpSent"));
    toast.success(`OTP: ${result.otp}`, {
      duration: Infinity,
      closeButton: true,
    });
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
        result.errorKey === "wrongCode"
          ? t("otpWrongCode")
          : t("otpGenericError"),
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
    resetOtpUi();
    toast.success(t("otpVerified"));
  }

  async function uploadPublicFiles(
    files: File[],
  ): Promise<{ fileName: string; downloadUrl: string }[]> {
    const results: { fileName: string; downloadUrl: string }[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${getServerCoreApiBaseUrl()}/uploads/public`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            results.push({
              fileName: result.data.fileName,
              downloadUrl: result.data.downloadUrl,
            });
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }
    return results;
  }

  async function onSubmit(data: GuestPlanRequestSchemaType) {
    if (!verifiedChannel) {
      toast.error(t("verifyContactFirst"));
      return;
    }

    if (verifiedChannel !== data.preferredContact) {
      toast.error(t("verifyPreferredContact"));
      return;
    }

    // Upload attached files to public storage
    let uploadedAttachments: { fileName: string; downloadUrl: string }[] = [];
    if (fileObjects.length > 0) {
      uploadedAttachments = await uploadPublicFiles(fileObjects);
    }

    const payload = guestPlanRequestToApiPayload(data);
    const result = await createPlanRequestAction({
      planId: plan.id,
      ...payload,
      ...(uploadedAttachments.length > 0
        ? { attachmentUrls: uploadedAttachments }
        : {}),
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
        className="dark:bg-card rounded-3xl border bg-white p-6 lg:p-8"
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
                {fieldState.error && (
                  <FieldError>
                    {translateError(fieldState.error.message)}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">{t("contactTabsLabel")}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("contactHint")}
              </p>
            </div>

            <SlidingPillToggle
              value={preferredContact}
              onChange={(value) => {
                if (contactLocked) return;
                form.setValue("preferredContact", value, {
                  shouldValidate: true,
                });
                resetOtpUi();
              }}
              disabled={contactLocked}
              ariaLabel={t("contactTabsLabel")}
              options={[
                { value: "phone", label: t("phoneLabel") },
                { value: "email", label: t("emailLabel") },
              ]}
            />

            {preferredContact === "phone" ? (
              <motion.div
                key="phone"
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, ease: "easeOut" }
                }
                className="space-y-3"
              >
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="mb-8 space-y-2">
                      <PhoneField
                        id="guest-plan-phone"
                        label={t("phoneLabel")}
                        required={!verifiedChannel}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={translateError(fieldState.error?.message)}
                        disabled={pending || contactLocked || otpPending}
                      />
                      {verifiedChannel === "phone" && (
                        <p className="text-success flex items-center gap-1.5 text-sm">
                          <CheckIcon className="size-4" aria-hidden />
                          {t("phoneVerified")}
                        </p>
                      )}
                      {!contactLocked && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit!"
                          disabled={
                            pending ||
                            otpPending ||
                            !isCompleteIranNationalMobile(phone ?? "")
                          }
                          onClick={() => void startOtp("phone")}
                        >
                          {otpPending && otpChannel === "phone" && (
                            <LoaderCircle className="size-4 animate-spin" />
                          )}
                          {t("verifyPhone")}
                        </Button>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guest-plan-email-optional">
                        {t("optionalEmailLabel")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guest-plan-email-optional"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        className="h-12"
                        placeholder={t("emailPlaceholder")}
                        disabled={pending || contactLocked || otpPending}
                      />
                      {fieldState.error && (
                        <FieldError>
                          {translateError(fieldState.error.message)}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, ease: "easeOut" }
                }
                className="space-y-3"
              >
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="mb-8">
                      <FieldLabel htmlFor="guest-plan-email" className="gap-1">
                        {t("emailLabel")}
                        {!verifiedChannel && <RequiredInputIcon />}
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
                      {fieldState.error && (
                        <FieldError>
                          {translateError(fieldState.error.message)}
                        </FieldError>
                      )}
                      {verifiedChannel === "email" && (
                        <p className="text-success mt-2 flex items-center gap-1.5 text-sm">
                          <CheckIcon className="size-4" aria-hidden />
                          {t("emailVerified")}
                        </p>
                      )}
                      {!contactLocked && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 w-fit!"
                          disabled={
                            pending || otpPending || !isLikelyEmail(email ?? "")
                          }
                          onClick={() => void startOtp("email")}
                        >
                          {otpPending && otpChannel === "email" && (
                            <LoaderCircle className="size-4 animate-spin" />
                          )}
                          {t("verifyEmail")}
                        </Button>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <PhoneField
                      id="guest-plan-phone-optional"
                      label={t("optionalPhoneLabel")}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={translateError(fieldState.error?.message)}
                      disabled={pending || contactLocked || otpPending}
                    />
                  )}
                />
              </motion.div>
            )}

            {otpChannel && !verifiedChannel && (
              <div className="bg-muted/30 rounded-2xl border p-4">
                <p className="text-muted-foreground mb-3 text-center text-sm">
                  {otpChannel === "phone"
                    ? t("otpPhoneHint")
                    : t("otpEmailHint")}
                </p>
                <OtpInput
                  className="flex flex-col items-center justify-center text-center [&_label]:justify-center"
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
                    disabled={
                      otpPending || otpCode.replace(/\D/g, "").length < 6
                    }
                    onClick={() => void confirmOtp()}
                  >
                    {otpPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
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
                    onClick={resetOtpUi}
                  >
                    {t("cancelOtp")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Controller
            name="noWebsiteYet"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="guest-plan-no-website"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
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
            name="website"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-plan-website" className="gap-1">
                  {t("websiteLabel")}
                  {!noWebsiteYet && <RequiredInputIcon />}
                </FieldLabel>
                <Input
                  {...field}
                  id="guest-plan-website"
                  type="url"
                  dir="ltr"
                  disabled={sizingDisabled}
                  aria-invalid={fieldState.invalid}
                  className="h-12"
                  placeholder={t("websitePlaceholder")}
                />
                {fieldState.error && (
                  <FieldError>
                    {translateError(fieldState.error.message)}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <p className="text-foreground text-sm font-medium">
            {t("intakeSectionTitle")}
          </p>
          <p className="text-muted-foreground -mt-3 text-xs">
            {t("intakeSectionHint")}
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Controller
              name="databaseSizeBand"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="gap-1">
                    {t("databaseSizeLabel")}
                    {!noWebsiteYet && <RequiredInputIcon />}
                  </FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={sizingDisabled}
                  >
                    <SelectTrigger
                      className="h-12 w-full"
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.error && (
                    <FieldError>
                      {translateError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="dailyVisitorsBand"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="gap-1">
                    {t("dailyVisitorsLabel")}
                    {!noWebsiteYet && <RequiredInputIcon />}
                  </FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={sizingDisabled}
                  >
                    <SelectTrigger
                      className="h-12 w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue
                        placeholder={t("dailyVisitorsPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {DAILY_VISITOR_BANDS.map((band) => (
                        <SelectItem key={band} value={band}>
                          {t(`dailyVisitorsOptions.${band}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>
                      {translateError(fieldState.error.message)}
                    </FieldError>
                  )}
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
                    {!noWebsiteYet && <RequiredInputIcon />}
                  </FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={sizingDisabled}
                  >
                    <SelectTrigger
                      className="h-12 w-full"
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.error && (
                    <FieldError>
                      {translateError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="lg:col-span-2"
                >
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
                      className="h-32"
                    />
                  </InputGroup>
                  {fieldState.error && (
                    <FieldError>
                      {translateError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="attachments"
            control={form.control}
            render={({ field, fieldState }) => (
              <PlanRequestFileUpload
                files={field.value ?? []}
                disabled={pending}
                error={translateError(fieldState.error?.message)}
                onChange={field.onChange}
                onFilesChange={setFileObjects}
              />
            )}
          />
        </FieldGroup>

        <RadialRevealButton
          type="submit"
          size="lg"
          disabled={pending || !verifiedChannel || Boolean(otpChannel)}
          className="mt-8 h-12 w-full gap-2 text-base font-bold"
        >
          {pending && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {pending ? t("processing") : t("submit")}
        </RadialRevealButton>

        <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm">
          <ShieldCheck
            aria-hidden="true"
            className="text-success mt-0.5 size-4 shrink-0"
          />
          {t("reassurance")}
        </p>
      </form>
    </motion.div>
  );
}
