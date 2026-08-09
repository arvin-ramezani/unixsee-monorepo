"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  Filter,
  Globe2,
  Inbox,
  Plus,
  UserRound,
} from "lucide-react";

import SearchInput from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  COMPLEMENTARY_SERVICE_FAMILY,
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  SERVICE_ASSIGNMENT_STATUS,
  SERVICE_COMMERCIAL_MODEL_LABELS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceAssignmentType,
  type ComplementaryServiceFamilyType,
  type ComplementaryServiceRequestType,
  type ServiceRequestStatusType,
} from "@/lib/data/complementary-services-data";
import { cn } from "@/lib/utils";
import { CreateServiceSheet } from "./create-service-sheet";
import { ServiceStatusBadge } from "./service-status-badge";

const VIEW_MODE = {
  REQUESTS: "REQUESTS",
  ASSIGNMENTS: "ASSIGNMENTS",
} as const;

type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export const REQUEST_STATUS_FILTER = {
  ALL: "ALL",
  ACTIONABLE: "ACTIONABLE",
  WAITING: "WAITING",
  READY: "READY",
} as const;

export type RequestStatusFilterType =
  (typeof REQUEST_STATUS_FILTER)[keyof typeof REQUEST_STATUS_FILTER];

const FAMILY_FILTER_ALL = "ALL";
type FamilyFilterType =
  | typeof FAMILY_FILTER_ALL
  | ComplementaryServiceFamilyType;

const REQUEST_STATUS_FILTER_OPTIONS: {
  value: RequestStatusFilterType;
  label: string;
}[] = [
  { value: REQUEST_STATUS_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: REQUEST_STATUS_FILTER.ACTIONABLE, label: "نیازمند اقدام" },
  { value: REQUEST_STATUS_FILTER.WAITING, label: "در انتظار مشتری" },
  { value: REQUEST_STATUS_FILTER.READY, label: "آماده ایجاد سرویس" },
];

const FAMILY_FILTER_OPTIONS = [
  { value: FAMILY_FILTER_ALL, label: "همه سرویس‌ها" },
  ...Object.values(COMPLEMENTARY_SERVICE_FAMILY).map((family) => ({
    value: family,
    label: COMPLEMENTARY_SERVICE_FAMILY_LABELS[family],
  })),
];

const ACTIONABLE_REQUEST_STATUSES = new Set<ServiceRequestStatusType>([
  SERVICE_REQUEST_STATUS.SUBMITTED,
  SERVICE_REQUEST_STATUS.UNDER_REVIEW,
  SERVICE_REQUEST_STATUS.SCOPED,
  SERVICE_REQUEST_STATUS.ACCEPTED,
]);

type ComplementaryServicesViewProps = {
  initialRequests: ComplementaryServiceRequestType[];
  initialAssignments: ComplementaryServiceAssignmentType[];
  initialStatus?: RequestStatusFilterType;
};

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Inbox;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        emphasis
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-sm",
              emphasis ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {value.toLocaleString("fa-IR")}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              emphasis ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {hint}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            emphasis ? "bg-primary-foreground/10" : "bg-muted text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function RequestCard({
  request,
  onOpen,
}: {
  request: ComplementaryServiceRequestType;
  onOpen: (request: ComplementaryServiceRequestType) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground" dir="ltr">
            {request.id}
          </p>
          <h3 className="mt-1 font-medium">{request.title}</h3>
        </div>
        <ServiceStatusBadge kind="request" status={request.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">مشتری</dt>
          <dd className="mt-1 font-medium">{request.customerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">وب‌سایت</dt>
          <dd className="mt-1 truncate font-medium" dir="ltr">
            {request.websiteDomain}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">سرویس</dt>
          <dd className="mt-1 font-medium">
            {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">مسئول</dt>
          <dd className="mt-1 font-medium">
            {request.ownerName ?? "تخصیص داده نشده"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-xs text-muted-foreground">اقدام بعدی</p>
        <p className="mt-1 font-medium">{request.nextAction}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full"
        onClick={() => onOpen(request)}
      >
        بررسی درخواست
        <ArrowLeft data-icon="inline-end" />
      </Button>
    </article>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: ComplementaryServiceAssignmentType;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground" dir="ltr">
            {assignment.id}
          </p>
          <h3 className="mt-1 font-medium">{assignment.title}</h3>
        </div>
        <ServiceStatusBadge kind="assignment" status={assignment.status} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Globe2 className="size-4" aria-hidden="true" />
        <span dir="ltr">{assignment.websiteDomain}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <UserRound className="size-4" aria-hidden="true" />
        <span>{assignment.ownerName}</span>
      </div>
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-xs text-muted-foreground">وضعیت تحویل</p>
        <p className="mt-1 font-medium">{assignment.progressLabel}</p>
      </div>
    </article>
  );
}

function RequestDetailsSheet({
  request,
  open,
  onOpenChange,
  onCreate,
}: {
  request: ComplementaryServiceRequestType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: ComplementaryServiceRequestType) => void;
}) {
  const canCreate = request?.status === SERVICE_REQUEST_STATUS.ACCEPTED;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        {request && (
          <>
            <SheetHeader className="border-b border-border pe-12">
              <div className="mb-2">
                <ServiceStatusBadge kind="request" status={request.status} />
              </div>
              <SheetTitle>{request.title}</SheetTitle>
              <SheetDescription>
                درخواست {request.id} · آخرین بروزرسانی {request.updatedAt}
              </SheetDescription>
            </SheetHeader>

            <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-5">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Globe2 className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{request.websiteTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                      {request.websiteDomain}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {request.customerName}
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <h3 className="text-sm font-semibold">شرح درخواست مشتری</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {request.description}
                </p>
              </section>

              <dl className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">نوع سرویس</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">نوع همکاری</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {request.preferredEngagement}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">مسئول</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {request.ownerName ?? "تخصیص داده نشده"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">زمان ثبت</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {request.submittedAt}
                  </dd>
                </div>
              </dl>

              <section className="rounded-xl border border-accent bg-accent/15 p-4">
                <p className="text-xs text-accent-foreground">اقدام بعدی</p>
                <p className="mt-1 text-sm font-medium">{request.nextAction}</p>
                {request.dueLabel && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" aria-hidden="true" />
                    سررسید: {request.dueLabel}
                  </p>
                )}
              </section>

              {request.customerNote && (
                <section className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold">یادداشت قابل مشاهده مشتری</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {request.customerNote}
                  </p>
                </section>
              )}
            </div>

            <SheetFooter className="border-t border-border bg-card">
              {canCreate ? (
                <Button type="button" onClick={() => onCreate(request)}>
                  <Plus data-icon="inline-start" />
                  ایجاد سرویس برای این وب‌سایت
                </Button>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  ایجاد سرویس پس از ثبت پذیرش پیشنهاد در دسترس قرار می‌گیرد.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                بستن
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function ComplementaryServicesView({
  initialRequests,
  initialAssignments,
  initialStatus = REQUEST_STATUS_FILTER.ALL,
}: ComplementaryServicesViewProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [viewMode, setViewMode] = useState<ViewModeType>(VIEW_MODE.REQUESTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<RequestStatusFilterType>(initialStatus);
  const [familyFilter, setFamilyFilter] =
    useState<FamilyFilterType>(FAMILY_FILTER_ALL);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ComplementaryServiceRequestType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const acceptedRequests = requests.filter(
    (request) => request.status === SERVICE_REQUEST_STATUS.ACCEPTED,
  );
  const actionableCount = requests.filter((request) =>
    ACTIONABLE_REQUEST_STATUSES.has(request.status),
  ).length;
  const waitingCount = requests.filter(
    (request) =>
      request.status === SERVICE_REQUEST_STATUS.NEEDS_CUSTOMER_INFORMATION ||
      request.status === SERVICE_REQUEST_STATUS.QUOTED,
  ).length;
  const activeAssignmentCount = assignments.filter(
    (assignment) => assignment.status === SERVICE_ASSIGNMENT_STATUS.ACTIVE,
  ).length;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRequests = requests.filter((request) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        request.id,
        request.title,
        request.customerName,
        request.websiteDomain,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesFamily =
      familyFilter === FAMILY_FILTER_ALL || request.family === familyFilter;
    const matchesStatus =
      statusFilter === REQUEST_STATUS_FILTER.ALL ||
      (statusFilter === REQUEST_STATUS_FILTER.ACTIONABLE &&
        ACTIONABLE_REQUEST_STATUSES.has(request.status)) ||
      (statusFilter === REQUEST_STATUS_FILTER.WAITING &&
        (request.status ===
          SERVICE_REQUEST_STATUS.NEEDS_CUSTOMER_INFORMATION ||
          request.status === SERVICE_REQUEST_STATUS.QUOTED)) ||
      (statusFilter === REQUEST_STATUS_FILTER.READY &&
        request.status === SERVICE_REQUEST_STATUS.ACCEPTED);

    return matchesQuery && matchesFamily && matchesStatus;
  });

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        assignment.id,
        assignment.title,
        assignment.customerName,
        assignment.websiteDomain,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesFamily =
      familyFilter === FAMILY_FILTER_ALL || assignment.family === familyFilter;

    return matchesQuery && matchesFamily;
  });

  const statusFilterLabel =
    REQUEST_STATUS_FILTER_OPTIONS.find(
      (option) => option.value === statusFilter,
    )?.label ?? "همه وضعیت‌ها";
  const familyFilterLabel =
    FAMILY_FILTER_OPTIONS.find((option) => option.value === familyFilter)
      ?.label ?? "همه سرویس‌ها";

  const openRequestDetails = (request: ComplementaryServiceRequestType) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const openCreateService = (request: ComplementaryServiceRequestType) => {
    setSelectedRequest(request);
    setIsDetailsOpen(false);
    setIsCreateOpen(true);
  };

  const handleHeaderCreate = () => {
    const firstAcceptedRequest = acceptedRequests[0];
    if (!firstAcceptedRequest) return;
    openCreateService(firstAcceptedRequest);
  };

  const handleCreateService: React.ComponentProps<
    typeof CreateServiceSheet
  >["onCreate"] = (request, values) => {
    const createdAssignment: ComplementaryServiceAssignmentType = {
      id: `CSA-${3022 + assignments.length - initialAssignments.length}`,
      requestId: request.id,
      customerName: request.customerName,
      websiteId: request.websiteId,
      websiteDomain: request.websiteDomain,
      family: request.family,
      title: request.title,
      ownerName: values.ownerName,
      commercialModel: values.commercialModel,
      status: SERVICE_ASSIGNMENT_STATUS.SCHEDULED,
      startDate: new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
      }).format(new Date(`${values.startDate}T00:00:00`)),
      renewalDate: null,
      progressLabel: "در انتظار رسیدن تاریخ شروع",
      agreedAmount: values.agreedAmount,
    };

    setAssignments((currentAssignments) => [
      createdAssignment,
      ...currentAssignments,
    ]);
    setRequests((currentRequests) =>
      currentRequests.map((currentRequest) =>
        currentRequest.id === request.id
          ? {
              ...currentRequest,
              status: SERVICE_REQUEST_STATUS.ACTIVATED,
              nextAction: "مشاهده سرویس ایجادشده",
              updatedAt: "همین حالا",
            }
          : currentRequest,
      ),
    );
    setSuccessMessage(
      `سرویس «${request.title}» برای ${request.websiteDomain} ایجاد و زمان‌بندی شد.`,
    );
    setIsCreateOpen(false);
    setViewMode(VIEW_MODE.ASSIGNMENTS);
  };

  const hasDuplicateAssignment =
    selectedRequest !== null &&
    assignments.some(
      (assignment) =>
        assignment.websiteId === selectedRequest.websiteId &&
        assignment.family === selectedRequest.family &&
        assignment.status !== SERVICE_ASSIGNMENT_STATUS.COMPLETED,
    );

  const filterControls = (
    <>
      {viewMode === VIEW_MODE.REQUESTS && (
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            value && setStatusFilter(value as RequestStatusFilterType)
          }
        >
          <SelectTrigger className="w-full" aria-label="فیلتر وضعیت درخواست">
            <SelectValue>{statusFilterLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {REQUEST_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={familyFilter}
        onValueChange={(value) =>
          value && setFamilyFilter(value as FamilyFilterType)
        }
      >
        <SelectTrigger className="w-full" aria-label="فیلتر نوع سرویس">
          <SelectValue>{familyFilterLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {FAMILY_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="خلاصه خدمات تکمیلی"
      >
        <SummaryCard
          label="درخواست‌های نیازمند اقدام"
          value={actionableCount}
          hint="برای بررسی یا ادامه فرایند"
          icon={Inbox}
          emphasis
        />
        <SummaryCard
          label="منتظر مشتری"
          value={waitingCount}
          hint="اطلاعات یا تصمیم مشتری"
          icon={Clock3}
        />
        <SummaryCard
          label="آماده ایجاد سرویس"
          value={acceptedRequests.length}
          hint="پیشنهاد تأیید شده"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="سرویس‌های فعال"
          value={activeAssignmentCount}
          hint="در حال ارائه به مشتری"
          icon={BriefcaseBusiness}
        />
      </section>

      {successMessage && (
        <div
          className="flex items-start gap-2 rounded-xl border border-accent bg-accent/20 p-4 text-sm text-accent-foreground"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{successMessage}</p>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex w-fit rounded-lg bg-muted p-1"
            aria-label="نوع فهرست"
          >
            <Button
              type="button"
              size="sm"
              variant={viewMode === VIEW_MODE.REQUESTS ? "secondary" : "ghost"}
              aria-pressed={viewMode === VIEW_MODE.REQUESTS}
              onClick={() => setViewMode(VIEW_MODE.REQUESTS)}
            >
              درخواست‌ها
              <span className="rounded-full bg-background px-1.5 py-0.5 text-xs">
                {requests.length.toLocaleString("fa-IR")}
              </span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                viewMode === VIEW_MODE.ASSIGNMENTS ? "secondary" : "ghost"
              }
              aria-pressed={viewMode === VIEW_MODE.ASSIGNMENTS}
              onClick={() => setViewMode(VIEW_MODE.ASSIGNMENTS)}
            >
              سرویس‌ها
              <span className="rounded-full bg-background px-1.5 py-0.5 text-xs">
                {assignments.length.toLocaleString("fa-IR")}
              </span>
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleHeaderCreate}
            disabled={acceptedRequests.length === 0}
            title={
              acceptedRequests.length === 0
                ? "درخواست تأییدشده‌ای برای ایجاد سرویس وجود ندارد"
                : undefined
            }
          >
            <Plus data-icon="inline-start" />
            ایجاد سرویس
          </Button>
        </div>

        <div className="border-b border-border p-4">
          <div
            className={cn(
              "grid gap-2",
              viewMode === VIEW_MODE.REQUESTS
                ? "lg:grid-cols-[minmax(240px,1fr)_180px_200px]"
                : "lg:grid-cols-[minmax(240px,1fr)_220px]",
            )}
          >
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجو در درخواست، مشتری یا وب‌سایت..."
            />

            <div className="hidden contents lg:contents">{filterControls}</div>

            <Button
              type="button"
              variant="outline"
              className="lg:hidden"
              aria-expanded={showMobileFilters}
              onClick={() => setShowMobileFilters((current) => !current)}
            >
              <Filter data-icon="inline-start" />
              فیلترها
            </Button>
          </div>

          {showMobileFilters && (
            <div className="mt-2 grid gap-2 lg:hidden">{filterControls}</div>
          )}
        </div>

        {viewMode === VIEW_MODE.REQUESTS ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table className="min-w-240">
                <TableHeader className="bg-muted/30 text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-right">درخواست</TableHead>
                    <TableHead className="px-4 py-3 text-right">مشتری</TableHead>
                    <TableHead className="px-4 py-3 text-right">وب‌سایت</TableHead>
                    <TableHead className="px-4 py-3 text-right">سرویس</TableHead>
                    <TableHead className="px-4 py-3 text-right">وضعیت</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      اقدام بعدی
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      <span className="sr-only">عملیات</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="border-b border-border/60 even:bg-muted/30"
                      >
                        <TableCell className="max-w-64 px-4 py-3">
                          <p className="font-medium">{request.title}</p>
                          <p
                            className="mt-1 text-xs text-muted-foreground"
                            dir="ltr"
                          >
                            {request.id}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <p className="font-medium">{request.customerName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.ownerName ?? "بدون مسئول"}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <p dir="ltr">{request.websiteDomain}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.websiteTitle}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <ServiceStatusBadge
                            kind="request"
                            status={request.status}
                          />
                        </TableCell>
                        <TableCell className="max-w-56 px-4 py-3">
                          <p className="text-sm">{request.nextAction}</p>
                          {request.dueLabel && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {request.dueLabel}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`بررسی درخواست ${request.id}`}
                            onClick={() => openRequestDetails(request)}
                          >
                            <Eye />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        درخواستی با این فیلترها پیدا نشد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 lg:hidden">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onOpen={openRequestDetails}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground md:col-span-2">
                  درخواستی با این فیلترها پیدا نشد.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table className="min-w-220">
                <TableHeader className="bg-muted/30 text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-right">سرویس</TableHead>
                    <TableHead className="px-4 py-3 text-right">وب‌سایت</TableHead>
                    <TableHead className="px-4 py-3 text-right">مسئول</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      مدل همکاری
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">وضعیت</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      پیشرفت
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      مبلغ توافق‌شده
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        className="border-b border-border/60 even:bg-muted/30"
                      >
                        <TableCell className="max-w-64 px-4 py-3">
                          <p className="font-medium">{assignment.title}</p>
                          <p
                            className="mt-1 text-xs text-muted-foreground"
                            dir="ltr"
                          >
                            {assignment.id}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <p dir="ltr">{assignment.websiteDomain}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {assignment.customerName}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {assignment.ownerName}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {
                            SERVICE_COMMERCIAL_MODEL_LABELS[
                              assignment.commercialModel
                            ]
                          }
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <ServiceStatusBadge
                            kind="assignment"
                            status={assignment.status}
                          />
                        </TableCell>
                        <TableCell className="max-w-56 px-4 py-3 text-sm">
                          {assignment.progressLabel}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium">
                          {assignment.agreedAmount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        سرویسی با این فیلترها پیدا نشد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 lg:hidden">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground md:col-span-2">
                  سرویسی با این فیلترها پیدا نشد.
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CircleDollarSign className="size-4" aria-hidden="true" />
        مبالغ این صفحه عملیاتی هستند و گزارش حسابداری محسوب نمی‌شوند.
      </p>

      <RequestDetailsSheet
        request={selectedRequest}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onCreate={openCreateService}
      />
      <CreateServiceSheet
        open={isCreateOpen}
        request={selectedRequest}
        hasDuplicateAssignment={hasDuplicateAssignment}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateService}
      />
    </div>
  );
}
