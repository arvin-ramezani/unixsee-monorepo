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
import { PasswordField } from "@/components/auth/password-field";
import { useRouter } from "@/i18n/navigation";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

export type ResetPasswordFormProps = {
  expired?: boolean;
};

export function ResetPasswordForm({ expired = false }: ResetPasswordFormProps) {
  const t = useTranslations("Auth.resetPassword");
  const tCommon = useTranslations("Auth.common");
  const tErrors = useTranslations("FormErrors");
  const tAuthErrors = useTranslations("Auth.errors");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const pending = form.formState.isSubmitting;

  function translateError(message?: string) {
    return translateFormError(
      (key) => tErrors(key as FormErrorKey),
      message,
    );
  }

  async function onSubmit() {
    setFormError(null);
    await wait(AUTH_MOCK_DELAY_MS);
    setSuccess(true);
    await wait(400);
    router.push("/auth");
  }

  if (expired) {
    return (
      <div>
        <AuthPageHeader
          title={t("deadTitle")}
          description={t("deadDescription")}
        />
        <AuthSubmitButton
          className="mt-6"
          type="button"
          onClick={() => router.push("/forgot-password")}
        >
          {tCommon("requestNewLink")}
        </AuthSubmitButton>
        <AuthCrossLinks>
          <AuthTextLink href="/auth">{tCommon("backToSignIn")}</AuthTextLink>
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
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordField
                value={field.value}
                onChange={field.onChange}
                disabled={pending || success}
                error={translateError(fieldState.error?.message)}
              />
            )}
          />
          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <PasswordField
                label={tCommon("confirmPasswordLabel")}
                value={field.value}
                onChange={field.onChange}
                disabled={pending || success}
                error={translateError(fieldState.error?.message)}
              />
            )}
          />
        </div>

        {!!formError && (
          <AuthAlert className="mt-4" description={formError} />
        )}
        {success && (
          <AuthAlert
            className="mt-4"
            variant="success"
            description={t("successRedirect")}
          />
        )}

        <AuthSubmitButton
          className="mt-6"
          loading={pending || success}
          pendingLabel={
            success ? t("successRedirect") : tCommon("settingPassword")
          }
        >
          {tCommon("setPassword")}
        </AuthSubmitButton>
      </form>

      <AuthCrossLinks>
        <AuthTextLink href="/auth">{tCommon("backToSignIn")}</AuthTextLink>
      </AuthCrossLinks>
    </div>
  );
}
