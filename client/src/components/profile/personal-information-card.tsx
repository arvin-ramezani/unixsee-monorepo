"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
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
import type { UserProfile } from "@/lib/data/profile/profile-data";
import { cn } from "@/lib/utils";
import { locales } from "@/lib/i18n";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

type FormErrors = Partial<Record<"fullName" | "email" | "mobile", string>>;

export function PersonalInformationCard({
  profile,
  simulateFailure,
}: {
  profile: UserProfile;
  simulateFailure?: boolean;
}) {
  const t = useTranslations("Profile.personal");
  const [saved, setSaved] = useState(profile);
  const [draft, setDraft] = useState(profile);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "failed"
  >("idle");
  const [showReset, setShowReset] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const dirty =
    JSON.stringify(saved) !== JSON.stringify(draft) || avatarChanged;

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function validate() {
    const next: FormErrors = {};
    if (!draft.fullName.trim()) next.fullName = t("errors.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
      next.email = t("errors.email");
    if (!/^(09\d{9}|\+989\d{9})$/.test(draft.mobile.replace(/[\s-]/g, "")))
      next.mobile = t("errors.mobile");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaveState("saving");
    window.setTimeout(() => {
      if (simulateFailure) {
        setSaveState("failed");
        return;
      }
      setSaved(draft);
      setAvatarChanged(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2500);
    }, 600);
  }

  function reset() {
    setDraft(saved);
    setAvatarChanged(false);
    setErrors({});
    setSaveState("idle");
    setShowReset(false);
  }

  return (
    <Panel className="p-5 sm:p-6">
      <div className="border-border border-b pb-5">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t("description")}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-stretch gap-7 xl:gap-8">
        <div className="border-border bg-muted/30 flex w-full shrink-0 items-center rounded-xl border p-4 lg:w-80">
          <ProfileAvatarField
            name={draft.fullName}
            initialUrl={draft.avatarUrl}
            onChange={(avatarUrl) => {
              setDraft((value) => ({ ...value, avatarUrl }));
              setAvatarChanged(true);
            }}
          />
        </div>

        <div className="min-w-[min(100%,42rem)] flex-[1_1_42rem] 2xl:max-w-240">
          <ProfileForm
            draft={draft}
            saved={saved}
            errors={errors}
            onChange={(next) => {
              setDraft(next);
              setSaveState("idle");
            }}
          />
        </div>
      </div>
      <form
        onSubmit={save}
        className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end"
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
          disabled={!dirty || saveState === "saving"}
          className="min-h-11 px-5"
        >
          {saveState === "saving" && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {saveState === "saving" ? t("saving") : t("save")}
        </DashboardButton>
      </form>
      <div ref={toastRef} aria-live="polite">
        {saveState === "saved" && (
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
    </Panel>
  );
}

export function ProfileForm({
  draft,
  saved,
  errors,
  onChange,
}: {
  draft: UserProfile;
  saved: UserProfile;
  errors: FormErrors;
  onChange: (profile: UserProfile) => void;
}) {
  const t = useTranslations("Profile.personal");
  const emailChanged = draft.email !== saved.email;
  const mobileChanged = draft.mobile !== saved.mobile;
  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    onChange({ ...draft, [key]: value });
  }
  function normalizeMobile() {
    const clean = draft.mobile.replace(/[\s-]/g, "");
    update("mobile", clean.startsWith("09") ? `+98${clean.slice(1)}` : clean);
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-5">
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
        required
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
          <VerificationStatus
            status={emailChanged ? "unverified" : draft.emailStatus}
          />
          {emailChanged && (
            <>
              <span className="text-muted-foreground text-xs">
                {t("emailChanged")}
              </span>
              <Button
                type="button"
                onClick={() => update("emailStatus", "pending")}
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
        required
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
          <VerificationStatus
            status={mobileChanged ? "unverified" : draft.mobileStatus}
          />
          {mobileChanged && (
            <>
              <span className="text-muted-foreground text-xs">
                {t("mobileChanged")}
              </span>
              <Button
                type="button"
                onClick={() => update("mobileStatus", "pending")}
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
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
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
        ) : null}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="text-destructive mt-2 text-xs">
          {error}
        </p>
      ) : null}
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
