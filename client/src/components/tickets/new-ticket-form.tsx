"use client";

import { type FormEvent, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";
import { createTicketAction } from "@/actions/tickets/create-ticket";
import { Panel } from "@/components/dashboard/panel";
import { Label } from "@/components/ui/label";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type {
  TicketServiceCatalogItem,
  TicketServiceCategory,
  TicketWebsiteRef,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<
  Record<"service" | "website" | "subject" | "description" | "form", string>
>;

const controlClassName =
  "w-full h-11! border border-border bg-background px-4 text-base shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_6%,transparent)] outline-none transition-[border-color,box-shadow,background-color] hover:border-ring/55 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/10 sm:text-sm";

const WEBSITE_NONE_VALUE = "__none__";

export function NewTicketForm({
  services,
  websites,
  initialWebsiteId,
  loadError,
}: {
  services: TicketServiceCatalogItem[];
  websites: TicketWebsiteRef[];
  initialWebsiteId?: string;
  loadError?: "unavailable";
}) {
  const t = useTranslations("Tickets.new");
  const serviceT = useTranslations("Tickets.services");
  const tApiErrors = useTranslations("ApiErrors");
  const router = useRouter();
  const [service, setService] = useState<"" | TicketServiceCategory>("");
  const [website, setWebsite] = useState(initialWebsiteId ?? "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!service) nextErrors.service = t("errors.service");
    if (!subject.trim()) nextErrors.subject = t("errors.subject");
    if (description.trim().length < 20)
      nextErrors.description = t("errors.description");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate() || !service) return;
    setSubmitting(true);
    setErrors({});

    const result = await createTicketAction({
      service,
      subject,
      description,
      ...(website ? { websiteId: website } : {}),
    });

    if (!result.ok) {
      toastMappedApiError(result.error, tApiErrors);
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard/tickets/${result.data.id}`);
    router.refresh();
  }

  if (loadError || services.length === 0) {
    return (
      <Panel className="grid min-h-60 place-items-center px-6 text-center">
        <div className="max-w-md">
          <span className="bg-warning/15 text-warning-foreground mx-auto grid size-12 place-items-center rounded-full">
            <AlertCircle aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">{t("loadErrorTitle")}</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("loadErrorDescription")}
          </p>
          <DashboardButtonLink
            href="/dashboard/tickets"
            variant="outline"
            className="mt-5 min-h-10"
          >
            {t("back")}
          </DashboardButtonLink>
        </div>
      </Panel>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid w-full items-start gap-5 pb-8 xl:grid-cols-2"
    >
      <Panel className="min-w-0 self-start overflow-hidden">
        <div className="border-border bg-muted/20 flex items-start gap-3 border-b px-5 py-5 sm:px-6">
          <span className="border-border dark:bg-link/12 dark:text-link bg-background text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl border">
            <ClipboardList aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">{t("context.title")}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t("context.description")}
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="3xl:grid-cols-2 mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <Field
              htmlFor="ticket-service"
              label={t("service.label")}
              hint={t("service.hint")}
              error={errors.service}
              required
            >
              <Select
                value={service}
                onValueChange={(value) => {
                  setService(value as TicketServiceCategory);
                  setErrors((current) => ({
                    ...current,
                    service: undefined,
                    website: undefined,
                    form: undefined,
                  }));
                }}
              >
                <SelectTrigger
                  id="ticket-service"
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={
                    errors.service ? "ticket-service-error" : undefined
                  }
                  className={`${controlClassName} text-start`}
                >
                  <SelectValue placeholder={t("service.placeholder")} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {services.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {serviceT(item.code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              htmlFor="ticket-website"
              label={t("website.label")}
              hint={t("website.optionalHint")}
              error={errors.website}
            >
              <Select
                value={website || WEBSITE_NONE_VALUE}
                onValueChange={(value) => {
                  setWebsite(value === WEBSITE_NONE_VALUE ? "" : value);
                  setErrors((current) => ({
                    ...current,
                    website: undefined,
                    form: undefined,
                  }));
                }}
                disabled={websites.length === 0}
              >
                <SelectTrigger
                  id="ticket-website"
                  aria-invalid={Boolean(errors.website)}
                  aria-describedby={
                    errors.website
                      ? "ticket-website-error"
                      : "ticket-website-hint"
                  }
                  className={`${controlClassName} text-start`}
                >
                  <SelectValue
                    placeholder={
                      websites.length === 0
                        ? t("website.emptyPlaceholder")
                        : t("website.placeholder")
                    }
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={WEBSITE_NONE_VALUE}>
                    {t("website.none")}
                  </SelectItem>
                  {websites.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.name} — {value.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field
            htmlFor="ticket-subject"
            label={t("subject.label")}
            error={errors.subject}
            required
            className="md:col-span-2 xl:col-span-1"
          >
            <Textarea
              id="ticket-subject"
              rows={7}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setErrors((current) => ({
                  ...current,
                  subject: undefined,
                  form: undefined,
                }));
              }}
              placeholder={t("subject.placeholder")}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "ticket-subject-error" : undefined
              }
              className="border-border bg-background placeholder:text-muted-foreground hover:border-ring/55 focus-visible:border-ring focus-visible:ring-ring/15 aria-invalid:border-destructive aria-invalid:ring-destructive/10 min-h-11! w-full resize-none rounded-xl border px-4 py-3 text-base leading-7 shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_6%,transparent)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-3 aria-invalid:ring-3 sm:text-sm rtl:placeholder:font-light"
            />
          </Field>
        </div>
      </Panel>

      <Panel className="min-w-0 overflow-hidden">
        <div className="border-border bg-muted/20 flex items-start gap-3 border-b px-5 py-5 sm:px-6">
          <span className="border-border bg-background dark:bg-link/12 dark:text-link text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl border">
            <MessageSquareText aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">{t("details.title")}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t("details.description")}
            </p>
          </div>
        </div>
        <div className="space-y-6 p-5 sm:p-6">
          <Field
            htmlFor="ticket-description"
            label={t("descriptionField.label")}
            hint={t("descriptionField.hint")}
            error={errors.description}
            required
          >
            <Textarea
              id="ticket-description"
              rows={7}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((current) => ({
                  ...current,
                  description: undefined,
                  form: undefined,
                }));
              }}
              placeholder={t("descriptionField.placeholder")}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? "ticket-description-error"
                  : "ticket-description-hint"
              }
              className="border-border bg-background placeholder:text-muted-foreground hover:border-ring/55 focus-visible:border-ring focus-visible:ring-ring/15 aria-invalid:border-destructive aria-invalid:ring-destructive/10 min-h-24 w-full resize-y rounded-xl border px-4 py-3 text-base leading-7 shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_6%,transparent)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-3 aria-invalid:ring-3 sm:text-sm rtl:placeholder:font-light"
            />
          </Field>
          <Field
            label={t("attachments.label")}
            hint={t("attachments.unavailableHint")}
          >
            <div className="border-border bg-muted/20 text-muted-foreground flex min-h-16 w-fit items-center justify-center gap-2 rounded-[12px] border border-dashed px-4 text-sm font-medium opacity-70">
              <Paperclip aria-hidden="true" className="size-4" />
              {t("attachments.unavailable")}
            </div>
          </Field>
        </div>
        <div className="border-border bg-muted/10 flex flex-col gap-3 border-t px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <DashboardButton
            type="submit"
            size="xl"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring/30 inline-flex w-full items-center justify-center gap-2 px-6 text-sm font-medium shadow-sm transition-colors focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {submitting ? t("submitting") : t("submit")}
          </DashboardButton>

          <DashboardButtonLink
            variant="outline"
            size="xl"
            href="/dashboard/tickets"
            revealClassName="bg-accent"
            className="border-border hover:bg-muted focus-visible:ring-ring/20 inline-flex w-full items-center justify-center border px-5 text-sm font-medium transition-colors focus-visible:ring-3 sm:w-auto"
          >
            {t("cancel")}
          </DashboardButtonLink>
        </div>
      </Panel>
    </form>
  );
}

function Field({
  htmlFor,
  label,
  hint,
  error,
  required,
  className,
  labelClassName,
  children,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}) {
  const labelContent = (
    <>
      {label}
      {required && (
        <span aria-hidden="true" className="text-destructive ms-1">
          *
        </span>
      )}
    </>
  );

  return (
    <div className={className}>
      {htmlFor ? (
        <Label
          htmlFor={htmlFor}
          className={cn("inline-block text-sm font-medium", labelClassName)}
        >
          {labelContent}
        </Label>
      ) : (
        <p className="text-sm font-medium">{labelContent}</p>
      )}
      {!!hint && (
        <p
          id={htmlFor ? `${htmlFor}-hint` : undefined}
          className="text-muted-foreground mt-1 text-xs leading-5"
        >
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {!!error && (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="text-destructive mt-2 flex items-center gap-1.5 text-xs"
        >
          <AlertCircle aria-hidden="true" className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
