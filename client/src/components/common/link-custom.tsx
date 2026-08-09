import { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type LinkCustomProps = ComponentProps<typeof Link>;

export default function LinkCustom({
  href,
  className,
  rel,
  target,
  children,

  ...otherProps
}: LinkCustomProps) {
  if (!href) return null;

  return (
    <Link
      className={cn("flex items-center gap-2 font-bold", className)}
      {...(!!rel && { rel })}
      {...(!!target && { target })}
      href={href}
      {...otherProps}
    >
      {children}
    </Link>
  );
}
