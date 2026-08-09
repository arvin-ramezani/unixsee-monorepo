"use client";

import { type FormEvent, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import type {
  TicketService,
  TicketWebsite,
} from "@/lib/data/tickets/ticket-records";
import { cn } from "@/lib/utils";
import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";

type FieldErrors = Partial<
  Record<"service" | "website" | "subject" | "description", string>
>;

const controlClassName =
  "w-full h-11! border border-border bg-background px-4 text-base shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_6%,transparent)] outline-none transition-[border-color,box-shadow,background-color] hover:border-ring/55 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/10 sm:text-sm";

const websiteRequiredServices: TicketService[] = [
  "managed_server",
  "migration_optimization",
  "woocommerce_support",
  "seo",
  "product_data_entry",
];

export function NewTicketForm({
  services,
  websites,
}: {
  services: TicketService[];
  websites: TicketWebsite[];
}) {
  const t = useTranslations("Tickets.new");
  const serviceT = useTranslations("Tickets.services");
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [service, setService] = useState<"" | TicketService>("");
  const [website, setWebsite] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const requiresWebsite = service
    ? websiteRequiredServices.includes(service)
    : false;

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!service) nextErrors.service = t("errors.service");
    if (requiresWebsite && !website) nextErrors.website = t("errors.website");
    if (!subject.trim()) nextErrors.subject = t("errors.subject");
    if (description.trim().length < 20)
      nextErrors.description = t("errors.description");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => router.push("/dashboard/tickets/TCK-1052"), 650);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid w-full items-start gap-5 pb-8 xl:grid-cols-2"
      // className="grid w-full items-start gap-5 pb-8 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]"
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
              labelClassName=""
              error={errors.service}
              required
            >
              <Select
                value={service}
                onValueChange={(value) => {
                  setService(value as TicketService);
                  setErrors((value) => ({
                    ...value,
                    service: undefined,
                    website: undefined,
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
                  {services.map((value) => (
                    <SelectItem key={value} value={value}>
                      {serviceT(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              htmlFor="ticket-website"
              label={t("website.label")}
              hint={
                requiresWebsite
                  ? t("website.requiredHint")
                  : t("website.optionalHint")
              }
              error={errors.website}
              required={requiresWebsite}
            >
              <Select
                value={website}
                onValueChange={(value) => {
                  setWebsite(value);
                  setErrors((value) => ({ ...value, website: undefined }));
                }}
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
                  <SelectValue placeholder={t("website.placeholder")} />
                </SelectTrigger>
                <SelectContent position="popper">
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
                setErrors((value) => ({ ...value, subject: undefined }));
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
                setErrors((value) => ({ ...value, description: undefined }));
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
          <Field label={t("attachments.label")} hint={t("attachments.hint")}>
            <Label className="border-border bg-muted/20 hover:border-ring/55 hover:bg-muted/50 dark:hover:bg-accent/50 focus-within:border-ring focus-within:ring-ring/15 flex min-h-16 w-fit cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed px-4 text-sm font-medium transition-[border-color,background-color] focus-within:ring-3">
              <Paperclip aria-hidden="true" className="size-4" />
              {t("attachments.choose")}
              <Input
                type="file"
                multiple
                className="absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
                onChange={(event) =>
                  setAttachments(Array.from(event.target.files ?? []))
                }
              />
            </Label>
            <ul className={cn("space-y-2", attachments.length > 0 && "mt-3")}>
              <AnimatePresence initial={false} mode="popLayout">
                {attachments.map((file, index) => (
                  <motion.li
                    key={`${file.name}-${file.size}`}
                    layout={!prefersReducedMotion}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8, scale: 0.98 }
                    }
                    animate={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={
                      prefersReducedMotion
                        ? {
                            opacity: 0,
                            height: 0,
                            marginBottom: 0,
                            transition: { duration: 0.12 },
                          }
                        : {
                            opacity: 0,
                            height: 0,
                            marginBottom: 0,
                            scale: 0.98,
                            transition: { duration: 0.18, ease: "easeOut" },
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.15 }
                        : {
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                            delay: index * 0.05,
                            layout: {
                              duration: 0.25,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          }
                    }
                    className="border-border bg-muted/40 flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm"
                  >
                    <Paperclip
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                    <span className="min-w-0 flex-1 truncate" dir="auto">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      onClick={() =>
                        setAttachments((files) =>
                          files.filter((item) => item !== file),
                        )
                      }
                      aria-label={t("attachments.remove", {
                        name: file.name,
                      })}
                      className="hover:bg-background focus-visible:ring-ring grid size-9 place-items-center rounded-lg focus-visible:ring-2"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
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
