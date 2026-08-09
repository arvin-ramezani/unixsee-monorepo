"use client";

import * as React from "react";
import { useActionState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import {
  requestAssessmentSchema,
  RequestAssessmentSchemaType,
} from "@/lib/zod-schemas/request-assessment-schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormErrorKey } from "@/lib/form-errors";
// import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { formatNumberByLocale } from "@/lib/utils";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import {
  createRequestAssessmentAction,
  type RequestAssessmentActionMessageKey,
} from "@/actions/request-assessment-action";
import { initialServerActionState } from "@/types/server-action-state";

const SERVICE_KEYS = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

// const SERVICE_KEYS = [
//   { value: "managedServer", serviceKey: "managedServer" },
//   { value: "migrationOptimization", serviceKey: "migrationOptimization" },
//   { value: "woocommerceSupport", serviceKey: "woocommerceSupport" },
//   { value: "seo", serviceKey: "seo" },
//   { value: "graphicDesign", serviceKey: "graphicDesign" },
//   { value: "productDataEntry", serviceKey: "productDataEntry" },
//   { value: "socialMedia", serviceKey: "socialMedia" },
// ] as const;

export type RequestAssessmentFormType = object;

export default function RequestAssessmentForm({}: RequestAssessmentFormType) {
  const t = useTranslations(
    `HomePage.ConsultationSection.requestAssessment.form`,
  );
  const tFormErrors = useTranslations("FormErrors");
  const tActionMessages = useTranslations(
    "ServerActionMessages.requestAssessment",
  );

  const locale = useLocale();

  const form = useForm<RequestAssessmentSchemaType>({
    resolver: zodResolver(requestAssessmentSchema),
    defaultValues: {
      fullName: "",
      businessEmail: "",
      // services: [],
      services: "managedServer",
      // services: ""
    },
  });

  const [actionState, submitRequestAssessment, isActionPending] =
    useActionState(createRequestAssessmentAction, initialServerActionState);

  const lastHandledSubmissionRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (
      !actionState.submittedAt ||
      lastHandledSubmissionRef.current === actionState.submittedAt
    ) {
      return;
    }

    lastHandledSubmissionRef.current = actionState.submittedAt;

    const message = tActionMessages(
      actionState.message as RequestAssessmentActionMessageKey,
    );

    if (actionState.ok) {
      toast.success(message);
      form.reset();
      return;
    }

    toast.error(message);
  }, [actionState, form, tActionMessages]);

  function onSubmit(data: RequestAssessmentSchemaType) {
    React.startTransition(() => {
      submitRequestAssessment({ ...data, locale });
    });
  }

  const isSubmitting = form.formState.isSubmitting || isActionPending;

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  return (
    // <Card className="bg-muted-darker mx-auto w-full max-w-2xl p-8">
    <Card className="mx-auto w-full max-w-2xl bg-transparent p-8 shadow-md">
      <CardHeader className="p-0">
        <CardTitle>{t(`title`)}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <form
          id="request-assessment-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-full-name"
                    className="sr-only"
                  >
                    {t("fields.name.label")}
                  </FieldLabel>
                  <Input
                    {...field}
                    className=""
                    id="request-assessment-form-full-name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t(`fields.name.placeholder`)}
                    autoComplete="off"
                  />
                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="businessEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-business-email"
                    className="sr-only"
                  >
                    {t("fields.email.label")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="request-assessment-form-business-email"
                    aria-invalid={fieldState.invalid}
                    placeholder={t(`fields.email.placeholder`)}
                    autoComplete="off"
                  />
                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="aboutProject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-about-project"
                    className="sr-only"
                  >
                    {t(`fields.aboutProject.label`)}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="request-assessment-form-about-project"
                      placeholder={t(`fields.aboutProject.placeholder`)}
                      rows={6}
                      className="min-h-24 resize-none px-4 py-4"
                      aria-invalid={fieldState.invalid}
                    />

                    {!!field.value?.length && (
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {formatNumberByLocale(field.value?.length, locale)}/
                          {formatNumberByLocale(100, locale)}
                        </InputGroupText>
                      </InputGroupAddon>
                    )}
                  </InputGroup>

                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="services"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                  className="flex-col! items-stretch"
                >
                  <FieldContent>
                    <FieldLabel
                      htmlFor="request-assessment-form-budget"
                      className="text-base"
                    >
                      {t(`fields.service.label`)}
                      {/* <RequiredInputIcon className="-m-1" /> */}
                    </FieldLabel>
                    {fieldState.error?.message && (
                      <FieldError
                        errors={[
                          {
                            message: translateError(fieldState.error.message),
                          },
                        ]}
                      />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="request-assessment-form-budget"
                      aria-invalid={fieldState.invalid}
                      className="border-border h-auto w-full! min-w-30 px-4 py-5.5 text-sm dark:text-white"
                    >
                      <SelectValue
                        className="dark:text-white"
                        placeholder={t(`fields.budget.placeholder`)}
                      />
                    </SelectTrigger>
                    <SelectContent className="py-4" position="popper">
                      {SERVICE_KEYS.map((item) => (
                        <SelectItem value={item} key={item}>
                          {t(`fields.service.options.${item}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <Field orientation="horizontal" className="mt-12">
          <RadialRevealButton
            type="submit"
            form="request-assessment-form"
            className="h-auto w-full py-3 text-base"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingLabel={t("actions.submitting")}
          >
            {t("actions.sendMessage")}
          </RadialRevealButton>
        </Field>
      </CardContent>
    </Card>
  );
}
