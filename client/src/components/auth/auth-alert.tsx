import { AlertCircleIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type AuthAlertProps = {
  title?: string;
  description: string;
  variant?: "destructive" | "success" | "default";
  className?: string;
};

export function AuthAlert({
  title,
  description,
  variant = "destructive",
  className,
}: AuthAlertProps) {
  const Icon = variant === "success" ? CircleCheckIcon : AlertCircleIcon;

  return (
    <Alert
      role="alert"
      aria-live="assertive"
      variant={variant === "destructive" ? "destructive" : "default"}
      className={cn(
        variant === "success" &&
          "border-success/40 text-success-foreground bg-success/10 [&>svg]:text-success",
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {!!title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
