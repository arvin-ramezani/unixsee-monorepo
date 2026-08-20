import {
  type AccountStateType,
  type TenantStateType,
} from "@/lib/data/users-data";
import { ACCOUNT_STATE_CONFIG, TENANT_STATE_CONFIG } from "@/lib/users-utils";
import { cn } from "@/lib/utils";

const badgeClassName =
  "inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs whitespace-nowrap";

type AccountStateBadgeProps = {
  state: AccountStateType;
  className?: string;
};

export function AccountStateBadge({
  state,
  className,
}: AccountStateBadgeProps) {
  const config = ACCOUNT_STATE_CONFIG[state];

  return (
    <span className={cn(badgeClassName, config.className, className)}>
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </span>
  );
}

type TenantStateBadgeProps = {
  state: TenantStateType;
  className?: string;
};

export function TenantStateBadge({ state, className }: TenantStateBadgeProps) {
  const config = TENANT_STATE_CONFIG[state];

  return (
    <span className={cn(badgeClassName, config.className, className)}>
      {config.label}
    </span>
  );
}
