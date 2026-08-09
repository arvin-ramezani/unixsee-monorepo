"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import Image from "next/image";

import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type StickyScrollCardsProps = {
  items: {
    title: string;
    description: string;
    tags: string[];
    cta: {
      label: string;
      href: string;
    };
  }[];
};

const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const step = 1 / items.length;

  return (
    <div
      ref={sectionRef}
      className="relative container mt-[-22%] flex w-full flex-col items-center justify-center"
      style={{ height: `calc(${items.length * 100}vh + 50vh)` }}
    >
      {items.map((item, i) => {
        const targetScale = 1 - (items.length - i - 1) * 0.08;
        const start = i * step;
        const end = (i + 1) * step;

        return (
          <StickyScrollCard
            key={`p_${i}`}
            i={i}
            progress={scrollYProgress}
            range={[start, end]}
            targetScale={targetScale}
            src={""}
            {...item}
          />
        );
      })}
    </div>
  );
};

const StickyScrollCard = ({
  i,
  title,
  description,
  tags,
  cta,
  progress,
  range,
  // targetScale,
}: {
  i: number;
  title: string;
  src: React.ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  targetScale: number;
  description: string;
  tags: string[];
  cta: {
    label: string;
    href: string;
  };
}) => {
  const container = useRef<HTMLDivElement>(null);

  const PRIMARY_VARIANTS = [
    "#1F2A3A",
    "#253246",
    "#2B3950",
    "#32405A",
    "#3A4A66",
  ] as const;

  const scale = useTransform(progress, range, [1.2, 1], {
    clamp: true,
  });

  return (
    <div
      ref={container}
      className="sticky top-0 flex h-dvh items-center justify-center"
    >
      <motion.div
        style={{
          scale,
        }}
        className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl"
      >
        <Card style={{ backgroundColor: PRIMARY_VARIANTS[i] }} className="py-8">
          <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
            <div className="flex flex-col items-start lg:pt-52.5">
              <Title as={"h3"} className="text-2xl font-medium text-white">
                {title}
              </Title>

              <TagsList tags={tags} />

              <SubTitle className="text-border dark:text-text-secondary mt-4">
                {description}
              </SubTitle>
              <Link
                href={cta.href}
                className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
              >
                {cta.label}
              </Link>
            </div>

            <Image
              className="mt-14 lg:mt-0 lg:self-start"
              src={"/sample.svg"}
              alt={title}
              width={231}
              height={231}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

function TagsList({ tags }: { tags: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export { StickyScrollCards, StickyScrollCard };
