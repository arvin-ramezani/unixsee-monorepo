import type { NestAuthorizationCaseDto } from "@/actions/authorization/authorization-case";
import {
  AUTHORIZATION_STATUS,
  type AuthorizationCase,
  type AuthorizationPackage,
  type AuthorizationStatus,
  type ContactChallengeState,
} from "@/lib/data/authorization/authorization-data";

const STATUSES = new Set<string>(Object.values(AUTHORIZATION_STATUS));

function asStatus(value: string): AuthorizationStatus {
  if (STATUSES.has(value)) return value as AuthorizationStatus;
  return AUTHORIZATION_STATUS.DRAFT;
}

function asChallenge(value: string): ContactChallengeState {
  if (
    value === "skipped_already_verified" ||
    value === "verified" ||
    value === "pending" ||
    value === "unverified"
  ) {
    return value;
  }
  return "unverified";
}

export function mapNestAuthorizationCase(
  dto: NestAuthorizationCaseDto,
): AuthorizationCase {
  const pkg: AuthorizationPackage = {
    nationalId: dto.package.nationalId,
    birthDate: dto.package.birthDate,
    mobile: dto.package.mobile,
    mobileChallenge: asChallenge(dto.package.mobileChallenge),
    mobileBelongsToNationalId: dto.package.mobileBelongsToNationalId,
    email: dto.package.email,
    emailChallenge: asChallenge(dto.package.emailChallenge),
    province: dto.package.province,
    city: dto.package.city,
    address: dto.package.address,
    postalCode: dto.package.postalCode,
    nationalIdCardFileName: dto.package.nationalIdCardFileName,
    nationalIdCardPreviewUrl: null,
    attestedTruthful: dto.package.attestedTruthful,
  };

  return {
    id: dto.id,
    status: asStatus(dto.status),
    package: pkg,
    staffReason: dto.staffReason,
    staffFieldsToFix: dto.staffFieldsToFix,
    submittedAt: dto.submittedAt,
    decidedAt: dto.decidedAt,
    tenantId: dto.tenantId,
    updatedAt: dto.updatedAt,
  };
}
