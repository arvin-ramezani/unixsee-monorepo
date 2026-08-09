import { Link } from "@/i18n/navigation";
import { ArrowLeft, Search, Undo2 } from "lucide-react";

export type HelpRecoveryLinkProps = {
  variant: "search" | "back" | "undo";
  label: string;
  href: string;
};

export default function HelpRecoveryLink({
  label,
  href,
  variant,
}: HelpRecoveryLinkProps) {
  const Icon =
    variant === "search" ? (
      <Search className="size-4" aria-hidden="true" />
    ) : variant === "back" ? (
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
    ) : (
      <Undo2 className="size-4 rtl:-scale-x-100" aria-hidden="true" />
    );

  return (
    <Link
      href={href}
      className="text-link hover:text-primary dark:hover:text-primary-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      {Icon}
      {label}
    </Link>
  );
}
