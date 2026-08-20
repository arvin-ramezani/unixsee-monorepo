"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Inbox,
  LoaderCircle,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useReducedMotion, motion } from "framer-motion";

import { MobileFilterDisclosure } from "@/components/common/mobile-filter-disclosure";
import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import {
  ComplementaryServiceStatusBadge,
  ServiceUsage,
} from "@/components/complementary-services/service-presentation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import type {
  ComplementaryService,
  ComplementaryServiceType,
  ConsultationRequest,
  ServiceWebsite,
} from "@/lib/data/complementary-services/complementary-services-data";
import { DashboardButtonLink } from "../dashboard/dashboard-button-link";

export type ComplementaryServicesTab = "active" | "requests" | "history";
export type ComplementaryServicesState =
  "ready" | "loading" | "error" | "empty";

export function ComplementaryServicesHeader() {
  const t = useTranslations("ComplementaryServices");
  return (
    <header className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          {t("description")}
        </p>
      </div>
      <DashboardButtonLink
        href="/dashboard/complementary-services/request"
        variant="primary"
        size="lg"
        className="h-11 w-full shrink-0"
      >
        <Plus aria-hidden="true" className="size-4" />
        {t("requestService")}
      </DashboardButtonLink>
    </header>
  );
}

export function ComplementaryServicesTabs({
  activeTab,
  onChange,
  counts,
}: {
  activeTab: ComplementaryServicesTab;
  onChange: (tab: ComplementaryServicesTab) => void;
  counts: Record<ComplementaryServicesTab, number>;
}) {
  const t = useTranslations("ComplementaryServices.tabs");
  const prefersReducedMotion = useReducedMotion();

  const tabs: ComplementaryServicesTab[] = ["active", "requests", "history"];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onChange(value as ComplementaryServicesTab)}
    >
      <TabsList
        aria-label={t("label")}
        className="border-border h-auto! gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0 py-2"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="text-muted-foreground group data-[state=active]:text-primary dark:data-[state=active]:text-secondary relative min-h-full border-0 bg-transparent! px-4 text-sm shadow-none! transition-colors data-[state=active]:rounded-none data-[state=active]:shadow-none"
          >
            {t(tab)}{" "}
            <span className="text-muted-foreground group-data-[state=active]:text-primary dark:group-data-[state=active]:text-secondary ms-1 text-xs tabular-nums">
              {counts[tab]}
            </span>
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab-underline"
                className="bg-primary dark:bg-secondary absolute -bottom-1.5 h-1 w-full origin-center scale-y-50 rounded-full"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 38,
                        mass: 0.65,
                      }
                }
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function FilterFields({
  website,
  service,
  websites,
  onWebsiteChange,
  onServiceChange,
}: {
  website: string;
  service: "all" | ComplementaryServiceType;
  websites: ServiceWebsite[];
  onWebsiteChange: (value: string) => void;
  onServiceChange: (value: "all" | ComplementaryServiceType) => void;
}) {
  const t = useTranslations("ComplementaryServices");

  return (
    <>
      <Label className="text-muted-foreground grid gap-1.5 text-xs font-medium">
        {t("filters.website")}
        <Select value={website} onValueChange={onWebsiteChange}>
          <SelectTrigger className="h-11! w-full min-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allWebsites")}</SelectItem>
            {websites.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
      <Label className="text-muted-foreground grid gap-1.5 text-xs font-medium">
        {t("filters.service")}
        <Select
          value={service}
          onValueChange={(value) =>
            onServiceChange(value as "all" | ComplementaryServiceType)
          }
        >
          <SelectTrigger className="h-11! w-full min-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allServices")}</SelectItem>
            {(
              [
                "seo",
                "graphic-design",
                "product-data-entry",
                "social-media-support",
              ] as const
            ).map((value) => (
              <SelectItem key={value} value={value}>
                {t(`services.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
    </>
  );
}

export function ComplementaryServicesFilters(
  props: Parameters<typeof FilterFields>[0] & {
    onReset: () => void;
    filtered: boolean;
  },
) {
  const t = useTranslations("ComplementaryServices.filters");

  return (
    <div className="mt-5">
      <div className="hidden items-end gap-3 md:flex">
        <FilterFields {...props} />

        {props.filtered && (
          <Button
            type="button"
            onClick={props.onReset}
            variant="ghost"
            className="text-muted-foreground min-h-11"
          >
            <RotateCcw aria-hidden="true" className="me-2 inline size-4" />
            {t("reset")}
          </Button>
        )}
      </div>
      <MobileFilterDisclosure label={t("mobile")} className="md:hidden">
        <FilterFields {...props} />

        {props.filtered && (
          <Button
            type="button"
            variant="outline"
            onClick={props.onReset}
            className="min-h-11 sm:col-span-2"
          >
            <RotateCcw aria-hidden="true" className="me-2 inline size-4" />
            {t("reset")}
          </Button>
        )}
      </MobileFilterDisclosure>
    </div>
  );
}

export function ActiveServiceCard({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices");
  const format = useFormatter();
  return (
    <Panel className="flex min-h-72 flex-col p-5 sm:p-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-link text-xs font-medium">
            {t(`services.${service.serviceType}`)}
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold">
            {t(`fixtures.titles.${service.titleKey}`)}
          </h2>
          <p className="text-muted-foreground mt-2 truncate text-sm">
            {service.websiteName} · <span dir="ltr">{service.domain}</span>
          </p>
        </div>
        <ComplementaryServiceStatusBadge status={service.status} />
      </div>
      <div className="text-muted-foreground mt-5 flex flex-wrap gap-2 text-xs">
        <span className="bg-muted rounded-md px-2.5 py-1.5">
          {t(`engagement.${service.engagementType}`)}
        </span>
        {service.startedAt && service.endsAt ? (
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {format.dateTime(new Date(service.startedAt), "shortDate")} –{" "}
            {format.dateTime(new Date(service.endsAt), "shortDate")}
          </span>
        ) : null}
      </div>
      <div className="mt-6">
        <ServiceUsage usage={service.usage} showDate />
      </div>
      <Link
        href={`/dashboard/complementary-services/${service.id}`}
        className="border-border text-link focus-visible:ring-ring mt-auto inline-flex min-h-11 items-center justify-between border-t pt-5 text-sm font-medium focus-visible:ring-2"
      >
        {t("viewDetails")}
        <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      </Link>
    </Panel>
  );
}

export function ConsultationRequestCard({
  request,
  onCancel,
}: {
  request: ConsultationRequest;
  onCancel: (request: ConsultationRequest) => void;
}) {
  const t = useTranslations("ComplementaryServices");
  const format = useFormatter();
  return (
    <Panel className="p-5 lg:p-6">
      {/* <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"> */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-link text-xs font-medium">
              {t(`services.${request.serviceType}`)}
            </p>
            <ComplementaryServiceStatusBadge status={request.status} />
          </div>
          <h2 className="mt-2 text-lg font-semibold">
            {t(`fixtures.requestTitles.${request.titleKey}`)}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {request.websiteName} · <span dir="ltr">{request.domain}</span>
          </p>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
            {t(`fixtures.requestSummaries.${request.summaryKey}`)}
          </p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 text-sm sm:min-w-64">
          <div>
            <dt className="text-muted-foreground text-xs">
              {t("requests.preference")}
            </dt>
            <dd className="mt-1 font-medium">
              {t(`preferences.${request.engagementPreference}`)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              {t("requests.submitted")}
            </dt>
            <dd className="mt-1 font-medium">
              {format.dateTime(new Date(request.requestedAt), "shortDate")}
            </dd>
          </div>
        </dl>
      </div>
      <div className="border-border mt-5 flex flex-wrap gap-2 border-t pt-4">
        <Link
          href={{
            pathname: "/dashboard/complementary-services",
            query: { tab: "requests", request: request.id },
          }}
          className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium focus-visible:ring-2"
        >
          {t("requests.view")}
        </Link>
        {request.status === "requested" ? (
          <Button
            type="button"
            onClick={() => onCancel(request)}
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive min-h-10"
          >
            {t("requests.cancel")}
          </Button>
        ) : null}
      </div>
    </Panel>
  );
}

export function ServiceHistoryItem({
  service,
}: {
  service: ComplementaryService;
}) {
  const t = useTranslations("ComplementaryServices");
  const format = useFormatter();

  return (
    <article className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <h2 className="mb-2 font-semibold">
              {t(`fixtures.titles.${service.titleKey}`)}
            </h2>
            <ComplementaryServiceStatusBadge status={service.status} />
          </div>
        </div>
        <p className="text-muted-foreground mt-1 text-sm md:mt-2">
          {t(`services.${service.serviceType}`)} · {service.websiteName}
        </p>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span>{t(`engagement.${service.engagementType}`)}</span>
        {service.completedAt ? (
          <time dateTime={service.completedAt}>
            {format.dateTime(new Date(service.completedAt), "shortDate")}
          </time>
        ) : null}
        <Link
          href={`/dashboard/complementary-services/${service.id}`}
          className="text-link focus-visible:ring-ring inline-flex min-h-10 items-center font-medium focus-visible:ring-2"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </article>
  );
}

export function ComplementaryServicesEmptyState({
  filtered,
  tab,
}: {
  filtered: boolean;
  tab: ComplementaryServicesTab;
}) {
  const t = useTranslations("ComplementaryServices.states");
  return (
    <Panel className="grid min-h-72 place-items-center px-5 py-12 text-center">
      <div className="max-w-md">
        <span className="bg-muted mx-auto grid size-12 place-items-center rounded-full">
          <Inbox aria-hidden="true" className="text-muted-foreground size-5" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">
          {t(filtered ? "filteredTitle" : `${tab}Title`)}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t(filtered ? "filteredDescription" : `${tab}Description`)}
        </p>
        {!filtered ? (
          <Link
            href="/dashboard/complementary-services/request"
            className="bg-primary text-primary-foreground focus-visible:ring-ring mt-5 inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium focus-visible:ring-2"
          >
            {t("action")}
          </Link>
        ) : null}
      </div>
    </Panel>
  );
}

export function CancelRequestDialog({
  request,
  onClose,
  onConfirm,
}: {
  request?: ConsultationRequest;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("ComplementaryServices.cancelDialog");
  return (
    <AlertDialog
      open={Boolean(request)}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("keep")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ComplementaryServicesManager({
  services,
  requests,
  websites,
  initialTab = "active",
  initialState = "ready",
}: {
  services: ComplementaryService[];
  requests: ConsultationRequest[];
  websites: ServiceWebsite[];
  initialTab?: ComplementaryServicesTab;
  initialState?: ComplementaryServicesState;
}) {
  const t = useTranslations("ComplementaryServices");
  const [tab, setTab] = useState(initialTab);
  const [state, setState] = useState(initialState);
  const [website, setWebsite] = useState("all");
  const [serviceType, setServiceType] = useState<
    "all" | ComplementaryServiceType
  >("all");
  const [cancelTarget, setCancelTarget] = useState<ConsultationRequest>();
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const liveRegion = useRef<HTMLParagraphElement>(null);
  const active = services.filter((item) => item.status === "active");
  const history = services.filter((item) =>
    ["completed", "expired", "cancelled"].includes(item.status),
  );
  const openRequests = requests.filter(
    (item) => item.status === "requested" && !cancelledIds.includes(item.id),
  );
  const matches = (item: {
    websiteId: string;
    serviceType: ComplementaryServiceType;
  }) =>
    (website === "all" || item.websiteId === website) &&
    (serviceType === "all" || item.serviceType === serviceType);
  const visibleActive = active.filter(matches);
  const visibleRequests = openRequests.filter(matches);
  const visibleHistory = history.filter(matches);
  const counts = {
    active: active.length,
    requests: openRequests.length,
    history: history.length,
  };
  const filtered = website !== "all" || serviceType !== "all";
  const reset = () => {
    setWebsite("all");
    setServiceType("all");
  };
  const content =
    tab === "active"
      ? visibleActive
      : tab === "requests"
        ? visibleRequests
        : visibleHistory;

  return (
    <section aria-labelledby="complementary-services-content" className="pb-8">
      <h2 id="complementary-services-content" className="sr-only">
        {t("contentTitle")}
      </h2>
      <div className="overflow-x-auto overflow-y-hidden">
        <ComplementaryServicesTabs
          activeTab={tab}
          onChange={setTab}
          counts={counts}
        />
      </div>
      <ComplementaryServicesFilters
        website={website}
        service={serviceType}
        websites={websites}
        onWebsiteChange={setWebsite}
        onServiceChange={setServiceType}
        onReset={reset}
        filtered={filtered}
      />
      <p ref={liveRegion} aria-live="polite" className="sr-only">
        {cancelledIds.length ? t("requests.cancelledFeedback") : ""}
      </p>
      {tab === "requests" && (
        <div className="border-link/20 bg-accent/50 text-muted-foreground mt-5 rounded-xl border p-4 text-sm leading-6">
          {t("requests.explanation")}
        </div>
      )}
      <div className="mt-5">
        {state === "loading" ? (
          <LoadingState />
        ) : state === "error" ? (
          <ErrorState onRetry={() => setState("ready")} />
        ) : (
          <DashboardFadeIn
            deferUntilKeyChange
            animationKey={`${tab}-${website}-${serviceType}`}
          >
            {state === "empty" || content.length === 0 ? (
              <ComplementaryServicesEmptyState filtered={filtered} tab={tab} />
            ) : tab === "active" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {visibleActive.map((item) => (
                  <ActiveServiceCard key={item.id} service={item} />
                ))}
              </div>
            ) : tab === "requests" ? (
              <div className="grid gap-4 2xl:grid-cols-2">
                {visibleRequests.map((item) => (
                  <ConsultationRequestCard
                    key={item.id}
                    request={item}
                    onCancel={setCancelTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {visibleHistory.map((item) => (
                  <ServiceHistoryItem key={item.id} service={item} />
                ))}
              </div>
            )}
          </DashboardFadeIn>
        )}
      </div>

      <CancelRequestDialog
        request={cancelTarget}
        onClose={() => setCancelTarget(undefined)}
        onConfirm={() => {
          if (cancelTarget) setCancelledIds((ids) => [...ids, cancelTarget.id]);
          setCancelTarget(undefined);
        }}
      />
    </section>
  );
}

function LoadingState() {
  const t = useTranslations("ComplementaryServices.states");
  return (
    <div aria-label={t("loading")} className="grid gap-5 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="border-border h-72 rounded-xl border" />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("ComplementaryServices.states");
  return (
    <Panel className="grid min-h-72 place-items-center p-8 text-center">
      <div className="max-w-md">
        <AlertTriangle
          aria-hidden="true"
          className="text-destructive mx-auto size-9"
        />
        <h2 className="mt-4 text-xl font-semibold">{t("errorTitle")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("errorDescription")}
        </p>
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          className="mt-5 min-h-11"
        >
          <LoaderCircle aria-hidden="true" className="size-4" />
          {t("retry")}
        </Button>
      </div>
    </Panel>
  );
}
