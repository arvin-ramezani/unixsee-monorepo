"use client";

import WaveBackground from "@/components/common/flow-lines-background";

export type AboutUsSectionProps = { id?: string };

export default function AboutUsSection({ id }: AboutUsSectionProps) {
  return (
    <section id={id} className="bg-background relative min-h-[80dvh]">
      {/* <WaveBackground /> */}
    </section>
  );
}
