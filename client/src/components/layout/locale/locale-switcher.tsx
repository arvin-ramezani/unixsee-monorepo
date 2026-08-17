"use client";

import { useLocale } from "next-intl";
import { useState, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Locale = "en" | "fa";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "fa", label: "فا" },
];

export type LocaleSwitcherProps = {
  className?: string;
  textClassName?: string;
  activeTextClassName?: string;
  activeClassName?: string;
  onLocaleChange?: (locale: Locale) => void;
};

export default function LocaleSwitcher({
  className,
  textClassName,
  activeTextClassName,
  activeClassName,
  onLocaleChange,
}: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleSwitch = (next: Locale) => {
    if (next === locale) return;
    setSelectedLocale(next);
    onLocaleChange?.(next);

    startTransition(() => {
      const search = window.location.search;
      const hash = window.location.hash;
      router.replace(`${pathname}${search}${hash}`, { locale: next });
      router.refresh();
    });
  };

  // const safeLocale: Locale = LOCALES.some((l) => l.value === locale)
  //   ? (locale as Locale)
  //   : "fa";

  // const activeIndex = LOCALES.findIndex((l) => l.value === safeLocale);

  // const activeIndex = LOCALES.findIndex((l) => l.value === locale);

  return (
    <div
      role="radiogroup"
      aria-label="Language switcher"
      className={cn(
        "border-border bg-muted relative flex h-10 items-center rounded-md border p-0.5 py-1.5 text-xs font-medium",
        isPending && "pointer-events-none opacity-60",
        className,
      )}
    >
      {/* <span
        aria-hidden
        className={cn(
          "bg-background absolute block size-9 rounded-sm shadow-sm transition-all duration-200 ease-in-out",
          activeClassName,
        )}
        style={{
          width: `calc(${100 / LOCALES.length}% - 2px)`,
          insetInlineStart: `calc(${(activeIndex / LOCALES.length) * 100}% + 2px)`,
        }}
      /> */}

      {LOCALES.map(({ value, label }) => {
        const isActive = value === selectedLocale;

        return (
          // <button
          //   key={value}
          //   role="radio"
          //   aria-checked={isActive}
          //   onClick={() => handleSwitch(value)}
          //   className={cn(
          //     "focus-visible:ring-ring relative z-10 flex size-9.5 flex-1 items-center justify-center rounded-sm transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",

          //     {
          //       "text-foreground": isActive,
          //       "text-muted-foreground hover:text-foreground": !isActive,
          //     },
          //     textClassName,
          //     isActive && activeTextClassName,
          //   )}
          // >
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSwitch(value)}
            className={cn(
              "focus-visible:ring-ring relative z-10 flex size-9.5 flex-1 items-center justify-center rounded-sm leading-px font-medium transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",

              {
                "text-foreground bg-background": isActive,
                activeClassName: activeClassName && isActive,
                "text-muted-foreground hover:text-foreground": !isActive,
              },
              textClassName,
              isActive && activeTextClassName,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// "use client";

// import { useLocale, useTranslations } from "next-intl";
// import { usePathname, useRouter } from "@/i18n/navigation";
// import { cn } from "@/lib/utils";

// type Locale = "en" | "fa";

// export type LocaleSwitcherProp = {
//   className?: string;
// };

// export default function LocaleSwitcher({ className }: LocaleSwitcherProp) {
//   const t = useTranslations("Layout.Navigation.languageSwitcher");
//   const locale = useLocale();
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const nextLocale = e.target.value as Locale;
//     router.replace(pathname, { locale: nextLocale });
//   };

//   return (
//     <select
//       value={locale}
//       onChange={handleChange}
//       className={cn(
//         "ms-auto h-10 cursor-pointer rounded-sm border bg-transparent px-3 py-2 text-xs text-nowrap transition-colors lg:w-auto",
//         className,
//       )}
//     >
//       <option value="en" className="text-sm text-nowrap text-black">
//         {t("en")}
//       </option>
//       <option value="fa" className="text-sm text-nowrap text-black">
//         {t("fa")}
//       </option>
//     </select>
//   );
// }
