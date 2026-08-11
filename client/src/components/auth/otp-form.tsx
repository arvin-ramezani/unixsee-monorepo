"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { AuthAlert } from "@/components/auth/auth-alert";
import {
  AuthCrossLinks,
  AuthTextLink,
} from "@/components/auth/auth-cross-links";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import {
  AUTH_MOCK_DELAY_MS,
  translateFormError,
  wait,
} from "@/components/auth/auth-utils";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  MOCK_OTP_FAIL_CODE,
  otpSchema,
  type IdentifierMode,
  type OtpSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

const RESEND_COOLDOWN_SECONDS = 30;

export type OtpFormProps = {
  mode: IdentifierMode;
  display: string;
};

export function OtpForm({ mode, display }: OtpFormProps) {
  const t = useTranslations("Auth.otp");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [success, setSuccess] = useState(false);

  const form = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const pending = form.formState.isSubmitting || success;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function translateError(message?: string) {
    return translateFormError(
      (key) => tErrors(key as FormErrorKey),
      message,
    );
  }

  async function onSubmit(data: OtpSchemaType) {
    setFormError(null);
    await wait(AUTH_MOCK_DELAY_MS);

    if (data.code === MOCK_OTP_FAIL_CODE) {
      setFormError(t("wrongCode"));
      form.setValue("code", "");
      return;
    }

    setSuccess(true);
    await wait(reduceMotion ? 120 : 380);
    router.push("/dashboard");
  }

  function handleResend() {
    if (cooldown > 0 || pending) return;
    setFormError(null);
    form.setValue("code", "");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  const maskedMessage =
    mode === "phone"
      ? tCommon("maskedPhone", { identifier: display })
      : tCommon("maskedEmail", { identifier: display });

  return (
    <div>
      <AuthPageHeader
        titleRef={titleRef}
        title={t("title")}
        description={t("description")}
      />
      <p className="text-muted-foreground mt-3 text-sm">{maskedMessage}</p>

      <form
        className="mt-6"
        onSubmit={form.handleSubmit(onSubmit)}
        aria-busy={pending || undefined}
        noValidate
      >
        <Controller
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              disabled={pending}
              autoFocus
              error={translateError(fieldState.error?.message)}
            />
          )}
        />

        {!!formError && (
          <AuthAlert className="mt-4" description={formError} />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.div
              key="success"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.25 }}
              className="border-success/40 bg-success/10 text-success-foreground mt-6 flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium"
            >
              <CheckIcon aria-hidden="true" className="size-4" />
              {t("success")}
            </motion.div>
          ) : (
            <motion.div
              key="submit"
              initial={false}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            >
              <AuthSubmitButton
                className="mt-6"
                loading={form.formState.isSubmitting}
                pendingLabel={tCommon("verifying")}
              >
                {tCommon("verify")}
              </AuthSubmitButton>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AuthCrossLinks>
        <Button
          type="button"
          variant="link"
          size="plain"
          disabled={cooldown > 0 || pending}
          onClick={handleResend}
          className="text-link min-h-11 px-0 text-sm font-medium"
        >
          {cooldown > 0
            ? tCommon("resendIn", { seconds: cooldown })
            : tCommon("resendCode")}
        </Button>
        <AuthTextLink href="/sign-in">{tCommon("editIdentifier")}</AuthTextLink>
      </AuthCrossLinks>
    </div>
  );
}
