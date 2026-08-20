"use client";

import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type TenantType,
} from "@/lib/data/users-data";
import { formatContactSummary } from "@/lib/users-utils";

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

type AddMemberDialogProps = {
  open: boolean;
  tenant: TenantType | null;
  candidates: CustomerUserType[];
  onOpenChange: (open: boolean) => void;
  onAddMember: (values: { userId: string; role: MembershipRoleType }) => void;
};

function AddMemberForm({
  tenant,
  candidates,
  onCancel,
  onAddMember,
}: {
  tenant: TenantType;
  candidates: CustomerUserType[];
  onCancel: () => void;
  onAddMember: AddMemberDialogProps["onAddMember"];
}) {
  const [userId, setUserId] = useState(candidates[0]?.id ?? "");
  const [role, setRole] = useState<MembershipRoleType>(MEMBERSHIP_ROLE.MANAGER);

  const selectedUser = candidates.find((candidate) => candidate.id === userId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;

    onAddMember({ userId: selectedUser.id, role });
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{tenant.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                دسترسی مشتری به وب‌سایت‌ها از طریق عضویت در مستأجر داده می‌شود.
              </p>
            </div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            همه مشتریان در دسترس، از قبل عضو این مستأجر هستند.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="member-user" className="text-sm font-medium">
                مشتری
              </label>
              <Select
                value={userId}
                onValueChange={(value) => value && setUserId(value)}
              >
                <SelectTrigger
                  id="member-user"
                  className="w-full"
                  aria-label="انتخاب مشتری"
                >
                  <SelectValue>{selectedUser?.displayName ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {formatContactSummary(selectedUser)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="member-role" className="text-sm font-medium">
                نقش
              </label>
              <Select
                value={role}
                onValueChange={(value) =>
                  value && setRole(value as MembershipRoleType)
                }
              >
                <SelectTrigger
                  id="member-role"
                  className="w-full"
                  aria-label="نقش عضو"
                >
                  <SelectValue>{MEMBERSHIP_ROLE_LABELS[role]}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!selectedUser}>
          افزودن عضو
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddMemberDialog({
  open,
  tenant,
  candidates,
  onOpenChange,
  onAddMember,
}: AddMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-0"
        aria-describedby="add-member-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>افزودن عضو به مستأجر</DialogTitle>
          <DialogDescription id="add-member-description">
            یک مشتری موجود را با نقش مشخص به این مستأجر اضافه کنید.
          </DialogDescription>
        </DialogHeader>

        {tenant && (
          <AddMemberForm
            key={tenant.id}
            tenant={tenant}
            candidates={candidates}
            onCancel={() => onOpenChange(false)}
            onAddMember={(values) => {
              onAddMember(values);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
