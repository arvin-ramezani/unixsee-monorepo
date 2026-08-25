"use client";

import { type FormEvent, useState } from "react";

import { createComplementaryRequestAction } from "@/actions/complementary-services/create-complementary-request";
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  Paperclip,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  WebsiteTargetCombobox,
  type WebsiteTarget,
} from "@/components/complementary-services/website-target-combobox";
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
import {
  catalogCodeToServiceType,
  type ComplementaryCatalogItem,
  type ComplementaryRequestSummary,
  type ComplementaryWebsiteOption,
} from "@/lib/complementary-services/types";
import type {
  ComplementaryServiceType,
  ConsultationEngagementPreference,
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

const MAX_ATTACHMENTS = 5;
const attachmentEase = [0.22, 1, 0.36, 1] as const;
const attachmentExitEase = [0.4, 0, 1, 1] as const;

type SelectedAttachment = {
  id: string;
  file: File;
};

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
  catalog,
  websites,
  requests,
  initialService = "",
  initialWebsite = "",
  previewState,
  loadError = false,
}: {
  catalog: ComplementaryCatalogItem[];
  websites: ComplementaryWebsiteOption[];
  requests: ComplementaryRequestSummary[];
  initialService?: ComplementaryServiceType | "";
  initialWebsite?: string;
  previewState?: string;
  loadError?: boolean;
}) {
  const t = useTranslations("ComplementaryServices");
  const prefersReducedMotion = useReducedMotion();
  const [service, setService] = useState<ComplementaryServiceType | "">(
    initialService,
  );
  const initialWebsiteOption = websites.find(
    (item) => item.id === initialWebsite,
  );
  const [websiteTarget, setWebsiteTarget] = useState<WebsiteTarget | null>(
    initialWebsiteOption
      ? {
          websiteId: initialWebsiteOption.id,
          displayDomain: initialWebsiteOption.domain,
          coverage: initialWebsiteOption.managementCoverage,
        }
      : null,
  );
  const [engagement, setEngagement] = useState<
    ConsultationEngagementPreference | ""
  >("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [files, setFiles] = useState<SelectedAttachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(previewState === "submitting");
  const [success, setSuccess] = useState(previewState === "success");
  const [submitError, setSubmitError] = useState("");
  const [submittedDomain, setSubmittedDomain] = useState(
    initialWebsiteOption?.domain ?? "",
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const selectedCatalog = catalog.find(
    (item) => catalogCodeToServiceType(item.code) === service,
  );
  const duplicate = Boolean(
    selectedCatalog &&
    websiteTarget &&
    requests.some(
      (item) =>
        item.catalogItemId === selectedCatalog.id &&
        item.status !== "WITHDRAWN" &&
        item.status !== "CANCELLED" &&
        item.status !== "COMPLETED" &&
        (websiteTarget.websiteId
          ? item.websiteId === websiteTarget.websiteId
          : item.websiteDomain === websiteTarget.websiteDomain),
    ),
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!service || !selectedCatalog)
      nextErrors.service = t("form.errors.service");
    if (!websiteTarget) nextErrors.website = t("form.errors.website");
    if (!engagement) nextErrors.engagement = t("form.errors.engagement");
    if (!title.trim()) nextErrors.title = t("form.errors.title");
    if (description.trim().length < 20)
      nextErrors.description = t("form.errors.description");
    setErrors(nextErrors);
    setSubmitError("");
    if (
      Object.keys(nextErrors).length ||
      !selectedCatalog ||
      !websiteTarget ||
      !engagement
    ) {
      return;
    }

    setSubmitting(true);
    const result = await createComplementaryRequestAction({
      catalogItemId: selectedCatalog.id,
      ...(websiteTarget.websiteId
        ? { websiteId: websiteTarget.websiteId }
        : { websiteDomain: websiteTarget.websiteDomain }),
      engagementPreference: engagement,
      title,
      description,
      ...(scope ? { scope: { value: scope } } : {}),
      idempotencyKey,
    });
    setSubmitting(false);

    if (!result.ok) {
      const message =
        result.error.code === "PROFILE_INCOMPLETE"
          ? t("form.errors.profileIncomplete")
          : result.error.key === "conflict"
            ? t("form.errors.conflict")
            : result.error.key === "validation"
              ? t("form.errors.validation")
              : t("form.errors.generic");
      setSubmitError(message);
      return;
    }

    setSubmittedDomain(
      result.data.websiteDomain || websiteTarget.displayDomain,
    );
    setSuccess(true);
  }
  function addFiles(fileList: FileList | null) {
    const nextFiles = Array.from(fileList ?? []);
    const invalid = nextFiles.find(
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
    setFiles((current) =>
      [
        ...current,
        ...nextFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
        })),
      ].slice(0, MAX_ATTACHMENTS),
    );
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
            {t.rich("form.success.submitted", {
              domain: submittedDomain,
              ltr: (chunks) => <span dir="ltr">{chunks}</span>,
            })}
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
          {loadError && (
            <Alert variant="destructive">
              <AlertTriangle aria-hidden="true" className="size-4" />
              <AlertTitle>{t("form.loadError.title")}</AlertTitle>
              <AlertDescription>
                {t("form.loadError.description")}
              </AlertDescription>
            </Alert>
          )}
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
            <div className="w-full flex-1">
              <p className="text-sm font-medium">
                {t("form.website.label")}{" "}
                <span className="text-destructive">*</span>
              </p>
              <div className="mt-2">
                <WebsiteTargetCombobox
                  websites={websites}
                  value={websiteTarget}
                  onChange={(next) => {
                    setWebsiteTarget(next);
                    setErrors((current) => ({ ...current, website: "" }));
                  }}
                  error={errors.website}
                />
              </div>
            </div>
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
          {websiteTarget && !!service && (
            <section
              className="border-border bg-muted/20 rounded-xl border p-4"
              aria-labelledby="request-review-title"
            >
              <h2 id="request-review-title" className="text-sm font-semibold">
                {t("form.review.title")}
              </h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {t("form.review.service")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {service === "seo"
                      ? t("services.seo")
                      : service === "graphic-design"
                        ? t("services.graphic-design")
                        : service === "product-data-entry"
                          ? t("services.product-data-entry")
                          : t("services.social-media-support")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {t("form.review.domain")}
                  </dt>
                  <dd className="mt-1 font-medium" dir="ltr">
                    {websiteTarget.displayDomain}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {t("form.review.coverage")}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {websiteTarget.coverage === "UNIXSEE_MANAGED"
                      ? t("coverageDescriptive.UNIXSEE_MANAGED")
                      : t("coverageDescriptive.EXTERNAL_INFRASTRUCTURE")}
                  </dd>
                </div>
              </dl>
              {websiteTarget.coverage !== "UNIXSEE_MANAGED" && (
                <p className="text-muted-foreground mt-3 text-xs leading-5">
                  {t("form.review.externalNote")}
                </p>
              )}
            </section>
          )}

          {!!submitError && (
            <Alert variant="destructive" role="alert">
              <AlertTriangle aria-hidden="true" className="size-4" />
              <AlertTitle>{t("form.submitError.title")}</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <div className="min-w-0">
            <span className="text-sm font-medium">
              {t("form.attachments.label")}
            </span>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("form.attachments.hint")}
            </p>
            <Label className="border-border bg-muted/20 hover:border-ring/55 hover:bg-muted/50 dark:hover:bg-accent/50 focus-within:border-ring focus-within:ring-ring/15 relative mt-3 flex min-h-16 w-fit max-w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed px-4 text-sm font-medium transition-[border-color,background-color] focus-within:ring-3">
              <Paperclip aria-hidden="true" className="size-4 shrink-0" />
              {t("form.attachments.add")}
              <Input
                type="file"
                multiple
                className="absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </Label>
            {!!fileError && (
              <p className="text-destructive mt-2 text-xs">{fileError}</p>
            )}
            <ul
              className={cn(
                "relative flex w-full max-w-full min-w-0 flex-col gap-2",
                files.length > 0 && "mt-3",
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {files.map(({ id, file }, index) => (
                  <motion.li
                    key={id}
                    layout={!prefersReducedMotion}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8, scale: 0.98 }
                    }
                    animate={
                      prefersReducedMotion
                        ? {
                            opacity: 1,
                            transition: { duration: 0.12, delay: index * 0.03 },
                          }
                        : {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              duration: 0.28,
                              ease: attachmentEase,
                              delay: index * 0.03,
                            },
                          }
                    }
                    exit={
                      prefersReducedMotion
                        ? {
                            opacity: 0,
                            transition: { duration: 0.12, delay: 0 },
                          }
                        : {
                            opacity: 0,
                            scale: 0.96,
                            y: -4,
                            transition: {
                              duration: 0.2,
                              ease: attachmentExitEase,
                              delay: 0,
                            },
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.12 }
                        : {
                            layout: {
                              duration: 0.28,
                              ease: attachmentEase,
                            },
                          }
                    }
                    className="border-border bg-muted/40 flex min-h-11 w-full max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-xl border px-3 text-sm sm:gap-3"
                  >
                    <Paperclip
                      aria-hidden="true"
                      className="text-muted-foreground size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {Math.ceil(file.size / 1024)} KB
                    </span>
                    <Button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((item) => item.id !== id),
                        )
                      }
                      aria-label={t("form.attachments.remove", {
                        name: file.name,
                      })}
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </Panel>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-start">
        <DashboardButton
          type="submit"
          size="xl"
          disabled={submitting || loadError || catalog.length === 0}
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
