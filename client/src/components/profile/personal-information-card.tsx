"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { updateProfileAction } from "@/actions/profile/update-profile";
import { uploadAvatarAction } from "@/actions/profile/upload-avatar";
import { Panel } from "@/components/dashboard/panel";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import {
  ContactVerifyDialog,
  type ContactVerifyChannel,
} from "@/components/profile/contact-verify-dialog";
import { ProfileAvatarField } from "@/components/profile/profile-avatar-field";
import { VerificationStatus } from "@/components/profile/verification-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import type { UserProfile } from "@/lib/data/profile/profile-data";
import {
  getContactFieldRequirements,
  isValidProfileEmail,
  isValidProfileMobile,
  normalizeProfileMobile,
} from "@/lib/profile/contact-requirements";
import { mapMeToUserProfile } from "@/lib/profile/map-me-to-profile";
import { cn } from "@/lib/utils";
import { locales } from "@/lib/i18n";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

type FormErrors = Partial<Record<"fullName" | "email" | "mobile", string>>;

export function PersonalInformationCard({
  profile,
  nestBacked = false,
  simulateFailure,
}: {
  profile: UserProfile;
  nestBacked?: boolean;
  simulateFailure?: boolean;
}) {
  const t = useTranslations("Profile.personal");
  const tApiErrors = useTranslations("ApiErrors");
  const [saved, setSaved] = useState(profile);
  const [draft, setDraft] = useState(profile);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "failed"
  >("idle");
  const [showReset, setShowReset] = useState(false);
  const [verifyChannel, setVerifyChannel] =
    useState<ContactVerifyChannel | null>(null);
  const [pending, startTransition] = useTransition();
  const toastRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const setStoreUser = useAuthStore((state) => state.setUser);

  const profileFieldsDirty =
    draft.fullName !== saved.fullName ||
    draft.preferredLanguage !== saved.preferredLanguage;
  const contactDirty =
    draft.email !== saved.email || draft.mobile !== saved.mobile;
  const dirty = profileFieldsDirty || contactDirty || avatarChanged;
  const canSave = nestBacked ? profileFieldsDirty || avatarChanged : dirty;
  const { emailRequired, mobileRequired } = getContactFieldRequirements(saved);

  useEffect(() => {
    setSaved(profile);
    setDraft((current) => ({
      ...profile,
      avatarUrl: current.avatarUrl,
    }));
  }, [profile]);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function validateProfileFields() {
    const next: FormErrors = {};
    if (!draft.fullName.trim()) next.fullName = t("errors.name");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validate() {
    const next: FormErrors = {};
    if (!draft.fullName.trim()) next.fullName = t("errors.name");

    const email = draft.email.trim();
    const mobile = normalizeProfileMobile(draft.mobile);

    if (emailRequired || email) {
      if (!email) next.email = t("errors.emailRequired");
      else if (!isValidProfileEmail(email)) next.email = t("errors.email");
    }

    if (mobileRequired || mobile) {
      if (!mobile) next.mobile = t("errors.mobileRequired");
      else if (!isValidProfileMobile(mobile)) next.mobile = t("errors.mobile");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function refreshAvatar(avatarUrl?: string | null) {
    if (avatarUrl && storeUser) {
      setStoreUser({ ...storeUser, avatarUrl });
    }
    router.refresh();
  }

  function save(event: FormEvent) {
    event.preventDefault();

    if (nestBacked) {
      if (!validateProfileFields()) return;

      const hadAvatarChange = avatarChanged;
      if (!profileFieldsDirty && hadAvatarChange) {
        // Avatar-only save: upload the file directly
        if (avatarFile) {
          setSaveState("saving");
          startTransition(async () => {
            const formData = new FormData();
            formData.append("file", avatarFile);
            const avatarResult = await uploadAvatarAction(formData);
            if (avatarResult.ok) {
              const updated = {
                ...draft,
                avatarUrl: avatarResult.data.avatarUrl,
              };
              setSaved(updated);
              setDraft(updated);
              setAvatarChanged(false);
              setAvatarFile(undefined);
              setSaveState("saved");
              refreshAvatar(avatarResult.data.avatarUrl);
              toast.success(t("toast.profileSaved"));
              window.setTimeout(() => setSaveState("idle"), 2500);
            } else {
              setSaveState("failed");
              toast.error(t("toast.avatarFailed"));
            }
          });
        } else {
          setAvatarChanged(false);
          toast.info(t("toast.avatarLocalOnly"));
        }
        return;
      }
      if (!profileFieldsDirty) return;

      setSaveState("saving");
      startTransition(async () => {
        const result = await updateProfileAction({
          fullName: draft.fullName,
          locale: draft.preferredLanguage,
        });

        if (!result.ok) {
          setSaveState("failed");
          toastMappedApiError(result.error, tApiErrors);
          return;
        }

        let avatarUrl = draft.avatarUrl;
        if (hadAvatarChange && avatarFile) {
          const formData = new FormData();
          formData.append("file", avatarFile);
          const avatarResult = await uploadAvatarAction(formData);
          if (avatarResult.ok) {
            avatarUrl = avatarResult.data.avatarUrl;
          }
        }
        const mapped = mapMeToUserProfile(result.data, {
          passwordState: saved.passwordState,
          twoFactorState: saved.twoFactorState,
        });
        const next: UserProfile = {
          ...mapped,
          avatarUrl,
        };
        setSaved(next);
        setDraft(next);
        setAvatarChanged(false);
        setAvatarFile(undefined);
        setSaveState("saved");
        if (hadAvatarChange) {
          refreshAvatar(avatarUrl);
        }
        toast.success(t("toast.profileSaved"));
        window.setTimeout(() => setSaveState("idle"), 2500);
      });
      return;
    }

    if (!validate()) return;
    setSaveState("saving");
    window.setTimeout(() => {
      if (simulateFailure) {
        setSaveState("failed");
        return;
      }
      setSaved({
        ...draft,
        email: saved.email,
        emailStatus: saved.emailStatus,
        mobile: saved.mobile,
        mobileStatus: saved.mobileStatus,
      });
      setDraft((current) => ({
        ...current,
        email: saved.email,
        emailStatus: saved.emailStatus,
        mobile: saved.mobile,
        mobileStatus: saved.mobileStatus,
      }));
      setAvatarChanged(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2500);
    }, 600);
  }

  function reset() {
    setDraft(saved);
    setAvatarChanged(false);
    setAvatarFile(undefined);
    setErrors({});
    setSaveState("idle");
    setShowReset(false);
  }

  function openVerify(channel: ContactVerifyChannel) {
    if (!nestBacked) return;
    if (channel === "email") {
      if (!draft.email.trim()) {
        setErrors((current) => ({
          ...current,
          email: t("errors.emailRequired"),
        }));
        return;
      }
      if (!isValidProfileEmail(draft.email)) {
        setErrors((current) => ({ ...current, email: t("errors.email") }));
        return;
      }
    } else {
      if (!normalizeProfileMobile(draft.mobile)) {
        setErrors((current) => ({
          ...current,
          mobile: t("errors.mobileRequired"),
        }));
        return;
      }
      if (!isValidProfileMobile(draft.mobile)) {
        setErrors((current) => ({ ...current, mobile: t("errors.mobile") }));
        return;
      }
    }
    setVerifyChannel(channel);
  }

  function handleVerified(next: UserProfile) {
    const merged: UserProfile = {
      ...draft,
      email: next.email,
      emailStatus: next.emailStatus,
      mobile: next.mobile,
      mobileStatus: next.mobileStatus,
      fullName: next.fullName || draft.fullName,
      preferredLanguage: draft.preferredLanguage,
      passwordState: saved.passwordState,
      twoFactorState: saved.twoFactorState,
      avatarUrl: draft.avatarUrl,
    };
    setSaved(merged);
    setDraft(merged);
  }

  return (
    <Panel className="p-5 sm:p-6">
      <div className="border-border border-b pb-5">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t("description")}</p>
        <p className="text-muted-foreground mt-2 text-xs">{t("contactRule")}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-stretch gap-7 xl:gap-8">
        <div className="border-border bg-muted/30 flex w-full shrink-0 items-center rounded-xl border p-4 lg:w-80">
          <ProfileAvatarField
            name={draft.fullName}
            initialUrl={draft.avatarUrl}
            onChange={(avatarUrl, file) => {
              setDraft((value) => ({ ...value, avatarUrl }));
              setAvatarChanged(true);
              setAvatarFile(file);
            }}
          />
        </div>

        <div className="min-w-[min(100%,42rem)] flex-[1_1_42rem] 2xl:max-w-240">
          <ProfileForm
            draft={draft}
            saved={saved}
            errors={errors}
            nestBacked={nestBacked}
            emailRequired={emailRequired}
            mobileRequired={mobileRequired}
            onChange={(next) => {
              setDraft(next);
              setSaveState("idle");
            }}
            onVerifyEmail={() => openVerify("email")}
            onVerifyMobile={() => openVerify("phone")}
          />
        </div>
      </div>
      <form
        onSubmit={save}
        className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center"
      >
        {dirty && (
          <DashboardButton
            revealClassName="bg-muted dark:bg-accent"
            size="xl"
            type="button"
            onClick={() => setShowReset(true)}
            variant="outline"
            className="min-h-11"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("reset")}
          </DashboardButton>
        )}
        <DashboardButton
          size="xl"
          type="submit"
          disabled={!canSave || saveState === "saving" || pending}
          className="min-h-11 px-5"
        >
          {(saveState === "saving" || pending) && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {saveState === "saving" || pending ? t("saving") : t("save")}
        </DashboardButton>
      </form>
      <div ref={toastRef} aria-live="polite">
        {saveState === "saved" && !nestBacked && (
          <div className="border-success/25 bg-popover text-success-foreground fixed inset-e-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {t("saved")}
          </div>
        )}
        {saveState === "failed" && (
          <p className="text-destructive mt-3 text-end text-sm">
            {t("saveFailed")}
          </p>
        )}
      </div>
      <UnsavedChangesDialog
        open={showReset}
        onCancel={() => setShowReset(false)}
        onDiscard={reset}
      />
      {!!verifyChannel && (
        <ContactVerifyDialog
          open
          channel={verifyChannel}
          value={verifyChannel === "phone" ? draft.mobile : draft.email}
          onOpenChange={(open) => {
            if (!open) setVerifyChannel(null);
          }}
          onVerified={handleVerified}
        />
      )}
    </Panel>
  );
}

export function ProfileForm({
  draft,
  saved,
  errors,
  nestBacked,
  emailRequired,
  mobileRequired,
  onChange,
  onVerifyEmail,
  onVerifyMobile,
}: {
  draft: UserProfile;
  saved: UserProfile;
  errors: FormErrors;
  nestBacked: boolean;
  emailRequired: boolean;
  mobileRequired: boolean;
  onChange: (profile: UserProfile) => void;
  onVerifyEmail: () => void;
  onVerifyMobile: () => void;
}) {
  const t = useTranslations("Profile.personal");
  const emailChanged = draft.email !== saved.email;
  const mobileChanged = draft.mobile !== saved.mobile;
  const showEmailVerify =
    nestBacked &&
    (emailChanged || draft.emailStatus !== "verified") &&
    Boolean(draft.email.trim());
  const showMobileVerify =
    nestBacked &&
    (mobileChanged || draft.mobileStatus !== "verified") &&
    Boolean(draft.mobile.trim());

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    onChange({ ...draft, [key]: value });
  }
  function normalizeMobile() {
    const clean = normalizeProfileMobile(draft.mobile);
    if (!clean) {
      update("mobile", "");
      return;
    }
    update("mobile", clean.startsWith("09") ? `+98${clean.slice(1)}` : clean);
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
      <Field
        id="profile-name"
        label={t("name")}
        error={errors.fullName}
        className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_calc(50%-0.625rem)]"
        required
      >
        <Input
          id="profile-name"
          autoComplete="name"
          value={draft.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "profile-name-error" : undefined}
          className="bg-muted/30 hover:bg-muted/50 focus-visible:bg-background h-11 text-base sm:text-sm"
        />
      </Field>
      <Field
        id="profile-email"
        label={t("email")}
        error={errors.email}
        className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_calc(50%-0.625rem)]"
        required={emailRequired}
        optionalLabel={!emailRequired ? t("optional") : undefined}
      >
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          value={draft.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "profile-email-error" : undefined}
          className="bg-muted/30 hover:bg-muted/50 focus-visible:bg-background h-11 text-base sm:text-sm"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {draft.email.trim() || saved.email.trim() ? (
            <VerificationStatus
              status={
                emailChanged
                  ? "unverified"
                  : draft.emailStatus === "verified"
                    ? "verified"
                    : "unverified"
              }
            />
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("notProvided")}
            </span>
          )}
          {showEmailVerify && (
            <>
              <span className="text-muted-foreground text-xs">
                {emailChanged ? t("emailChanged") : t("emailNeedsVerify")}
              </span>
              <Button
                type="button"
                onClick={onVerifyEmail}
                variant="link"
                size="plain"
                className="text-link text-xs"
              >
                {t("sendEmail")}
              </Button>
            </>
          )}
        </div>
      </Field>
      <Field
        id="profile-mobile"
        label={t("mobile")}
        error={errors.mobile}
        className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_30rem]"
        required={mobileRequired}
        optionalLabel={!mobileRequired ? t("optional") : undefined}
        hint={!mobileRequired ? t("optionalBecauseEmail") : undefined}
      >
        <Input
          id="profile-mobile"
          dir="ltr"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={draft.mobile}
          onBlur={normalizeMobile}
          onChange={(event) => update("mobile", event.target.value)}
          aria-invalid={Boolean(errors.mobile)}
          aria-describedby={errors.mobile ? "profile-mobile-error" : undefined}
          className="bg-muted/30 hover:bg-muted/50 focus-visible:bg-background h-11 text-start text-base sm:text-sm"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {normalizeProfileMobile(draft.mobile) ||
          normalizeProfileMobile(saved.mobile) ? (
            <VerificationStatus
              status={
                mobileChanged
                  ? "unverified"
                  : draft.mobileStatus === "verified"
                    ? "verified"
                    : "unverified"
              }
            />
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("notProvided")}
            </span>
          )}
          {showMobileVerify && (
            <>
              <span className="text-muted-foreground text-xs">
                {mobileChanged ? t("mobileChanged") : t("mobileNeedsVerify")}
              </span>
              <Button
                type="button"
                onClick={onVerifyMobile}
                variant="link"
                size="plain"
                className="text-link text-xs"
              >
                {t("verifyMobile")}
              </Button>
            </>
          )}
        </div>
      </Field>
      <fieldset className="w-full shrink-0 sm:w-72">
        <legend className="text-sm font-medium">{t("language")}</legend>
        <RadioGroup
          value={draft.preferredLanguage}
          onValueChange={(locale) =>
            update(
              "preferredLanguage",
              locale as UserProfile["preferredLanguage"],
            )
          }
          className="border-border mt-2 grid grid-cols-2 gap-0 rounded-lg border p-1"
        >
          {locales.map((locale) => {
            const isSelected = draft.preferredLanguage === locale;

            return (
              <Label
                key={locale}
                htmlFor={`preferred-language-${locale}`}
                className="cursor-pointer"
              >
                <RadioGroupItem
                  id={`preferred-language-${locale}`}
                  value={locale}
                  className="peer absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
                />
                <span
                  className={cn(
                    "peer-focus-visible:ring-ring flex min-h-11 w-full items-center justify-center rounded-md text-sm font-medium transition-colors peer-focus-visible:ring-2",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/80"
                      : "hover:bg-muted",
                  )}
                >
                  {locale === "fa" ? "فارسی" : "English"}
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      </fieldset>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  required,
  hint,
  optionalLabel,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  optionalLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-destructive ms-1" aria-hidden="true">
            *
          </span>
        ) : optionalLabel ? (
          <span className="text-muted-foreground ms-1 text-xs font-normal">
            ({optionalLabel})
          </span>
        ) : null}
      </Label>

      {!!hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}

      <div className="mt-2">{children}</div>

      {!!error && (
        <p id={`${id}-error`} className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export function UnsavedChangesDialog({
  open,
  onCancel,
  onDiscard,
}: {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}) {
  const t = useTranslations("Profile.unsaved");
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDiscard}>
            {t("discard")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
