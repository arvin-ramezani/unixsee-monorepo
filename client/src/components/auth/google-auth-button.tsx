"use client";

import { useTranslations } from "next-intl";

import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { cn } from "@/lib/utils";

export type GoogleAuthButtonProps = {
  className?: string;
  disabled?: boolean;
};

export function GoogleAuthButton({
  className,
  disabled = true,
}: GoogleAuthButtonProps) {
  const t = useTranslations("Auth.common");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <RadialRevealButton
        type="button"
        variant="outline"
        disabled={disabled}
        aria-disabled={disabled}
        className="border-border text-foreground h-11 min-h-11 w-full font-medium"
        title={t("googleComingSoon")}
      >
        <GoogleGlyph aria-hidden="true" />
        {t("google")}
      </RadialRevealButton>
      <p className="text-muted-foreground text-center text-xs">
        {t("googleComingSoon")}
      </p>
    </div>
  );
}

function GoogleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.7 0 2.9.7 3.6 1.4l2.4-2.4C16.7 3.9 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.4 6.8 9.5C7.6 7.5 9.6 6.2 12 6.2c1.7 0 2.9.7 3.6 1.4l2.4-2.4C16.7 3.9 14.6 3 12 3 8.3 3 5.1 5.1 3.9 7.4z"
      />
      <path
        fill="#4A90E2"
        d="M12 21c2.5 0 4.6-.8 6.1-2.2l-2.9-2.3c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-2.9 2.2C5 18.9 8.2 21 12 21z"
      />
      <path
        fill="#FBBC05"
        d="M6.6 13.5c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.9 7.7C3.3 9 3 10.4 3 12s.3 3 0.9 4.3l2.7-2.8z"
      />
    </svg>
  );
}
