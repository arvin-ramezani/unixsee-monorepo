import {
  listRuntimeMemberships,
  listRuntimeTenants,
  listRuntimeUsers,
} from "@/lib/data/users-runtime";
import {
  buildCustomerQueueRows,
  normalizeEmail,
  normalizeMobile,
  type CustomerQueueRowType,
} from "@/lib/users-utils";

export type CustomerDataSource = "nest" | "fixture";

export type HybridCustomerQueueRowType = CustomerQueueRowType & {
  source: CustomerDataSource;
};

export type MergeNestOverFixtureResult = {
  rows: HybridCustomerQueueRowType[];
  nestCount: number;
  fixtureCount: number;
};

/** Fixture queue rows from in-session runtime (includes session-created customers). */
export function getFixtureCustomerQueueRows(): CustomerQueueRowType[] {
  return buildCustomerQueueRows(
    listRuntimeUsers(),
    listRuntimeTenants(),
    listRuntimeMemberships(),
  );
}

/**
 * Nest rows first; fixtures follow when they do not collide by id, mobile, or email.
 * Nest always wins for shared identity keys.
 */
export function mergeNestOverFixtureQueueRows(
  nestRows: CustomerQueueRowType[],
  fixtureRows: CustomerQueueRowType[] = getFixtureCustomerQueueRows(),
): MergeNestOverFixtureResult {
  const nestIds = new Set(nestRows.map((row) => row.user.id));
  const nestMobiles = new Set(
    nestRows.map((row) => normalizeMobile(row.user.mobile)).filter(Boolean),
  );
  const nestEmails = new Set(
    nestRows
      .map((row) => (row.user.email ? normalizeEmail(row.user.email) : ""))
      .filter(Boolean),
  );

  const nestTagged: HybridCustomerQueueRowType[] = nestRows.map((row) => ({
    ...row,
    source: "nest",
  }));

  const fixtureTagged: HybridCustomerQueueRowType[] = [];
  for (const row of fixtureRows) {
    if (nestIds.has(row.user.id)) continue;
    if (nestMobiles.has(normalizeMobile(row.user.mobile))) continue;
    const email = row.user.email ? normalizeEmail(row.user.email) : "";
    if (email && nestEmails.has(email)) continue;
    fixtureTagged.push({ ...row, source: "fixture" });
  }

  return {
    rows: [...nestTagged, ...fixtureTagged],
    nestCount: nestTagged.length,
    fixtureCount: fixtureTagged.length,
  };
}
