import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { AnimatedEyeIcon } from "../common/animated-icons/animated-eye-icon";
import { FloatingNavEyeMark } from "../common/animated-icons/floating-nav-eye-mark";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="focus-visible:ring-ring flex h-12 min-w-0 items-center gap-1.5 rounded-lg focus-visible:ring-2"
    >
      <span className="bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold tracking-tight">
        <FloatingNavEyeMark className="size-4 lg:size-6" />
      </span>
      <span
        className={cn(
          "overflow-hidden text-2xl font-semibold tracking-tight whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
          compact
            ? "max-w-0 -translate-x-1 opacity-0 rtl:translate-x-1"
            : "max-w-28 translate-x-0 opacity-100 delay-100",
        )}
        aria-hidden={compact}
      >
        Unixsee
      </span>
    </Link>
  );
}
