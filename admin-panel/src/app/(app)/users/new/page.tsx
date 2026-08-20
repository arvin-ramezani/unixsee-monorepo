import { NewCustomerPageClient } from "@/components/users/new-customer-page-client";
import {
  readSafeInternalPath,
  readStringParam,
} from "@/lib/url-search-params";

export type NewCustomerPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
    assign?: string | string[];
  }>;
};

export default async function NewCustomerPage({
  searchParams,
}: NewCustomerPageProps) {
  const params = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <NewCustomerPageClient
        returnTo={readSafeInternalPath(params.returnTo)}
        assign={readStringParam(params.assign) ?? null}
      />
    </div>
  );
}
