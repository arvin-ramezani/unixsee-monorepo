"use client";

import { useState } from "react";
import { Check, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionKind = "clearCache" | "retryStatus";

type ActionState = "idle" | "pending" | "success";

interface WebsiteDetailsActionButtonProps {
  kind: ActionKind;
  idleLabel: string;
  pendingLabel: string;
  successLabel: string;
  description?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function WebsiteDetailsActionButton({
  kind,
  idleLabel,
  pendingLabel,
  successLabel,
  description,
  className,
  variant = "outline",
}: WebsiteDetailsActionButtonProps) {
  const [state, setState] = useState<ActionState>("idle");

  async function runAction() {
    if (state === "pending") return;
    setState("pending");
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setState("success");
  }

  const Icon =
    state === "pending"
      ? LoaderCircle
      : state === "success"
        ? Check
        : kind === "clearCache"
          ? Trash2
          : RefreshCw;

  const label =
    state === "pending"
      ? pendingLabel
      : state === "success"
        ? successLabel
        : idleLabel;

  return (
    <div className={cn("min-w-0", className)}>
      <Button
        type="button"
        variant={variant}
        aria-busy={state === "pending"}
        onClick={runAction}
        className="w-full justify-start gap-3 whitespace-normal"
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            state === "pending" &&
              "animate-spin motion-reduce:animate-none",
          )}
        />
        <span className="min-w-0 text-start">
          <span className="block">{label}</span>
          {description ? (
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "success" ? successLabel : ""}
      </span>
    </div>
  );
}
