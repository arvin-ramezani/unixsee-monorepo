import { useTranslations } from "next-intl";

import { PasswordSecurityCard } from "@/components/profile/password-security-card";
import { TwoFactorCard } from "@/components/profile/two-factor-card";
import type {
  PasswordState,
  TwoFactorState,
} from "@/lib/data/profile/profile-data";

export function SecuritySection({
  passwordState,
  twoFactorState,
  recoveryCodes,
}: {
  passwordState: PasswordState;
  twoFactorState: TwoFactorState;
  recoveryCodes: readonly string[];
}) {
  const t = useTranslations("Profile.security");
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <PasswordSecurityCard initialState={passwordState} />
        <TwoFactorCard
          initialState={twoFactorState}
          recoveryCodes={recoveryCodes}
        />
      </div>
    </section>
  );
}
