"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { clientFetch } from "@/lib/api/client-fetch";

type UserOption = {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  email: string | null;
};

type PlanOption = { id: string; name: string };

type FieldErrors = { domain?: string; userId?: string };

const PLAN_ASSIGNMENT_MODE = {
  LINK_ONLY: "LINK_ONLY",
  ACTIVATE_NOW: "ACTIVATE_NOW",
} as const;

type PlanAssignmentMode =
  (typeof PLAN_ASSIGNMENT_MODE)[keyof typeof PLAN_ASSIGNMENT_MODE];

function userLabel(u: UserOption): string {
  if (u.fullName) return u.fullName;
  if (u.phoneNumber) return u.phoneNumber;
  if (u.email) return u.email;
  return u.id;
}

export function CreateWebsiteForm({
  users: initialUsers,
  plans: initialPlans,
}: {
  users: UserOption[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [planAssignmentMode, setPlanAssignmentMode] =
    useState<PlanAssignmentMode>(PLAN_ASSIGNMENT_MODE.LINK_ONLY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!domain.trim()) {
      next.domain = "دامنه الزامی است";
    } else if (
      !/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain.trim())
    ) {
      next.domain = "دامنه معتبر نیست";
    }
    if (!userId) {
      next.userId = "کاربر الزامی است";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const tenantResult = await clientFetch<{ id: string }>(
        `/admin/users/${userId}/tenant`,
        { method: "GET" },
      );

      if (!tenantResult.success || !tenantResult.data) {
        toast.error("خطا در دریافت مستأجر");
        setSubmitting(false);
        return;
      }

      const tenantId = tenantResult.data.id;

      const result = await clientFetch("/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          displayName: displayName.trim() || undefined,
          tenantId,
          planId: planId || undefined,
          activatePlan:
            Boolean(planId) &&
            planAssignmentMode === PLAN_ASSIGNMENT_MODE.ACTIVATE_NOW,
        }),
      });
      if (result.success) {
        toast.success("وب‌سایت با موفقیت ایجاد شد");
        router.push("/websites");
        router.refresh();
      } else {
        toast.error(result.message ?? "خطا در ایجاد وب‌سایت");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedUser = initialUsers.find((u) => u.id === userId);
  const selectedPlan = initialPlans.find((plan) => plan.id === planId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="domain" className="text-sm font-medium">
          دامنه *
        </label>
        <div className="relative">
          <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setErrors((prev) => ({ ...prev, domain: undefined }));
            }}
            placeholder="example.com"
            dir="ltr"
            className="ps-10"
            aria-invalid={Boolean(errors.domain)}
            aria-describedby={errors.domain ? "domain-error" : undefined}
          />
        </div>
        {errors.domain && (
          <p id="domain-error" className="text-sm text-destructive">
            {errors.domain}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          نام نمایشی
        </label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="نام اختیاری وب‌سایت"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">کاربر *</label>
        <Select
          value={userId}
          onValueChange={(value: string | null) => {
            setUserId(value ?? "");
            setErrors((prev) => ({ ...prev, userId: undefined }));
          }}
        >
          <SelectTrigger aria-invalid={Boolean(errors.userId)}>
            <SelectValue placeholder="انتخاب کاربر">
              {selectedUser ? userLabel(selectedUser) : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {initialUsers.map((user) => (
              <SelectItem
                dir="ltr"
                className={"border-b"}
                key={user.id}
                value={user.id}
              >
                <div className="flex flex-col gap-0.5">
                  <span>{userLabel(user)}</span>
                  {user.fullName && (user.phoneNumber || user.email) && (
                    <span className="text-xs text-muted-foreground">
                      {[user.phoneNumber, user.email]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.userId && (
          <p className="text-sm text-destructive">{errors.userId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">پلن (اختیاری)</label>
        <Select
          value={planId || "__none__"}
          onValueChange={(value: string | null) => {
            const nextPlanId = value === "__none__" ? "" : (value ?? "");
            setPlanId(nextPlanId);
            if (!nextPlanId) {
              setPlanAssignmentMode(PLAN_ASSIGNMENT_MODE.LINK_ONLY);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="بدون پلن">
              {selectedPlan?.name ?? "بدون پلن"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectItem value="__none__">بدون پلن</SelectItem>
              {initialPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {planId && (
          <RadioGroup
            value={planAssignmentMode}
            onValueChange={(value) =>
              setPlanAssignmentMode(value as PlanAssignmentMode)
            }
            className="rounded-xl border p-3"
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
              <RadioGroupItem
                value={PLAN_ASSIGNMENT_MODE.LINK_ONLY}
                id="plan-link-only"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">فقط اتصال پلن</span>
                <span className="block text-xs text-muted-foreground">
                  پلن به وب‌سایت متصل می‌شود، اما شروع و فعال نمی‌شود.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
              <RadioGroupItem
                value={PLAN_ASSIGNMENT_MODE.ACTIVATE_NOW}
                id="plan-activate-now"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">
                  اتصال و فعال‌سازی فوری
                </span>
                <span className="block text-xs text-muted-foreground">
                  زمان شروع پلن همین حالا ثبت می‌شود.
                </span>
              </span>
            </label>
          </RadioGroup>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <LoaderCircle className="ms-2 size-4 animate-spin" />}
          ایجاد وب‌سایت
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}
