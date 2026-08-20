"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { requestLoginOtp } from "@/actions/auth/request-login-otp";
import { AuthAlert } from "@/components/auth/auth-alert";
import {
  AuthCrossLinks,
  AuthTextLink,
} from "@/components/auth/auth-cross-links";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import {
  AUTH_MOCK_DELAY_MS,
  translateFormError,
  wait,
} from "@/components/auth/auth-utils";
import { EmailField } from "@/components/auth/email-field";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { IdentifierModeToggle } from "@/components/auth/identifier-mode-toggle";
import { PasswordField } from "@/components/auth/password-field";
import { PhoneField } from "@/components/auth/phone-field";
import { TextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  isMockExistingAccount,
  maskIdentifier,
  normalizeNationalPhone,
  signUpSchema,
  type IdentifierMode,
  type SignUpSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

export function SignUpForm() {
  const t = useTranslations("Auth.signUp");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      mode: "phone",
      fullName: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" });
  const pending = form.formState.isSubmitting;

  function translateError(message?: string) {
    return translateFormError(
      (key) => tErrors(key as FormErrorKey),
      message,
    );
  }

  async function onSubmit(data: SignUpSchemaType) {
    setFormError(null);

    if (data.mode === "phone") {
      const identifier = normalizeNationalPhone(data.phone ?? "");
      const result = await requestLoginOtp({ phone: identifier });

      if (!result.ok) {
        setFormError(tAuthErrors(result.errorKey));
        return;
      }

      const params = new URLSearchParams({
        mode: "phone",
        display: maskIdentifier("phone", identifier),
      });
      router.push(`/otp?${params.toString()}`);
      return;
    }

    await wait(AUTH_MOCK_DELAY_MS);

    const identifier = (data.email ?? "").trim();

    if (isMockExistingAccount("email", identifier)) {
      setAlreadyExists(true);
      return;
    }

    const params = new URLSearchParams({
      status: "pending",
      email: maskIdentifier("email", identifier),
    });
    router.push(`/verify-email?${params.toString()}`);
  }

  function switchMode(next: IdentifierMode) {
    form.setValue("mode", next);
    setFormError(null);
    setAlreadyExists(false);
    form.clearErrors();
  }

  if (alreadyExists) {
    return (
      <div>
        <AuthPageHeader
          title={t("alreadyExistsTitle")}
          description={t("alreadyExistsDescription")}
        />
        <AuthSubmitButton
          className="mt-6"
          type="button"
          onClick={() => router.push("/auth")}
        >
          {t("goToSignIn")}
        </AuthSubmitButton>
        <AuthCrossLinks>
          <Button
            type="button"
            variant="link"
            size="plain"
            className="text-link min-h-11 px-0 text-sm"
            onClick={() => setAlreadyExists(false)}
          >
            {tCommon("editIdentifier")}
          </Button>
        </AuthCrossLinks>
      </div>
    );
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
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <TextField
                label={tCommon("fullNameLabel")}
                placeholder={tCommon("fullNamePlaceholder")}
                value={field.value}
                onChange={field.onChange}
                disabled={pending}
                error={translateError(fieldState.error?.message)}
              />
            )}
          />

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
                  disabled={pending}
                  autoComplete="username"
                  error={translateError(fieldState.error?.message)}
                />
              )}
            />
          )}

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordField
                value={field.value}
                onChange={field.onChange}
                disabled={pending}
                error={translateError(fieldState.error?.message)}
              />
            )}
          />
        </div>

        {!!formError && (
          <AuthAlert className="mt-4" description={formError} />
        )}

        <AuthSubmitButton
          className="mt-6"
          loading={pending}
          pendingLabel={
            mode === "phone" ? tCommon("sending") : tCommon("continuing")
          }
        >
          {mode === "phone" ? tCommon("sendCode") : tCommon("continue")}
        </AuthSubmitButton>

        <AuthDivider className="mt-6" />
        <GoogleAuthButton className="mt-6" disabled />
      </form>

      <AuthCrossLinks>
        <p>
          {t("haveAccount")}{" "}
          <AuthTextLink href="/auth" className="min-h-0 inline">
            {t("signInLink")}
          </AuthTextLink>
        </p>
        <p className="text-muted-foreground text-xs">
          {mode === "phone"
            ? tCommon("phoneOtpLiveNote")
            : tCommon("prototypeNote")}
        </p>
      </AuthCrossLinks>
    </div>
  );
}
