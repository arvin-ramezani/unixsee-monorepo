import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

// import LinkButton from "@/components/common/link-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LinkCustom from "@/components/common/link-custom";
import Text from "../common/text";

export type VideoCardProps = {
  className?: string;
};

export default function VideoCard({ className }: VideoCardProps) {
  const t = useTranslations("ManagedServerPage.MonitoringSection.VideoCard");

  return (
    <div
      className={cn(
        "bg-muted flex flex-col gap-4 overflow-hidden rounded-2xl lg:flex-row-reverse lg:items-center",
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-6 lg:max-w-1/2">
        <Badge variant="accent" className="text-sm">
          {t("videoBadge")}
        </Badge>
        <h3 className="text-2xl font-extrabold">{t("title")}</h3>
        <Text>{t("description")}</Text>

        <LinkCustom className="text-text-link mt-2 gap-1" href={t("cta.href")}>
          {t("cta.label")}
          <ChevronRight className="size-4 rtl:rotate-180" />
        </LinkCustom>
      </div>

      <div className="relative aspect-358/250 w-full lg:aspect-407/285 lg:min-w-[45%]">
        <video
          className="absolute h-full w-full"
          autoPlay
          loop
          muted
          playsInline
          src="/videos/migration-page/video-card.mp4"
        />
      </div>
    </div>
  );
}
