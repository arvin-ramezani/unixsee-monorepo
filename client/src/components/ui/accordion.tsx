"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { PlusMinusIcon } from "../common/plus-minus-icon";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

type AccordionTriggerIndicator = "chevron" | "plus-minus" | "none";

type AccordionTriggerProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Trigger>,
  "asChild"
> & {
  indicator?: AccordionTriggerIndicator;
};

type AccordionTriggerButtonProps = React.ComponentPropsWithRef<"button"> & {
  indicator: AccordionTriggerIndicator;
  "data-state"?: "open" | "closed";
};

function AccordionTriggerButton({
  className,
  children,
  indicator,
  "data-state": state,
  ref,
  ...props
}: AccordionTriggerButtonProps) {
  const expanded = state === "open";

  return (
    <button
      ref={ref}
      data-slot="accordion-trigger"
      data-state={state}
      className={cn(
        "group/accordion-trigger",
        "focus-visible:border-ring focus-visible:ring-ring/50",
        "relative flex flex-1 items-start justify-between",
        "rounded-lg border border-transparent py-2.5",
        "text-start text-base font-medium",
        "transition-all outline-none",
        "focus-visible:ring-3",
        "disabled:pointer-events-none disabled:opacity-50",
        "**:data-[slot=accordion-trigger-icon]:ms-auto",
        "**:data-[slot=accordion-trigger-icon]:size-4",
        "lg:text-lg",
        className,
      )}
      {...props}
    >
      {children}

      {indicator === "chevron" && (
        <ChevronDownIcon
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          className={cn(
            "pointer-events-none shrink-0",
            "transition-transform duration-200 ease-out",
            "group-data-[state=open]/accordion-trigger:rotate-180",
          )}
        />
      )}

      {indicator === "plus-minus" && (
        <PlusMinusIcon
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          expanded={expanded}
        />
      )}
    </button>
  );
}

function AccordionTrigger({
  className,
  children,
  indicator = "chevron",
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger asChild {...props}>
        <AccordionTriggerButton className={className} indicator={indicator}>
          {children}
        </AccordionTriggerButton>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// function AccordionTrigger({
//   className,
//   children,
//   plusIcon = false,
//   noIcon = false,

//   onClick,
//   ...props
// }: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
//   plusIcon?: boolean;
//   noIcon?: boolean;
// }) {
//   const [expanded, setExpanded] = React.useState(false);

//   return (
//     <AccordionPrimitive.Header className="flex">
//       <AccordionPrimitive.Trigger
//         data-slot="accordion-trigger"
//         className={cn(
//           "group/accordion-trigger focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:after:border-ring relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-start text-base font-medium transition-all outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ms-auto **:data-[slot=accordion-trigger-icon]:size-4 lg:text-lg",
//           className,
//         )}
//         onClick={(e) => {
//           setExpanded(!expanded);
//           onClick?.(e);
//         }}
//         {...props}
//       >
//         {children}
//         {!noIcon && !plusIcon && (
//           <>
//             <ChevronDownIcon
//               data-slot="accordion-trigger-icon"
//               className="text-foreground pointer-events-none size-6 shrink-0 group-aria-expanded/accordion-trigger:hidden"
//             />
//             <ChevronUpIcon
//               data-slot="accordion-trigger-icon"
//               className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
//             />
//           </>
//         )}

//         {!noIcon && plusIcon && (
//           <PlusMinusIcon
//             data-slot="accordion-trigger-icon"
//             expanded={expanded}
//           />
//         )}
//         {/* {!noIcon && plusIcon && (
//           <>
//             <PlusIcon
//               data-slot="accordion-trigger-icon"
//               className="pointer-events-none size-4 shrink-0 scale-y-100 transition-all duration-200 ease-out group-aria-expanded/accordion-trigger:hidden group-aria-expanded/accordion-trigger:scale-y-0"
//             />

//             <MinusIcon
//               data-slot="accordion-trigger-icon"
//               className="pointer-events-none hidden size-4 shrink-0 scale-x-0 transition-all duration-200 ease-out group-aria-expanded/accordion-trigger:inline group-aria-expanded/accordion-trigger:scale-x-100"
//             />
//           </>
//         )} */}
//       </AccordionPrimitive.Trigger>
//     </AccordionPrimitive.Header>
//   );
// }

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden text-sm"
      {...props}
    >
      <div
        className={cn(
          "[&_a]:hover:text-foreground h-(--radix-accordion-content-height) pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
