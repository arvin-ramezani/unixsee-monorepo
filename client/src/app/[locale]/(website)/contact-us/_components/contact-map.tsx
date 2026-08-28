"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/common/map"), {
  ssr: false,
});

export type ContactMapProps = {
  label: string;
};

export function ContactMap({ label }: ContactMapProps) {
  return (
    <div
      aria-label={label}
      className="mt-6 h-64 w-full overflow-hidden rounded-xl border lg:mt-auto lg:h-80"
    >
      <Map key="contact-info-map" />
    </div>
  );
}
