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
    ctaLabelKey: "core.cta.label",
    ctaHrefKey: "core.cta.href",
    features: [
      {
        labelKey: "core.features.location.label",
        valueKey: "core.features.location.value",
      },
      {
        labelKey: "core.features.ip.label",
        valueKey: "core.features.ip.value",
      },
      {
        labelKey: "core.features.cpu.label",
        valueKey: "core.features.cpu.value",
      },
      {
        labelKey: "core.features.memory.label",
        valueKey: "core.features.memory.value",
      },
      {
        labelKey: "core.features.suitability.label",
        valueKey: "core.features.suitability.value",
      },
    ],
  },
  {
    key: "scale",
    titleKey: "scale.title",
    descriptionKey: "scale.description",
    badgeKey: "scale.badge",
    ctaLabelKey: "scale.cta.label",
    ctaHrefKey: "scale.cta.href",
    features: [
      {
        labelKey: "core.features.location.label",
        valueKey: "core.features.location.value",
      },
      {
        labelKey: "core.features.ip.label",
        valueKey: "core.features.ip.value",
      },
      {
        labelKey: "core.features.cpu.label",
        valueKey: "core.features.cpu.value",
      },
      {
        labelKey: "core.features.memory.label",
        valueKey: "core.features.memory.value",
      },
      {
        labelKey: "core.features.suitability.label",
        valueKey: "core.features.suitability.value",
      },
    ],
    popular: true,
  },
  {
    key: "peak",
    titleKey: "peak.title",
    descriptionKey: "peak.description",
    badgeKey: "peak.badge",
    ctaLabelKey: "peak.cta.label",
    ctaHrefKey: "peak.cta.href",
    features: [
      {
        labelKey: "core.features.location.label",
        valueKey: "core.features.location.value",
      },
      {
        labelKey: "core.features.ip.label",
        valueKey: "core.features.ip.value",
      },
      {
        labelKey: "core.features.cpu.label",
        valueKey: "core.features.cpu.value",
      },
      {
        labelKey: "core.features.memory.label",
        valueKey: "core.features.memory.value",
      },
      {
        labelKey: "core.features.suitability.label",
        valueKey: "core.features.suitability.value",
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
    ctaLabelKey: "enterprise.cta.label",
    ctaHrefKey: "enterprise.cta.href",
    features: [
      {
        labelKey: "core.features.location.label",
        valueKey: "core.features.location.value",
      },
      {
        labelKey: "core.features.ip.label",
        valueKey: "core.features.ip.value",
      },
      {
        labelKey: "core.features.cpu.label",
        valueKey: "core.features.cpu.value",
      },
      {
        labelKey: "core.features.memory.label",
        valueKey: "core.features.memory.value",
      },
      {
        labelKey: "core.features.suitability.label",
        valueKey: "core.features.suitability.value",
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
  const t = useTranslations("ManagedServerPage.PlansSection.items");

  return (
    <Carousel
      className={className}
      dir={locale === "fa" ? "rtl" : "ltr"}
      opts={{ align: "start", containScroll: "trimSnaps" }}
    >
      <div className="mb-4 hidden justify-end gap-4 lg:flex 2xl:hidden rtl:flex-row-reverse rtl:justify-start">
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
              title={t(plan.titleKey as any)}
              description={t(plan.descriptionKey as any)}
              badge={t(plan.badgeKey as any)}
              features={plan.features.map((feature) => ({
                label: t(feature.labelKey as any),
                value: t(feature.valueKey as any),
              }))}
              // addOn={
              //   "addOn" in plan
              //     ? {
              //         label: t(plan.addOn.labelKey as any),
              //         description: t(plan.addOn.descriptionKey as any),
              //       }
              //     : undefined
              // }
              cta={{
                label: t(plan.ctaLabelKey as any),
                href: `${requestPath}?plan=${plan.key}`,
              }}
            />
          );

          return (
            <CarouselItem
              key={plan.key}

              className="flex min-h-fit basis-[87%] md:basis-[45%] lg:basis-1/3 2xl:basis-1/4"
              aria-label={`${index + 1} of ${PLAN_DEFINITIONS.length}`}
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
    </Carousel>
  );
}

function PopularWrapper({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ManagedServerPage.PlansSection");

  return (
    <div className="bg-primary relative -top-10 flex h-[calc(100%+40px)] w-full flex-col items-center overflow-hidden rounded-3xl p-0.5 pt-0 lg:relative">
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
  addOn,
  cta,
}: PlanItemProps) {
  return (
    <article className="dark:bg-card flex h-auto w-full flex-1 flex-col rounded-3xl bg-white p-6 lg:h-auto">
      <Badge className="ms-auto px-2 py-1" variant="accent">
        {badge}
      </Badge>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 font-light lg:min-h-24">{description}</p>

      <ul className="mt-4 flex flex-col gap-1 rounded-lg border p-4">
        {features.map((feature) => (
          <li key={feature.label}>
            <strong>{feature.label}:</strong> {feature.value}
          </li>
        ))}
      </ul>

      {/* {addOn && (
        <div className="mt-4 rounded-lg border p-4">
          <p className="text-sm font-bold">{addOn.label}</p>
          <p className="mt-2 font-light">{addOn.description}</p>
        </div>
      )} */}

      <LinkButton
        className="mt-auto h-12 text-base! font-bold"
        variant="outline"
        href={cta.href}
      >
        {cta.label}
      </LinkButton>
    </article>
  );
}
