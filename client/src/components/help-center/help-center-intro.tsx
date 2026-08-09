import type { ReactNode } from "react";
import { DirectionalImage } from "../common/directional-image";

interface HelpCenterIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  search?: ReactNode;
}

export function HelpCenterIntro({
  eyebrow,
  title,
  description,
  search,
}: HelpCenterIntroProps) {
  return (
    <header className="bg-muted/40 px-6 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto flex flex-col items-center gap-8 lg:max-w-7xl lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          <p
            className="text-muted-foreground mb-2 text-sm font-semibold tracking-widest uppercase"
            dir="auto"
          >
            {eyebrow}
          </p>
          <h1
            id="help-topic-heading"
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight outline-none sm:text-[2.5rem] sm:leading-[1.15]"
            dir="auto"
          >
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md text-base leading-7">
            {description}
          </p>
          {search && <div className="mt-6 w-full max-w-lg">{search}</div>}
        </div>
        <div className="relative aspect-video w-full max-w-125 shrink-0 overflow-hidden rounded-xl lg:w-[48%]">
          <DirectionalImage
            src={{
              ltr: "/images/help-center/hero-section.png",
              rtl: "/images/help-center/hero-section-rtl.png",
            }}
            alt=""
            fill
            sizes="(min-width: 1024px) 48vw, (min-width: 500px) 500px, 100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </header>
  );
}
