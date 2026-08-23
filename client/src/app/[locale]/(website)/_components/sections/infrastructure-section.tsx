import { useLocale, useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import Image from "next/image";
import SubTitle from "@/components/common/subtitle";
import { cn } from "@/lib/utils";
import { ScaleTitle } from "@/components/common/motion/scale-title";

const ITEM_KEYS = [
  "woocommerceExpertise",
  "continuousMonitoring",
  "growthReadyInfrastructure",
  "operationalSupport",
] as const;

const IMAGE_URLS = [
  "icons/infrastructure-section/dh-shape-creative.svg",
  "icons/infrastructure-section/dh-shape-customised.svg",
  "icons/infrastructure-section/dh-shape-full-stack.svg",
  "icons/infrastructure-section/dh-shape-open.svg",
];

export type InfrastructureSectionType = { id?: string };

export default function InfrastructureSection({
  id,
}: InfrastructureSectionType) {
  const t = useTranslations("HomePage.InfrastructureSection");
  const isRtl = useLocale() === "fa";

  return (
    <Section
      id={id}
      className="unixsee-glow-blue-surface-reverse bg-blue-light"
    >
      <ScaleTitle
        className={cn("lg:leading-16 xl:max-w-lg", {
          "md:leading-16": isRtl,
        })}
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        dangerouslySetInnerHTML={{ __html: t.raw("title") }}
      />

      <ul className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-2">
        {ITEM_KEYS.map((key, index) => (
          <InfrastructureItems
            key={key}
            title={t(`items.${key}.title`)}
            description={t(`items.${key}.description`)}
            imageUrl={IMAGE_URLS[index]}
          />
        ))}
      </ul>
    </Section>
  );
}

type InfrastructureItemsProps = {
  title: string;
  description: string;
  imageUrl: string;
};

function InfrastructureItems({
  title,
  description,
  imageUrl,
}: InfrastructureItemsProps) {
  return (
    <li className="flex flex-col gap-4 odd:lg:[&_p]:max-w-155 odd:xl:[&_p]:max-w-lg">
      <Image src={imageUrl} alt={title} width={40} height={40} />
      <Title className="max-w-107.25 text-[1.6rem]! ltr:min-h-[2lh]" as={"h3"}>
        {title}
      </Title>
      <SubTitle>{description}</SubTitle>
    </li>
  );
}

// import { useLocale, useTranslations } from "next-intl";
// import Image from "next/image";

// import Title from "@/components/common/title";
// import Section from "@/components/common/section";
// import SubTitle from "@/components/common/subtitle";
// import { cn } from "@/lib/utils";
// import { ScaleTitle } from "@/components/common/motion/scale-title";

// const ITEM_KEYS = [
//   "woocommerceExpertise",
//   "continuousMonitoring",
//   "growthReadyInfrastructure",
//   "operationalSupport",
// ] as const;

// const IMAGE_URLS = [
//   "icons/infrastructure-section/dh-shape-creative.svg",
//   "icons/infrastructure-section/dh-shape-customised.svg",
//   "icons/infrastructure-section/dh-shape-full-stack.svg",
//   "icons/infrastructure-section/dh-shape-open.svg",
// ];

// export type InfrastructureSectionType = { id?: string };

// export default function InfrastructureSection({
//   id,
// }: InfrastructureSectionType) {
//   const t = useTranslations("HomePage.InfrastructureSection");
//   const isRtl = useLocale() === "fa";

//   return (
//     <Section
//       id={id}
//       className="unixsee-observability-surface pt-20 pb-28 shadow-none"
//     >
//       <ScaleTitle
//         className={cn(
//           "max-w-2/3 sm:w-1/2 lg:max-w-155 lg:leading-16 xl:max-w-lg",
//           {
//             "md:leading-16": isRtl,
//           },
//         )}
//         as="h2"
//         scaleFrom={0.6}
//         scaleTo={1}
//       >
//         {t("title")}
//       </ScaleTitle>

//       <ul className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 md:gap-6 2xl:gap-8">
//         {ITEM_KEYS.map((key, index) => (
//           <InfrastructureItems
//             key={key}
//             title={t(`items.${key}.title`)}
//             description={t(`items.${key}.description`)}
//             imageUrl={IMAGE_URLS[index]}
//           />
//         ))}
//       </ul>
//     </Section>
//   );
// }

// type InfrastructureItemsProps = {
//   title: string;
//   description: string;
//   imageUrl: string;
// };

// function InfrastructureItems({
//   title,
//   description,
//   imageUrl,
// }: InfrastructureItemsProps) {
//   return (
//     <li className="unixsee-observability-card group p-6 md:p-7">
//       <div className="unixsee-observability-soft-glow" />
//       <div className="unixsee-observability-card-line" />
//       <div className="unixsee-observability-icon relative flex size-14 items-center justify-center rounded-2xl">
//         <Image
//           src={imageUrl}
//           alt={title}
//           width={40}
//           height={40}
//           className="size-10"
//         />
//       </div>

//       <Title
//         className="unixsee-observability-title relative mt-6 max-w-107.25 text-[2rem]! leading-10! md:text-[2.3rem]!"
//         as="h3"
//       >
//         {title}
//       </Title>

//       <SubTitle className="unixsee-observability-text relative mt-3 max-w-155 leading-8">
//         {description}
//       </SubTitle>
//     </li>
//   );
// }
