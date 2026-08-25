"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { NationalIdUpload } from "@/components/authorization/national-id-upload";
import { OtpInput } from "@/components/auth/otp-input";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  saveAuthorizationDraftAction,
  submitAuthorizationAction,
} from "@/actions/authorization/authorization-case";
import { uploadAuthorizationDocumentAction } from "@/actions/authorization/upload-document";
import { mapNestAuthorizationCase } from "@/lib/authorization/map-nest-case";
import {
  AUTHORIZATION_STEP_ORDER,
  AUTHORIZATION_STEPS,
  IRAN_CITIES,
  IRAN_PROVINCES,
  accountHasMobile,
  isContactSatisfied,
  mobileMatchesAccount,
  resolveEmailChallenge,
  resolveMobileChallenge,
  type AccountContactSeed,
  type AuthorizationPackage,
  type AuthorizationStep,
  type ContactChallengeState,
} from "@/lib/data/authorization/authorization-data";
import {
  cancelAuthorizationDraft,
  hydrateAuthorizationCase,
  saveAuthorizationDraft,
} from "@/lib/data/authorization/authorization-runtime";
import type { FormErrorKey } from "@/lib/form-errors";
import {
  authorizationAddressSchema,
  authorizationContactsSchema,
  authorizationIdentitySchema,
  authorizationReviewSchema,
} from "@/lib/zod-schemas/authorization-schema";
import { cn } from "@/lib/utils";

type AuthorizationWizardProps = {
  initialPackage: AuthorizationPackage;
  accountContacts: AccountContactSeed;
  staffReason?: string | null;
  onExitToStatus: () => void;
  onSubmitted: () => void;
};

const PROTOTYPE_OTP = "123456";

export function AuthorizationWizard({
  initialPackage,
  accountContacts,
  staffReason,
  onExitToStatus,
  onSubmitted,
}: AuthorizationWizardProps) {
  const t = useTranslations("Authorization");
  const tFields = useTranslations("Authorization.fields");
  const tSteps = useTranslations("Authorization.steps");
  const tActions = useTranslations("Authorization.actions");
  const tChallenges = useTranslations("Authorization.challenges");
  const tAlerts = useTranslations("Authorization.alerts");
  const tFormErrors = useTranslations("FormErrors");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const isFa = locale.startsWith("fa");

  const [step, setStep] = useState<AuthorizationStep>(
    AUTHORIZATION_STEPS.IDENTITY,
  );
  const [pkg, setPkg] = useState<AuthorizationPackage>(initialPackage);
  const [busy, setBusy] = useState<"idle" | "saving" | "submitting">("idle");
  const [flash, setFlash] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const stepIndex = AUTHORIZATION_STEP_ORDER.indexOf(step);

  const identityForm = useForm({
    resolver: zodResolver(authorizationIdentitySchema),
    defaultValues: {
      nationalId: pkg.nationalId,
      birthDate: pkg.birthDate,
      mobile: pkg.mobile,
      mobileBelongsToNationalId: pkg.mobileBelongsToNationalId,
    },
  });

  const contactsForm = useForm({
    resolver: zodResolver(authorizationContactsSchema),
    defaultValues: {
      email: pkg.email,
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(authorizationAddressSchema),
    defaultValues: {
      province: pkg.province,
      city: pkg.city,
      address: pkg.address,
      postalCode: pkg.postalCode,
    },
  });

  const reviewForm = useForm({
    resolver: zodResolver(authorizationReviewSchema),
    defaultValues: {
      attestedTruthful: pkg.attestedTruthful,
    },
  });

  const watchedProvince = useWatch({
    control: addressForm.control,
    name: "province",
  });
  const cities = IRAN_CITIES[watchedProvince || pkg.province] ?? [];
  const watchedIdentityMobile = useWatch({
    control: identityForm.control,
    name: "mobile",
  });
  const watchedEmail = useWatch({
    control: contactsForm.control,
    name: "email",
  });

  function mapError(message?: string) {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  }

  function challengeLabel(state: ContactChallengeState) {
    if (state === "skipped_already_verified") return tChallenges("skipped");
    if (state === "verified") return tChallenges("verified");
    if (state === "pending") return tChallenges("pending");
    return tChallenges("unverified");
  }

  function persist(next: AuthorizationPackage) {
    setPkg(next);
    saveAuthorizationDraft(next);
  }

  async function handleSaveDraft() {
    setBusy("saving");
    persist(pkg);
    const nestResult = await saveAuthorizationDraftAction(pkg);
    if (nestResult.ok) {
      hydrateAuthorizationCase(mapNestAuthorizationCase(nestResult.data));
    }
    setBusy("idle");
    setFlash(tAlerts("saved"));
  }

  function handleCancel() {
    cancelAuthorizationDraft();
    setFlash(tAlerts("cancelled"));
    onExitToStatus();
  }

  async function goNextFromIdentity() {
    const valid = await identityForm.trigger();
    if (!valid) return;
    const values = identityForm.getValues();
    const challenge = resolveMobileChallenge(values.mobile, accountContacts);

    if (challenge === "skipped_already_verified") {
      if (!values.mobileBelongsToNationalId) {
        identityForm.setError("mobileBelongsToNationalId", {
          message: "mobileBelongsRequired",
        });
        return;
      }
      persist({
        ...pkg,
        ...values,
        mobileChallenge: "skipped_already_verified",
        mobileBelongsToNationalId: true,
      });
      setStep(AUTHORIZATION_STEPS.CONTACTS);
      return;
    }

    let mobileChallenge = challenge;
    if (
      mobileChallenge === "unverified" &&
      pkg.mobile === values.mobile &&
      (pkg.mobileChallenge === "verified" || pkg.mobileChallenge === "pending")
    ) {
      mobileChallenge = pkg.mobileChallenge;
    }

    const next = {
      ...pkg,
      ...values,
      mobileChallenge,
    };

    if (!isContactSatisfied(next.mobileChallenge)) {
      setFlash(tChallenges("unverified"));
      persist(next);
      return;
    }

    persist(next);
    setStep(AUTHORIZATION_STEPS.CONTACTS);
  }

  async function goNextFromContacts() {
    const valid = await contactsForm.trigger();
    if (!valid) return;
    const values = contactsForm.getValues();

    let emailChallenge = resolveEmailChallenge(values.email, accountContacts);
    if (
      emailChallenge === "unverified" &&
      pkg.email === values.email &&
      pkg.emailChallenge === "verified"
    ) {
      emailChallenge = "verified";
    }

    const next = { ...pkg, ...values, emailChallenge };

    if (!isContactSatisfied(next.emailChallenge)) {
      setFlash(tChallenges("unverified"));
      persist(next);
      return;
    }

    persist(next);
    setStep(AUTHORIZATION_STEPS.ADDRESS);
  }

  async function goNextFromAddress() {
    const valid = await addressForm.trigger();
    if (!valid) return;
    const values = addressForm.getValues();
    persist({ ...pkg, ...values });
    setStep(AUTHORIZATION_STEPS.DOCUMENT);
  }

  function goNextFromDocument() {
    if (!pkg.nationalIdCardFileName) {
      setDocumentError(tFormErrors("documentRequired"));
      return;
    }
    setDocumentError(null);
    persist(pkg);
    setStep(AUTHORIZATION_STEPS.REVIEW);
  }

  async function handleSubmit() {
    const valid = await reviewForm.trigger();
    if (!valid) return;
    if (!pkg.nationalIdCardFileName) {
      setDocumentError(tFormErrors("documentRequired"));
      setStep(AUTHORIZATION_STEPS.DOCUMENT);
      return;
    }

    const next = {
      ...pkg,
      attestedTruthful: true as const,
    };
    setBusy("submitting");
    persist(next);
    const nestResult = await submitAuthorizationAction(next);
    setBusy("idle");
    if (!nestResult.ok) {
      const locked = nestResult.error.code === "AUTHORIZATION_LOCKED";
      setFlash(tAlerts(locked ? "locked" : "incomplete"));
      return;
    }
    hydrateAuthorizationCase(mapNestAuthorizationCase(nestResult.data));
    setFlash(tAlerts("submitted"));
    onSubmitted();
  }

  function verifyMobileOtp() {
    if (otp !== PROTOTYPE_OTP) {
      setOtpError(tFormErrors("otpInvalid"));
      return;
    }
    setOtpError(null);
    const mobile = identityForm.getValues("mobile");
    persist({ ...pkg, mobile, mobileChallenge: "verified" });
  }

  function provinceLabel(id: string) {
    const found = IRAN_PROVINCES.find((entry) => entry.id === id);
    if (!found) return id;
    return isFa ? found.labelFa : found.labelEn;
  }

  function cityLabel(provinceId: string, cityId: string) {
    const found = (IRAN_CITIES[provinceId] ?? []).find(
      (entry) => entry.id === cityId,
    );
    if (!found) return cityId;
    return isFa ? found.labelFa : found.labelEn;
  }

  return (
    <Panel className="mx-auto w-full max-w-2xl space-y-5 p-5 sm:p-6">
      <header className="space-y-2 border-b pb-4">
        <p className="text-muted-foreground text-sm">
          {tSteps("progress", {
            current: stepIndex + 1,
            total: AUTHORIZATION_STEP_ORDER.length,
          })}
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
        <ol className="flex flex-wrap gap-2 pt-1" aria-label={t("title")}>
          {AUTHORIZATION_STEP_ORDER.map((item, index) => (
            <li
              key={item}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                index === stepIndex
                  ? "bg-primary text-primary-foreground"
                  : index < stepIndex
                    ? "bg-success/15 text-success-foreground dark:text-success"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {tSteps(item)}
            </li>
          ))}
        </ol>
      </header>

      {!!staffReason && (
        <div
          className="border-warning/40 bg-warning/10 rounded-xl border p-3 text-sm"
          role="status"
        >
          {staffReason}
        </div>
      )}

      {!!flash && (
        <p className="text-sm" role="status" aria-live="polite">
          {flash}
        </p>
      )}

      {step === AUTHORIZATION_STEPS.IDENTITY && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void goNextFromIdentity();
          }}
        >
          <FieldGroup>
            <Controller
              control={identityForm.control}
              name="nationalId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="nationalId">
                    {tFields("nationalId")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="nationalId"
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={identityForm.control}
              name="mobile"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="auth-mobile">
                    {tFields("mobile")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="auth-mobile"
                    dir="ltr"
                    inputMode="tel"
                    onChange={(event) => {
                      field.onChange(event);
                      const nextChallenge = resolveMobileChallenge(
                        event.target.value,
                        accountContacts,
                      );
                      setPkg((prev) => ({
                        ...prev,
                        mobile: event.target.value,
                        mobileChallenge: nextChallenge,
                      }));
                    }}
                    aria-invalid={fieldState.invalid}
                  />
                  <p className="text-muted-foreground text-xs">
                    {challengeLabel(
                      resolveMobileChallenge(field.value, accountContacts) ===
                        "skipped_already_verified"
                        ? "skipped_already_verified"
                        : pkg.mobileChallenge,
                    )}
                  </p>
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            {accountHasMobile(accountContacts) &&
            mobileMatchesAccount(
              watchedIdentityMobile ?? "",
              accountContacts,
            ) ? (
              <Controller
                control={identityForm.control}
                name="mobileBelongsToNationalId"
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id="mobileBelongsToNationalId"
                      checked={Boolean(field.value)}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <FieldContent>
                      <FieldLabel
                        htmlFor="mobileBelongsToNationalId"
                        className="font-normal"
                      >
                        {tFields("mobileBelongs")}
                      </FieldLabel>
                      {fieldState.error && (
                        <FieldError>
                          {mapError(fieldState.error.message)}
                        </FieldError>
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            ) : (
              <>
                <p className="text-muted-foreground text-sm">
                  {tFields("mobileNeedsVerify")}
                </p>
                {!isContactSatisfied(
                  resolveMobileChallenge(
                    watchedIdentityMobile ?? "",
                    accountContacts,
                  ) === "skipped_already_verified"
                    ? "skipped_already_verified"
                    : pkg.mobileChallenge,
                ) &&
                  resolveMobileChallenge(
                    watchedIdentityMobile ?? "",
                    accountContacts,
                  ) !== "skipped_already_verified" && (
                    <div className="space-y-3 rounded-xl border p-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        onClick={() =>
                          setPkg((prev) => ({
                            ...prev,
                            mobileChallenge: "pending",
                          }))
                        }
                      >
                        {tChallenges("sendOtp")}
                      </Button>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        error={otpError ?? undefined}
                      />
                      <p className="text-muted-foreground text-xs">
                        {tChallenges("otpHint")}
                      </p>
                      <Button
                        type="button"
                        className="min-h-11"
                        onClick={verifyMobileOtp}
                      >
                        {tChallenges("verifyOtp")}
                      </Button>
                    </div>
                  )}
              </>
            )}

            <Controller
              control={identityForm.control}
              name="birthDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="birthDate">
                    {tFields("birthDate")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="birthDate"
                    type="date"
                    dir="ltr"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <WizardFooter
            busy={busy}
            onBack={onExitToStatus}
            onSave={() => void handleSaveDraft()}
            onCancel={handleCancel}
            nextLabel={tActions("next")}
          />
        </form>
      )}

      {step === AUTHORIZATION_STEPS.CONTACTS && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void goNextFromContacts();
          }}
        >
          <FieldGroup>
            <Controller
              control={contactsForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="auth-email">
                    {tFields("email")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="auth-email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    onChange={(event) => {
                      field.onChange(event);
                      const nextChallenge = resolveEmailChallenge(
                        event.target.value,
                        accountContacts,
                      );
                      setPkg((prev) => ({
                        ...prev,
                        email: event.target.value,
                        emailChallenge: nextChallenge,
                      }));
                    }}
                    aria-invalid={fieldState.invalid}
                  />
                  <p className="text-muted-foreground text-xs">
                    {challengeLabel(
                      resolveEmailChallenge(field.value, accountContacts) ===
                        "skipped_already_verified"
                        ? "skipped_already_verified"
                        : pkg.emailChallenge,
                    )}
                  </p>
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            {!isContactSatisfied(
              resolveEmailChallenge(watchedEmail ?? "", accountContacts) ===
                "skipped_already_verified"
                ? "skipped_already_verified"
                : pkg.emailChallenge,
            ) &&
              resolveEmailChallenge(watchedEmail ?? "", accountContacts) !==
                "skipped_already_verified" && (
                <div className="space-y-2 rounded-xl border p-3">
                  <p className="text-muted-foreground text-xs">
                    {tChallenges("emailHint")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      persist({ ...pkg, emailChallenge: "verified" })
                    }
                  >
                    {tChallenges("confirmEmail")}
                  </Button>
                </div>
              )}
          </FieldGroup>
          <WizardFooter
            busy={busy}
            onBack={() => setStep(AUTHORIZATION_STEPS.IDENTITY)}
            onSave={() => void handleSaveDraft()}
            onCancel={handleCancel}
            nextLabel={tActions("next")}
          />
        </form>
      )}

      {step === AUTHORIZATION_STEPS.ADDRESS && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void goNextFromAddress();
          }}
        >
          <FieldGroup>
            <Controller
              control={addressForm.control}
              name="province"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tFields("province")}</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      addressForm.setValue("city", "");
                    }}
                  >
                    <SelectTrigger className="min-h-11 w-full">
                      <SelectValue placeholder={tFields("province")} />
                    </SelectTrigger>
                    <SelectContent>
                      {IRAN_PROVINCES.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {isFa ? province.labelFa : province.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={addressForm.control}
              name="city"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tFields("city")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="min-h-11 w-full">
                      <SelectValue placeholder={tFields("city")} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {isFa ? city.labelFa : city.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={addressForm.control}
              name="address"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="auth-address">
                    {tFields("address")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="auth-address"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={addressForm.control}
              name="postalCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="auth-postal">
                    {tFields("postalCode")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="auth-postal"
                    dir="ltr"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <WizardFooter
            busy={busy}
            onBack={() => setStep(AUTHORIZATION_STEPS.CONTACTS)}
            onSave={() => void handleSaveDraft()}
            onCancel={handleCancel}
            nextLabel={tActions("next")}
          />
        </form>
      )}

      {step === AUTHORIZATION_STEPS.DOCUMENT && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            goNextFromDocument();
          }}
        >
          <NationalIdUpload
            fileName={pkg.nationalIdCardFileName}
            previewUrl={pkg.nationalIdCardPreviewUrl}
            error={documentError ?? undefined}
            onChange={({ fileName, previewUrl, file }) => {
              setDocumentError(null);
              setDocumentFile(file ?? null);
              persist({
                ...pkg,
                nationalIdCardFileName: fileName,
                nationalIdCardPreviewUrl: previewUrl,
              });
            }}
          />
          <WizardFooter
            busy={busy}
            onBack={() => setStep(AUTHORIZATION_STEPS.ADDRESS)}
            onSave={() => void handleSaveDraft()}
            onCancel={handleCancel}
            nextLabel={tActions("next")}
          />
        </form>
      )}

      {step === AUTHORIZATION_STEPS.REVIEW && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="space-y-3">
            <h2 className="font-semibold">{t("review.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("review.hint")}</p>
            <dl className="space-y-2 text-sm">
              <ReviewRow
                label={tFields("nationalId")}
                value={pkg.nationalId}
                ltr
                onEdit={() => setStep(AUTHORIZATION_STEPS.IDENTITY)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("mobile")}
                value={`${pkg.mobile} — ${challengeLabel(pkg.mobileChallenge)}`}
                ltr
                onEdit={() => setStep(AUTHORIZATION_STEPS.IDENTITY)}
                editLabel={tActions("editSection")}
              />
              {pkg.mobileChallenge === "skipped_already_verified" && (
                <ReviewRow
                  label={tFields("mobileBelongs")}
                  value={
                    pkg.mobileBelongsToNationalId ? tCommon("yes") : tCommon("no")
                  }
                  onEdit={() => setStep(AUTHORIZATION_STEPS.IDENTITY)}
                  editLabel={tActions("editSection")}
                />
              )}
              <ReviewRow
                label={tFields("birthDate")}
                value={pkg.birthDate}
                ltr
                onEdit={() => setStep(AUTHORIZATION_STEPS.IDENTITY)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("email")}
                value={`${pkg.email} — ${challengeLabel(pkg.emailChallenge)}`}
                ltr
                onEdit={() => setStep(AUTHORIZATION_STEPS.CONTACTS)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("province")}
                value={provinceLabel(pkg.province)}
                onEdit={() => setStep(AUTHORIZATION_STEPS.ADDRESS)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("city")}
                value={cityLabel(pkg.province, pkg.city)}
                onEdit={() => setStep(AUTHORIZATION_STEPS.ADDRESS)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("address")}
                value={pkg.address}
                onEdit={() => setStep(AUTHORIZATION_STEPS.ADDRESS)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("postalCode")}
                value={pkg.postalCode}
                ltr
                onEdit={() => setStep(AUTHORIZATION_STEPS.ADDRESS)}
                editLabel={tActions("editSection")}
              />
              <ReviewRow
                label={tFields("document")}
                value={pkg.nationalIdCardFileName ?? "—"}
                onEdit={() => setStep(AUTHORIZATION_STEPS.DOCUMENT)}
                editLabel={tActions("editSection")}
              />
            </dl>
          </div>

          <Controller
            control={reviewForm.control}
            name="attestedTruthful"
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                data-invalid={fieldState.invalid}
              >
                <Checkbox
                  id="attestedTruthful"
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
                <FieldContent>
                  <FieldLabel htmlFor="attestedTruthful" className="font-normal">
                    {tFields("attestation")}
                  </FieldLabel>
                  {fieldState.error && (
                    <FieldError>
                      {mapError(fieldState.error.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setStep(AUTHORIZATION_STEPS.DOCUMENT)}
            >
              {tActions("back")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              disabled={busy !== "idle"}
              onClick={() => void handleSaveDraft()}
            >
              {busy === "saving" ? tActions("saving") : tActions("saveDraft")}
            </Button>
            <Button
              type="submit"
              className="min-h-11 ms-auto"
              disabled={busy !== "idle"}
            >
              {busy === "submitting" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {tActions("submitting")}
                </>
              ) : (
                tActions("submit")
              )}
            </Button>
          </div>
        </form>
      )}
    </Panel>
  );
}

function WizardFooter({
  busy,
  onBack,
  onSave,
  onCancel,
  nextLabel,
}: {
  busy: "idle" | "saving" | "submitting";
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
  nextLabel: string;
}) {
  const tActions = useTranslations("Authorization.actions");
  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={onBack}
      >
        {tActions("back")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="min-h-11"
        disabled={busy !== "idle"}
        onClick={onSave}
      >
        {busy === "saving" ? tActions("saving") : tActions("saveDraft")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="text-destructive min-h-11"
        onClick={onCancel}
      >
        {tActions("cancelDraft")}
      </Button>
      <Button type="submit" className="min-h-11 ms-auto">
        {nextLabel}
      </Button>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  ltr,
  onEdit,
  editLabel,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2">
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="mt-0.5 font-medium" dir={ltr ? "ltr" : undefined}>
          {value}
        </dd>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        {editLabel}
      </Button>
    </div>
  );
}
