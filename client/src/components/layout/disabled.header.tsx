import { useTranslations } from "next-intl";

import LocaleSwitcher from "./locale/locale-switcher";
import Navigation from "./navigation";
import { Button } from "../ui/button";

export type HeaderType = {};

export default function Header(_props: HeaderType) {
  const t = useTranslations("HomePage");

  return (
    <header className="bg-bg-secondary/500 sticky top-0 z-10 backdrop-blur-md">
      <div className="container my-2 flex items-center gap-4 py-2 lg:my-2 lg:py-4">
        <p>{t("brand")}</p>

        <Navigation />

        <LocaleSwitcher />

        <Button className="bg-secondary h-10 text-sm text-white lg:min-w-48">
          {t("HeroSection.primaryCTA")}
        </Button>
      </div>
    </header>
  );
}
