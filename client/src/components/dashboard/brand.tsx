import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex h-12 min-w-0 items-center gap-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-xs font-bold tracking-tight text-primary-foreground">UX</span>
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-2xl font-semibold tracking-tight transition-[max-width,opacity,transform] duration-200 ease-out",
          compact ? "max-w-0 -translate-x-1 opacity-0 rtl:translate-x-1" : "max-w-28 translate-x-0 opacity-100 delay-100",
        )}
        aria-hidden={compact}
      >
        Unixsee
      </span>
    </Link>
  );
}
