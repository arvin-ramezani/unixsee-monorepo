"use client";

import { ArrowTopLeftIcon } from "@radix-ui/react-icons";

import { useDirection } from "@/components/ui/direction";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type ArrowLinkCircleType = object;

export default function ArrowLinkCircle({}: ArrowLinkCircleType) {
  const isLtr = useDirection() === "ltr";

  return (
    <Link
      href="/"
      className={cn(
        "bg-primary group dark:bg-primary absolute inset-e-2 top-2 z-20 flex size-10 items-center justify-center rounded-full text-white",
        {
          "rotate-90": isLtr,
        },
      )}
    >
      <ArrowTopLeftIcon className="size-4 duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
