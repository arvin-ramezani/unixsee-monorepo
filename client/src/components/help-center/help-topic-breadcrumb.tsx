import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface HelpTopicBreadcrumbProps {
  homeLabel: string;
  homeHref: string;
  topicTitle: string;
  className?: string;
}

export function HelpTopicBreadcrumb({
  homeLabel,
  homeHref,
  topicTitle,
  className,
}: HelpTopicBreadcrumbProps) {
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
          <BreadcrumbPage dir="auto" className="max-w-[18ch] truncate sm:max-w-[32ch]">
            {topicTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
