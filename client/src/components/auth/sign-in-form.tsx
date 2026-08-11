"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

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
import { PhoneField } from "@/components/auth/phone-field";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  maskIdentifier,
  normalizeNationalPhone,
  signInSchema,
  type IdentifierMode,
  type SignInSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

export function SignInForm() {
  const t = useTranslations("Auth.signIn");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
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
    await wait(AUTH_MOCK_DELAY_MS);

    const identifier =
      data.mode === "phone"
        ? normalizeNationalPhone(data.phone)
        : data.email.trim();

    const params = new URLSearchParams({
      mode: data.mode,
      identifier,
      display: maskIdentifier(data.mode, identifier),
    });

    router.push(`/otp?${params.toString()}`);
  }

  function switchMode(next: IdentifierMode) {
    form.setValue("mode", next);
    setFormError(null);
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
                  disabled={pending}
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
        >
          {tCommon("sendCode")}
        </AuthSubmitButton>

        <AuthDivider className="mt-6" />
        <GoogleAuthButton className="mt-6" disabled />
      </form>

      <AuthCrossLinks>
        <AuthTextLink href="/forgot-password">{t("forgotPassword")}</AuthTextLink>
        <p>
          {t("noAccount")}{" "}
          <AuthTextLink href="/sign-up" className="min-h-0 inline">
            {t("signUpLink")}
          </AuthTextLink>
        </p>
        <p className="text-muted-foreground text-xs">{tCommon("prototypeNote")}</p>
      </AuthCrossLinks>
    </div>
  );
}
