"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Filter,
  MailCheck,
  Plus,
  SearchX,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";

import SearchInput from "@/components/common/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
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
  ACCOUNT_ORIGIN,
  ACCOUNT_ORIGIN_LABELS,
  ACCOUNT_STATE,
  ACCOUNT_STATE_LABELS,
  STAFF_CAPABILITY,
} from "@/lib/data/users-data";
import {
  ACCOUNT_ORIGIN_FILTER_ALL,
  ACCOUNT_STATE_FILTER,
  filterCustomerQueueRows,
  formatContactSummary,
  formatCustomerDisplayName,
  getCustomerInitials,
  getCustomerQueueSummary,
  hasCapability,
  type AccountOriginFilterType,
  type AccountStateFilterType,
  type CustomerQueueRowType,
} from "@/lib/users-utils";
import { cn } from "@/lib/utils";
import { AccountStateBadge } from "./account-status-badge";
import { AuthorizationStatusBadge } from "./authorization-status-badge";
import { USER_KYC_STATUS } from "@/lib/users/map-admin-user";

const ACCOUNT_STATE_FILTER_OPTIONS = [
  { value: ACCOUNT_STATE_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: ACCOUNT_STATE_FILTER.ACTIONABLE, label: "نیازمند اقدام" },
  {
    value: ACCOUNT_STATE.ACTIVE,
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.ACTIVE],
  },
  {
    value: ACCOUNT_STATE.PENDING_VERIFICATION,
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.PENDING_VERIFICATION],
  },
  {
    value: ACCOUNT_STATE.LOCKED,
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.LOCKED],
  },
  {
    value: ACCOUNT_STATE.SUSPENDED,
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.SUSPENDED],
  },
] as const;

const ACCOUNT_ORIGIN_FILTER_OPTIONS = [
  { value: ACCOUNT_ORIGIN_FILTER_ALL, label: "همه منابع" },
  {
    value: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    label: ACCOUNT_ORIGIN_LABELS[ACCOUNT_ORIGIN.PUBLIC_SIGNUP],
  },
  {
    value: ACCOUNT_ORIGIN.PLAN_REQUEST,
    label: ACCOUNT_ORIGIN_LABELS[ACCOUNT_ORIGIN.PLAN_REQUEST],
  },
  {
    value: ACCOUNT_ORIGIN.ADMIN_CREATE,
    label: ACCOUNT_ORIGIN_LABELS[ACCOUNT_ORIGIN.ADMIN_CREATE],
  },
] as const;

function resolveAuthorization(row: CustomerQueueRowType) {
  return row.authorization ?? USER_KYC_STATUS.NOT_SUBMITTED;
}

function CustomerTableRow({ row }: { row: CustomerQueueRowType }) {
  const router = useRouter();
  const userHref = `/users/${row.user.id}`;
  const authorization = resolveAuthorization(row);
  const displayName = formatCustomerDisplayName(row.user.displayName);

  const navigateToUser = () => {
    router.push(userHref);
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;

    navigateToUser();
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigateToUser();
  };

  return (
    <TableRow
      className="group cursor-pointer border-b border-border/60 transition-colors odd:bg-secondary/50 hover:bg-muted/40"
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`مشاهده حساب ${displayName}`}
    >
      <TableCell className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>
              {getCustomerInitials(displayName === "--" ? "" : displayName)}
            </AvatarFallback>
          </Avatar>
          <Link
            href={userHref}
            className="truncate font-medium hover:underline"
          >
            {displayName}
          </Link>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
        <span dir="ltr">{formatContactSummary(row.user)}</span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <AuthorizationStatusBadge status={authorization} />
      </TableCell>
      <TableCell className="px-4 py-3">
        <AccountStateBadge state={row.user.accountState} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm font-medium">
        {row.websiteCount.toLocaleString("fa-IR")}
      </TableCell>
    </TableRow>
  );
}

function CustomerCard({ row }: { row: CustomerQueueRowType }) {
  const authorization = resolveAuthorization(row);
  const displayName = formatCustomerDisplayName(row.user.displayName);

  return (
    <Link
      href={`/users/${row.user.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>
              {getCustomerInitials(displayName === "--" ? "" : displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{displayName}</p>
            <p
              className="truncate text-xs text-muted-foreground w-fit"
              dir="ltr"
            >
              {formatContactSummary(row.user)}
            </p>
          </div>
        </div>
        <AccountStateBadge state={row.user.accountState} />
      </div>

      <div className="mt-3 space-y-2">
        <AuthorizationStatusBadge status={authorization} />
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <p className="text-xs">وب‌سایت‌ها</p>
          <p className="mt-1 text-xs font-medium text-foreground">
            {row.websiteCount.toLocaleString("fa-IR")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export type UsersViewProps = {
  initialRows?: CustomerQueueRowType[];
  /** Nest failure — list is empty; do not substitute fixtures. */
  loadError?: string | null;
  totalCount?: number | null;
};

export function UsersView({
  initialRows,
  loadError = null,
  totalCount = null,
}: UsersViewProps) {
  const [rows] = useState(() => initialRows ?? []);
  const [query, setQuery] = useState("");
  const [accountState, setAccountState] = useState<AccountStateFilterType>(
    ACCOUNT_STATE_FILTER.ALL,
  );
  const [origin, setOrigin] = useState<AccountOriginFilterType>(
    ACCOUNT_ORIGIN_FILTER_ALL,
  );
  const [showFilters, setShowFilters] = useState(false);

  const canCreateCustomer = hasCapability(STAFF_CAPABILITY.CREATE_CUSTOMER);
  const summary = useMemo(() => getCustomerQueueSummary(rows), [rows]);
  const filteredRows = useMemo(
    () => filterCustomerQueueRows(rows, { query, accountState, origin }),
    [accountState, origin, query, rows],
  );

  const accountStateLabel =
    ACCOUNT_STATE_FILTER_OPTIONS.find((option) => option.value === accountState)
      ?.label ?? "همه وضعیت‌ها";
  const originLabel =
    ACCOUNT_ORIGIN_FILTER_OPTIONS.find((option) => option.value === origin)
      ?.label ?? "همه منابع";

  const summaryItems = [
    {
      key: "actionable",
      label: "نیازمند اقدام",
      value: summary.actionable,
      hint: "تأییدنشده، قفل‌شده یا تعلیق‌شده",
      icon: AlertTriangle,
      emphasis: true,
      filter: ACCOUNT_STATE_FILTER.ACTIONABLE as AccountStateFilterType,
    },
    {
      key: "pending",
      label: "در انتظار تأیید",
      value: summary.pendingVerification,
      hint: "دعوت‌نامه یا تأیید تماس تکمیل نشده",
      icon: MailCheck,
      emphasis: false,
      filter: ACCOUNT_STATE.PENDING_VERIFICATION as AccountStateFilterType,
    },
    {
      key: "restricted",
      label: "قفل یا تعلیق",
      value: summary.suspendedOrLocked,
      hint: "نیازمند بررسی امنیتی",
      icon: ShieldAlert,
      emphasis: false,
      filter: ACCOUNT_STATE.SUSPENDED as AccountStateFilterType,
    },
    {
      key: "total",
      label: "همه مشتریان",
      value: totalCount ?? summary.total,
      hint: "از NestJS — بدون نمایش مدارک هویتی",
      icon: Users,
      emphasis: false,
      filter: ACCOUNT_STATE_FILTER.ALL as AccountStateFilterType,
    },
  ];

  const hasActiveSearch = query.trim().length > 0;

  if (loadError) {
    return (
      <div
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
        role="alert"
      >
        <p className="font-medium">بارگذاری فهرست کاربران ناموفق بود</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setAccountState(item.filter)}
              className={cn(
                "rounded-xl border p-4 text-start transition-colors",
                item.emphasis
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted/30",
                accountState === item.filter &&
                  !item.emphasis &&
                  "ring-2 ring-primary/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      "text-sm",
                      item.emphasis
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {item.value.toLocaleString("fa-IR")}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      item.emphasis
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.hint}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    item.emphasis
                      ? "bg-primary-foreground/10"
                      : "bg-muted text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">مشتریان</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((value) => !value)}
              className="gap-2 lg:hidden"
            >
              <Filter className="size-4" />
              فیلتر
            </Button>
            {canCreateCustomer && (
              <Link
                href="/users/new"
                className={buttonVariants({
                  size: "sm",
                  className: "gap-2",
                })}
              >
                <Plus className="size-4" />
                ایجاد مشتری
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(220px,580px)_minmax(160px,200px)_minmax(160px,200px)]">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در نام، ایمیل یا موبایل..."
            aria-label="جستجوی مشتری"
          />

          <div className="hidden lg:block">
            <Select
              value={accountState}
              onValueChange={(value) =>
                value && setAccountState(value as AccountStateFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت حساب">
                <SelectValue>{accountStateLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ACCOUNT_STATE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden lg:block">
            <Select
              value={origin}
              onValueChange={(value) =>
                value && setOrigin(value as AccountOriginFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر منبع ایجاد">
                <SelectValue>{originLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ACCOUNT_ORIGIN_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-2 lg:hidden">
            <Select
              value={accountState}
              onValueChange={(value) =>
                value && setAccountState(value as AccountStateFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت حساب">
                <SelectValue>{accountStateLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ACCOUNT_STATE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={origin}
              onValueChange={(value) =>
                value && setOrigin(value as AccountOriginFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر منبع ایجاد">
                <SelectValue>{originLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ACCOUNT_ORIGIN_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!canCreateCustomer && (
        <div
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          role="note"
        >
          دسترسی ایجاد مشتری برای نقش فعلی فعال نیست. برای ایجاد حساب، درخواست
          را به همکار دارای این دسترسی ارجاع دهید.
        </div>
      )}

      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {hasActiveSearch ? (
              <SearchX className="size-6" aria-hidden="true" />
            ) : (
              <UserPlus className="size-6" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-medium">
              {hasActiveSearch
                ? "مشتری مطابق با این جستجو پیدا نشد"
                : "مشتری‌ای در محدوده دسترسی شما نیست"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveSearch
                ? "جستجو را با شناسه تماس دقیق‌تر تکرار کنید یا مشتری جدید بسازید. نتیجه خالی به معنای نبودن حساب در کل سامانه نیست."
                : "با تغییر فیلترها جستجو کنید یا در صورت داشتن دسترسی، مشتری جدید بسازید."}
            </p>
          </div>
          {canCreateCustomer && (
            <Link href="/users/new" className={buttonVariants()}>
              ایجاد مشتری
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 py-3">مشتری</TableHead>
                  <TableHead className="px-4 py-3">شناسه تماس</TableHead>
                  <TableHead className="px-4 py-3">احراز هویت</TableHead>
                  <TableHead className="px-4 py-3">وضعیت حساب</TableHead>
                  <TableHead className="px-4 py-3">وب‌سایت‌ها</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <CustomerTableRow key={row.user.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredRows.map((row) => (
              <CustomerCard key={row.user.id} row={row} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
