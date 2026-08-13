import { useLocale, useTranslations } from "next-intl";

import LinkButton from "@/components/common/link-button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PLAN_DEFINITIONS = [
  {
    key: "core",
    titleKey: "core.title",
    descriptionKey: "core.description",
    badgeKey: "core.badge",
    noteKey: "core.note",
    ctaLabelKey: "core.cta.label",
    ctaHrefKey: "core.cta.href",
    features: [
      {
        labelKey: "core.features.germanyConfiguration.label",
        valueKey: "core.features.germanyConfiguration.value",
      },
      {
        labelKey: "core.features.iranConfiguration.label",
        valueKey: "core.features.iranConfiguration.value",
      },
      {
        labelKey: "core.features.backup.label",
        valueKey: "core.features.backup.value",
      },
      {
        labelKey: "core.features.ssl.label",
        valueKey: "core.features.ssl.value",
      },
      {
        labelKey: "core.features.monitoring.label",
        valueKey: "core.features.monitoring.value",
      },
      {
        labelKey: "core.features.serviceManagement.label",
        valueKey: "core.features.serviceManagement.value",
      },
    ],
  },
  {
    key: "scale",
    titleKey: "scale.title",
    descriptionKey: "scale.description",
    badgeKey: "scale.badge",
    noteKey: "scale.note",
    ctaLabelKey: "scale.cta.label",
    ctaHrefKey: "scale.cta.href",
    features: [
      {
        labelKey: "scale.features.germanyConfiguration.label",
        valueKey: "scale.features.germanyConfiguration.value",
      },
      {
        labelKey: "scale.features.iranConfiguration.label",
        valueKey: "scale.features.iranConfiguration.value",
      },
      {
        labelKey: "scale.features.backup.label",
        valueKey: "scale.features.backup.value",
      },
      {
        labelKey: "scale.features.ssl.label",
        valueKey: "scale.features.ssl.value",
      },
      {
        labelKey: "scale.features.monitoring.label",
        valueKey: "scale.features.monitoring.value",
      },
      {
        labelKey: "scale.features.serviceManagement.label",
        valueKey: "scale.features.serviceManagement.value",
      },
    ],
    popular: true,
  },
  {
    key: "peak",
    titleKey: "peak.title",
    descriptionKey: "peak.description",
    badgeKey: "peak.badge",
    noteKey: "peak.note",
    ctaLabelKey: "peak.cta.label",
    ctaHrefKey: "peak.cta.href",
    features: [
      {
        labelKey: "peak.features.location.label",
        valueKey: "peak.features.location.value",
      },
      {
        labelKey: "peak.features.cpu.label",
        valueKey: "peak.features.cpu.value",
      },
      {
        labelKey: "peak.features.memory.label",
        valueKey: "peak.features.memory.value",
      },
      {
        labelKey: "peak.features.storage.label",
        valueKey: "peak.features.storage.value",
      },
      {
        labelKey: "peak.features.backup.label",
        valueKey: "peak.features.backup.value",
      },
      {
        labelKey: "peak.features.ssl.label",
        valueKey: "peak.features.ssl.value",
      },
      {
        labelKey: "peak.features.monitoring.label",
        valueKey: "peak.features.monitoring.value",
      },
    ],
    addOn: {
      labelKey: "peak.addOn.label",
      descriptionKey: "peak.addOn.description",
    },
  },
  {
    key: "enterprise",
    titleKey: "enterprise.title",
    descriptionKey: "enterprise.description",
    badgeKey: "enterprise.badge",
    noteKey: "enterprise.note",
    ctaLabelKey: "enterprise.cta.label",
    ctaHrefKey: "enterprise.cta.href",
    features: [
      {
        labelKey: "enterprise.features.serviceType.label",
        valueKey: "enterprise.features.serviceType.value",
      },
      {
        labelKey: "enterprise.features.location.label",
        valueKey: "enterprise.features.location.value",
      },
      {
        labelKey: "enterprise.features.cpu.label",
        valueKey: "enterprise.features.cpu.value",
      },
      {
        labelKey: "enterprise.features.memoryAndStorage.label",
        valueKey: "enterprise.features.memoryAndStorage.value",
      },
      {
        labelKey: "enterprise.features.backupAndRecovery.label",
        valueKey: "enterprise.features.backupAndRecovery.value",
      },
      {
        labelKey: "enterprise.features.monitoringAndSecurity.label",
        valueKey: "enterprise.features.monitoringAndSecurity.value",
      },
    ],
  },
] as const;

export type PlansListProps = {
  className?: string;
  requestPath?: string;
};

export default function PlansList({
  className,
  requestPath = "/services/managed-woocommerce-server/request",
}: PlansListProps) {
  const locale = useLocale();
  const t = useTranslations("MigrationPage.PlansSection.items");
  const sectionT = useTranslations("MigrationPage.PlansSection");

  return (
    <Carousel
      className={className}
      dir={locale === "fa" ? "rtl" : "ltr"}
      opts={{ align: "start", containScroll: "trimSnaps" }}
    >
      <div className="mb-4 hidden justify-end gap-4 lg:flex rtl:flex-row-reverse rtl:justify-start">
        <CarouselPrevious
          className="dark:bg-primary dark:disabled:border-primary dark:disabled:[&_svg]:text-primary! dark:hover:bg-primary relative size-12 p-0!"
          iconClassName="size-6 dark:text-primary-foreground!"
        />
        <CarouselNext
          className="dark:bg-primary dark:hover:bg-primary dark:disabled:border-primary dark:disabled:[&_svg]:text-primary! relative size-12 p-0!"
          iconClassName="size-6 dark:text-primary-foreground!"
        />
      </div>

      <CarouselContent className="cursor-grab items-stretch pt-10 select-none active:cursor-grabbing">
        {PLAN_DEFINITIONS.map((plan, index) => {
          const card = (
            <PlanItem
              title={t(plan.titleKey)}
              description={t(plan.descriptionKey)}
              badge={t(plan.badgeKey)}
              features={plan.features.map((feature) => ({
                label: t(feature.labelKey),
                value: t(feature.valueKey),
              }))}
              note={t(plan.noteKey)}
              addOn={
                "addOn" in plan
                  ? {
                      label: t(plan.addOn.labelKey),
                      description: t(plan.addOn.descriptionKey),
                    }
                  : undefined
              }
              cta={{
                label: t(plan.ctaLabelKey),
                href: `${requestPath}?plan=${plan.key}`,
              }}
            />
          );

          return (
            <CarouselItem
              key={plan.key}
              // className="flex h-fit basis-[90%] md:basis-[45%] lg:h-auto xl:basis-[31%]"
              className="flex h-fit basis-[87%] md:basis-[45%] lg:h-auto lg:basis-1/3"
              aria-label={sectionT("slideLabel", {
                current: index + 1,
                total: PLAN_DEFINITIONS.length,
              })}
            >
              {"popular" in plan ? (
                <PopularWrapper>{card}</PopularWrapper>
              ) : (
                card
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* <div className="mt-8 flex justify-end gap-4 lg:hidden rtl:flex-row-reverse rtl:justify-start">
        <CarouselPrevious
          className="relative size-12 p-0!"
          iconClassName="size-6"
        />
        <CarouselNext
          className="relative size-12 p-0!"
          iconClassName="size-6"
        />
      </div> */}
    </Carousel>
  );
}

function PopularWrapper({ children }: { children: React.ReactNode }) {
  const t = useTranslations("MigrationPage.PlansSection");

  return (
    <div className="bg-primary relative flex h-fit w-full flex-col items-center overflow-hidden rounded-3xl p-0.5 pt-0 lg:relative lg:-top-10 lg:h-[calc(100%+40px)]">
      <div className="bg-primary absolute inset-s-0 h-full w-0.5" />
      <div className="bg-primary absolute inset-e-0 h-full w-0.5" />
      <div className="bg-primary absolute inset-be-0 h-0.5 w-full" />

      <p className="text-primary-foreground py-2.5 text-sm font-bold">
        {t("popularLabel")}
      </p>

      {children}
    </div>
  );
}

type PlanItemProps = {
  title: string;
  description: string;
  badge: string;
  features: { label: string; value: string }[];
  note: string;
  addOn?: {
    label: string;
    description: string;
  };
  cta: {
    label: string;
    href: string;
  };
};

function PlanItem({
  title,
  description,
  badge,
  features,
  note,
  addOn,
  cta,
}: PlanItemProps) {
  return (
    <article className="dark:bg-card flex h-fit w-full flex-1 flex-col rounded-3xl bg-white p-6 lg:h-auto">
      <Badge className="ms-auto px-2 py-1" variant="accent">
        {badge}
      </Badge>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 font-light lg:min-h-48 xl:min-h-36 2xl:min-h-24">
        {description}
      </p>

      <LinkButton
        className="my-4 h-12 text-base! font-bold"
        variant="outline"
        href={cta.href}
      >
        {cta.label}
      </LinkButton>
      <p className="font-light">{note}</p>
      <ul className="mt-4 flex flex-col gap-1 rounded-lg border p-4">
        {features.map((feature) => (
          <li key={feature.label}>
            <strong>{feature.label}:</strong> {feature.value}
          </li>
        ))}
      </ul>

      {addOn ? (
        <div className="mt-4 rounded-lg border p-4">
          <p className="text-sm font-bold">{addOn.label}</p>
          <p className="mt-2 font-light">{addOn.description}</p>
        </div>
      ) : null}
    </article>
  );
}
