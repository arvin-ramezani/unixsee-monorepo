import { notFound } from "next/navigation";

import { AuthorizationDetailsView } from "@/components/authorization/authorization-details-view";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  isNestAuthorizationCaseId,
  mapAdminAuthorizationCaseToUi,
  type AdminAuthorizationCaseDto,
} from "@/lib/authorization/map-admin-authorization-case";
import { getRuntimeAuthorizationCase } from "@/lib/data/authorization-runtime";

export type AuthorizationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AuthorizationDetailsPage({
  params,
}: AuthorizationDetailsPageProps) {
  const { id } = await params;

  if (isNestAuthorizationCaseId(id)) {
    try {
      const response = await serverFetch<AdminAuthorizationCaseDto>(
        `/admin/authorization-cases/${id}`,
        { method: "GET" },
      );
      if (response.success && response.data) {
        return (
          <div className="flex flex-1 flex-col gap-6 pt-4">
            <AuthorizationDetailsView
              initialCase={mapAdminAuthorizationCaseToUi(response.data)}
              source="nest"
            />
          </div>
        );
      }
    } catch {
      // fall through to fixture / notFound
    }
  }

  const authCase = getRuntimeAuthorizationCase(id);
  if (!authCase) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <AuthorizationDetailsView initialCase={authCase} source="fixture" />
    </div>
  );
}
