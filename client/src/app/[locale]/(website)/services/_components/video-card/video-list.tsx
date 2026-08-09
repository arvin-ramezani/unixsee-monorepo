import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Text from "../common/text";

const ITEM_KEYS = ["item1", "item2", "item3"] as const;

export type VideoListProps = {
  className?: string;
};

export default function VideoList({ className }: VideoListProps) {
  const t = useTranslations(`ManagedServerPage.MonitoringSection.items`);

  return (
    <ul className={cn("grid grid-cols-1 gap-6 lg:grid-cols-3", className)}>
      {ITEM_KEYS.map((itemKey) => (
        <VideoListItem
          key={itemKey}
          className=""
          title={t(`${itemKey}.title`)}
          description={t(`${itemKey}.description`)}
          icon={t(`${itemKey}.icon`)}
        />
      ))}
    </ul>
  );
}

type VideoListItemProps = {
  className?: string;
  title: string;
  description: string;
  icon: string;
};

function VideoListItem({
  className,
  title,
  description,
  icon,
}: VideoListItemProps) {
  return (
    <li className={cn("flex flex-col gap-2", className)}>
      <div className="relative mb-2 size-6">
        <Image src={icon} alt={title} fill />
      </div>
      <h4 className="text-xl font-extrabold">{title}</h4>
      <Text className="mt-1 font-light">{description}</Text>
    </li>
  );
}
