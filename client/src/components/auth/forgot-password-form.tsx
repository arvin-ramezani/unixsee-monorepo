"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { EmailField } from "@/components/auth/email-field";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth.forgotPassword");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const pending = form.formState.isSubmitting;

  function translateError(message?: string) {
    return translateFormError(
      (key) => tErrors(key as FormErrorKey),
      message,
    );
  }

  async function onSubmit() {
    await wait(AUTH_MOCK_DELAY_MS);
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <AuthPageHeader
          title={t("sentTitle")}
          description={t("sentDescription")}
        />
        <AuthAlert
          className="mt-6"
          variant="success"
          description={t("openEmail")}
        />
        <AuthCrossLinks>
          <AuthTextLink href="/auth">{tCommon("backToSignIn")}</AuthTextLink>
          <AuthTextLink href="/reset-password">
            {tCommon("continue")}
          </AuthTextLink>
        </AuthCrossLinks>
      </div>
    );
  }

  return (
    <div>
      <AuthPageHeader title={t("title")} description={t("description")} />

      <form
        className="mt-6"
        onSubmit={form.handleSubmit(onSubmit)}
        aria-busy={pending || undefined}
        noValidate
      >
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <EmailField
              value={field.value}
              onChange={field.onChange}
              disabled={pending}
              error={
                translateError(fieldState.error?.message) ??
                (form.formState.isSubmitted && fieldState.invalid
                  ? tAuthErrors("validation")
                  : undefined)
              }
            />
          )}
        />

        <AuthSubmitButton
          className="mt-6"
          loading={pending}
          pendingLabel={tCommon("sending")}
        >
          {t("submit")}
        </AuthSubmitButton>
      </form>

      <AuthCrossLinks>
        <AuthTextLink href="/auth">{tCommon("backToSignIn")}</AuthTextLink>
      </AuthCrossLinks>
    </div>
  );
}
