import Image from "next/image";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Text from "../common/text";

const PROTECTION_ITEMS_KEYS = [
  "preMigrationAudit",
  "dataIntegrityProtection",
  "downtimePrevention",
  "postMigrationMonitoring",
] as const;

export type ProtectionListProps = {
  className?: string;
};

export default function ProtectionList({ className }: ProtectionListProps) {
  const t = useTranslations("ManagedServerPage.ProtectionSection.items");

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6",
        className,
      )}
    >
      {PROTECTION_ITEMS_KEYS.map((itemKey) => (
        <ProtectionItem
          key={itemKey}
          title={t(`${itemKey}.title`)}
          description={t(`${itemKey}.description`)}
          icon={t(`${itemKey}.icon`)}
        />
      ))}
    </ul>
  );
}

function ProtectionItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <li className="bg-text-link dark:bg-primary text-primary-foreground flex flex-col items-start gap-2 rounded-2xl p-6">
      <Image
        src={icon}
        alt={title}
        width={24}
        height={24}
        className="shrink-0"
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Text className="text-primary-foreground font-light">
          {description}
        </Text>
      </div>
    </li>
  );
}
