"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
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
                  {user.fullName && user.phoneNumber && (
                    <span className="text-xs text-muted-foreground">
                      {user.phoneNumber}
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
          value={planId}
          onValueChange={(value: string | null) => setPlanId(value ?? "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="بدون پلن" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {initialPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
