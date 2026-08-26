import { useTranslations } from "next-intl";
import {
  Lock,
  Activity,
  RotateCcw,
  Settings,
  ShieldCheck,
  Users,
  Rocket,
  Zap,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Section from "./section";
import Title from "../common/title";
import Text from "../common/text";
import PlansAdditionalNotes from "../plans-additional-notes/plans-additional-notes";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  lock: Lock,
  activity: Activity,
  "rotate-ccw": RotateCcw,
  settings: Settings,
};

const TECHNICAL_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  zap: Zap,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  users: Users,
};

export type CommonFeaturesSectionProps = {
  id?: string;
};

export default function CommonFeaturesSection({
  id,
}: CommonFeaturesSectionProps) {
  const t = useTranslations("ManagedServerPage.PlansSection.commonFeatures");
  const tTechnical = useTranslations(
    "ManagedServerPage.PlansSection.technicalFeatures",
  );

  const itemKeys = [
    "ssl",
    "monitoring",
    "backup",
    "serviceManagement",
  ] as const;
  const items = itemKeys.map((key) => ({
    icon: key,
    label: t(`items.${key}.label`),
    value: t(`items.${key}.value`),
  }));

  const technicalItemKeys = [
    "redisObjectCache",
    "liteSpeed",
    "wafAntiDdos",
    "infrastructureManagement",
  ] as const;
  const technicalItems = technicalItemKeys.map((key) => ({
    icon: key,
    title: tTechnical(`items.${key}.title`),
    description: tTechnical(`items.${key}.description`),
  }));

  return (
    <Section
      id={id}
      className="bg-muted overflow-hidden"
      containerClassName="flex-col! items-center!"
    >
      <div className="mx-auto w-full">
        <div className="mb-8 text-center md:text-start">
          <Title
            as="h3"
            className="mb-4 lg:max-w-3xl"
            dangerouslySetInnerHTML={{ __html: t.raw("title") }}
          />
          {/* {t("title")}
            </Title> */}
          <Text dangerouslySetInnerHTML={{ __html: t.raw("description") }} />
          {/* {t("description")}
            </Text> */}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Lock;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-4",
                  "bg-card border-border border",
                  "hover:border-primary/30 transition-colors duration-300",
                )}
              >
                <div className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-xl border p-2.5">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-foreground mb-2 text-xl font-semibold">
                    {item.label}
                  </h4>
                  <p className="text-muted-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-14 w-full">
        <div className="bg-primary/5 pointer-events-none absolute -inset-e-20 -top-20 h-64 w-64 rounded-full blur-[60px]" />
        <div className="bg-secondary/5 pointer-events-none absolute -inset-s-20 -bottom-20 h-64 w-64 rounded-full blur-[60px]" />

        <div className="relative z-10 mb-10 flex justify-center gap-4 md:justify-start">
          <div className="text-primary border-border bg-card hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border md:flex">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <Title
              as="h3"
              className="flex items-center justify-center gap-4 text-center md:justify-start md:text-start"
              dangerouslySetInnerHTML={{ __html: tTechnical.raw("title") }}
            />
            {/* {tTechnical("title")}
            </Title> */}
            <Text
              className="mx-auto mt-3 max-w-2xl text-center md:text-start"
              dangerouslySetInnerHTML={{ __html: tTechnical.raw("subtitle") }}
            />
            {/* {tTechnical("subtitle")}
            </Text> */}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {technicalItems.map((item) => {
            const IconComponent = TECHNICAL_ICON_MAP[item.icon] || Zap;
            return (
              <div
                key={item.title}
                className={cn(
                  "flex items-start gap-4 rounded-2xl p-5",
                  "bg-card border-border border",
                  "hover:border-primary/30 hover:bg-accent/50 group transition-all duration-300",
                )}
              >
                <div className="text-primary bg-card border-primary/30 group-hover:border-primary/30 group-hover:bg-primary/10 mt-0.5 shrink-0 rounded-xl border p-3 transition-all duration-300">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-foreground mb-2 text-xl font-bold rtl:leading-9">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed font-light">
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
