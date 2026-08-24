"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { createPlanRequestAction } from "@/actions/plans/create-plan-request";
import { updateProfileAction } from "@/actions/users/update-profile";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { PlanRequestFileUpload } from "@/components/plans/plan-request-file-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import type { FormErrorKey } from "@/lib/form-errors";
import type { DashboardPlan } from "@/lib/plans/types";
import {
  CONTENT_SIZE_BANDS,
  DATABASE_SIZE_BANDS,
  DAILY_VISITOR_BANDS,
  WOOCOMMERCE_OPTIONS,
  authPlanRequestSchema,
  buildAuthPlanIntakeNotes,
  normalizeWebsite,
  type AuthPlanRequestSchemaType,
} from "@/lib/zod-schemas/guest-plan-request-schema";

export function AuthCheckoutForm({
  plan,
  contactName,
  hasName,
  contactPhone,
  contactEmail,
}: {
  plan: DashboardPlan;
  contactName: string;
  hasName: boolean;
  contactPhone: string | null;
  contactEmail: string | null;
}) {
  const t = useTranslations("AuthCheckout.form");
  const tApiErrors = useTranslations("ApiErrors");
  const tFormErrors = useTranslations("FormErrors");
  const router = useRouter();
  const [fileObjects, setFileObjects] = useState<File[]>([]);

  const form = useForm<AuthPlanRequestSchemaType>({
    resolver: zodResolver(authPlanRequestSchema),
    defaultValues: {
      contactName: contactName || "",
      website: "",
      databaseSizeBand: "",
      dailyVisitorsBand: "",
      contentSizeBand: "",
      isWooCommerce: "",
      description: "",
      attachments: [],
    },
  });

  const pending = form.formState.isSubmitting;

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  async function uploadPublicFiles(
    files: File[],
  ): Promise<{ fileName: string; downloadUrl: string }[]> {
    const results: { fileName: string; downloadUrl: string }[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(
          `${getServerCoreApiBaseUrl()}/uploads/public`,
          { method: "POST", body: formData },
        );
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            results.push({
              fileName: result.data.fileName,
              downloadUrl: result.data.downloadUrl,
            });
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }
    return results;
  }    async function onSubmit(data: AuthPlanRequestSchemaType) {
    let uploadedAttachments: { fileName: string; downloadUrl: string }[] = [];
    if (fileObjects.length > 0) {
      uploadedAttachments = await uploadPublicFiles(fileObjects);
    }

    const notes = buildAuthPlanIntakeNotes(data);
    const websiteDomain = data.website.trim()
      ? normalizeWebsite(data.website)
      : undefined;

    // If user provided a name and didn't have one before, save it to their profile
    const nameToUse = data.contactName.trim();
    if (!hasName && nameToUse) {
      await updateProfileAction({ fullName: nameToUse });
    }

    const result = await createPlanRequestAction({
      planId: plan.id,
      contactName: nameToUse || contactName,
      ...(contactPhone?.trim() ? { contactPhone: contactPhone.trim() } : {}),
      ...(contactEmail?.trim() ? { contactEmail: contactEmail.trim() } : {}),
      ...(websiteDomain ? { websiteDomain } : {}),
      notes: notes.trim() || undefined,
    });

    if (!result.ok) {
      toastMappedApiError(result.error, tApiErrors);
      return;
    }

    router.push(
      `/dashboard/plans/success?plan=${plan.id}&request=${result.data.id}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-busy={pending || undefined}>
      <FieldGroup className="gap-5">
        {!hasName && (
          <Controller
            name="contactName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="auth-plan-name" className="gap-1">
                  {t("nameLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Input
                  {...field}
                  id="auth-plan-name"
                  autoComplete="name"
                  disabled={pending}
                  aria-invalid={fieldState.invalid}
                  className="h-12"
                  placeholder={t("namePlaceholder")}
                />
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />
        )}
        <Controller
          name="website"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="auth-plan-website" className="gap-1">
                {t("websiteLabel")}
                <RequiredInputIcon />
              </FieldLabel>
              <Input
                {...field}
                id="auth-plan-website"
                type="url"
                dir="ltr"
                disabled={pending}
                aria-invalid={fieldState.invalid}
                className="h-12"
                placeholder={t("websitePlaceholder")}
              />
              {fieldState.error && (
                <FieldError>{translateError(fieldState.error.message)}</FieldError>
              )}
            </Field>
          )}
        />

        <p className="text-foreground text-sm font-medium">
          {t("intakeSectionTitle")}
        </p>
        <p className="text-muted-foreground -mt-3 text-xs">
          {t("intakeSectionHint")}
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Controller
            name="databaseSizeBand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("databaseSizeLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("databaseSizePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DATABASE_SIZE_BANDS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`databaseSizeOptions.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="dailyVisitorsBand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("dailyVisitorsLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("dailyVisitorsPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DAILY_VISITOR_BANDS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`dailyVisitorsOptions.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="contentSizeBand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("contentSizeLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("contentSizePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_SIZE_BANDS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`contentSizeOptions.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="isWooCommerce"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="gap-1">
                  {t("woocommerceLabel")}
                  <RequiredInputIcon />
                </FieldLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger className="h-12 w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t("woocommercePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WOOCOMMERCE_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`woocommerceOptions.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
                <FieldLabel htmlFor="auth-plan-description">
                  {t("descriptionLabel")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="auth-plan-description"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("descriptionPlaceholder")}
                    disabled={pending}
                    className="h-32"
                  />
                </InputGroup>
                {fieldState.error && (
                  <FieldError>{translateError(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="attachments"
          control={form.control}
          render={({ field, fieldState }) => (
            <PlanRequestFileUpload
              files={field.value ?? []}
              disabled={pending}
              error={translateError(fieldState.error?.message)}
              onChange={field.onChange}
              onFilesChange={setFileObjects}
            />
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-8 h-12 w-full gap-2 text-base font-bold"
      >
        {pending && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {pending ? t("processing") : t("submit")}
      </Button>

      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm">
        <ShieldCheck
          aria-hidden="true"
          className="text-success mt-0.5 size-4 shrink-0"
        />
        {t("reassurance")}
      </p>
    </form>
  );
}