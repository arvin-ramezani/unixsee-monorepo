"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  SearchX,
  ShieldCheck,
} from "lucide-react";

import { AuthorizationStatusBadge } from "@/components/authorization/authorization-status-badge";
import SearchInput from "@/components/common/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AUTHORIZATION_STATUS,
  AUTHORIZATION_STATUS_LABELS,
  CONTACT_CHALLENGE_LABELS,
  type AuthorizationCaseType,
} from "@/lib/data/authorization-data";
import {
  AUTHORIZATION_STATUS_FILTER,
  filterAuthorizationCases,
  getAuthorizationQueueSummary,
  type AuthorizationStatusFilterType,
} from "@/lib/data/authorization-runtime";
import { STAFF_CAPABILITY } from "@/lib/data/users-data";
import { hasCapability } from "@/lib/users-utils";
import { cn } from "@/lib/utils";

const STATUS_FILTER_OPTIONS = [
  { value: AUTHORIZATION_STATUS_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: AUTHORIZATION_STATUS_FILTER.ACTIONABLE, label: "نیازمند اقدام" },
  {
    value: AUTHORIZATION_STATUS.PENDING_REVIEW,
    label: AUTHORIZATION_STATUS_LABELS[AUTHORIZATION_STATUS.PENDING_REVIEW],
  },
  {
    value: AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
    label: AUTHORIZATION_STATUS_LABELS[AUTHORIZATION_STATUS.NEEDS_MORE_INFO],
  },
  {
    value: AUTHORIZATION_STATUS.REJECTED,
    label: AUTHORIZATION_STATUS_LABELS[AUTHORIZATION_STATUS.REJECTED],
  },
  {
    value: AUTHORIZATION_STATUS.APPROVED,
    label: AUTHORIZATION_STATUS_LABELS[AUTHORIZATION_STATUS.APPROVED],
  },
] as const;

function caseHref(authCase: AuthorizationCaseType) {
  return `/users/authorization/${authCase.id}`;
}

function contactSummary(authCase: AuthorizationCaseType) {
  return [
    CONTACT_CHALLENGE_LABELS[authCase.package.mobileChallenge],
    CONTACT_CHALLENGE_LABELS[authCase.package.emailChallenge],
  ].join(" · ");
}

function contactIdentifiers(authCase: AuthorizationCaseType) {
  return authCase.userEmail
    ? `${authCase.userMobile} · ${authCase.userEmail}`
    : authCase.userMobile;
}

function AuthorizationTableRow({
  authCase,
}: {
  authCase: AuthorizationCaseType;
}) {
  const router = useRouter();
  const href = caseHref(authCase);

  return (
    <TableRow
      className="group cursor-pointer border-b border-border/60 transition-colors odd:bg-secondary/50 hover:bg-muted/40"
      tabIndex={0}
      role="link"
      aria-label={`مشاهده پرونده ${authCase.userDisplayName}`}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button")) return;
        router.push(href);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        router.push(href);
      }}
    >
      <TableCell className="px-4 py-3">
        <div className="min-w-0">
          <Link href={href} className="font-medium hover:underline">
            {authCase.userDisplayName}
          </Link>
          <p className="text-muted-foreground w-fit truncate text-xs" dir="ltr">
            {authCase.userId}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-sm">
        <span className="inline-block max-w-56 truncate" dir="ltr">
          {contactIdentifiers(authCase)}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <AuthorizationStatusBadge status={authCase.status} />
      </TableCell>
      <TableCell className="text-muted-foreground px-4 py-3 text-xs">
        {contactSummary(authCase)}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm">
        {authCase.submittedAt}
      </TableCell>
    </TableRow>
  );
}

function AuthorizationCaseCard({
  authCase,
}: {
  authCase: AuthorizationCaseType;
}) {
  const href = caseHref(authCase);

  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
      aria-label={`مشاهده پرونده ${authCase.userDisplayName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{authCase.userDisplayName}</p>
          <p
            className="text-muted-foreground mt-0.5 w-fit truncate text-xs"
            dir="ltr"
          >
            {authCase.userId}
          </p>
        </div>
        <AuthorizationStatusBadge status={authCase.status} />
      </div>

      <dl className="mt-3 grid gap-2 text-xs">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-muted-foreground shrink-0">تماس</dt>
          <dd className="min-w-0 truncate text-end font-medium" dir="ltr">
            {contactIdentifiers(authCase)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-muted-foreground shrink-0">تأیید تماس</dt>
          <dd className="text-muted-foreground min-w-0 text-end">
            {contactSummary(authCase)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-muted-foreground shrink-0">زمان ارسال</dt>
          <dd className="font-medium text-end">{authCase.submittedAt}</dd>
        </div>
      </dl>
    </Link>
  );
}

export function AuthorizationQueueView({
  initialCases,
}: {
  initialCases: AuthorizationCaseType[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AuthorizationStatusFilterType>(
      AUTHORIZATION_STATUS.PENDING_REVIEW,
    );

  const cases = initialCases;

  const summary = getAuthorizationQueueSummary(cases);
  const filtered = filterAuthorizationCases({
    cases,
    statusFilter,
    query,
  });

  const canReview = hasCapability(STAFF_CAPABILITY.REVIEW_AUTHORIZATION);

  if (!canReview) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        دسترسی بررسی احراز هویت برای نقش فعلی فعال نیست.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: "pending",
            label: "در حال بررسی (دستی)",
            value: summary.pending,
            icon: Clock3,
            filter: AUTHORIZATION_STATUS.PENDING_REVIEW,
          },
          {
            key: "needsInfo",
            label: "نیاز به اصلاح",
            value: summary.needsInfo,
            icon: CircleAlert,
            filter: AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
          },
          {
            key: "rejected",
            label: "رد شده",
            value: summary.rejected,
            icon: CircleAlert,
            filter: AUTHORIZATION_STATUS.REJECTED,
          },
          {
            key: "approved",
            label: "تأیید شده",
            value: summary.approved,
            icon: CheckCircle2,
            filter: AUTHORIZATION_STATUS.APPROVED,
          },
        ].map((card) => (
          <button
            key={card.key}
            type="button"
            className={cn(
              "rounded-2xl border bg-card p-4 text-start shadow-sm transition-colors",
              statusFilter === card.filter
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:bg-muted/30",
            )}
            onClick={() => {
              setStatusFilter(card.filter);
            }}
          >
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <card.icon className="size-3.5" aria-hidden />
              {card.label}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {card.value.toLocaleString("fa-IR")}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجوی نام، موبایل، ایمیل یا کد ملی…"
          aria-label="جست‌وجوی پرونده احراز هویت"
          className="flex-1 lg:max-w-lg min-h-11!"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            value && setStatusFilter(value as AuthorizationStatusFilterType)
          }
        >
          <SelectTrigger
            className="min-h-11 w-full sm:w-56"
            aria-label="فیلتر وضعیت"
          >
            <SelectValue>
              {STATUS_FILTER_OPTIONS.find(
                (option) => option.value === statusFilter,
              )?.label ?? "وضعیت"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-16 text-center text-sm">
          <SearchX className="size-8 opacity-50" aria-hidden />
          <p>پرونده‌ای با این فیلتر یافت نشد.</p>
          <button
            type="button"
            className="text-primary text-sm underline-offset-2 hover:underline"
            onClick={() => {
              setQuery("");
              setStatusFilter("ALL");
            }}
          >
            پاک‌کردن فیلترها
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">مشتری</TableHead>
                  <TableHead className="px-4">تماس</TableHead>
                  <TableHead className="px-4">وضعیت</TableHead>
                  <TableHead className="px-4">تأیید تماس</TableHead>
                  <TableHead className="px-4">زمان ارسال</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((authCase) => (
                  <AuthorizationTableRow
                    key={authCase.id}
                    authCase={authCase}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filtered.map((authCase) => (
              <AuthorizationCaseCard key={authCase.id} authCase={authCase} />
            ))}
          </div>
        </>
      )}

      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <ShieldCheck className="size-3.5" aria-hidden />
        رمز یک‌بارمصرف و توکن‌ها هرگز در این صف نمایش داده نمی‌شوند.
      </p>
    </div>
  );
}
