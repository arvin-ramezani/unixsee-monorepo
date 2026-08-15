import Link from "next/link";

import { UserDetailsView } from "@/components/users/user-details-view";
import { buttonVariants } from "@/components/ui/button";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { type AdminAuthorizationListResponse } from "@/lib/authorization/map-admin-authorization-case";
import { findAuthorizationCaseByUserId } from "@/lib/data/authorization-runtime";
import {
  getRuntimeUser,
  listRuntimeMemberships,
  listRuntimeTenants,
} from "@/lib/data/users-runtime";
import {
  mapAdminUserDetail,
  mapAuthorizationCaseStatusToUserKyc,
  USER_KYC_STATUS,
  type AdminUserDto,
  type MappedAdminUserBundle,
} from "@/lib/users/map-admin-user";
import { getUserTenantMemberships } from "@/lib/users-utils";

export type UserDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function mapFixtureUserDetail(id: string): MappedAdminUserBundle | null {
  const user = getRuntimeUser(id);
  if (!user) return null;

  const tenants = listRuntimeTenants();
  const memberships = listRuntimeMemberships().filter(
    (membership) => membership.userId === id,
  );
  const tenantMemberships = getUserTenantMemberships(
    id,
    tenants,
    listRuntimeMemberships(),
  );
  const userTenants = tenantMemberships.map((item) => item.tenant);
  const fixtureCase = findAuthorizationCaseByUserId(id);

  return {
    user,
    tenants: userTenants,
    memberships,
    websiteCount: 0,
    authorization: fixtureCase
      ? mapAuthorizationCaseStatusToUserKyc(fixtureCase.status)
      : USER_KYC_STATUS.NOT_SUBMITTED,
  };
}

async function loadUserKycStatus(userId: string) {
  try {
    const response = await serverFetch<AdminAuthorizationListResponse>(
      "/admin/authorization-cases?skip=0&take=100",
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      return USER_KYC_STATUS.NOT_SUBMITTED;
    }
    const cases = response.data.items.filter((item) => item.userId === userId);
    const preferred =
      cases.find((item) => item.status === "approved") ??
      cases.find((item) => item.status === "rejected") ??
      cases[0];
    return mapAuthorizationCaseStatusToUserKyc(preferred?.status);
  } catch {
    return USER_KYC_STATUS.NOT_SUBMITTED;
  }
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  let nestBundle: MappedAdminUserBundle | null = null;
  let nestWarning: string | null = null;

  try {
    const response = await serverFetch<AdminUserDto>(`/admin/users/${id}`, {
      method: "GET",
    });

    if (response.success && response.data) {
      const mapped = mapAdminUserDetail(response.data);
      nestBundle = {
        ...mapped,
        authorization: await loadUserKycStatus(id),
      };
    } else {
      const mappedError = mapApiError(response);
      nestWarning = mappedError
        ? STAFF_API_ERROR_MESSAGES[mappedError.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    }
  } catch {
    nestWarning = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  if (nestBundle) {
    return (
      <div className="flex flex-1 flex-col gap-6 pt-4">
        <UserDetailsView
          key={nestBundle.user.id}
          initialUser={nestBundle.user}
          initialTenants={nestBundle.tenants}
          initialMemberships={nestBundle.memberships}
          authorization={nestBundle.authorization}
          nestBacked
        />
      </div>
    );
  }

  const fixtureBundle = mapFixtureUserDetail(id);
  if (fixtureBundle) {
    return (
      <div className="flex flex-1 flex-col gap-6 pt-4">
        {nestWarning && (
          <div
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
            role="status"
          >
            Nest این شناسه را برنگرداند ({nestWarning}). در حال نمایش نمونه
            محلی.
          </div>
        )}
        <UserDetailsView
          key={fixtureBundle.user.id}
          initialUser={fixtureBundle.user}
          initialTenants={fixtureBundle.tenants}
          initialMemberships={fixtureBundle.memberships}
          authorization={fixtureBundle.authorization}
          nestBacked={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-4">
      <Link
        href="/users"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        بازگشت به کاربران
      </Link>
      <div
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
        role="alert"
      >
        {nestWarning ?? STAFF_API_ERROR_MESSAGES.notFound}
      </div>
    </div>
  );
}
