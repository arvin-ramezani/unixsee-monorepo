import type { PlanRequestType } from "@/lib/data/plan-requests-data";
import { maskEmail, maskMobile } from "@/lib/users-utils";

export function resolvePlanRequestContactPrimary(
  request: PlanRequestType,
): string {
  return request.linkedUserName ?? request.contactName;
}

export function resolvePlanRequestContactSecondary(
  request: PlanRequestType,
): string {
  if (request.contactMobile) {
    return maskMobile(request.contactMobile);
  }
  if (request.contactEmail) {
    return maskEmail(request.contactEmail);
  }
  return "—";
}

export function resolvePlanRequestWebsiteLabel(request: PlanRequestType): string {
  return request.targetWebsiteDomain ?? request.domainHint ?? "—";
}
