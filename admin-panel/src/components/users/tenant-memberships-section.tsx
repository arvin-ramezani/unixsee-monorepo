"use client";

import Link from "next/link";
import { AlertTriangle, Building2, Globe2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEMBERSHIP_ROLE,
  MEMBERSHIP_ROLE_LABELS,
  type CustomerUserType,
  type MembershipRoleType,
  type MembershipType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  formatContactSummary,
  getTenantAssignmentEligibility,
  getTenantMembers,
  getTenantWebsites,
  isLastOwnerMembership,
  looksLikePhoneLabel,
  type TenantMembershipType,
} from "@/lib/users-utils";
import { cn } from "@/lib/utils";
import { TenantStateBadge } from "./account-status-badge";

function resolveTenantCardTitle(
  tenant: TenantType,
  pageUser: CustomerUserType,
): string {
  if (!looksLikePhoneLabel(tenant.name)) {
    return tenant.name;
  }
  if (
    pageUser.displayName.trim() &&
    !looksLikePhoneLabel(pageUser.displayName)
  ) {
    return pageUser.displayName;
  }
  return tenant.name;
}

const MEMBERSHIP_ROLE_OPTIONS = [
  {
    value: MEMBERSHIP_ROLE.OWNER,
    label: MEMBERSHIP_ROLE_LABELS[MEMBERSHIP_ROLE.OWNER],
  },
  {
    value: MEMBERSHIP_ROLE.MANAGER,
    label: MEMBERSHIP_ROLE_LABELS[MEMBERSHIP_ROLE.MANAGER],
  },
  {
    value: MEMBERSHIP_ROLE.VIEWER,
    label: MEMBERSHIP_ROLE_LABELS[MEMBERSHIP_ROLE.VIEWER],
  },
] as const;

const surfaceClassName = "rounded-2xl border border-border bg-card/90";
const mutedSurfaceClassName = "rounded-2xl border border-border bg-muted/30";

type TenantMembershipsSectionProps = {
  user: CustomerUserType;
  tenantMemberships: TenantMembershipType[];
  users: CustomerUserType[];
  memberships: MembershipType[];
  canManageMembership: boolean;
  onChangeRole: (membershipId: string, role: MembershipRoleType) => void;
  onRemoveMembership: (membershipId: string) => void;
  onAddMemberRequest: (tenant: TenantType) => void;
};

export function TenantMembershipsSection({
  user,
  tenantMemberships,
  users,
  memberships,
  canManageMembership,
  onChangeRole,
  onRemoveMembership,
  onAddMemberRequest,
}: TenantMembershipsSectionProps) {
  return (
    <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
      <div className="flex items-center gap-2">
        <Building2 className="size-5" aria-hidden="true" />
        <h2 className="font-semibold">مستأجرها و عضویت‌ها</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        مالکیت وب‌سایت به مستأجر تعلق دارد، نه به کاربر. هر مستأجر باید همیشه
        حداقل یک مالک داشته باشد.
      </p>

      {tenantMemberships.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          این مشتری عضو هیچ مستأجری نیست، بنابراین به هیچ وب‌سایتی دسترسی ندارد.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {tenantMemberships.map(({ tenant, membership }) => {
            const members = getTenantMembers(tenant.id, users, memberships);
            const websites = getTenantWebsites(tenant.id);
            const eligibility = getTenantAssignmentEligibility(
              tenant,
              memberships,
            );
            const candidates = users.filter(
              (candidate) =>
                !members.some((member) => member.user.id === candidate.id),
            );

            return (
              <article
                key={membership.id}
                className={cn(mutedSurfaceClassName, "p-4")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {resolveTenantCardTitle(tenant, user)}
                    </p>
                    <p
                      className="mt-1 text-xs text-muted-foreground w-fit"
                      dir="ltr"
                    >
                      {tenant.id}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      نقش {user.displayName} در این مستأجر:{" "}
                      {MEMBERSHIP_ROLE_LABELS[membership.role]}
                    </p>
                  </div>
                  <TenantStateBadge state={tenant.state} />
                </div>

                {!eligibility.eligible && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                    role="note"
                  >
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <p>{eligibility.reason}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe2 className="size-4" aria-hidden="true" />
                  <p>
                    {websites.length === 0
                      ? "هنوز وب‌سایتی به این مستأجر تخصیص نیافته است."
                      : `${websites.length.toLocaleString("fa-IR")} وب‌سایت متعلق به این مستأجر`}
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {members.map((member) => {
                    const isLastOwner = isLastOwnerMembership(
                      member.membership,
                      memberships,
                    );

                    return (
                      <li
                        key={member.membership.id}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/users/${member.user.id}`}
                            className="font-medium hover:underline"
                          >
                            {member.user.displayName}
                          </Link>
                          <p
                            className="mt-1 text-xs text-muted-foreground"
                            dir="ltr"
                          >
                            {formatContactSummary(member.user)}
                          </p>
                          {isLastOwner && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              تنها مالک این مستأجر است.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {canManageMembership ? (
                            <Select
                              value={member.membership.role}
                              onValueChange={(value) =>
                                value &&
                                onChangeRole(
                                  member.membership.id,
                                  value as MembershipRoleType,
                                )
                              }
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label={`نقش ${member.user.displayName}`}
                              >
                                <SelectValue>
                                  {
                                    MEMBERSHIP_ROLE_LABELS[
                                      member.membership.role
                                    ]
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent alignItemWithTrigger={false}>
                                {MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {MEMBERSHIP_ROLE_LABELS[member.membership.role]}
                            </span>
                          )}

                          {canManageMembership && (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                onRemoveMembership(member.membership.id)
                              }
                            >
                              حذف عضویت
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {canManageMembership && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onAddMemberRequest(tenant)}
                      disabled={candidates.length === 0}
                    >
                      <UserPlus className="size-4" aria-hidden="true" />
                      افزودن عضو
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!canManageMembership && (
        <p className="mt-4 text-sm text-muted-foreground">
          دسترسی مدیریت عضویت برای نقش فعلی فعال نیست. تغییر نقش و حذف عضویت
          نمایش داده نمی‌شود.
        </p>
      )}
    </section>
  );
}
