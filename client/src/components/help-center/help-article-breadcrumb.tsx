import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface HelpArticleBreadcrumbProps {
  homeLabel: string;
  homeHref: string;
  topicLabel: string;
  topicHref: string;
  articleTitle: string;
  className?: string;
}

/**
 * Three-item breadcrumb for the article page (UX spec §5).
 * Uses "/" as separator — direction-neutral and matches the spec example.
 * The article title identifies the current page and is not a link.
 */
export function HelpArticleBreadcrumb({
  homeLabel,
  homeHref,
  topicLabel,
  topicHref,
  articleTitle,
  className,
}: HelpArticleBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={homeHref}>{homeLabel}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={topicHref} dir="auto">
              {topicLabel}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          {/* Article title is the current page — not a duplicate link (spec §5). */}
          <BreadcrumbPage
            dir="auto"
            className="max-w-[18ch] truncate sm:max-w-[32ch]"
          >
            {articleTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
