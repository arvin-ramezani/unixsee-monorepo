import Link from "next/link";

import { UsersView } from "@/components/users/users-view";
import { buttonVariants } from "@/components/ui/button";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { type AdminAuthorizationListResponse } from "@/lib/authorization/map-admin-authorization-case";
import { getAuthorizationQueueSummary } from "@/lib/data/authorization-runtime";
import {
  mapAuthorizationCaseStatusToUserKyc,
  mapAdminUserListToQueueRows,
  USER_KYC_STATUS,
  type AdminUserListResponse,
} from "@/lib/users/map-admin-user";
import {
  getFixtureCustomerQueueRows,
  mergeNestOverFixtureQueueRows,
  type HybridCustomerQueueRowType,
} from "@/lib/users/merge-nest-over-fixture";
import { findAuthorizationCaseByUserId } from "@/lib/data/authorization-runtime";

const PAGE_SIZE = 50;

function applyKycStatusToRows(
  rows: HybridCustomerQueueRowType[],
  statusByUserId: Map<string, string>,
): HybridCustomerQueueRowType[] {
  return rows.map((row) => {
    const nestStatus = statusByUserId.get(row.user.id);
    if (nestStatus) {
      return {
        ...row,
        authorization: mapAuthorizationCaseStatusToUserKyc(nestStatus),
      };
    }
    if (row.source === "fixture") {
      const fixtureCase = findAuthorizationCaseByUserId(row.user.id);
      return {
        ...row,
        authorization: fixtureCase
          ? mapAuthorizationCaseStatusToUserKyc(fixtureCase.status)
          : USER_KYC_STATUS.NOT_SUBMITTED,
      };
    }
    return {
      ...row,
      authorization: row.authorization ?? USER_KYC_STATUS.NOT_SUBMITTED,
    };
  });
}

export default async function UsersPage() {
  const fixtureRows = getFixtureCustomerQueueRows();

  let nestRows: ReturnType<typeof mapAdminUserListToQueueRows> = [];
  let nestTotal: number | null = null;
  let nestWarning: string | null = null;
  let pendingAuthCount = getAuthorizationQueueSummary().pending;
  const kycStatusByUserId = new Map<string, string>();

  try {
    const query = new URLSearchParams({
      skip: "0",
      take: String(PAGE_SIZE),
    });
    const response = await serverFetch<AdminUserListResponse>(
      `/admin/users?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      nestWarning = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      nestRows = mapAdminUserListToQueueRows(response.data);
      nestTotal = response.data.total;
    }
  } catch {
    nestWarning = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  try {
    const authResponse = await serverFetch<AdminAuthorizationListResponse>(
      "/admin/authorization-cases?skip=0&take=100",
      { method: "GET" },
    );
    if (authResponse.success && authResponse.data) {
      pendingAuthCount = authResponse.data.items.filter(
        (item) => item.status === "pending_review",
      ).length;
      for (const item of authResponse.data.items) {
        const previous = kycStatusByUserId.get(item.userId);
        // Prefer terminal outcomes over in-progress when multiple exist.
        if (
          !previous ||
          item.status === "approved" ||
          item.status === "rejected"
        ) {
          kycStatusByUserId.set(item.userId, item.status);
        }
      }
    }
  } catch {
    // keep fixture summary
  }

  const merged = mergeNestOverFixtureQueueRows(nestRows, fixtureRows);
  const rows: HybridCustomerQueueRowType[] = applyKycStatusToRows(
    merged.rows,
    kycStatusByUserId,
  );
  const totalCount =
    nestTotal === null ? rows.length : nestTotal + merged.fixtureCount;

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">کاربران</h1>
        </div>
        <Link
          href="/users/authorization"
          className={buttonVariants({ className: "min-h-11 shrink-0" })}
        >
          بررسی مدارک احراز هویت
          {pendingAuthCount > 0
            ? ` (${pendingAuthCount.toLocaleString("fa-IR")} در انتظار)`
            : ""}
        </Link>
      </div>

      <UsersView
        initialRows={rows}
        nestWarning={nestWarning}
        totalCount={totalCount}
        nestCount={merged.nestCount}
        fixtureCount={merged.fixtureCount}
      />
    </div>
  );
}
