"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface ArticleCodeBlockProps {
  code: string;
  caption?: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}

/**
 * Code block with a copy-to-clipboard button (UX spec §10 — Commands and code).
 * Always renders LTR for the <code> content. Copy feedback is announced to
 * screen readers via a live region without moving focus.
 */
export function ArticleCodeBlock({
  code,
  caption,
  copyLabel,
  copiedLabel,
  className,
}: ArticleCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border", className)}
    >
      <div className="relative">
        {/* Code is always LTR regardless of page direction (spec §10). */}
        <pre
          dir="ltr"
          className="overflow-x-auto bg-muted/60 px-4 py-3 text-start text-sm font-mono leading-6"
        >
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? copiedLabel : copyLabel}
          className="absolute end-2 top-2 grid size-7 place-items-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
      {caption && (
        <p
          className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground"
          dir="auto"
        >
          {caption}
        </p>
      )}
      {/* Announce copy result to assistive technology without moving focus. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
