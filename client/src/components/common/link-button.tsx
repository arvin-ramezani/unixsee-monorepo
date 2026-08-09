import { PropsWithChildren } from "react";

import { Button, ShadcnButtonProps } from "../ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export type LinkButtonProps = {
  href?: string;
  rel?: string;
  target?: string;
} & ShadcnButtonProps &
  PropsWithChildren;

export default function LinkButton({
  href,
  className,
  rel,
  target,
  children,
  ...otherProps
}: LinkButtonProps) {
  if (!href) return null;

  return (
    <Button
      asChild
      className={cn("h-12 lg:min-w-48", className)}
      {...otherProps}
    >
      <Link {...(!!rel && { rel })} {...(!!target && { target })} href={href}>
        {children}
      </Link>
    </Button>
  );
}
