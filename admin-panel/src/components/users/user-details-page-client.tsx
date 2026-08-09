"use client";

import { UserDetailsView } from "@/components/users/user-details-view";
import { getRuntimeUser } from "@/lib/data/users-runtime";

export type UserDetailsPageClientProps = {
  id: string;
};

export function UserDetailsPageClient({ id }: UserDetailsPageClientProps) {
  const user = getRuntimeUser(id);

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        کاربر موردنظر پیدا نشد.
      </div>
    );
  }

  return <UserDetailsView key={user.id} initialUser={user} />;
}
