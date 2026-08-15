import { cn } from "@/lib/utils";

function websiteExternalHref(domain: string) {
  const trimmed = domain.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function WebsiteDomainLink({
  domain,
  className,
}: {
  domain: string;
  className?: string;
}) {
  const href = websiteExternalHref(domain);

  if (!href) {
    return (
      <span className={cn("truncate font-medium", className)} dir="ltr">
        {domain}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={cn(
        "truncate font-medium text-primary underline-offset-2 hover:underline",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {domain}
    </a>
  );
}
