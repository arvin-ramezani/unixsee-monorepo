"use client";

import { ClockIcon, HeadsetIcon, MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import Title from "@/components/common/title";

// import { Skeleton } from "@/components/ui/skeleton"; // Or any fallback block wrapper you prefer

const Map = dynamic(() => import("@/components/common/map"), {
  ssr: false,
  //   loading: () => <Skeleton className="h-full w-full min-h-[400px] bg-slate-100 dark:bg-zinc-900" />,
});

export default function ContactInfoSection() {
  const t = useTranslations("ContactUsPage.ContactInfoSection");
  const tCommon = useTranslations("common");

  return (
    <section className="w-full max-w-7xl px-5 py-4 lg:m-6 lg:w-[calc(100%-48px)] lg:rounded-lg lg:border">
      <div>
        <Title className="text-[1.4rem] font-bold lg:text-[1.6rem]">
          {t(`title`)}
        </Title>
        <div className="bg-primary mt-2 h-0.5 w-30 lg:mt-3 lg:w-34" />
      </div>

      <div className="mt-6 flex items-center gap-2 lg:mt-8">
        <div className="bg-primary size-6 rounded-full" />
        <h3 className="text-lg font-medium">{t(`office.title`)}</h3>
      </div>

      <address className="mt-2 text-sm not-italic">
        {tCommon(`address.value`)}
      </address>

      <h3 className="mt-4 text-lg font-medium lg:mt-6">{t(`support.title`)}</h3>
      <p className="mt-2 text-sm">{t(`support.description`)}</p>

      <div className="mt-3 h-75 w-full overflow-hidden rounded-xs lg:mt-6 lg:rounded-md">
        <Map key="contact-info-map" />
      </div>

      <div className="bg-muted my-4 h-px" />

      <h5 className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-bold">
        <ClockIcon className="size-6" />
        <span>{t(`contactInfo.title`)}</span>
      </h5>

      <div className="mt-4 flex gap-4 text-sm">
        <div className="bg-muted flex h-39 flex-1 flex-col items-center justify-center gap-3 rounded-2xl">
          <HeadsetIcon className="size-6" />
          <span>{t(`contactInfo.phone.label`)}</span>
          <a
            href={`tel:${t(`contactInfo.phone.href`)}`}
            className="text-primary hover:underline"
            dir="ltr"
          >
            {t(`contactInfo.phone.labelNumber`)}
          </a>
        </div>

        <div className="bg-muted flex h-39 flex-1 flex-col items-center justify-center gap-3 rounded-2xl">
          <MailIcon className="size-6" />
          <span>{t(`contactInfo.email.label`)}</span>
          <a
            href={`mailto:${t(`contactInfo.email.value`)}`}
            className="text-primary hover:underline"
          >
            {t(`contactInfo.email.value`)}
          </a>
        </div>
      </div>
    </section>
  );
}
