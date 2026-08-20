import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type AuthTextLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function AuthTextLink({
  href,
  children,
  className,
  onClick,
}: AuthTextLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-link inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export type AuthCrossLinksProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCrossLinks({ children, className }: AuthCrossLinksProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground mt-6 flex flex-col items-center gap-1.5 text-sm sm:mt-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
