import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "font-yekan-bakh-family placeholder:text-muted-foreground border-border app-scrollbar disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 ring-ring flex field-sizing-content max-h-70 min-h-9 w-full rounded-[12px] border bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-sm focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 md:text-sm rtl:font-light",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
