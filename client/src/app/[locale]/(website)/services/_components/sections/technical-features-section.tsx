import { useTranslations } from "next-intl";
import { Cpu, Zap, Rocket, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Section from "./section";
import Title from "../common/title";
import Text from "../common/text";
import PlansAdditionalNotes from "../plans-additional-notes/plans-additional-notes";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  users: Users,
};

export type TechnicalFeaturesSectionProps = {
  id?: string;
};

export default function TechnicalFeaturesSection({
  id,
}: TechnicalFeaturesSectionProps) {
  const t = useTranslations("ManagedServerPage.PlansSection.technicalFeatures");

  const itemKeys = [
    "redisObjectCache",
    "liteSpeed",
    "wafAntiDdos",
    "infrastructureManagement",
  ] as const;
  const items = itemKeys.map((key) => ({
    icon: key,
    title: t(`items.${key}.title`),
    description: t(`items.${key}.description`),
  }));

  return (
    <Section
      id={id}
      className="bg-muted"
      containerClassName="flex-col! items-center!"
    >
      <div className="relative mx-auto w-full max-w-5xl">
        {/* Ambient glows */}
        <div className="bg-primary/5 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[60px]" />
        <div className="bg-secondary/5 pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-[60px]" />

        {/* Header */}
        <div className="relative z-10 mb-10 text-center">
          <div className="text-primary border-border bg-card mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border">
            <Cpu className="h-6 w-6" />
          </div>
          <Title as="h3" className="text-center">
            {t("title")}
          </Title>
          <Text className="mx-auto mt-3 max-w-2xl text-center">
            {t("subtitle")}
          </Text>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Zap;
            return (
              <div
                key={item.title}
                className={cn(
                  "flex items-start gap-4 rounded-2xl p-5",
                  "bg-card border-border border",
                  "hover:border-primary/30 hover:bg-accent/50 group transition-all duration-300",
                )}
              >
                <div className="text-primary bg-card border-border group-hover:border-primary/30 group-hover:bg-primary/10 mt-0.5 shrink-0 rounded-xl border p-3 transition-all duration-300">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-foreground mb-2 text-base font-bold tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-[13px] leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PlansAdditionalNotes className="mt-10" />
    </Section>
  );
}
