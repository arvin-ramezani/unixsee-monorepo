"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { staffLoginAction } from "@/actions/auth/login";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSafeReturnToPath } from "@/lib/auth/auth-utils";
import {
  staffLoginSchema,
  type StaffLoginSchemaType,
} from "@/lib/zod-schemas/auth-schemas";

const ERROR_COPY = {
  invalidCredentials: "نام کاربری یا رمز عبور نادرست است.",
  unavailable: "سرویس در دسترس نیست. لطفاً بعداً تلاش کنید.",
} as const;

export function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<StaffLoginSchemaType>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: StaffLoginSchemaType) {
    setFormError(null);

    const result = await staffLoginAction(values);

    if (!result.ok) {
      setFormError(ERROR_COPY[result.errorKey]);
      return;
    }

    login({
      accessToken: result.accessToken,
      serverClockOffsetInSeconds: result.serverClockOffsetInSeconds,
      user: result.user,
    });

    const returnTo = searchParams.get("returnTo");
    router.replace(isSafeReturnToPath(returnTo) ? returnTo! : "/");
    router.refresh();
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium">
          نام کاربری
        </label>
        <Input
          id="username"
          autoComplete="username"
          disabled={form.formState.isSubmitting}
          aria-invalid={!!form.formState.errors.username}
          {...form.register("username")}
        />
        {form.formState.errors.username ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.username.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          رمز عبور
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={form.formState.isSubmitting}
          aria-invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "در حال ورود…" : "ورود"}
      </Button>
    </form>
  );
}
