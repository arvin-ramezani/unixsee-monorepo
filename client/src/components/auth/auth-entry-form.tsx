"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { requestLoginOtp } from "@/actions/auth/request-login-otp";
import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { translateFormError } from "@/components/auth/auth-utils";
import { EmailField } from "@/components/auth/email-field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { IdentifierModeToggle } from "@/components/auth/identifier-mode-toggle";
import { PhoneField } from "@/components/auth/phone-field";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  PLAN_REQUEST_ACCOUNT_EXISTS_NOTICE,
  PLAN_REQUEST_ACCOUNT_EXISTS_TOAST_ID,
  PLAN_REQUEST_SIGN_IN_PHONE_KEY,
} from "@/lib/plans/plan-request-session";
import {
  maskIdentifier,
  normalizeNationalPhone,
  signInSchema,
  type IdentifierMode,
  type SignInSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

export function AuthEntryForm({
  returnTo,
  notice,
}: {
  returnTo?: string;
  notice?: string;
}) {
  const t = useTranslations("Auth.entry");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
  const tAccountExists = useTranslations("GuestPlanRequestPage.accountExists");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      mode: "phone",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    const storedPhone = sessionStorage.getItem(PLAN_REQUEST_SIGN_IN_PHONE_KEY);
    if (!storedPhone) {
      return;
    }

    form.setValue("phone", storedPhone);
    sessionStorage.removeItem(PLAN_REQUEST_SIGN_IN_PHONE_KEY);
  }, [form]);

  useEffect(() => {
    if (notice !== PLAN_REQUEST_ACCOUNT_EXISTS_NOTICE) {
      return;
    }

    toast.info(tAccountExists("toast"), {
      id: PLAN_REQUEST_ACCOUNT_EXISTS_TOAST_ID,
      duration: Infinity,
      closeButton: true,
    });
  }, [notice, tAccountExists]);

  const mode = useWatch({ control: form.control, name: "mode" });
  const pending = form.formState.isSubmitting;

  function translateError(message?: string) {
    return translateFormError(
      (key) => tErrors(key as FormErrorKey),
      message,
    );
  }

  async function onSubmit(data: SignInSchemaType) {
    setFormError(null);

    if (data.mode === "email") {
      setFormError(tAuthErrors("emailOtpComingSoon"));
      return;
    }

    const identifier = normalizeNationalPhone(data.phone);
    const result = await requestLoginOtp({ phone: identifier });

    if (!result.ok) {
      setFormError(tAuthErrors(result.errorKey));
      return;
    }

    const params = new URLSearchParams({
      mode: "phone",
      display: maskIdentifier("phone", identifier),
    });

    if (returnTo) {
      params.set("returnTo", returnTo);
    }

    router.push(`/otp?${params.toString()}`);
  }

  function switchMode(next: IdentifierMode) {
    form.setValue("mode", next);
    setFormError(
      next === "email" ? tAuthErrors("emailOtpComingSoon") : null,
    );
    form.clearErrors();
  }

  return (
    <div>
      <AuthPageHeader title={t("title")} description={t("description")} />

      <form
        className="mt-6"
        onSubmit={form.handleSubmit(onSubmit, () => {
          setFormError(tAuthErrors("validation"));
        })}
        aria-busy={pending || undefined}
        noValidate
      >
        <IdentifierModeToggle
          value={mode}
          onChange={switchMode}
          disabled={pending}
        />

        <div className="mt-4 flex flex-col gap-4">
          {mode === "phone" ? (
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <PhoneField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={pending}
                  error={translateError(fieldState.error?.message)}
                />
              )}
            />
          ) : (
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <EmailField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled
                  error={translateError(fieldState.error?.message)}
                />
              )}
            />
          )}
        </div>

        {!!formError && (
          <AuthAlert className="mt-4" description={formError} />
        )}

        <AuthSubmitButton
          className="mt-6"
          loading={pending}
          pendingLabel={tCommon("sending")}
          disabled={mode === "email"}
        >
          {tCommon("sendCode")}
        </AuthSubmitButton>

        <AuthDivider className="mt-6" />
        <GoogleAuthButton className="mt-6" disabled />
      </form>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        {tCommon("phoneOtpLiveNote")}
      </p>
    </div>
  );
}
