"use client";

import * as React from "react";
import { Controller, FormProvider } from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { Button } from "@/components/ui/button";
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
import { REQUEST_ASSESSMENT_STEP_COUNT } from "@/lib/request-assessment/form-draft-storage";
import { SERVICE_VALUES } from "@/lib/zod-schemas/request-assessment-schema";
import { cn, formatNumberByLocale } from "@/lib/utils";

import { RequestAssessmentContactTabs } from "./request-assessment-contact-tabs";
import { RequestAssessmentFileUpload } from "./request-assessment-file-upload";
import { RequestAssessmentServiceFields } from "./request-assessment-service-fields";
import { useRequestAssessmentFormController } from "./use-request-assessment-form-controller";

const enterEase = [0.22, 1, 0.36, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

export type RequestAssessmentMultiStepFormProps = {
  formId: string;
  variant?: "card" | "embedded";
  className?: string;
  formClassName?: string;
  selectContentClassName?: string;
  submitButtonClassName?: string;
  onSubmitted?: () => void;
};

function RequestAssessmentProgress({ step }: { step: number }) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.steps",
  );
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        {t("progress", {
          current: formatNumberByLocale(step, locale),
          total: formatNumberByLocale(REQUEST_ASSESSMENT_STEP_COUNT, locale),
        })}
      </p>
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={REQUEST_ASSESSMENT_STEP_COUNT}
        aria-valuenow={step}
        aria-label={t("progressLabel")}
      >
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={false}
          animate={{
            width: `${(step / REQUEST_ASSESSMENT_STEP_COUNT) * 100}%`,
          }}
          transition={{ duration: 0.28, ease: enterEase }}
        />
      </div>
    </div>
  );
}

function StepPanel({
  stepKey,
  direction,
  children,
}: {
  stepKey: string;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = direction > 0 ? 16 : -16;

  return (
    <motion.div
      key={stepKey}
      initial={
        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: offset }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1, transition: { duration: 0.15 } }
          : {
              opacity: 1,
              x: 0,
              transition: { duration: 0.28, ease: enterEase },
            }
      }
      exit={
        prefersReducedMotion
          ? { opacity: 0, transition: { duration: 0.12 } }
          : {
              opacity: 0,
              x: -offset,
              transition: { duration: 0.2, ease: exitEase },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function RequestAssessmentMultiStepForm({
  formId,
  variant = "card",
  className,
  formClassName,
  selectContentClassName,
  submitButtonClassName,
  onSubmitted,
}: RequestAssessmentMultiStepFormProps) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );
  const locale = useLocale();

  const {
    form,
    step,
    stepDirection,
    hydrated,
    selectedService,
    verifiedChannel,
    accountPhone,
    accountEmail,
    isSignedIn,
    setVerifiedChannel,
    isSubmitting,
    translateError,
    goNext,
    goBack,
    onSubmit,
  } = useRequestAssessmentFormController({ onSubmitted });


  const stepTitle = t(`steps.titles.${step}` as "steps.titles.1");

  const formBody = (
    <>
      <CardHeader className={cn("gap-4 p-0", variant === "embedded" && "pb-0")}>
        <div className="flex flex-col gap-3">
          <CardTitle className="text-lg">{stepTitle}</CardTitle>
          <RequestAssessmentProgress step={step} />
        </div>
      </CardHeader>

      <CardContent className={cn("p-0", variant === "embedded" && "pt-4")}>
        {!hydrated && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {t("steps.loading")}
          </div>
        )}

        {hydrated && (
          <FormProvider {...form}>
            <form
              id={formId}
              className={cn("flex flex-col gap-4", formClassName)}
              onSubmit={(event) => {
                event.preventDefault();
              }}
              noValidate
            >
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 && (
                  <StepPanel stepKey="step-1" direction={stepDirection}>
                    <FieldGroup>
                      <Controller
                        name="fullName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor={`${formId}-full-name`}
                              className="sr-only"
                            >
                              {t("fields.name.label")}
                            </FieldLabel>
                            <Input
                              {...field}
                              id={`${formId}-full-name`}
                              aria-invalid={fieldState.invalid}
                              placeholder={t("fields.name.placeholder")}
                              autoComplete="name"
                              disabled={isSubmitting}
                            />
                            {!!fieldState.error?.message && (
                              <FieldError
                                errors={[
                                  {
                                    message: translateError(
                                      fieldState.error.message,
                                    ),
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
                        accountPhone={accountPhone}
                        accountEmail={accountEmail}
                        isSignedIn={isSignedIn}
                        onVerifiedChannelChange={setVerifiedChannel}
                      />

                      <Controller
                        name="aboutProject"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor={`${formId}-about-project`}
                              className="sr-only"
                            >
                              {t("fields.aboutProject.label")}
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupTextarea
                                {...field}
                                id={`${formId}-about-project`}
                                placeholder={t(
                                  "fields.aboutProject.placeholder",
                                )}
                                rows={4}
                                className="min-h-20 resize-none px-4 py-4"
                                aria-invalid={fieldState.invalid}
                                disabled={isSubmitting}
                              />
                              {!!field.value?.length && (
                                <InputGroupAddon align="block-end">
                                  <InputGroupText className="tabular-nums">
                                    {formatNumberByLocale(
                                      field.value.length,
                                      locale,
                                    )}
                                    /{formatNumberByLocale(1000, locale)}
                                  </InputGroupText>
                                </InputGroupAddon>
                              )}
                            </InputGroup>
                            {!!fieldState.error?.message && (
                              <FieldError
                                errors={[
                                  {
                                    message: translateError(
                                      fieldState.error.message,
                                    ),
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
                                htmlFor={`${formId}-service`}
                                className="text-base"
                              >
                                {t("fields.service.label")}
                              </FieldLabel>
                              {!!fieldState.error?.message && (
                                <FieldError
                                  errors={[
                                    {
                                      message: translateError(
                                        fieldState.error.message,
                                      ),
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
                                id={`${formId}-service`}
                                aria-invalid={fieldState.invalid}
                                className="border-border h-auto w-full! min-w-30 px-4 py-5.5 text-sm dark:text-white"
                              >
                                <SelectValue
                                  className="dark:text-white"
                                  placeholder={t("fields.service.placeholder")}
                                />
                              </SelectTrigger>
                              <SelectContent
                                className={cn("py-4", selectContentClassName)}
                                position="popper"
                              >
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
                    </FieldGroup>
                  </StepPanel>
                )}

                {step === 2 && (
                  <StepPanel stepKey="step-2" direction={stepDirection}>
                    <FieldGroup>
                      <RequestAssessmentServiceFields
                        control={form.control}
                        service={selectedService}
                        section="details"
                        disabled={isSubmitting}
                        translateError={translateError}
                      />
                    </FieldGroup>
                  </StepPanel>
                )}

                {step === 3 && (
                  <StepPanel stepKey="step-3" direction={stepDirection}>
                    <FieldGroup>
                      <RequestAssessmentServiceFields
                        control={form.control}
                        service={selectedService}
                        section="notes"
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
                                    message: translateError(
                                      fieldState.error.message,
                                    ),
                                  },
                                ]}
                              />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </StepPanel>
                )}
              </AnimatePresence>

              <Field orientation="horizontal" className="mt-8 gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 flex-1"
                    disabled={isSubmitting}
                    onClick={goBack}
                  >
                    {t("actions.back")}
                  </Button>
                )}

                {step < 3 ? (
                  <RadialRevealButton
                    key="request-assessment-continue"
                    type="button"
                    className={cn(
                      "h-auto min-h-11 flex-2 py-3 text-base",
                      submitButtonClassName,
                    )}
                    disabled={isSubmitting || (step === 1 && !verifiedChannel)}
                    onClick={() => {
                      void goNext();
                    }}
                  >
                    {t("actions.continue")}
                  </RadialRevealButton>
                ) : (
                  <RadialRevealButton
                    key="request-assessment-submit"
                    type="button"
                    className={cn(
                      "h-auto min-h-11 flex-2 py-3 text-base",
                      submitButtonClassName,
                    )}
                    disabled={isSubmitting || !verifiedChannel}
                    loading={isSubmitting}
                    loadingLabel={t("actions.submitting")}
                    onClick={() => {
                      void form.handleSubmit(onSubmit)();
                    }}
                  >
                    {t("actions.sendMessage")}
                  </RadialRevealButton>
                )}
              </Field>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </>
  );

  if (variant === "embedded") {
    return <div className={className}>{formBody}</div>;
  }

  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-2xl bg-transparent p-8 shadow-md",
        className,
      )}
    >
      {formBody}
    </Card>
  );
}
