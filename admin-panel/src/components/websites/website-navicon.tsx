import { WEBSITE_STATUS, WebsiteStatusType } from "@/lib/data/websites-data";
import { cn } from "@/lib/utils";

export type WebsiteNaviconProps = {
  className?: string;
  status: WebsiteStatusType;
  icon: string;
};

export default function WebsiteNavicon({
  status,
  icon,
  className,
}: WebsiteNaviconProps) {
  return (
    <div
      className={cn(
        "flex justify-center rounded-full size-8 p-1",
        {
          "bg-accent text-accent-foreground": status === WEBSITE_STATUS.ONLINE,
          "bg-destructive text-destructive-foreground":
            status === WEBSITE_STATUS.NEEDS_ATTENTION,
          "bg-secondary text-secondary-foreground":
            status === WEBSITE_STATUS.MAINTENANCE,
          "bg-primary text-primary-foreground":
            status === WEBSITE_STATUS.PENDING_SETUP,
        },
        className,
      )}
    >
      {icon}
    </div>
  );
}
