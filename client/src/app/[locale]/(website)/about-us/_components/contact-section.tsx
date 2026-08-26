import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";

export type ContactSectionProps = { id?: string };

/**
 * Section 8 — address and direct contact, in its reduced form.
 *
 * The full section is meant to open with the registered legal-entity name,
 * which has not been supplied yet, so it ships without one rather than with a
 * placeholder. What remains — a real street address and a real landline — is
 * still the most checkable evidence on the page, which is why the section runs
 * at all instead of waiting.
 *
 * Do not add an email address here: the only mailbox on record belongs to the
 * parent company, and this page keeps a hard brand boundary from it.
 */
export default function ContactSection({ id }: ContactSectionProps) {
  const t = useTranslations("AboutPage.ContactSection");
  const tCommon = useTranslations("common");

  return (
    <Section id={id}>
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-[1.5]">
          {t("heading")}
        </Title>

        <SubTitle className="mt-5 max-w-3xl rtl:leading-[2]">
          {t("lead")}
        </SubTitle>

        <dl className="border-border mt-8 grid max-w-4xl gap-6 rounded-xl border p-6 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-2">
            <dt className="text-text-secondary flex items-center gap-2 text-sm font-semibold">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              {tCommon("address.label")}
            </dt>
            <dd>
              <address className="font-medium not-italic rtl:leading-[2]">
                {tCommon("address.value")}
              </address>
            </dd>
          </div>

          <div className="flex flex-col gap-2">
            <dt className="text-text-secondary flex items-center gap-2 text-sm font-semibold">
              <Phone aria-hidden="true" className="size-4 shrink-0" />
              {t("phoneLabel")}
            </dt>
            <dd>
              <a
                // The number is written with Persian digits, so it needs its
                // own direction to keep the dash groups from being reordered
                // next to the surrounding RTL text. Same as the site footer.
                dir="ltr"
                href={`tel:${tCommon("phone.href")}`}
                className="text-link focus-visible:ring-ring inline-flex min-h-11 items-center text-lg font-bold hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {tCommon("phone.label")}
              </a>
            </dd>
          </div>
        </dl>
      </RevealOnScroll>
    </Section>
  );
}
