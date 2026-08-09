import { cva, type VariantProps } from "class-variance-authority";

/**
 * Dashboard-scoped button size variants
 *
 * Builds on top of buttonVariants from @/components/ui/button.
 * Only defines dashboard-specific geometry (height, padding, border-radius).
 * Base classes and color variants come through the radial-reveal → button chain.
 *
 * Use with size="plain" and variant pass-through on the radial-reveal wrappers.
 */
export const dashboardButtonSizeVariants = cva("", {
  variants: {
    variant: {
      primary: "",
      outline: "dark:hover:bg-transparent",
    },
    size: {
      lg: [
        "h-9 px-3 gap-1.5",
        "rounded-[10px]",
        "text-sm leading-5",
        "ltr:font-semibold", // 600 weight only for LTR
        "w-full md:w-auto",
      ],
      xl: [
        "h-10 px-4 gap-1.5",
        "rounded-[10px]",
        "text-sm leading-5",
        "ltr:font-semibold", // 600 weight only for LTR
        "w-full md:w-auto",
      ],
    },
  },
  defaultVariants: {
    size: "xl",
  },
});

export type DashboardButtonSizeVariants = VariantProps<
  typeof dashboardButtonSizeVariants
>;
