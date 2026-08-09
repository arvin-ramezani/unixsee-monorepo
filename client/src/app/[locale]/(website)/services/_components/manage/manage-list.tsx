import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Text from "../common/text";

const MANAGE_ITEMS_KEYS = ["item1", "item2", "item3"] as const;

export type ManageListProps = {
  className?: string;
};

export default function ManageList({ className }: ManageListProps) {
  const t = useTranslations("MigrationPage.ManageSection.items");

  return (
    <ul className={cn("grid grid-cols-1 gap-6 lg:grid-cols-3", className)}>
      {MANAGE_ITEMS_KEYS.map((itemKey) => (
        <ManageItem
          key={itemKey}
          title={t(`${itemKey}.title`)}
          description={t(`${itemKey}.description`)}
          image={t(`${itemKey}.image`)}
        />
      ))}
    </ul>
  );
}

type ManageItemProps = {
  title: string;
  description: string;
  image: string;
};

function ManageItem({ title, description, image }: ManageItemProps) {
  return (
    <li className="flex flex-col gap-4">
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-2xl">
        <Image src={image} alt={title} fill />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <Text className="font-light">{description}</Text>
    </li>
  );
}
