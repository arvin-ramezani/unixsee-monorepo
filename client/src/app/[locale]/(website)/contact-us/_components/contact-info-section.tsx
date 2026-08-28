import { BookOpen, Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { Link } from "@/i18n/navigation";
import { ContactMap } from "./contact-map";

export type ContactInfoSectionProps = {
  id?: string;
};

export default function ContactInfoSection({ id }: ContactInfoSectionProps) {
  const t = useTranslations("ContactUsPage.ContactInfoSection");
  const tCommon = useTranslations("common");

  return (
    <section
      id={id}
      className="border-border bg-card w-full scroll-mt-28 rounded-xl border p-6 md:p-8 lg:sticky lg:top-28 lg:flex lg:h-full lg:flex-col"
    >
      <Title as="h2" className="text-[1.4rem] font-bold lg:text-[1.6rem]">
        {t("title")}
      </Title>

      <dl className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <dt className="text-text-secondary flex items-center gap-2 text-sm font-semibold">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {t("office.title")}
          </dt>
          <dd>
            <address className="text-sm not-italic rtl:leading-loose">
              {tCommon("address.value")}
            </address>
          </dd>
        </div>

        <div className="flex flex-col gap-2">
          <dt className="text-text-secondary flex items-center gap-2 text-sm font-semibold">
            <Clock aria-hidden="true" className="size-4 shrink-0" />
            {t("hours.label")}
          </dt>
          <dd className="text-sm rtl:leading-loose">{t("hours.value")}</dd>
        </div>
      </dl>

      <ul className="mt-6 flex flex-col gap-3">
        <li>
          <a
            href={`tel:${tCommon("phone.href")}`}
            className="bg-muted hover:bg-muted/80 focus-visible:ring-ring flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="bg-background text-muted-foreground grid size-10 shrink-0 place-items-center rounded-full border">
              <Phone aria-hidden="true" className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-text-secondary text-xs font-medium">
                {t("contactInfo.phone.label")}
              </span>
              <span dir="ltr" className="text-foreground text-sm font-semibold">
                {tCommon("phone.label")}
              </span>
            </span>
          </a>
        </li>
        <li>
          <Link
            href="/help-center"
            className="bg-muted hover:bg-muted/80 focus-visible:ring-ring flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="bg-background text-muted-foreground grid size-10 shrink-0 place-items-center rounded-full border">
              <BookOpen aria-hidden="true" className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-text-secondary text-xs font-medium">
                {t("contactInfo.helpCenter.label")}
              </span>
              <span className="text-foreground text-sm font-semibold rtl:leading-[1.7]">
                {t("contactInfo.helpCenter.hrefLabel")}
              </span>
            </span>
          </Link>
        </li>
      </ul>

      <ContactMap label={t("mapLabel")} />
    </section>
  );
}
