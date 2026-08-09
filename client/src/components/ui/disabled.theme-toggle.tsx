"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ModeToggleProps = {
  triggerClassName?: string;
  iconClassName?: string;
};

export function ModeToggle({
  triggerClassName,
  iconClassName,
}: ModeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className={cn(
        "relative size-10 rounded-md focus:bg-transparent",
        triggerClassName,
      )}
    >
      <Sun
        className={cn(
          "size-[1.2rem] scale-100 rotate-0 transition-all duration-300",
          { "scale-0 -rotate-90": isDark },
          iconClassName,
        )}
      />
      <Moon
        className={cn(
          "absolute size-[1.2rem] scale-0 -rotate-90 transition-all duration-300",
          { "scale-100 rotate-0": isDark },
          iconClassName,
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// "use client";

// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";
// import { useTranslations } from "next-intl";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { cn } from "@/lib/utils";

// const THEME_KEYS = [
//   { key: "lightMode", value: "light" },
//   { key: "darkMode", value: "dark" },
//   { key: "system", value: "system" },
// ] as const;

// export type ThemeType = "light" | "dark" | "system";

// export type ModeToggleProps = {
//   triggerClassName?: string;
// };

// export function ModeToggle({ triggerClassName }: ModeToggleProps) {
//   const t = useTranslations("common");
//   const { setTheme } = useTheme();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             "size-10 rounded-md focus:bg-transparent",
//             triggerClassName,
//           )}
//         >
//           <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
//           <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="start">
//         {THEME_KEYS.map((item) => (
//           <DropdownMenuItem key={item.key} onClick={() => setTheme(item.value)}>
//             {t(`${item.key}`)}
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
