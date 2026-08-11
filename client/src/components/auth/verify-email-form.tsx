"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthAlert } from "@/components/auth/auth-alert";
import {
  AuthCrossLinks,
  AuthTextLink,
} from "@/components/auth/auth-cross-links";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AUTH_MOCK_DELAY_MS, wait } from "@/components/auth/auth-utils";
import { useRouter } from "@/i18n/navigation";

export type VerifyEmailStatus = "pending" | "success" | "expired";

export type VerifyEmailFormProps = {
  status: VerifyEmailStatus;
  email?: string;
};

export function VerifyEmailForm({ status, email }: VerifyEmailFormProps) {
  const t = useTranslations("Auth.verifyEmail");
  const tCommon = useTranslations("Auth.common");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setPending(true);
    setResent(false);
    await wait(AUTH_MOCK_DELAY_MS);
    setResent(true);
    setPending(false);
  }

  async function handleContinue() {
    setPending(true);
    await wait(AUTH_MOCK_DELAY_MS);
    router.push("/dashboard");
  }

  if (status === "success") {
    return (
      <div>
        <AuthPageHeader
          title={t("successTitle")}
          description={t("successDescription")}
        />
        <AuthAlert
          className="mt-6"
          variant="success"
          description={t("successDescription")}
        />
        <AuthSubmitButton
          className="mt-6"
          type="button"
          loading={pending}
          pendingLabel={tCommon("continuing")}
          onClick={handleContinue}
        >
          {t("continue")}
        </AuthSubmitButton>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div>
        <AuthPageHeader
          title={t("expiredTitle")}
          description={t("expiredDescription")}
        />
        <AuthSubmitButton
          className="mt-6"
          type="button"
          loading={pending}
          pendingLabel={tCommon("sending")}
          onClick={handleResend}
        >
          {t("resend")}
        </AuthSubmitButton>
        {resent && (
          <AuthAlert
            className="mt-4"
            variant="success"
            description={t("pendingDescription")}
          />
        )}
        <AuthCrossLinks>
          <AuthTextLink href="/sign-up">{t("changeEmail")}</AuthTextLink>
          <AuthTextLink href="/sign-in">{tCommon("backToSignIn")}</AuthTextLink>
        </AuthCrossLinks>
      </div>
    );
  }

  return (
    <div>
      <AuthPageHeader
        title={t("pendingTitle")}
        description={t("pendingDescription")}
      />
      {!!email && (
        <p className="text-muted-foreground mt-3 text-sm" dir="ltr">
          {email}
        </p>
      )}
      <AuthSubmitButton
        className="mt-6"
        type="button"
        loading={pending}
        pendingLabel={tCommon("sending")}
        onClick={handleResend}
      >
        {t("resend")}
      </AuthSubmitButton>
      {resent && (
        <AuthAlert
          className="mt-4"
          variant="success"
          description={t("pendingDescription")}
        />
      )}
      <AuthCrossLinks>
        <AuthTextLink href="/sign-up">{t("changeEmail")}</AuthTextLink>
        <AuthTextLink href="/sign-in">{tCommon("backToSignIn")}</AuthTextLink>
        <p className="text-muted-foreground text-xs">{tCommon("prototypeNote")}</p>
      </AuthCrossLinks>
    </div>
  );
}
