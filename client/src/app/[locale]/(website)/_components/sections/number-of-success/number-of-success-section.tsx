"use client";
import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import { ScaleTitle } from "@/components/common/motion/scale-title";
import { NumberOfSuccessItem } from "./number-of-success-item";
import { NumberOfSuccessList } from "./number-of-success-list";

export const NUMBER_OF_SUCCESS_ITEM_KEYS = [
  "storesManaged",
  "uptime",
  "monitoring",
  "experience",
] as const;

export type NumberOfSuccessItemKey =
  (typeof NUMBER_OF_SUCCESS_ITEM_KEYS)[number];

export type NumberOfSuccessSectionType = { id: string };

export default function NumberOfSuccessSection({
  id,
}: NumberOfSuccessSectionType) {
  const t = useTranslations("HomePage.NumberOfSuccess");

  return (
    <Section
      id={id}
      // className="unixsee-glow-blue-surface bg-blue-light"
      className="unixsee-glow-blue-surface bg-blue-light"
    >
      <ScaleTitle
        as={"h2"}
        scaleFrom={0.6}
        scaleTo={1}
        className="mb-8 max-w-2/3 sm:w-1/2 lg:mb-14 lg:max-w-155 lg:leading-16 xl:max-w-lg"
      >
        {t("title")}
      </ScaleTitle>

      <NumberOfSuccessList itemKeys={NUMBER_OF_SUCCESS_ITEM_KEYS} />
    </Section>
  );
}
