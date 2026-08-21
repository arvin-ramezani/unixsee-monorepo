"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ExternalLink } from "lucide-react";
import { updateServerControlPanelUrlAction } from "@/actions/servers/server-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ServerControlPanelEditor({
  serverId,
  initialUrl,
}: {
  serverId: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateServerControlPanelUrlAction({
        serverId,
        controlPanelUrl: url,
      });
      if (!result.ok) setMessage(result.message);
      else {
        setUrl(result.server.controlPanelUrl ?? "");
        setMessage("نشانی DirectAdmin ذخیره شد.");
      }
    });
  };
  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-xl border border-border bg-muted/20 p-3"
    >
      <label htmlFor="control-panel-url" className="text-sm font-medium">
        نشانی DirectAdmin (مدیریت‌شده توسط ادمین)
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="control-panel-url"
          dir="ltr"
          type="url"
          inputMode="url"
          placeholder="https://panel.example.com:2222"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={pending}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ذخیره…" : "ذخیره"}
        </Button>
        {initialUrl && (
          <a
            className={buttonVariants({ variant: "outline" })}
            href={initialUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            باز کردن
          </a>
        )}
      </div>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
      )}
    </form>
  );
}
