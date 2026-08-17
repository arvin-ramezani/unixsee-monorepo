"use client";

import * as React from "react";

import { useActionState } from "react";

import { FormProvider, Controller, useWatch } from "react-hook-form";

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

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getDefaultServiceDetails,
  getRequestAssessmentDefaultValues,
  requestAssessmentSchema,
  SERVICE_VALUES,
  type RequestAssessmentSchemaType,
} from "@/lib/zod-schemas/request-assessment-schema";

import { FormErrorKey } from "@/lib/form-errors";

import { formatNumberByLocale } from "@/lib/utils";

import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";

import {
  createRequestAssessmentAction,
  type RequestAssessmentActionMessageKey,
} from "@/actions/request-assessment-action";

import { initialServerActionState } from "@/types/server-action-state";

import {
  RequestAssessmentContactTabs,
  type ContactOtpChannel,
} from "./request-assessment-contact-tabs";

import { RequestAssessmentFileUpload } from "./request-assessment-file-upload";

import { RequestAssessmentServiceFields } from "./request-assessment-service-fields";

export type RequestAssessmentFormType = object;

export default function RequestAssessmentForm({}: RequestAssessmentFormType) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );

  const tFormErrors = useTranslations("FormErrors");

  const tActionMessages = useTranslations(
    "ServerActionMessages.requestAssessment",
  );

  const tContact = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.contact",
  );

  const locale = useLocale();

  const form = useForm<RequestAssessmentSchemaType>({
    resolver: zodResolver(requestAssessmentSchema),

    defaultValues: getRequestAssessmentDefaultValues(),
  });

  const [verifiedChannel, setVerifiedChannel] =
    React.useState<ContactOtpChannel | null>(null);

  const selectedService = useWatch({
    control: form.control,

    name: "services",
  });

  const previousServiceRef = React.useRef(selectedService);

  React.useEffect(() => {
    if (previousServiceRef.current === selectedService) {
      return;
    }

    form.setValue("serviceDetails", getDefaultServiceDetails());

    form.clearErrors("serviceDetails");

    previousServiceRef.current = selectedService;
  }, [form, selectedService]);

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

      form.reset(getRequestAssessmentDefaultValues());

      setVerifiedChannel(null);

      return;
    }

    toast.error(message);
  }, [actionState, form, tActionMessages]);

  function onSubmit(data: RequestAssessmentSchemaType) {
    if (!verifiedChannel) {
      toast.error(tContact("verifyContactFirst"));

      return;
    }

    if (verifiedChannel !== data.preferredContact) {
      toast.error(tContact("verifyPreferredContact"));

      return;
    }

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
    <Card className="mx-auto w-full max-w-2xl bg-transparent p-8 shadow-md">
      <CardHeader className="p-0">
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <FormProvider {...form}>
          <form
            id="request-assessment-form"

            onSubmit={form.handleSubmit(onSubmit)}

            noValidate
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

                      id="request-assessment-form-full-name"

                      aria-invalid={fieldState.invalid}

                      placeholder={t("fields.name.placeholder")}

                      autoComplete="name"

                      disabled={isSubmitting}
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

              <RequestAssessmentContactTabs
                control={form.control}

                disabled={isSubmitting}

                translateError={translateError}

                verifiedChannel={verifiedChannel}

                onVerifiedChannelChange={setVerifiedChannel}
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
                      {t("fields.aboutProject.label")}
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        {...field}

                        id="request-assessment-form-about-project"

                        placeholder={t("fields.aboutProject.placeholder")}

                        rows={6}

                        className="min-h-24 resize-none px-4 py-4"

                        aria-invalid={fieldState.invalid}

                        disabled={isSubmitting}
                      />

                      {!!field.value?.length && (
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {formatNumberByLocale(field.value.length, locale)}/
                            {formatNumberByLocale(1000, locale)}
                          </InputGroupText>
                        </InputGroupAddon>
                      )}
                    </InputGroup>

                    {!!fieldState.error?.message && (
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
                        htmlFor="request-assessment-form-service"

                        className="text-base"
                      >
                        {t("fields.service.label")}
                      </FieldLabel>

                      {!!fieldState.error?.message && (
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

                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="request-assessment-form-service"

                        aria-invalid={fieldState.invalid}

                        className="border-border h-auto w-full! min-w-30 px-4 py-5.5 text-sm dark:text-white"
                      >
                        <SelectValue
                          className="dark:text-white"

                          placeholder={t("fields.service.placeholder")}
                        />
                      </SelectTrigger>

                      <SelectContent className="py-4" position="popper">
                        {SERVICE_VALUES.map((item) => (
                          <SelectItem value={item} key={item}>
                            {t(`fields.service.options.${item}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <RequestAssessmentServiceFields
                control={form.control}

                service={selectedService}

                disabled={isSubmitting}

                translateError={translateError}
              />

              <Controller
                name="attachments"

                control={form.control}

                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <RequestAssessmentFileUpload
                      files={field.value ?? []}

                      disabled={isSubmitting}

                      error={translateError(fieldState.error?.message)}

                      onChange={field.onChange}
                    />

                    {!!fieldState.error?.message && (
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
            </FieldGroup>
          </form>
        </FormProvider>

        <Field orientation="horizontal" className="mt-12">
          <RadialRevealButton
            type="submit"

            form="request-assessment-form"

            className="h-auto w-full py-3 text-base"

            disabled={isSubmitting || !verifiedChannel}

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
