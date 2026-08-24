import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";

export default function ComingSoonBadge() {
  const tNavigation = useTranslations("Layout.Navigation");

  return (
    <Badge
      variant="secondary"
      className="absolute min-h-4 shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-none font-semibold"
    >
      {tNavigation("comingSoon")}
    </Badge>
  );
}
