"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { CustomerCreateForm } from "@/components/users/customer-create-form";
import type { CreateCustomerResultType } from "@/lib/data/users-runtime";

type NewCustomerPageClientProps = {
  returnTo: string | null;
  assign: string | null;
};

function destinationFor(
  result: CreateCustomerResultType,
  returnTo: string | null,
  assign: string | null,
) {
  if (!returnTo) {
    return `/users/${result.user.id}`;
  }

  if (assign) {
    const separator = returnTo.includes("?") ? "&" : "?";
    return `${returnTo}${separator}assign=${encodeURIComponent(assign)}&tenantId=${encodeURIComponent(result.tenant.id)}`;
  }

  return returnTo;
}

export function NewCustomerPageClient({
  returnTo,
  assign,
}: NewCustomerPageClientProps) {
  const router = useRouter();
  const cancelHref = returnTo ?? "/users";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Link
        href={cancelHref}
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "w-fit gap-2",
        })}
        aria-label="بازگشت"
      >
        <ArrowRight data-icon="inline-start" />
        بازگشت
      </Link>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          ایجاد مشتری جدید
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مشتری، مستأجر و عضویت مالک با هم ساخته می‌شوند. حساب تا تکمیل
          دعوت‌نامه توسط مشتری تأییدنشده می‌ماند.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <CustomerCreateForm
          onCancel={() => router.push(cancelHref)}
          onCreated={(result) => {
            toast.success(
              `مشتری ${result.user.displayName} و مستأجر ${result.tenant.name} ایجاد شد. دعوت‌نامه ارسال شده و حساب تا تکمیل آن تأییدنشده است.`,
            );
            router.push(destinationFor(result, returnTo, assign));
          }}
        />
      </div>
    </div>
  );
}
