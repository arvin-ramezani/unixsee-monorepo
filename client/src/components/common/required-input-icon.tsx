import { cn } from "@/lib/utils";

type RequiredInputIconProps = {
  className?: string;
};

export function RequiredInputIcon({ className }: RequiredInputIconProps) {
  return <span className={cn("text-secondary", className)}>*</span>;
}
