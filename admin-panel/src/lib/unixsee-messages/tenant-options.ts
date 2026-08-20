import type { AdminUserDto } from "@/lib/users/map-admin-user";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function looksLikePhoneLabel(value: string): boolean {
  const normalized = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{8,15}$/.test(normalized);
}

function isOpaqueLabel(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return true;
  if (UUID_RE.test(trimmed)) return true;
  if (looksLikePhoneLabel(trimmed)) return true;
  return false;
}

function resolvePersonLabel(
  user: Pick<AdminUserDto, "fullName" | "username" | "email" | "phoneNumber">,
): string | null {
  const candidates = [
    user.fullName?.trim(),
    user.username?.trim(),
    user.email?.trim(),
  ].filter((value): value is string => Boolean(value));

  const human = candidates.find((value) => !isOpaqueLabel(value));
  return human ?? null;
}

function resolveTenantLabel(
  tenant: NonNullable<
    NonNullable<AdminUserDto["memberships"]>[number]["tenant"]
  >,
  user: AdminUserDto,
): string {
  const person = resolvePersonLabel(user);
  const candidates = [
    tenant.displayName?.trim(),
    tenant.name?.trim(),
    person,
  ].filter((value): value is string => Boolean(value));

  const human = candidates.find((value) => !isOpaqueLabel(value));
  if (human) return human;

  // Last resort only — prefer person name path above whenever available.
  return person || user.phoneNumber?.trim() || tenant.id;
}

function scoreMembershipRole(role: string | undefined): number {
  if (role === "OWNER") return 3;
  if (role === "ADMIN") return 2;
  return 1;
}

/**
 * Build tenant picker options labeled by a human name when possible.
 * OTP personal tenants often store phone as tenant name — skip those and use
 * the owner/member fullName instead.
 */
export function buildTenantOptionsFromUsers(users: AdminUserDto[]) {
  const byId = new Map<
    string,
    { label: string; score: number; opaque: boolean }
  >();

  for (const user of users) {
    for (const membership of user.memberships ?? []) {
      const tenant = membership.tenant;
      if (!tenant?.id) continue;

      const label = resolveTenantLabel(tenant, user);
      const score = scoreMembershipRole(membership.role);
      const opaque = isOpaqueLabel(label);
      const existing = byId.get(tenant.id);

      if (
        !existing ||
        (existing.opaque && !opaque) ||
        (existing.opaque === opaque && score > existing.score)
      ) {
        byId.set(tenant.id, { label, score, opaque });
      }
    }
  }

  return Array.from(byId.entries())
    .map(([id, value]) => ({ id, label: value.label }))
    .sort((a, b) => a.label.localeCompare(b.label, "fa"));
}
