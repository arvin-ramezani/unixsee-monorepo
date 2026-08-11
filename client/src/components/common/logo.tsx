import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  mode?: "dark" | "light" | "default";
};

export default function Logo({ className, mode = "default" }: LogoProps) {
  return (
    <Link
      className={cn("relative block aspect-80/14 w-20 lg:w-32", className)}
      href="/"
    >
      <Image
        className={cn("dark:hidden", {
          "inline-block dark:inline-block": mode === "light",
          "hidden dark:hidden": mode === "dark",
        })}
        src="/logo-light.webp"
        alt="Unixsee"
        fill
        unoptimized
        loading="eager"
      />
      <Image
        className={cn("hidden dark:inline-block", {
          "inline-block dark:inline-block": mode === "dark",
          "hidden dark:hidden": mode === "light",
        })}
        src="/logo-dark.webp"
        alt="Unixsee"
        fill
        unoptimized
      />
      {/* <Image
        className={cn(
          "lg:hidden dark:hidden",
          {
            hidden: size === "lg",
          },
          className,
        )}
        src="/logo-light.webp"
        alt="Unixsee"
        fill
        // width={80}
        // height={14}
      />
      <Image
        className={cn(
          "hidden lg:hidden dark:inline-block dark:lg:hidden",
          {
            hidden: size === "lg",
          },
          className,
        )}
        src="/logo-dark.webp"
        alt="Unixsee"
        fill
        // width={80}
        // height={14}
      />

      <Image
        className={cn(
          "hidden lg:inline-block dark:hidden",
          {
            hidden: size === "sm",
          },
          className,
        )}
        src="/logo-light.webp"
        alt="Unixsee"
        width={128}
        height={21}
      />

      <Image
        className={cn(
          "hidden lg:dark:inline-block",
          {
            hidden: size === "sm",
          },
          className,
        )}
        src="/logo-dark.webp"
        alt="Unixsee"
        width={128}
        height={21}
      /> */}
    </Link>
  );
}
