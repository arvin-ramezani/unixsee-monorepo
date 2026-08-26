"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon, MapPin, PhoneCall } from "lucide-react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { NAVIGATION_ITEMS } from "@/lib/translation-keys";
import FooterAccordion from "./footer-accordion";
import Logo from "@/components/common/logo";
import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";
import NewsletterForm from "./newsletter-form";
import { Badge } from "@/components/ui/badge";
import ComingSoonBadge from "./coming-soon-badge";

const MotionChevronDownIcon = motion.create(ChevronDownIcon);

const socialLinks = [
  {
    icon: <FaFacebook className="size-4 lg:size-6" />,
    link: "#",
  },
  {
    icon: <FaGithub className="size-4 lg:size-6" />,
    link: "#",
  },
  {
    icon: <FaInstagram className="size-4 lg:size-6" />,
    link: "#",
  },
  {
    icon: <FaLinkedin className="size-4 lg:size-6" />,
    link: "#",
  },
  {
    icon: <FaTwitter className="size-4 lg:size-6" />,
    link: "#",
  },
  {
    icon: <FaYoutube className="size-4 lg:size-6" />,
    link: "#",
  },
];

type TranslateNavigation = (key: string) => string;

export default function Footer() {
  const tNavigation = useTranslations("Layout.Navigation");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const isAboutPage = pathname === "/about-us";

  const translate: TranslateNavigation = (key) => tNavigation(key as never);

  const locale = useLocale();
  const direction = locale === "en" ? "ltr" : "rtl";

  const year = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : "fa-IR",
    { year: "numeric" },
  );

  return (
    <footer
      data-app-footer="true"
      className={cn(
        "bg-background relative z-10 -mt-10 overflow-hidden pt-10 lg:-mt-14 lg:pt-14",
        isAboutPage && "bg-muted",
      )}
    >
      <div className="relative rounded-t-3xl border-t border-[#dcecfb] bg-white pb-20 [box-shadow:inset_0_1px_0_rgba(255,255,255,.95),0_-1px_0_rgba(142,170,204,.12),0_-10px_24px_rgba(198,222,252,.28)] lg:rounded-t-[52px] lg:bg-[radial-gradient(35%_80%_at_20%_0%,#eaf5ff_0%,transparent_70%)] lg:py-16 lg:[box-shadow:inset_0_1px_0_rgba(255,255,255,.95),0_-1px_0_rgba(142,170,204,.14),0_-12px_28px_rgba(198,222,252,.30)] 2xl:bg-[radial-gradient(35%_80%_at_30%_0%,#eaf5ff_0%,transparent_70%)] dark:border-[#8eaacc24] dark:bg-[#101b29] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,.035),0_-1px_0_rgba(142,170,204,.10)] dark:lg:bg-[radial-gradient(35%_80%_at_20%_0%,#17273b_10%,transparent)] dark:2xl:bg-[radial-gradient(35%_80%_at_30%_0%,#17273b_10%,transparent)]">
        <div className="container mx-auto flex flex-col items-center rounded-t-3xl lg:rounded-[52px] xl:w-[80%]">
          <Logo className="hidden w-36 lg:block lg:w-40 lg:self-start" />

          <div className="mt-2 flex w-full flex-col items-center lg:mt-4 lg:flex-row lg:self-start">
            <p className="text-text-secondary flex h-12 w-full items-center justify-between gap-1 border-b py-2 pb-3 lg:h-auto lg:w-fit lg:justify-start lg:self-start lg:border-e lg:border-b-0 lg:py-0 lg:pe-4">
              <span className="flex items-center gap-2 text-xs">
                <PhoneCall className="size-4" />

                {tCommon(`phone.text`)}

                <i className="hidden lg:inline">:</i>
              </span>

              <a
                dir="ltr"
                className="bg-primary/30 hidden rounded-full px-4 py-1.5 text-sm font-light lg:block lg:bg-transparent lg:px-0 lg:py-0"
                href={`tel:${tCommon("phone.href")}`}
              >
                {tCommon(`phone.label`)}
              </a>
              <a
                dir="ltr"
                className="border-secondary text-secondary rounded-full border px-4 py-1.5 text-sm lg:hidden rtl:font-light"
                href={`tel:${tCommon("phone.href")}`}
              >
                {tCommon(`phone.textMobile`)}
              </a>
            </p>
            <div className="text-text-secondary mt-1 flex h-12 items-center self-start text-sm lg:mt-0 lg:h-auto lg:shrink-0 lg:ps-4">
              <MapPin className="me-2 hidden size-4 lg:inline" />
              <span className="hidden lg:inline">
                {tCommon(`address.label`)} {": "}
              </span>
              <address className="inline not-italic">
                <MapPin className="me-2 inline size-4 lg:hidden" />
                {tCommon(`address.value`)}
              </address>
            </div>
          </div>
          <div className="mx-auto grid w-full grid-cols-1 content-center justify-between gap-6 gap-x-0 pt-4 pb-6 lg:mt-10 lg:flex lg:content-start lg:gap-x-4 lg:pt-6 lg:pb-20">
            <FooterNavigation
              className="hidden lg:block"
              items={NAVIGATION_ITEMS}
              translate={translate}
            />
            <FooterAccordion
              className="mx-auto w-full grow lg:hidden"
              items={NAVIGATION_ITEMS}
              translate={translate}
            />

            <div className="flex h-full flex-col justify-between gap-6 lg:col-span-3 lg:shrink-0 lg:justify-start xl:col-span-2 2xl:col-span-2">
              <div className="mt-4 flex justify-center gap-4 lg:mt-0 lg:justify-between">
                {socialLinks.map((item, i) => (
                  <RadialRevealLink
                    key={i}
                    revealClassName="bg-accent"
                    variant={"outline"}
                    className="border-primary/30 data-[radial-active=true]:text-primary size-11.5 rounded-lg border p-2.5"
                    target="_blank"
                    href={item.link}
                  >
                    {item.icon}
                  </RadialRevealLink>
                ))}
              </div>

              <NewsletterForm
                direction={direction}
                placeholder={tCommon("emailPlaceholder")}
              />
            </div>
          </div>

          <div className="w-full flex-row-reverse justify-between gap-8 lg:flex xl:gap-16">
            <div className="mb-8 flex justify-center gap-2 lg:justify-start lg:gap-4">
              <div className="bg-accent size-28 rounded" />
              <div className="bg-accent size-28 rounded" />
              <div className="bg-accent size-28 rounded" />
            </div>

            <div className="relative flex flex-col items-center gap-2 self-start pb-8 text-xl font-semibold lg:items-start lg:gap-4">
              <FooterDescription />
            </div>
          </div>

          <p className="text-muted-foreground mt-6 flex items-center gap-1 text-center text-sm">
            <span className="rtl:h-4">© </span>
            <Link href="https://unixsee.com">
              <strong className="font-bold">{tCommon("brand")}</strong>
            </Link>
            {tCommon("copywrite")} {year}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterDescription() {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  return (
    <>
      <h4 className="text-center">{t(`HomePage.SiteFooter.title`)}</h4>
      <motion.p
        animate={isDescriptionOpen ? { height: "auto" } : { height: "50px" }}
        className="text-muted-foreground max-w-sm overflow-hidden text-center text-sm lg:max-w-max lg:text-start"
      >
        {t("HomePage.SiteFooter.description")}
      </motion.p>

      <motion.div
        animate={isDescriptionOpen ? { opacity: 0 } : { opacity: 1 }}
        className="dark:from-background dark:via-background/50 pointer-events-none absolute inset-x-0 bottom-8 z-10 h-8 bg-linear-to-t from-[#fbfdff] via-[#fbfdff]/80 to-transparent dark:to-transparent"
      />
      <Button
        className="text-text-secondary absolute inset-s-1/2 bottom-0 z-10 -translate-x-1/2 text-xs rtl:translate-x-1/2"
        variant={"ghost"}
        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
      >
        {isDescriptionOpen ? tCommon("seeLess") : tCommon("seeMore")}
        <MotionChevronDownIcon
          animate={
            isDescriptionOpen ? { rotate: "180deg" } : { rotate: "0deg" }
          }
        />
      </Button>
    </>
  );
}

type FooterNavItem = {
  key: string;
  href?: string;
  items?: readonly {
    key: string;
    href: string;
    comingSoon?: boolean;
  }[];
};

type FooterNavigationProps = {
  className?: string;
  items: readonly FooterNavItem[];
  translate: (key: string) => string;
};

export function FooterNavigation({
  items,
  translate,
  className,
}: FooterNavigationProps) {
  const visibleItems = items.filter(
    (item) => item.key !== "requestConsultation" && item.key !== "home",
  );

  return (
    <div
      className={cn(
        "col-span-3 w-full lg:col-span-2 xl:col-span-5 xl:max-w-[70%] 2xl:col-span-5",
        className,
      )}
    >
      <nav aria-label="Footer navigation">
        <div className="grid grid-cols-2 flex-col justify-items-center gap-4 text-center md:flex md:flex-row md:items-start md:justify-between lg:flex lg:grid-cols-5 lg:text-start xl:grid-cols-5 2xl:grid-cols-5">
          {visibleItems.map((column, index) => (
            <ul key={index} className="flex min-w-0 flex-1 flex-col gap-4">
              <FooterNavigationItem
                key={column.key}
                item={column}
                translate={translate}
              />
            </ul>
          ))}
        </div>
      </nav>
    </div>
  );
}

type FooterNavigationItemProps = {
  item: FooterNavItem;
  translate: (key: string) => string;
};

function FooterNavigationItem({ item, translate }: FooterNavigationItemProps) {
  const tNavigation = useTranslations("Layout.Navigation");
  const hasChildren = Boolean(item.items?.length);

  if (!hasChildren) {
    return (
      <li>
        <p className="text-text-primary group inline-flex items-center text-sm font-semibold lg:text-start"></p>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3">
      <p className="text-text-primary group relative inline-flex w-fit items-center justify-center text-sm leading-[1.1rem] font-semibold lg:justify-start">
        {translate(`${item.key}.label`)}
      </p>

      <ul className="flex flex-col gap-1">
        {item.items?.map((child) => (
          <li key={child.key} className="relative">
            {!!child.href && !child.comingSoon ? (
              <Link
                href={child.href}
                className="group text-text-secondary hover:text-text-primary group relative inline-flex items-center text-xs duration-100 aria-disabled:opacity-50 lg:text-start"
              >
                {translate(`${item.key}.items.${child.key}`)}
                <span className="absolute inset-s-0 -bottom-0.5 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            ) : (
              <span className="text-text-secondary group relative inline-flex items-center text-xs duration-100 lg:text-start">
                {translate(`${item.key}.items.${child.key}`)}
              </span>
            )}

            {child?.comingSoon && <ComingSoonBadge />}
          </li>
        ))}
      </ul>
    </li>
  );
}
