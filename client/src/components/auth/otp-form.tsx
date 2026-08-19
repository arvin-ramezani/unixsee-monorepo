"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { resendLoginOtp } from "@/actions/auth/request-login-otp";
import { verifyLoginOtp } from "@/actions/auth/verify-login-otp";
import { AuthAlert } from "@/components/auth/auth-alert";
import {
  AuthCrossLinks,
  AuthTextLink,
} from "@/components/auth/auth-cross-links";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { translateFormError } from "@/components/auth/auth-utils";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { isSafeReturnToPath } from "@/lib/auth/auth-utils";
import type { FormErrorKey } from "@/lib/form-errors";
import { PLAN_REQUEST_ACCOUNT_EXISTS_TOAST_ID } from "@/lib/plans/plan-request-session";
import {
  OTP_LENGTH,
  otpSchema,
  type OtpSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

const RESEND_COOLDOWN_SECONDS = 30;

export type OtpFormProps = {
  display: string;
  returnTo?: string;
};

export function OtpForm({ display, returnTo }: OtpFormProps) {
  const t = useTranslations("Auth.otp");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const autoSubmitCodeRef = useRef<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [success, setSuccess] = useState(false);
  const login = useAuthStore((state) => state.login);

  const form = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const code = useWatch({ control: form.control, name: "code" });
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
    return translateFormError((key) => tErrors(key as FormErrorKey), message);
  }

  async function onSubmit(data: OtpSchemaType) {
    setFormError(null);

    const result = await verifyLoginOtp({ code: data.code });

    if (!result.ok) {
      if (result.errorKey === "wrongCode") {
        setFormError(t("wrongCode"));
      } else if (result.errorKey === "expiredSession") {
        setFormError(tAuthErrors("expiredSession"));
      } else {
        setFormError(tAuthErrors(result.errorKey));
      }
      autoSubmitCodeRef.current = null;
      form.setValue("code", "");
      return;
    }

    login({
      accessToken: result.accessToken,
      serverClockOffsetInSeconds: result.serverClockOffsetInSeconds,
      user: result.user,
    });

    setSuccess(true);
    await new Promise((resolve) =>
      window.setTimeout(resolve, reduceMotion ? 120 : 380),
    );

    toast.dismiss(PLAN_REQUEST_ACCOUNT_EXISTS_TOAST_ID);

    const destination = isSafeReturnToPath(returnTo) ? returnTo! : "/dashboard";
    router.push(destination);
  }

  const submitWhenComplete = useEffectEvent((nextCode: string) => {
    if (pending) return;
    if (nextCode.replace(/\D/g, "").length !== OTP_LENGTH) {
      autoSubmitCodeRef.current = null;
      return;
    }
    if (autoSubmitCodeRef.current === nextCode) return;
    autoSubmitCodeRef.current = nextCode;
    void form.handleSubmit(onSubmit)();
  });

  useEffect(() => {
    submitWhenComplete(code ?? "");
  }, [code]);

  async function handleResend() {
    if (cooldown > 0 || pending) return;
    setFormError(null);
    autoSubmitCodeRef.current = null;
    form.setValue("code", "");

    const result = await resendLoginOtp();
    if (!result.ok) {
      setFormError(tAuthErrors(result.errorKey));
      return;
    }

    toast.success(`OTP: ${result.otp}`);

    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  const maskedMessage = tCommon("maskedPhone", {
    identifier: `<span dir="ltr">${display}</span>`,
  });

  return (
    <div>
      <AuthPageHeader
        titleRef={titleRef}
        title={t("title")}
        description={t("description")}
      />
      <p
        className="text-muted-foreground mt-3 text-sm"
        dangerouslySetInnerHTML={{ __html: maskedMessage }}
      />
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

        {!!formError && <AuthAlert className="mt-4" description={formError} />}

        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.div
              key="success"
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
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
          onClick={() => {
            void handleResend();
          }}
          className="text-link min-h-11 px-0 text-sm font-medium"
        >
          {cooldown > 0
            ? tCommon("resendIn", { seconds: cooldown })
            : tCommon("resendCode")}
        </Button>
        <AuthTextLink href="/auth">{tCommon("editIdentifier")}</AuthTextLink>
      </AuthCrossLinks>
    </div>
  );
}
