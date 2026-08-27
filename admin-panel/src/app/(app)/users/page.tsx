import Link from "next/link";

import { UsersView } from "@/components/users/users-view";
import { buttonVariants } from "@/components/ui/button";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { type AdminAuthorizationListResponse } from "@/lib/authorization/map-admin-authorization-case";
import {
  mapAuthorizationCaseStatusToUserKyc,
  mapAdminUserListToQueueRows,
  USER_KYC_STATUS,
  type AdminUserListResponse,
} from "@/lib/users/map-admin-user";
import { type HybridCustomerQueueRowType } from "@/lib/users/merge-nest-over-fixture";

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
    return {
      ...row,
      authorization: row.authorization ?? USER_KYC_STATUS.NOT_SUBMITTED,
    };
  });
}

export default async function UsersPage() {
  let nestRows: HybridCustomerQueueRowType[] = [];
  let nestTotal = 0;
  let loadError: string | null = null;
  let pendingAuthCount = 0;
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
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      nestRows = mapAdminUserListToQueueRows(response.data).map((row) => ({
        ...row,
        source: "nest" as const,
      }));
      nestTotal = response.data.total;
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
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
    // KYC badges fall back to NOT_SUBMITTED; list still Nest-only.
  }

  const rows = applyKycStatusToRows(nestRows, kycStatusByUserId);

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
        loadError={loadError}
        totalCount={loadError ? null : nestTotal}
      />
    </div>
  );
}
