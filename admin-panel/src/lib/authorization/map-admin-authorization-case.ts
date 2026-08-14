import {
  AUTHORIZATION_FIX_FIELD,
  AUTHORIZATION_STATUS,
  CONTACT_CHALLENGE,
  type AuthorizationCaseType,
  type AuthorizationFixFieldType,
  type AuthorizationStatusType,
  type ContactChallengeType,
} from "@/lib/data/authorization-data";

export type AdminAuthorizationCaseDto = {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string | null;
  userMobile: string;
  status: string;
  package: {
    nationalId: string;
    birthDate: string;
    mobile: string;
    mobileChallenge: string;
    mobileBelongsToNationalId: boolean;
    email: string;
    emailChallenge: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
    nationalIdCardFileName: string | null;
    nationalIdCardPreviewLabel: string;
    attestedTruthful: boolean;
  };
  relatedPlanRequestIds: string[];
  staffReason: string | null;
  staffFieldsToFix: string[];
  submittedAt: string;
  updatedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  tenantId: string | null;
  tenantName: string | null;
  history: Array<{
    id: string;
    at: string;
    action: string;
    actorName: string;
    note?: string | null;
  }>;
};

export type AdminAuthorizationListResponse = {
  items: AdminAuthorizationCaseDto[];
  total: number;
};

const STATUS_SET = new Set<string>(Object.values(AUTHORIZATION_STATUS));
const CHALLENGE_SET = new Set<string>(Object.values(CONTACT_CHALLENGE));
const FIX_FIELD_SET = new Set<string>(Object.values(AUTHORIZATION_FIX_FIELD));

function asStatus(value: string): AuthorizationStatusType {
  if (STATUS_SET.has(value)) return value as AuthorizationStatusType;
  return AUTHORIZATION_STATUS.PENDING_REVIEW;
}

function asChallenge(value: string): ContactChallengeType {
  if (CHALLENGE_SET.has(value)) return value as ContactChallengeType;
  return CONTACT_CHALLENGE.UNVERIFIED;
}

function asFixFields(values: string[]): AuthorizationFixFieldType[] {
  return values.filter((value): value is AuthorizationFixFieldType =>
    FIX_FIELD_SET.has(value),
  );
}

export function mapAdminAuthorizationCaseToUi(
  dto: AdminAuthorizationCaseDto,
): AuthorizationCaseType {
  return {
    id: dto.id,
    userId: dto.userId,
    userDisplayName: dto.userDisplayName,
    userEmail: dto.userEmail,
    userMobile: dto.userMobile,
    status: asStatus(dto.status),
    package: {
      nationalId: dto.package.nationalId,
      birthDate: dto.package.birthDate,
      mobile: dto.package.mobile,
      mobileChallenge: asChallenge(dto.package.mobileChallenge),
      email: dto.package.email,
      emailChallenge: asChallenge(dto.package.emailChallenge),
      province: dto.package.province,
      city: dto.package.city,
      address: dto.package.address,
      postalCode: dto.package.postalCode,
      nationalIdCardFileName: dto.package.nationalIdCardFileName ?? "—",
      nationalIdCardPreviewLabel: dto.package.nationalIdCardPreviewLabel,
    },
    relatedPlanRequestIds: dto.relatedPlanRequestIds ?? [],
    staffReason: dto.staffReason,
    staffFieldsToFix: asFixFields(dto.staffFieldsToFix ?? []),
    submittedAt: dto.submittedAt,
    updatedAt: dto.updatedAt,
    decidedAt: dto.decidedAt,
    decidedBy: dto.decidedBy,
    tenantId: dto.tenantId,
    tenantName: dto.tenantName,
    history: dto.history ?? [],
  };
}

export function isNestAuthorizationCaseId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}
