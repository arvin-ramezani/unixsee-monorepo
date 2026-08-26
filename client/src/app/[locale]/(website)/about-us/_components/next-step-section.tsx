import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";
import { RequestAssessmentDialog } from "@/components/layout/request-assessment-dialog";
import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";

export type NextStepSectionProps = { id?: string };

/**
 * Section 9 — next step.
 *
 * Deliberately low-pressure: a reader who reached the end of a due-diligence
 * page converts on confidence, and urgency at this position reads as
 * compensation for thin evidence. No countdown, no scarcity claim, and no plan
 * selection — three routes out at three levels of commitment, and nothing that
 * penalizes the reader for taking the smallest one.
 *
 * The assessment flow is the existing shared dialog rather than a second form,
 * so submissions keep landing in one place.
 */
export default function NextStepSection({ id }: NextStepSectionProps) {
  const t = useTranslations("AboutPage.NextStepSection");
  const tCommon = useTranslations("common");

  return (
    <Section id={id} className="bg-muted">
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-[1.5]">
          {t("heading")}
        </Title>

        <SubTitle className="mt-5 max-w-3xl rtl:leading-[2]">
          {t("description")}
        </SubTitle>

        <div className="mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="sm:w-auto">
            <RequestAssessmentDialog triggerClassName="sm:w-auto sm:px-8" />
          </div>

          <RadialRevealLink
            variant="outline"
            href="/contact-us"
            className="h-12 w-full sm:w-auto sm:px-8"
          >
            {t("contactLabel")}
          </RadialRevealLink>

          <a
            // Persian digits next to RTL copy need their own direction so the
            // dash groups cannot be reordered. Same as the site footer.
            dir="ltr"
            href={`tel:${tCommon("phone.href")}`}
            className="text-text-secondary hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            <Phone aria-hidden="true" className="size-4 shrink-0" />
            {tCommon("phone.label")}
          </a>
        </div>
      </RevealOnScroll>
    </Section>
  );
}
