"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { toast } from "sonner";

import { submitContactMessageAction } from "@/actions/contact-message-actions";
import { PhoneInput } from "@/components/common/phone-input";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import Title from "@/components/common/title";
import SubTitle from "@/components/common/subtitle";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import type { FormErrorKey } from "@/lib/form-errors";
import { cn } from "@/lib/utils";
import {
  contactUsSchema,
  SERVICE_VALUES,
  type ContactUsSchemaType,
} from "@/lib/zod-schemas/contact-us-schema";
import type { ApiResponse } from "@/types/auth.types";
import { ContactFileUpload } from "./contact-file-upload";

/** Navy-tinted edge on the cyan card so fields don't read as white outlines. */
const contactControlClassName =
  "border-ring bg-muted dark:border-border dark:bg-input/30";

export type ContactFormSectionProps = {
  id?: string;
};

type TranslateError = (message?: string) => string | undefined;

type PublicUploadResult = {
  storageKey: string;
};

export default function ContactFormSection({ id }: ContactFormSectionProps) {
  const t = useTranslations("ContactUsPage.ContactFormSection");
  const tForm = useTranslations("ContactUsPage.ContactFormSection.form");
  const tFormErrors = useTranslations("FormErrors");
  const locale = useLocale();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(contactUsSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "" as unknown as ContactUsSchemaType["subject"],
      message: "",
      website: "",
      activityBasin: "",
      files: [],
    },
  });

  const translateError: TranslateError = (message) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ContactUsSchemaType) {
    const attachmentKeys: string[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${getServerCoreApiBaseUrl()}/uploads/public`, {
          method: "POST",
          body: formData,
        });
        const payload = (await res
          .json()
          .catch(() => null)) as ApiResponse<PublicUploadResult> | null;

        if (!res.ok || !payload?.success || !payload.data?.storageKey) {
          toast.error(tForm("toast.error"));
          return;
        }

        attachmentKeys.push(payload.data.storageKey);
      } catch {
        toast.error(tForm("toast.error"));
        return;
      }
    }

    const result = await submitContactMessageAction({
      subject: values.subject,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      website: values.website,
      activityBasin: values.activityBasin,
      message: values.message,
      attachmentKeys,
      locale: locale === "en" ? "en" : "fa",
      source: "contact-us",
    });

    if (!result.ok) {
      toast.error(tForm("toast.error"));
      return;
    }

    toast.success(tForm("toast.success"));
    form.reset();
    setSelectedFiles([]);
  }

  return (
    <section
      id={id}
      className="border-border bg-card w-full scroll-mt-28 rounded-xl border p-6 md:p-8"
    >
      {/*
        Not wrapped in RevealOnScroll: this is the above-the-fold primary block
        (same rule as AboutUs PositioningSection). Hiding it until hydration
        would delay the form the page must show immediately.
      */}
      <Title as="h2" className="text-[1.4rem] font-bold lg:text-[1.6rem]">
        {t("title")}
      </Title>

      <form
        noValidate
        className="mt-6 flex flex-col lg:mt-8"
        onSubmit={form.handleSubmit(onSubmit)}
        aria-busy={isSubmitting || undefined}
      >
        <FieldGroup className="sm:grid sm:grid-cols-2 sm:items-start">
          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => {
              const errorId = "contact-us-form-subject-error";
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="contact-us-form-subject"
                    className="mb-1 flex items-start gap-1"
                  >
                    {tForm("fields.subject.label")}
                    <RequiredInputIcon />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value ? field.value : undefined}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="contact-us-form-subject"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? errorId : undefined
                      }
                      className={cn(
                        "h-12! w-full min-w-0 px-4",
                        contactControlClassName,
                      )}
                    >
                      <SelectValue
                        placeholder={tForm("fields.subject.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SERVICE_VALUES.map((item) => (
                        <SelectItem value={item} key={item}>
                          {tForm(`fields.subject.options.${item}.label`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError
                      id={errorId}
                      errors={[
                        {
                          message: translateError(fieldState.error?.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              );
            }}
          />

          <ContactTextField
            name="fullName"
            control={form.control}
            translateError={translateError}
            label={tForm("fields.fullName.label")}
            placeholder={tForm("fields.fullName.placeholder")}
            autoComplete="name"
            required
            disabled={isSubmitting}
            id="contact-us-form-full-name"
          />

          <ContactTextField
            name="email"
            control={form.control}
            translateError={translateError}
            label={tForm("fields.email.label")}
            placeholder={tForm("fields.email.placeholder")}
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            required
            disabled={isSubmitting}
            id="contact-us-form-business-email"
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => {
              const errorId = "contact-us-form-phone-error";
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="contact-us-form-phone"
                    className="mb-1 flex items-start gap-1"
                  >
                    {tForm("fields.phone.label")}
                    <RequiredInputIcon />
                  </FieldLabel>
                  <PhoneInput
                    id="contact-us-form-phone"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={tForm("fields.phone.placeholder")}
                    autoComplete="tel-national"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? errorId : undefined}
                    aria-required
                    triggerClassName={contactControlClassName}
                    inputClassName={contactControlClassName}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={errorId}
                      errors={[
                        {
                          message: translateError(fieldState.error?.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              );
            }}
          />

          <ContactTextField
            name="website"
            control={form.control}
            translateError={translateError}
            label={tForm("fields.website.label")}
            placeholder={tForm("fields.website.placeholder")}
            optionalLabel={tForm("optional")}
            type="url"
            inputMode="url"
            autoComplete="url"
            dir="ltr"
            disabled={isSubmitting}
            id="contact-us-form-website"
          />

          <ContactTextField
            name="activityBasin"
            control={form.control}
            translateError={translateError}
            label={tForm("fields.activityBasin.label")}
            placeholder={tForm("fields.activityBasin.placeholder")}
            optionalLabel={tForm("optional")}
            autoComplete="organization-title"
            disabled={isSubmitting}
            id="contact-us-form-activity-basin"
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => {
              const errorId = "contact-us-form-message-error";
              return (
                <Field className="col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="contact-us-form-message"
                    className="mb-1 flex items-start gap-1"
                  >
                    {tForm("fields.message.label")}
                    <RequiredInputIcon />
                  </FieldLabel>
                  <InputGroup className={contactControlClassName}>
                    <InputGroupTextarea
                      {...field}
                      id="contact-us-form-message"
                      rows={8}
                      disabled={isSubmitting}
                      placeholder={tForm("fields.message.placeholder")}
                      className="min-h-28 resize-none border-0 px-4 py-4 shadow-none lg:min-h-32"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? errorId : undefined
                      }
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError
                      id={errorId}
                      errors={[
                        {
                          message: translateError(fieldState.error?.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              );
            }}
          />

          <ContactFileUpload
            files={selectedFiles}
            disabled={isSubmitting}
            onChange={setSelectedFiles}
            controlClassName={contactControlClassName}
          />
        </FieldGroup>

        <RadialRevealButton
          type="submit"
          loading={isSubmitting}
          loadingLabel={tForm("actions.sending")}
          className="ms-auto mt-6 h-12 w-full sm:w-auto sm:px-8"
        >
          {tForm("actions.sendMessage")}
        </RadialRevealButton>
      </form>
    </section>
  );
}

type ContactTextFieldProps = {
  name: "fullName" | "email" | "website" | "activityBasin";
  control: Control<ContactUsSchemaType>;
  translateError: TranslateError;
  label: string;
  placeholder?: string;
  optionalLabel?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  inputMode?: ComponentProps<"input">["inputMode"];
  autoComplete?: string;
  dir?: "ltr" | "rtl" | "auto";
  id: string;
};

function ContactTextField({
  name,
  control,
  translateError,
  label,
  placeholder,
  optionalLabel,
  required,
  disabled,
  type = "text",
  inputMode,
  autoComplete,
  dir,
  id,
}: ContactTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id} className="mb-1 flex items-start gap-1">
            {label}
            {required && <RequiredInputIcon />}
            {!!optionalLabel && !required && (
              <span className="text-muted-foreground font-normal">
                ({optionalLabel})
              </span>
            )}
          </FieldLabel>
          <Input
            {...field}
            id={id}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            dir={dir}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? errorId : undefined}
            className={cn("h-12", contactControlClassName)}
          />
          {fieldState.invalid && (
            <FieldError
              id={errorId}
              errors={[
                {
                  message: translateError(fieldState.error?.message),
                },
              ]}
            />
          )}
        </Field>
      )}
    />
  );
}
