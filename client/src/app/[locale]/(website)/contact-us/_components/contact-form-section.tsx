"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import {
  contactUsSchema,
  ContactUsSchemaType,
} from "@/lib/zod-schemas/contact-us-schema";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormErrorKey } from "@/lib/form-errors";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import Title from "@/components/common/title";
import { UploadCloudIcon } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

const SERVICE_KEYS = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

export type ContactFormSectionProps = object;

export default function ContactFormSection({}: ContactFormSectionProps) {
  const t = useTranslations("ContactUsPage.ContactFormSection");
  const tForm = useTranslations("ContactUsPage.ContactFormSection.form");
  const tFormErrors = useTranslations("FormErrors");

  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(contactUsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      website: "",
      activityBasin: "",
      files: [],
    },
  });

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  async function onSubmit(data: ContactUsSchemaType) {
    const uploadUrls: { fileName: string; downloadUrl: string }[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${getServerCoreApiBaseUrl()}/uploads/public`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            uploadUrls.push({
              fileName: result.data.fileName,
              downloadUrl: result.data.downloadUrl,
            });
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify({ ...data, attachments: uploadUrls }, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const filesChangeHandler = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <section className="w-full max-w-7xl px-5 py-4 lg:m-6 lg:w-[calc(100%-48px)] lg:rounded-lg lg:border">
      <Title className="text-[1.4rem] font-bold lg:text-[1.6rem]">
        {t(`title`)}
      </Title>
      <div className="bg-primary mt-2 h-0.5 w-30 lg:mt-3 lg:w-34" />
      <form
        className="mt-6 flex flex-col lg:mt-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="lg:grid lg:grid-cols-2">
          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation="responsive"
                data-invalid={fieldState.invalid}
                className="flex-col! items-start!"
              >
                <Label
                  htmlFor="contact-us-form-subject"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.subject.label")}
                  <RequiredInputIcon className="-m-1" />
                </Label>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="contact-us-form-subject"
                    aria-invalid={fieldState.invalid}
                    className="bg-muted h-12 w-full! min-w-30 px-4 py-5.5 dark:text-white"
                  >
                    <SelectValue
                      className="dark:text-white"
                      placeholder={tForm(`fields.subject.placeholder`)}
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="">
                    {SERVICE_KEYS.map((item) => (
                      <SelectItem value={item} key={item}>
                        {tForm(`fields.subject.options.${item}.label`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-full-name"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.fullName.label")}
                  <RequiredInputIcon className="-m-1" />
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-us-form-full-name"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="h-12"
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
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-business-email"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.email.label")}
                  <RequiredInputIcon className="-m-1" />
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-us-form-business-email"
                  aria-invalid={fieldState.invalid}
                  className="h-12"
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
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-phone"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.phone.label")}
                  <RequiredInputIcon className="-m-1" />
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-us-form-phone"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="h-12"
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
            name="website"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-website"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.website.label")}
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-us-form-website"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="h-12"
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
            name="activityBasin"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-activity-basin"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm("fields.activityBasin.label")}
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-us-form-activity-basin"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="h-12"
                />
              </Field>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="contact-us-form-message"
                  className="mb-1 flex items-start gap-1 text-xs lg:text-sm"
                >
                  {tForm(`fields.message.label`)}
                  <RequiredInputIcon className="-m-1" />
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="contact-us-form-message"
                    rows={8}
                    className="min-h-28 resize-none px-4 py-4 lg:min-h-30"
                    aria-invalid={fieldState.invalid}
                  />
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

          <UploadFileInput onFileChange={filesChangeHandler} />
        </FieldGroup>

        <Button className="ms-auto mt-4 h-12 w-full lg:w-auto lg:px-4">
          {tForm(`actions.sendMessage`)}
        </Button>
      </form>
    </section>
  );
}

type UploadFileInputProps = {
  onFileChange: (files: File[]) => void;
};

function UploadFileInput({ onFileChange }: UploadFileInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const t = useTranslations(
    "ContactUsPage.ContactFormSection.form.fields.fileUpload",
  );

  const clickHandler = () => {
    ref.current?.click();
  };

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;

    const files = e.target.files;
    onFileChange(Array.from(files));
  };

  return (
    <div className="col-span-2 mt-6 flex h-37 w-full flex-col items-center justify-between rounded border py-6">
      <p className="text-center text-xs">{t(`label`)}</p>
      <Button
        type="button"
        variant={"outline"}
        className="hover:text-primary h-12 text-xs font-bold hover:bg-transparent"
        onClick={clickHandler}
      >
        <UploadCloudIcon className="size-6" />
        {t(`buttonLabel`)}
      </Button>

      <input
        onChange={fileChangeHandler}
        type="file"
        multiple
        hidden
        ref={ref}
        accept="image/png, image/jpg, image/jpeg, video/mp4, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
    </div>
  );
}
