"use client";

import { useEffect, useState } from "react";
import type { Control } from "react-hook-form";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CheckIcon, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import {
  requestGuestPlanOtpAction,
  verifyGuestPlanOtpAction,
} from "@/actions/plans/request-guest-plan-otp";
import { OtpInput } from "@/components/auth/otp-input";
import { PhoneField } from "@/components/auth/phone-field";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isCompleteIranNationalMobile } from "@/lib/auth/iran-phone";
import {
  emailsMatch,
  phonesMatch,
} from "@/lib/request-assessment/account-contact";
import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";
import { cn } from "@/lib/utils";

import type { TranslateError } from "./request-assessment-form-fields";
import { toast } from "sonner";

export type ContactOtpChannel = "phone" | "email";

type RequestAssessmentContactTabsProps = {
  control: Control<RequestAssessmentSchemaType>;
  disabled?: boolean;
  translateError: TranslateError;
  verifiedChannel: ContactOtpChannel | null;
  accountPhone?: string;
  accountEmail?: string;
  isSignedIn?: boolean;
  onVerifiedChannelChange: (channel: ContactOtpChannel | null) => void;
};

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function RequestAssessmentContactTabs({
  control,
  disabled,
  translateError,
  verifiedChannel,
  accountPhone = "",
  accountEmail = "",
  isSignedIn = false,
  onVerifiedChannelChange,
}: RequestAssessmentContactTabsProps) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.contact",
  );
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const login = useAuthStore((state) => state.login);
  const form = useFormContext<RequestAssessmentSchemaType>();

  const [otpChannel, setOtpChannel] = useState<ContactOtpChannel | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpPending, setOtpPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const preferredContact = useWatch({ control, name: "preferredContact" });
  const phone = useWatch({ control, name: "phone" });
  const email = useWatch({ control, name: "email" });

  const phoneMatchesAccount = phonesMatch(phone, accountPhone);
  const emailMatchesAccount = emailsMatch(email, accountEmail);
  const preferredVerified = verifiedChannel === preferredContact;
  const contactInputDisabled = disabled || otpPending || Boolean(otpChannel);
  const contactInputClassName = cn(
    "h-12 dir-ltr text-start",
    locale === "fa" && "placeholder:text-end",
  );
  const phonePlaceholderClassName =
    locale === "fa" ? "[&_input]:placeholder:text-end" : undefined;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function resetOtpUi() {
    setOtpChannel(null);
    setOtpCode("");
    setOtpError(null);
  }

  async function startOtp(channel: ContactOtpChannel) {
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
        setOtpError(t("otpRateLimited"));
      } else if (result.errorKey === "unavailable") {
        setOtpError(t("otpUnavailable"));
      } else {
        setOtpError(t("otpGenericError"));
      }
      return;
    }

    setOtpChannel(channel);
    setOtpCode("");
    setCooldown(Math.max(0, result.retryAfterSeconds));
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

    onVerifiedChannelChange(result.channel);
    resetOtpUi();
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{t("tabsLabel")}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          {isSignedIn ? t("signedInHint") : t("hint")}
        </p>
      </div>

      <Controller
        name="preferredContact"
        control={control}
        render={({ field }) => (
          <Tabs
            value={field.value}
            onValueChange={(value) => {
              if (contactInputDisabled) return;
              field.onChange(value as ContactOtpChannel);
              resetOtpUi();
            }}
          >
            <TabsList
              aria-label={t("tabsLabel")}
              className="grid h-11! w-full grid-cols-2"
            >
              {(["phone", "email"] as const).map((channel) => (
                <TabsTrigger
                  key={channel}
                  value={channel}
                  disabled={contactInputDisabled}
                  className={cn(
                    "relative z-0 overflow-hidden",
                    "data-active:bg-transparent! data-active:shadow-none!",
                    "dark:data-active:border-transparent! dark:data-active:bg-transparent!",
                  )}
                >
                  {preferredContact === channel && (
                    <motion.span
                      layoutId="request-assessment-contact-tab-pill"
                      aria-hidden
                      className="bg-background dark:bg-input/30 pointer-events-none absolute inset-0 z-0 rounded-md shadow-sm"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 38,
                              mass: 0.65,
                            }
                      }
                    />
                  )}
                  <span className="relative z-10">
                    {channel === "phone" ? t("phoneTab") : t("emailTab")}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="phone" className="mt-4" asChild>
              <motion.div
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, ease: "easeOut" }
                }
                className="mt-4 flex flex-col gap-3"
              >
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-2">
                      <PhoneField
                        id="request-assessment-phone"
                        label={t("phoneLabel")}
                        placeholder={t("phonePlaceholder")}
                        required={!preferredVerified}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={translateError(fieldState.error?.message)}
                        disabled={contactInputDisabled}
                        className={phonePlaceholderClassName}
                      />
                      {preferredVerified && (
                        <p className="text-success flex items-center gap-1.5 text-sm">
                          <CheckIcon className="size-4" aria-hidden />
                          {phoneMatchesAccount
                            ? t("accountPhoneReady")
                            : t("phoneVerified")}
                        </p>
                      )}
                      {!preferredVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit!"
                          disabled={
                            contactInputDisabled ||
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
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="request-assessment-optional-email">
                        {t("optionalEmailLabel")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="request-assessment-optional-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        className={contactInputClassName}
                        placeholder={t("emailPlaceholder")}
                        disabled={contactInputDisabled}
                      />
                      {fieldState.error?.message && (
                        <FieldError
                          errors={[
                            {
                              message: translateError(fieldState.error.message),
                            },
                          ]}
                        />
                      )}
                    </Field>
                  )}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="email" asChild>
              <motion.div
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, ease: "easeOut" }
                }
                className="mt-4 flex flex-col gap-3"
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-2">
                      <Field
                        data-invalid={fieldState.invalid}
                        className="flex flex-col gap-2"
                      >
                        <FieldLabel
                          htmlFor="request-assessment-email"
                          className="gap-1"
                        >
                          {t("emailLabel")}
                          {!preferredVerified && <RequiredInputIcon />}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="request-assessment-email"
                          type="email"
                          dir="ltr"
                          autoComplete="email"
                          aria-invalid={fieldState.invalid}
                          className={contactInputClassName}
                          placeholder={t("emailPlaceholder")}
                          disabled={contactInputDisabled}
                        />
                        {fieldState.error?.message && (
                          <FieldError
                            errors={[
                              {
                                message: translateError(
                                  fieldState.error.message,
                                ),
                              },
                            ]}
                          />
                        )}
                      </Field>
                      {preferredVerified && (
                        <p className="text-success flex items-center gap-1.5 text-sm">
                          <CheckIcon className="size-4" aria-hidden />
                          {emailMatchesAccount
                            ? t("accountEmailReady")
                            : t("emailVerified")}
                        </p>
                      )}
                      {!preferredVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit!"
                          disabled={
                            contactInputDisabled || !isLikelyEmail(email ?? "")
                          }
                          onClick={() => void startOtp("email")}
                        >
                          {otpPending && otpChannel === "email" && (
                            <LoaderCircle className="size-4 animate-spin" />
                          )}
                          {t("verifyEmail")}
                        </Button>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <PhoneField
                      id="request-assessment-optional-phone"
                      label={t("optionalPhoneLabel")}
                      placeholder={t("phonePlaceholder")}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={translateError(fieldState.error?.message)}
                      disabled={contactInputDisabled}
                      className={phonePlaceholderClassName}
                    />
                  )}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      />

      {otpChannel && !verifiedChannel && (
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-xl border p-4">
          <p className="text-sm">
            {otpChannel === "phone" ? t("otpPhoneHint") : t("otpEmailHint")}
          </p>
          <OtpInput
            className="flex flex-col items-center justify-center [&_label]:justify-center"
            value={otpCode}
            onChange={setOtpCode}
            disabled={otpPending || disabled}
            error={otpError ?? undefined}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={otpPending || otpCode.length < 6 || disabled}
              onClick={() => void confirmOtp()}
            >
              {otpPending && <LoaderCircle className="size-4 animate-spin" />}
              {t("confirmOtp")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={otpPending || cooldown > 0 || disabled}
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
              disabled={otpPending || disabled}
              onClick={resetOtpUi}
            >
              {t("cancelOtp")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
