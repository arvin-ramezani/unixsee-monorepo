"use client";

import { type FormEvent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Paperclip,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type {
  ComplementaryService,
  ComplementaryServiceType,
  ConsultationEngagementPreference,
  ConsultationRequest,
  ServiceWebsite,
} from "@/lib/data/complementary-services/complementary-services-data";
import { cn } from "@/lib/utils";
import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";

const SEO_SCOPE_OPTIONS = [
  "technical",
  "audit",
  "content",
  "ongoing",
  "unsure",
] as const;
const DESIGN_SCOPE_OPTIONS = ["logo", "banner", "socialPost", "other"] as const;

type ServiceScopeOption =
  (typeof SEO_SCOPE_OPTIONS)[number] | (typeof DESIGN_SCOPE_OPTIONS)[number];

function getServiceScopeOptionKey(option: ServiceScopeOption) {
  return `options.${option}` as const;
}

export function ServiceTypeSelector({
  value,
  onChange,
  error,
}: {
  value: ComplementaryServiceType | "";
  onChange: (value: ComplementaryServiceType) => void;
  error?: string;
}) {
  const t = useTranslations("ComplementaryServices");
  const values: ComplementaryServiceType[] = [
    "seo",
    "graphic-design",
    "product-data-entry",
    "social-media-support",
  ];
  return (
    <fieldset aria-describedby={error ? "service-error" : undefined}>
      <legend className="text-sm font-medium">
        {t("form.service.label")} <span className="text-destructive">*</span>
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as ComplementaryServiceType)}
        className="mt-2 grid gap-2 sm:grid-cols-2"
      >
        {values.map((item) => (
          <Label
            key={item}
            htmlFor={`service-${item}`}
            className={cn(
              "border-border focus-within:ring-ring flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm focus-within:ring-2",
              value === item && "border-primary bg-accent",
            )}
          >
            <RadioGroupItem id={`service-${item}`} value={item} />
            {t(`services.${item}`)}
          </Label>
        ))}
      </RadioGroup>
      {error && (
        <p id="service-error" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function EngagementTypeSelector({
  value,
  onChange,
  error,
}: {
  value: ConsultationEngagementPreference | "";
  onChange: (value: ConsultationEngagementPreference) => void;
  error?: string;
}) {
  const t = useTranslations("ComplementaryServices");
  const values: ConsultationEngagementPreference[] = [
    "one-time",
    "recurring",
    "not-sure",
  ];
  return (
    <fieldset aria-describedby={error ? "engagement-error" : undefined}>
      <legend className="text-sm font-medium">
        {t("form.engagement.label")}{" "}
        <span className="text-destructive ms-0.5">*</span>
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(next) =>
          onChange(next as ConsultationEngagementPreference)
        }
        className="mt-2 grid gap-2 sm:grid-cols-3"
      >
        {values.map((item) => (
          <Label
            key={item}
            htmlFor={`engagement-${item}`}
            className={cn(
              "border-border focus-within:ring-ring flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm focus-within:ring-2",
              value === item && "border-primary bg-accent",
            )}
          >
            <RadioGroupItem id={`engagement-${item}`} value={item} />
            {t(`preferences.${item}`)}
          </Label>
        ))}
      </RadioGroup>
      {error && (
        <p id="engagement-error" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function ServiceSpecificFields({
  className,
  service,
  value,
  onChange,
}: {
  className?: string;
  service: ComplementaryServiceType | "";
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("ComplementaryServices.form.scope");

  if (!service) return null;

  if (service === "product-data-entry" || service === "social-media-support") {
    return (
      <Label
        htmlFor={service}
        className={cn("grid gap-2 text-sm font-medium", className)}
      >
        {t(service === "product-data-entry" ? "productCount" : "postCount")}
        <Input
          type="number"
          id={service}
          min={1}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11!"
        />
      </Label>
    );
  }

  const options = service === "seo" ? SEO_SCOPE_OPTIONS : DESIGN_SCOPE_OPTIONS;

  return (
    <Label
      className={cn("grid gap-2 text-sm font-medium", className)}
      htmlFor={service}
    >
      {t("label")}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={service} className="h-11! w-full">
          <SelectValue placeholder={t("placeholder")} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {t(getServiceScopeOptionKey(option))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Label>
  );
}

export function RequestServiceForm({
  websites,
  activeServices,
  requests,
  initialService = "",
  initialWebsite = "",
  previewState,
}: {
  websites: ServiceWebsite[];
  activeServices: ComplementaryService[];
  requests: ConsultationRequest[];
  initialService?: ComplementaryServiceType | "";
  initialWebsite?: string;
  previewState?: string;
}) {
  const t = useTranslations("ComplementaryServices");
  const [service, setService] = useState<ComplementaryServiceType | "">(
    initialService,
  );
  const [website, setWebsite] = useState(initialWebsite);
  const [engagement, setEngagement] = useState<
    ConsultationEngagementPreference | ""
  >("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(previewState === "submitting");
  const [success, setSuccess] = useState(previewState === "success");
  const duplicate = Boolean(
    service &&
    website &&
    (activeServices.some(
      (item) =>
        item.websiteId === website &&
        item.serviceType === service &&
        item.status === "active",
    ) ||
      requests.some(
        (item) =>
          item.websiteId === website &&
          item.serviceType === service &&
          item.status === "requested",
      )),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!service) nextErrors.service = t("form.errors.service");
    if (!website) nextErrors.website = t("form.errors.website");
    if (!engagement) nextErrors.engagement = t("form.errors.engagement");
    if (!title.trim()) nextErrors.title = t("form.errors.title");
    if (description.trim().length < 20)
      nextErrors.description = t("form.errors.description");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 650);
  }

  function addFiles(fileList: FileList | null) {
    const next = Array.from(fileList ?? []);
    const invalid = next.find(
      (file) =>
        file.size > 5 * 1024 * 1024 ||
        ![
          "image/png",
          "image/jpeg",
          "image/webp",
          "application/pdf",
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type),
    );
    if (invalid) {
      setFileError(t("form.attachments.invalid"));
      return;
    }
    setFileError("");
    setFiles((current) => [...current, ...next].slice(0, 5));
  }

  if (success)
    return (
      <Panel
        className="grid min-h-96 place-items-center p-6 text-center"
        aria-live="polite"
      >
        <div className="">
          <span className="bg-success/10 mx-auto grid size-14 place-items-center rounded-full">
            <CheckCircle2
              aria-hidden="true"
              className="text-success-foreground size-7"
            />
          </span>
          <h1 className="mt-5 text-2xl font-semibold">
            {t("form.success.title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("form.success.description")}
          </p>
          <Link
            href={{
              pathname: "/dashboard/complementary-services",
              query: { tab: "requests" },
            }}
            className="bg-primary text-primary-foreground focus-visible:ring-ring mt-6 inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium focus-visible:ring-2"
          >
            {t("form.success.action")}
          </Link>
        </div>
      </Panel>
    );

  return (
    <form onSubmit={submit} noValidate>
      <Panel className="p-5 sm:p-6">
        <div className="grid gap-6">
          <ServiceTypeSelector
            value={service}
            onChange={(value) => {
              setService(value);
              setScope("");
              setErrors((current) => ({ ...current, service: "" }));
            }}
            error={errors.service}
          />
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
            <Label className="inline-block w-full flex-1 gap-2 text-sm font-medium">
              {t("form.website.label")}
              <span className="text-destructive">*</span>
              <Select
                value={website}
                onValueChange={(next) => {
                  setWebsite(next);
                  setErrors((current) => ({ ...current, website: "" }));
                }}
              >
                <SelectTrigger
                  className="mt-2 h-11! w-full"
                  aria-invalid={Boolean(errors.website)}
                  aria-describedby={
                    errors.website ? "website-error" : undefined
                  }
                >
                  <SelectValue placeholder={t("form.website.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {websites.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} — {item.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.website && (
                <span id="website-error" className="text-destructive text-xs">
                  {errors.website}
                </span>
              )}
            </Label>
            <ServiceSpecificFields
              className="mt-6 flex-1 lg:mt-0"
              service={service}
              value={scope}
              onChange={setScope}
            />
          </div>
          {duplicate && (
            <Alert className="border-warning/35 bg-warning/10 flex">
              <AlertTriangle
                aria-hidden="true"
                className="text-warning-foreground dark:stroke-warning mt-0.5 size-4! shrink-0 lg:size-6!"
              />
              <div className="">
                <AlertTitle>{t("form.duplicate.title")}</AlertTitle>
                <AlertDescription className="mt-1 leading-6">
                  {t("form.duplicate.description")}
                </AlertDescription>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 lg:ms-auto lg:flex-col lg:items-start">
                <DashboardButtonLink
                  href="/dashboard/complementary-services"
                  // className="border-border bg-background inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium"
                >
                  {t("form.duplicate.view")}
                </DashboardButtonLink>
                <span className="text-muted-foreground inline-flex min-h-10 items-center text-xs">
                  {t("form.duplicate.continue")}
                </span>
              </div>
            </Alert>
          )}

          <EngagementTypeSelector
            value={engagement}
            onChange={(value) => {
              setEngagement(value);
              setErrors((current) => ({ ...current, engagement: "" }));
            }}
            error={errors.engagement}
          />

          <Label className="inline-block gap-2 text-sm font-medium">
            {t("form.title.label")}{" "}
            <span className="text-destructive ms-0.5">*</span>
            <Input
              value={title}
              maxLength={100}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((current) => ({ ...current, title: "" }));
              }}
              placeholder={t("form.title.placeholder")}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={!!errors.title ? "title-error" : undefined}
              className="mt-1 h-11 placeholder:text-sm"
            />
            {!!errors.title && (
              <span id="title-error" className="text-destructive text-xs">
                {errors.title}
              </span>
            )}
          </Label>
          <Label className="inline-block gap-2 text-sm font-medium">
            {t("form.description.label")}{" "}
            <span className="text-destructive ms-0.5">*</span>
            <Textarea
              value={description}
              maxLength={800}
              rows={6}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((current) => ({ ...current, description: "" }));
              }}
              placeholder={t("form.description.placeholder")}
              aria-invalid={Boolean(errors.description)}
              aria-describedby="description-hint description-error"
              className="app-scrollbar mt-1 min-h-24 resize-y px-3 py-3"
            />
            <span className="text-muted-foreground mt-1.5 flex justify-between gap-4 text-xs">
              <span
                id="description-error"
                className={errors.description ? "text-destructive" : undefined}
              >
                {errors.description || t("form.description.hint")}
              </span>
              <span className="tabular-nums">{description.length}/800</span>
            </span>
          </Label>
          <div>
            <span className="text-sm font-medium">
              {t("form.attachments.label")}
            </span>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("form.attachments.hint")}
            </p>
            <Label className="border-border hover:bg-muted focus-within:ring-ring dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-link/12 mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm focus-within:ring-2 ltr:font-medium">
              <Paperclip aria-hidden="true" className="size-4" />
              {t("form.attachments.add")}
              <Input
                type="file"
                multiple
                className="absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
                onChange={(event) => addFiles(event.target.files)}
              />
            </Label>
            {!!fileError && (
              <p className="text-destructive mt-2 text-xs">{fileError}</p>
            )}
            {!!files.length && (
              <ul className="mt-3 grid gap-2">
                {files.map((file) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="bg-muted flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm"
                  >
                    <FileText aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate" dir="auto">
                      {file.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {Math.ceil(file.size / 1024)} KB
                    </span>
                    <Button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((item) => item !== file),
                        )
                      }
                      aria-label={t("form.attachments.remove", {
                        name: file.name,
                      })}
                      variant="ghost"
                      size="icon-sm"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-start">
        <DashboardButton
          type="submit"
          size="xl"
          disabled={submitting}
          className=""
        >
          {submitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              {t("form.submitting")}
            </>
          ) : (
            t("form.submit")
          )}
          {/* {submitting ? t("form.submitting") : t("form.submit")} */}
        </DashboardButton>
        <DashboardButtonLink
          variant="outline"
          size="xl"
          revealClassName="bg-muted dark:bg-accent"
          href="/dashboard/complementary-services"
          className="hover:text-foreground! border-border"
          // className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
        >
          {t("form.cancel")}
        </DashboardButtonLink>
      </div>
    </form>
  );
}
