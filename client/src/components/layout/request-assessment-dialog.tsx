"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MotionGrowDialog,
  MotionGrowDialogClose,
  MotionGrowDialogContent,
  MotionGrowDialogDescription,
  MotionGrowDialogFooter,
  MotionGrowDialogHeader,
  MotionGrowDialogTitle,
  MotionGrowDialogTrigger,
  type LogicalGrowSide,
} from "@/components/common/motion/motion-grow-dialog";
import { FormErrorKey } from "@/lib/form-errors";
import {
  requestAssessmentSchema,
  RequestAssessmentSchemaType,
} from "@/lib/zod-schemas/request-assessment-schema";
import { RequestAssessmentFormType } from "@/app/[locale]/(website)/_components/others/request-assessment-form";
import { cn } from "@/lib/utils";
// import { RequiredInputIcon } from "../required-input-icon";

const SERVICE_KEYS = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

type RequestAssessmentDialogProps = {
  side?: LogicalGrowSide;
  triggerClassName?: string;
};

export function RequestAssessmentDialog({
  side = "bottom-start",
  triggerClassName,
}: RequestAssessmentDialogProps) {
  const tNavigation = useTranslations("Layout.Navigation.primaryCta");
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );
  const tFormErrors = useTranslations("FormErrors");

  const form = useForm<RequestAssessmentSchemaType>({
    resolver: zodResolver(requestAssessmentSchema),
    defaultValues: {
      fullName: "",
      businessEmail: "",
      services: "managedServer",
    },
  });

  function onSubmit(data: RequestAssessmentFormType) {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  return (
    <MotionGrowDialog
      side={side}
      scrollLockKey="request-assessment-dialog-mobile"
    >
      <MotionGrowDialogTrigger asChild>
        <Button className={cn("h-12 w-full", triggerClassName)}>
          {tNavigation("label")}
        </Button>
      </MotionGrowDialogTrigger>

      <MotionGrowDialogContent>
        <MotionGrowDialogHeader>
          <MotionGrowDialogTitle>{t("title")}</MotionGrowDialogTitle>
          <MotionGrowDialogDescription className="sr-only">
            {t("title")}
          </MotionGrowDialogDescription>
        </MotionGrowDialogHeader>

        <form
          id="request-assessment-form-dialog-mobile"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-full-name"
                    className="sr-only"
                  >
                    {t("fields.name.label")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="request-assessment-form-full-name"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("fields.name.placeholder")}
                    autoComplete="off"
                  />
                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="businessEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-business-email"
                    className="sr-only"
                  >
                    {t("fields.email.label")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="request-assessment-form-business-email"
                    aria-invalid={fieldState.invalid}
                    placeholder={t("fields.email.placeholder")}
                    autoComplete="off"
                  />
                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="aboutProject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="request-assessment-form-about-project"
                    className="sr-only"
                  >
                    {t("fields.aboutProject.label")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="request-assessment-form-about-project"
                      placeholder={t("fields.aboutProject.placeholder")}
                      rows={6}
                      className="min-h-24 resize-none px-4 py-4"
                      aria-invalid={fieldState.invalid}
                    />
                    {field.value?.length && (
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    )}
                  </InputGroup>

                  {fieldState.error?.message && (
                    <FieldError
                      errors={[
                        {
                          message: translateError(fieldState.error.message),
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="services"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                  className="flex-col! items-stretch"
                >
                  <FieldContent>
                    <FieldLabel
                      htmlFor="request-assessment-form-budget"
                      className="text-base"
                    >
                      {t("fields.service.label")}
                      {/* <RequiredInputIcon className="-m-1" /> */}
                    </FieldLabel>
                    {fieldState.error?.message && (
                      <FieldError
                        errors={[
                          {
                            message: translateError(fieldState.error.message),
                          },
                        ]}
                      />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="request-assessment-form-budget"
                      aria-invalid={fieldState.invalid}
                      className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
                    >
                      <SelectValue
                        className="dark:text-white"
                        placeholder={t("fields.budget.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="py-4" position="item-aligned">
                      {SERVICE_KEYS.map((item) => (
                        <SelectItem value={item} key={item}>
                          {t(`fields.service.options.${item}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <MotionGrowDialogFooter className="flex flex-col-reverse!">
          <MotionGrowDialogClose asChild>
            <Button className="h-12" variant="outline">
              {t("actions.cancel")}
            </Button>
          </MotionGrowDialogClose>
          <Button
            type="submit"
            form="request-assessment-form-dialog-mobile"
            className="h-12"
          >
            {t("actions.sendMessage")}
          </Button>
        </MotionGrowDialogFooter>
      </MotionGrowDialogContent>
    </MotionGrowDialog>
  );
}

// "use client";

// import * as React from "react";
// import { useLocale, useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { motion, useReducedMotion } from "framer-motion";
// import { XIcon } from "lucide-react";
// import { Dialog as DialogPrimitive } from "radix-ui";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogOverlay,
//   DialogPortal,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Field,
//   FieldContent,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequiredInputIcon } from "../common/required-input-icon";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";
// import { useScrollLock } from "@/hooks/use-scroll-lock";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// type LogicalGrowSide =
//   | "top"
//   | "bottom"
//   | "start"
//   | "end"
//   | "top-start"
//   | "top-end"
//   | "bottom-start"
//   | "bottom-end"
//   | "left"
//   | "right";

// type TriggerOrigin = {
//   left: number;
//   right: number;
//   top: number;
//   bottom: number;
// };

// type MobileGrowDialogContentProps = React.ComponentPropsWithoutRef<
//   typeof DialogPrimitive.Content
// > & {
//   origin?: TriggerOrigin | null;
//   side?: LogicalGrowSide;
//   isClosing?: boolean;
//   isRtl?: boolean;
//   showCloseButton?: boolean;
//   onCloseAnimationComplete?: () => void;
// };

// type RequestAssessmentDialogMobileProps = {
//   side?: LogicalGrowSide;
//   className?: string;
//   triggerClassName?: string;
// };

// const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

// function getViewportSize() {
//   if (typeof window === "undefined") {
//     return { width: 390, height: 844 };
//   }

//   return {
//     width: window.visualViewport?.width ?? window.innerWidth,
//     height: window.visualViewport?.height ?? window.innerHeight,
//   };
// }

// function clamp(value: number, min: number, max: number) {
//   return Math.max(min, Math.min(value, max));
// }

// function resolveInlineEdge(side: LogicalGrowSide, isRtl: boolean) {
//   if (side === "left") return "left" as const;
//   if (side === "right") return "right" as const;

//   if (side === "start" || side.endsWith("-start")) {
//     return isRtl ? ("right" as const) : ("left" as const);
//   }

//   if (side === "end" || side.endsWith("-end")) {
//     return isRtl ? ("left" as const) : ("right" as const);
//   }

//   return null;
// }

// function resolveBlockEdge(side: LogicalGrowSide) {
//   if (side === "top" || side.startsWith("top-")) return "top" as const;
//   if (side === "bottom" || side.startsWith("bottom-")) {
//     return "bottom" as const;
//   }

//   return null;
// }

// function shouldAnimateWidth(side: LogicalGrowSide) {
//   return (
//     side === "start" ||
//     side === "end" ||
//     side === "left" ||
//     side === "right" ||
//     side.endsWith("-start") ||
//     side.endsWith("-end")
//   );
// }

// function shouldAnimateHeight(side: LogicalGrowSide) {
//   return (
//     side === "top" ||
//     side === "bottom" ||
//     side.startsWith("top-") ||
//     side.startsWith("bottom-")
//   );
// }

// const MobileLogicalGrowDialogContent = React.forwardRef<
//   React.ComponentRef<typeof DialogPrimitive.Content>,
//   MobileGrowDialogContentProps
// >(
//   (
//     {
//       className,
//       children,
//       origin,
//       side = "bottom-start",
//       isClosing = false,
//       isRtl = false,
//       showCloseButton = true,
//       onCloseAnimationComplete,
//       ...props
//     },
//     ref,
//   ) => {
//     const shouldReduceMotion = useReducedMotion();
//     const [viewport, setViewport] = React.useState(getViewportSize);
//     const [isRevealComplete, setIsRevealComplete] = React.useState(false);

//     React.useEffect(() => {
//       const updateViewport = () => setViewport(getViewportSize());

//       updateViewport();
//       window.addEventListener("resize", updateViewport);
//       window.visualViewport?.addEventListener("resize", updateViewport);

//       return () => {
//         window.removeEventListener("resize", updateViewport);
//         window.visualViewport?.removeEventListener("resize", updateViewport);
//       };
//     }, []);

//     React.useEffect(() => {
//       if (isClosing) {
//         setIsRevealComplete(false);
//       }
//     }, [isClosing]);

//     const margin = 16;

//     const originLeft = origin ? Math.max(0, origin.left) : margin;
//     const originRight = origin
//       ? Math.max(0, viewport.width - origin.right)
//       : margin;
//     const originTop = origin ? Math.max(0, origin.top) : margin;
//     const originBottom = origin
//       ? Math.max(0, viewport.height - origin.bottom)
//       : margin;

//     const inlineEdge = resolveInlineEdge(side, isRtl);
//     const blockEdge = resolveBlockEdge(side) ?? "bottom";
//     const animateWidth = shouldAnimateWidth(side);
//     const animateHeight = shouldAnimateHeight(side);

//     const originInlineOffset =
//       inlineEdge === "right" ? originRight : originLeft;
//     const finalInlineOffset = inlineEdge
//       ? clamp(originInlineOffset, margin, viewport.width - 2)
//       : Math.max(
//           margin,
//           Math.round(
//             (viewport.width - Math.min(384, viewport.width - margin * 2)) / 2,
//           ),
//         );

//     const finalWidth = inlineEdge
//       ? Math.max(1, Math.min(384, viewport.width - finalInlineOffset - margin))
//       : Math.max(1, Math.min(384, viewport.width - margin * 2));

//     const finalCenteredLeft = Math.max(
//       margin,
//       Math.round((viewport.width - finalWidth) / 2),
//     );

//     const originBlockOffset = blockEdge === "top" ? originTop : originBottom;
//     const finalBlockOffset = clamp(
//       originBlockOffset,
//       margin,
//       viewport.height - 2,
//     );
//     const maxHeight = Math.max(
//       160,
//       viewport.height - finalBlockOffset - margin,
//     );

//     const expandedInlinePosition = inlineEdge
//       ? inlineEdge === "right"
//         ? { right: finalInlineOffset }
//         : { left: finalInlineOffset }
//       : { left: finalCenteredLeft };

//     const collapsedInlinePosition = inlineEdge
//       ? inlineEdge === "right"
//         ? { right: originInlineOffset }
//         : { left: originInlineOffset }
//       : expandedInlinePosition;

//     const expandedBlockPosition =
//       blockEdge === "top"
//         ? { top: finalBlockOffset }
//         : { bottom: finalBlockOffset };

//     const collapsedBlockPosition = animateHeight
//       ? blockEdge === "top"
//         ? { top: originBlockOffset }
//         : { bottom: originBlockOffset }
//       : expandedBlockPosition;

//     const expandedState = {
//       opacity: 1,
//       ...expandedInlinePosition,
//       ...expandedBlockPosition,
//       width: finalWidth,
//       height: "auto" as const,
//     };

//     const collapsedState = {
//       opacity: shouldReduceMotion ? 0 : 1,
//       ...collapsedInlinePosition,
//       ...collapsedBlockPosition,
//       width: animateWidth ? 2 : finalWidth,
//       height: animateHeight ? 2 : ("auto" as const),
//     };

//     const closingState = shouldReduceMotion
//       ? {
//           ...expandedState,
//           opacity: 0,
//         }
//       : {
//           opacity: 0,
//           ...collapsedInlinePosition,
//           ...collapsedBlockPosition,
//           width: animateWidth ? 2 : finalWidth,
//           height: animateHeight ? 2 : ("auto" as const),
//         };

//     const inlineTransitionKey = inlineEdge ?? "left";
//     const blockTransitionKey = blockEdge;

//     const transformInlineOrigin = inlineEdge ?? "center";
//     const transformBlockOrigin = blockEdge;
//     const willChangeProperties = [
//       inlineTransitionKey,
//       blockTransitionKey,
//       animateWidth ? "width" : null,
//       animateHeight ? "height" : null,
//     ].filter(Boolean);

//     return (
//       <DialogPortal>
//         <DialogOverlay />

//         <DialogPrimitive.Content
//           ref={ref}
//           data-slot="dialog-content"
//           className="pointer-events-none fixed inset-0 z-50 outline-none"
//           {...props}
//         >
//           <motion.div
//             initial={
//               shouldReduceMotion
//                 ? { ...expandedState, opacity: 0 }
//                 : collapsedState
//             }
//             animate={isClosing ? closingState : expandedState}
//             transition={
//               shouldReduceMotion
//                 ? { duration: 0.12 }
//                 : {
//                     opacity: {
//                       duration: isClosing ? 0.18 : 0.12,
//                       ease: "easeOut",
//                     },
//                     [inlineTransitionKey]: {
//                       duration: 0.42,
//                       ease: MOTION_EASE,
//                     },
//                     [blockTransitionKey]: {
//                       duration: 0.42,
//                       ease: MOTION_EASE,
//                     },
//                     width: { duration: 0.42, ease: MOTION_EASE },
//                     height: { duration: 0.42, ease: MOTION_EASE },
//                   }
//             }
//             style={{
//               position: "fixed",
//               transformOrigin: `${transformInlineOrigin} ${transformBlockOrigin}`,
//               maxHeight,
//               willChange: willChangeProperties.join(", "),
//             }}
//             onAnimationStart={() => setIsRevealComplete(false)}
//             onAnimationComplete={() => {
//               if (isClosing) {
//                 onCloseAnimationComplete?.();
//                 return;
//               }

//               setIsRevealComplete(true);
//             }}
//             className={cn(
//               "bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto rounded-xl text-sm shadow-lg ring-1 outline-none",
//               isRevealComplete && !isClosing
//                 ? "overflow-x-hidden overflow-y-auto"
//                 : "overflow-hidden",
//               className,
//             )}
//           >
//             <motion.div
//               initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
//               animate={{ opacity: isClosing ? 0 : 1 }}
//               transition={{
//                 duration: isClosing ? 0.08 : 0.16,
//                 delay: shouldReduceMotion || isClosing ? 0 : 0.12,
//               }}
//               className="relative grid gap-4 p-4"
//               style={{ width: finalWidth }}
//             >
//               {children}
//             </motion.div>

//             {showCloseButton && (
//               <DialogPrimitive.Close data-slot="dialog-close" asChild>
//                 <Button
//                   variant="ghost"
//                   className="absolute inset-e-2 top-2"
//                   size="icon-sm"
//                 >
//                   <XIcon />
//                   <span className="sr-only">Close</span>
//                 </Button>
//               </DialogPrimitive.Close>
//             )}
//           </motion.div>
//         </DialogPrimitive.Content>
//       </DialogPortal>
//     );
//   },
// );

// MobileLogicalGrowDialogContent.displayName = "MobileLogicalGrowDialogContent";

// export function RequestAssessmentDialogMobile({
//   side = "bottom-start",
//   className,
//   triggerClassName,
// }: RequestAssessmentDialogMobileProps) {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     `HomePage.ConsultationSection.requestAssessment.form`,
//   );
//   const tFormErrors = useTranslations("FormErrors");
//   const triggerRef = React.useRef<HTMLButtonElement>(null);
//   const [open, setOpen] = React.useState(false);
//   const [isClosing, setIsClosing] = React.useState(false);
//   const shouldCloseAfterAnimationRef = React.useRef(false);
//   const [triggerOrigin, setTriggerOrigin] =
//     React.useState<TriggerOrigin | null>(null);

//   useScrollLock(open || isClosing, "request-assessment-dialog-mobile");

//   const isRtl = useLocale() === "fa";

//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       services: "managedServer",
//     },
//   });

//   function captureTriggerOrigin(element?: HTMLElement | null) {
//     const trigger = element ?? triggerRef.current;

//     if (!trigger) return;

//     const rect = trigger.getBoundingClientRect();
//     setTriggerOrigin({
//       left: rect.left,
//       right: rect.right,
//       top: rect.top,
//       bottom: rect.bottom,
//     });
//   }

//   function handleOpenChange(nextOpen: boolean) {
//     if (nextOpen) {
//       captureTriggerOrigin();
//       shouldCloseAfterAnimationRef.current = false;
//       setIsClosing(false);
//       setOpen(true);
//       return;
//     }

//     if (!open) return;

//     shouldCloseAfterAnimationRef.current = true;
//     setIsClosing(true);
//   }

//   function handleCloseAnimationComplete() {
//     if (!shouldCloseAfterAnimationRef.current) return;

//     shouldCloseAfterAnimationRef.current = false;
//     setOpen(false);
//     setIsClosing(false);
//   }

//   function onSubmit(data: RequestAssessmentFormType) {
//     toast("You submitted the following values:", {
//       description: (
//         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
//           <code>{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//       position: "bottom-right",
//       classNames: {
//         content: "flex flex-col gap-2",
//       },
//       style: {
//         "--border-radius": "calc(var(--radius)  + 4px)",
//       } as React.CSSProperties,
//     });
//   }

//   const translateError = (message?: string) => {
//     if (!message) return undefined;
//     return tFormErrors(message as FormErrorKey);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button
//           ref={triggerRef}
//           className={cn("h-12 w-full lg:w-auto", triggerClassName)}
//           onPointerDown={(event) => captureTriggerOrigin(event.currentTarget)}
//           onKeyDown={(event) => {
//             if (event.key === "Enter" || event.key === " ") {
//               captureTriggerOrigin(event.currentTarget);
//             }
//           }}
//           onClick={(event) => captureTriggerOrigin(event.currentTarget)}
//         >
//           {tNavigation(`label`)}
//         </Button>
//       </DialogTrigger>

//       <MobileLogicalGrowDialogContent
//         className={className}
//         origin={triggerOrigin}
//         side={side}
//         isClosing={isClosing}
//         isRtl={isRtl}
//         onCloseAnimationComplete={handleCloseAnimationComplete}
//       >
//         <DialogHeader>
//           <DialogTitle>{t(`title`)}</DialogTitle>
//           <DialogDescription className="sr-only">
//             {t(`title`)}
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           id="request-assessment-form-dialog-mobile"
//           onSubmit={form.handleSubmit(onSubmit)}
//         >
//           <FieldGroup>
//             <Controller
//               name="fullName"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-full-name"
//                     className="sr-only"
//                   >
//                     {t("fields.name.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-full-name"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.name.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="businessEmail"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-business-email"
//                     className="sr-only"
//                   >
//                     {t("fields.email.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-business-email"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.email.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="aboutProject"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-about-project"
//                     className="sr-only"
//                   >
//                     {t(`fields.aboutProject.label`)}
//                   </FieldLabel>
//                   <InputGroup>
//                     <InputGroupTextarea
//                       {...field}
//                       id="request-assessment-form-about-project"
//                       placeholder={t(`fields.aboutProject.placeholder`)}
//                       rows={6}
//                       className="min-h-24 resize-none px-4 py-4"
//                       aria-invalid={fieldState.invalid}
//                     />
//                     {field.value?.length && (
//                       <InputGroupAddon align="block-end">
//                         <InputGroupText className="tabular-nums">
//                           {field.value.length}/100 characters
//                         </InputGroupText>
//                       </InputGroupAddon>
//                     )}
//                   </InputGroup>

//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="services"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   orientation="responsive"
//                   data-invalid={fieldState.invalid}
//                   className="flex-col! items-stretch"
//                 >
//                   <FieldContent>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-budget"
//                       className="text-base"
//                     >
//                       {t(`fields.service.label`)}
//                       <RequiredInputIcon className="-m-1" />
//                     </FieldLabel>
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </FieldContent>
//                   <Select
//                     name={field.name}
//                     value={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     <SelectTrigger
//                       id="request-assessment-form-budget"
//                       aria-invalid={fieldState.invalid}
//                       className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
//                     >
//                       <SelectValue
//                         className="dark:text-white"
//                         placeholder={t(`fields.budget.placeholder`)}
//                       />
//                     </SelectTrigger>
//                     <SelectContent className="py-4" position="item-aligned">
//                       {SERVICE_KEYS.map((item) => (
//                         <SelectItem value={item} key={item}>
//                           {t(`fields.service.options.${item}`)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             />
//           </FieldGroup>
//         </form>

//         <DialogFooter className="flex flex-col-reverse!">
//           <DialogClose asChild>
//             <Button className="h-12" variant="outline">
//               {t("actions.cancel")}
//             </Button>
//           </DialogClose>
//           <Button
//             type="submit"
//             form="request-assessment-form-dialog-mobile"
//             className="h-12"
//           >
//             {t("actions.sendMessage")}
//           </Button>
//         </DialogFooter>
//       </MobileLogicalGrowDialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import * as React from "react";
// import { useLocale, useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { motion, useReducedMotion } from "framer-motion";
// import { XIcon } from "lucide-react";
// import { Dialog as DialogPrimitive } from "radix-ui";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogOverlay,
//   DialogPortal,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Field,
//   FieldContent,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequiredInputIcon } from "../required-input-icon";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";
// import { useScrollLock } from "@/hooks/use-scroll-lock";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// type TriggerOrigin = {
//   left: number;
//   right: number;
//   bottom: number;
// };

// type MobileGrowDialogContentProps = React.ComponentPropsWithoutRef<
//   typeof DialogPrimitive.Content
// > & {
//   origin?: TriggerOrigin | null;
//   isClosing?: boolean;
//   isRtl: boolean;
//   showCloseButton?: boolean;
//   onCloseAnimationComplete?: () => void;
// };

// function getViewportSize() {
//   if (typeof window === "undefined") {
//     return { width: 390, height: 844 };
//   }

//   return {
//     width: window.visualViewport?.width ?? window.innerWidth,
//     height: window.visualViewport?.height ?? window.innerHeight,
//   };
// }

// const MobileBottomInlineGrowDialogContent = React.forwardRef<
//   React.ComponentRef<typeof DialogPrimitive.Content>,
//   MobileGrowDialogContentProps
// >(
//   (
//     {
//       className,
//       children,
//       origin,
//       isClosing = false,
//       isRtl,
//       showCloseButton = true,
//       onCloseAnimationComplete,
//       ...props
//     },
//     ref,
//   ) => {
//     const shouldReduceMotion = useReducedMotion();
//     const [viewport, setViewport] = React.useState(getViewportSize);
//     const [isRevealComplete, setIsRevealComplete] = React.useState(false);

//     React.useEffect(() => {
//       const updateViewport = () => setViewport(getViewportSize());

//       updateViewport();
//       window.addEventListener("resize", updateViewport);
//       window.visualViewport?.addEventListener("resize", updateViewport);

//       return () => {
//         window.removeEventListener("resize", updateViewport);
//         window.visualViewport?.removeEventListener("resize", updateViewport);
//       };
//     }, []);

//     React.useEffect(() => {
//       if (isClosing) {
//         setIsRevealComplete(false);
//       }
//     }, [isClosing]);

//     const margin = 16;

//     const originLeft = origin ? Math.max(0, origin.left) : margin;
//     const originRight = origin
//       ? Math.max(0, viewport.width - origin.right)
//       : margin;
//     const originBottom = origin
//       ? Math.max(0, viewport.height - origin.bottom)
//       : margin;

//     /**
//      * Direction-aware inline anchor:
//      * - RTL/fa: anchor to right, grow width toward the left.
//      * - LTR: anchor to left, grow width toward the right.
//      * Both directions keep bottom anchored, so height grows upward.
//      */
//     const originInlineOffset = isRtl ? originRight : originLeft;

//     const finalInlineOffset = Math.max(
//       margin,
//       Math.min(originInlineOffset, viewport.width - 2),
//     );

//     const finalBottom = Math.max(
//       margin,
//       Math.min(originBottom, viewport.height - 2),
//     );

//     const finalWidth = Math.max(
//       1,
//       Math.min(384, viewport.width - finalInlineOffset - margin),
//     );

//     const maxHeight = Math.max(160, viewport.height - finalBottom - margin);

//     const expandedInlinePosition = isRtl
//       ? { right: finalInlineOffset }
//       : { left: finalInlineOffset };

//     const collapsedInlinePosition = isRtl
//       ? { right: originInlineOffset }
//       : { left: originInlineOffset };

//     const expandedState = {
//       opacity: 1,
//       ...expandedInlinePosition,
//       bottom: finalBottom,
//       width: finalWidth,
//       height: "auto" as const,
//     };

//     const collapsedState = {
//       opacity: shouldReduceMotion ? 0 : 1,
//       ...collapsedInlinePosition,
//       bottom: originBottom,
//       width: 2,
//       height: 2,
//     };

//     const closingState = shouldReduceMotion
//       ? {
//           opacity: 0,
//           ...expandedInlinePosition,
//           bottom: finalBottom,
//           width: finalWidth,
//           height: "auto" as const,
//         }
//       : {
//           opacity: 0,
//           ...collapsedInlinePosition,
//           bottom: originBottom,
//           width: 2,
//           height: 2,
//         };

//     const inlineTransition = isRtl
//       ? { right: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
//       : { left: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } };

//     return (
//       <DialogPortal>
//         <DialogOverlay />

//         <DialogPrimitive.Content
//           ref={ref}
//           data-slot="dialog-content"
//           className="pointer-events-none fixed inset-0 z-50 outline-none"
//           {...props}
//         >
//           <motion.div
//             initial={
//               shouldReduceMotion
//                 ? { ...expandedState, opacity: 0 }
//                 : collapsedState
//             }
//             animate={isClosing ? closingState : expandedState}
//             transition={
//               shouldReduceMotion
//                 ? { duration: 0.12 }
//                 : {
//                     opacity: {
//                       duration: isClosing ? 0.18 : 0.12,
//                       ease: "easeOut",
//                     },
//                     ...inlineTransition,
//                     bottom: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                     width: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                     height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                   }
//             }
//             style={{
//               position: "fixed",
//               transformOrigin: isRtl ? "right bottom" : "left bottom",
//               maxHeight,
//               willChange: `${isRtl ? "right" : "left"}, bottom, width, height`,
//             }}
//             onAnimationStart={() => setIsRevealComplete(false)}
//             onAnimationComplete={() => {
//               if (isClosing) {
//                 onCloseAnimationComplete?.();
//                 return;
//               }

//               setIsRevealComplete(true);
//             }}
//             className={cn(
//               "bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto rounded-xl text-sm shadow-lg ring-1 outline-none",
//               isRevealComplete && !isClosing
//                 ? "overflow-x-hidden overflow-y-auto"
//                 : "overflow-hidden",
//               className,
//             )}
//           >
//             <motion.div
//               initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
//               animate={{ opacity: isClosing ? 0 : 1 }}
//               transition={{
//                 duration: isClosing ? 0.08 : 0.16,
//                 delay: shouldReduceMotion || isClosing ? 0 : 0.12,
//               }}
//               className="relative grid gap-4 p-4"
//               style={{ width: finalWidth }}
//             >
//               {children}
//             </motion.div>

//             {showCloseButton && (
//               <DialogPrimitive.Close data-slot="dialog-close" asChild>
//                 <Button
//                   variant="ghost"
//                   className="absolute inset-e-2 top-2"
//                   size="icon-sm"
//                 >
//                   <XIcon />
//                   <span className="sr-only">Close</span>
//                 </Button>
//               </DialogPrimitive.Close>
//             )}
//           </motion.div>
//         </DialogPrimitive.Content>
//       </DialogPortal>
//     );
//   },
// );

// MobileBottomInlineGrowDialogContent.displayName =
//   "MobileBottomInlineGrowDialogContent";

// export function RequestAssessmentDialogMobile() {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     `HomePage.ConsultationSection.requestAssessment.form`,
//   );
//   const tFormErrors = useTranslations("FormErrors");
//   const triggerRef = React.useRef<HTMLButtonElement>(null);
//   const [open, setOpen] = React.useState(false);
//   const [isClosing, setIsClosing] = React.useState(false);
//   const shouldCloseAfterAnimationRef = React.useRef(false);
//   const [triggerOrigin, setTriggerOrigin] =
//     React.useState<TriggerOrigin | null>(null);

//   useScrollLock(open || isClosing, "request-assessment-dialog-mobile");

//   const isRtl = useLocale() === "fa";

//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       services: "managedServer",
//     },
//   });

//   function captureTriggerOrigin(element?: HTMLElement | null) {
//     const trigger = element ?? triggerRef.current;

//     if (!trigger) return;

//     const rect = trigger.getBoundingClientRect();
//     setTriggerOrigin({
//       left: rect.left,
//       right: rect.right,
//       bottom: rect.bottom,
//     });
//   }

//   function handleOpenChange(nextOpen: boolean) {
//     if (nextOpen) {
//       captureTriggerOrigin();
//       shouldCloseAfterAnimationRef.current = false;
//       setIsClosing(false);
//       setOpen(true);
//       return;
//     }

//     if (!open) return;

//     shouldCloseAfterAnimationRef.current = true;
//     setIsClosing(true);
//   }

//   function handleCloseAnimationComplete() {
//     if (!shouldCloseAfterAnimationRef.current) return;

//     shouldCloseAfterAnimationRef.current = false;
//     setOpen(false);
//     setIsClosing(false);
//   }

//   function onSubmit(data: RequestAssessmentFormType) {
//     toast("You submitted the following values:", {
//       description: (
//         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
//           <code>{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//       position: "bottom-right",
//       classNames: {
//         content: "flex flex-col gap-2",
//       },
//       style: {
//         "--border-radius": "calc(var(--radius)  + 4px)",
//       } as React.CSSProperties,
//     });
//   }

//   const translateError = (message?: string) => {
//     if (!message) return undefined;
//     return tFormErrors(message as FormErrorKey);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button
//           ref={triggerRef}
//           className="h-12 w-full"
//           onPointerDown={(event) => captureTriggerOrigin(event.currentTarget)}
//           onKeyDown={(event) => {
//             if (event.key === "Enter" || event.key === " ") {
//               captureTriggerOrigin(event.currentTarget);
//             }
//           }}
//           onClick={(event) => captureTriggerOrigin(event.currentTarget)}
//         >
//           {tNavigation(`label`)}
//         </Button>
//       </DialogTrigger>

//       <MobileBottomInlineGrowDialogContent
//         origin={triggerOrigin}
//         isClosing={isClosing}
//         isRtl={isRtl}
//         onCloseAnimationComplete={handleCloseAnimationComplete}
//       >
//         <DialogHeader>
//           <DialogTitle>{t(`title`)}</DialogTitle>
//           <DialogDescription className="sr-only">
//             {t(`title`)}
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           id="request-assessment-form-dialog-mobile"
//           onSubmit={form.handleSubmit(onSubmit)}
//         >
//           <FieldGroup>
//             <Controller
//               name="fullName"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-full-name"
//                     className="sr-only"
//                   >
//                     {t("fields.name.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-full-name"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.name.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="businessEmail"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-business-email"
//                     className="sr-only"
//                   >
//                     {t("fields.email.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-business-email"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.email.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="aboutProject"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-about-project"
//                     className="sr-only"
//                   >
//                     {t(`fields.aboutProject.label`)}
//                   </FieldLabel>
//                   <InputGroup>
//                     <InputGroupTextarea
//                       {...field}
//                       id="request-assessment-form-about-project"
//                       placeholder={t(`fields.aboutProject.placeholder`)}
//                       rows={6}
//                       className="min-h-24 resize-none px-4 py-4"
//                       aria-invalid={fieldState.invalid}
//                     />
//                     {field.value?.length && (
//                       <InputGroupAddon align="block-end">
//                         <InputGroupText className="tabular-nums">
//                           {field.value.length}/100 characters
//                         </InputGroupText>
//                       </InputGroupAddon>
//                     )}
//                   </InputGroup>

//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="services"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   orientation="responsive"
//                   data-invalid={fieldState.invalid}
//                   className="flex-col! items-stretch"
//                 >
//                   <FieldContent>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-budget"
//                       className="text-base"
//                     >
//                       {t(`fields.service.label`)}
//                       <RequiredInputIcon className="-m-1" />
//                     </FieldLabel>
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </FieldContent>
//                   <Select
//                     name={field.name}
//                     value={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     <SelectTrigger
//                       id="request-assessment-form-budget"
//                       aria-invalid={fieldState.invalid}
//                       className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
//                     >
//                       <SelectValue
//                         className="dark:text-white"
//                         placeholder={t(`fields.budget.placeholder`)}
//                       />
//                     </SelectTrigger>
//                     <SelectContent className="py-4" position="item-aligned">
//                       {SERVICE_KEYS.map((item) => (
//                         <SelectItem value={item} key={item}>
//                           {t(`fields.service.options.${item}`)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             />
//           </FieldGroup>
//         </form>

//         <DialogFooter className="flex flex-col-reverse!">
//           <DialogClose asChild>
//             <Button className="h-12" variant="outline">
//               {t("actions.cancel")}
//             </Button>
//           </DialogClose>
//           <Button
//             type="submit"
//             form="request-assessment-form-dialog-mobile"
//             className="h-12"
//           >
//             {t("actions.sendMessage")}
//           </Button>
//         </DialogFooter>
//       </MobileBottomInlineGrowDialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import * as React from "react";
// import { useLocale, useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { motion, useReducedMotion } from "framer-motion";
// import { XIcon } from "lucide-react";
// import { Dialog as DialogPrimitive } from "radix-ui";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogOverlay,
//   DialogPortal,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Field,
//   FieldContent,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequiredInputIcon } from "../required-input-icon";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";
// import { useScrollLock } from "@/hooks/use-scroll-lock";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// type TriggerOrigin = {
//   right: number;
//   bottom: number;
// };

// type MobileGrowDialogContentProps = React.ComponentPropsWithoutRef<
//   typeof DialogPrimitive.Content
// > & {
//   origin?: TriggerOrigin | null;
//   isClosing?: boolean;
//   showCloseButton?: boolean;
//   onCloseAnimationComplete?: () => void;
// };

// function getViewportSize() {
//   if (typeof window === "undefined") {
//     return { width: 390, height: 844 };
//   }

//   return {
//     width: window.visualViewport?.width ?? window.innerWidth,
//     height: window.visualViewport?.height ?? window.innerHeight,
//   };
// }

// const MobileBottomRightGrowDialogContent = React.forwardRef<
//   React.ComponentRef<typeof DialogPrimitive.Content>,
//   MobileGrowDialogContentProps
// >(
//   (
//     {
//       className,
//       children,
//       origin,
//       isClosing = false,
//       showCloseButton = true,
//       onCloseAnimationComplete,
//       ...props
//     },
//     ref,
//   ) => {
//     const shouldReduceMotion = useReducedMotion();
//     const [viewport, setViewport] = React.useState(getViewportSize);
//     const [isRevealComplete, setIsRevealComplete] = React.useState(false);

//     React.useEffect(() => {
//       const updateViewport = () => setViewport(getViewportSize());

//       updateViewport();
//       window.addEventListener("resize", updateViewport);
//       window.visualViewport?.addEventListener("resize", updateViewport);

//       return () => {
//         window.removeEventListener("resize", updateViewport);
//         window.visualViewport?.removeEventListener("resize", updateViewport);
//       };
//     }, []);

//     React.useEffect(() => {
//       if (isClosing) {
//         setIsRevealComplete(false);
//       }
//     }, [isClosing]);

//     const margin = 16;
//     const originRight = origin
//       ? Math.max(0, viewport.width - origin.right)
//       : margin;
//     const originBottom = origin
//       ? Math.max(0, viewport.height - origin.bottom)
//       : margin;

//     /**
//      * Keep the final panel anchored to the same right/bottom edge family.
//      * Width grows leftward because `right` stays fixed.
//      * Height grows upward because `bottom` stays fixed.
//      */
//     const finalRight = Math.max(
//       margin,
//       Math.min(originRight, viewport.width - 2),
//     );
//     const finalBottom = Math.max(
//       margin,
//       Math.min(originBottom, viewport.height - 2),
//     );
//     const finalWidth = Math.max(
//       1,
//       Math.min(384, viewport.width - finalRight - margin),
//     );
//     const maxHeight = Math.max(160, viewport.height - finalBottom - margin);

//     const expandedState = {
//       opacity: 1,
//       right: finalRight,
//       bottom: finalBottom,
//       width: finalWidth,
//       height: "auto" as const,
//     };

//     const collapsedState = {
//       opacity: shouldReduceMotion ? 0 : 1,
//       right: originRight,
//       bottom: originBottom,
//       width: 2,
//       height: 2,
//     };

//     const closingState = shouldReduceMotion
//       ? {
//           opacity: 0,
//           right: finalRight,
//           bottom: finalBottom,
//           width: finalWidth,
//           height: "auto" as const,
//         }
//       : {
//           opacity: 0,
//           right: originRight,
//           bottom: originBottom,
//           width: 2,
//           height: 2,
//         };

//     return (
//       <DialogPortal>
//         <DialogOverlay />

//         <DialogPrimitive.Content
//           ref={ref}
//           data-slot="dialog-content"
//           className="pointer-events-none fixed inset-0 z-50 outline-none"
//           {...props}
//         >
//           <motion.div
//             initial={
//               shouldReduceMotion
//                 ? { ...expandedState, opacity: 0 }
//                 : collapsedState
//             }
//             animate={isClosing ? closingState : expandedState}
//             transition={
//               shouldReduceMotion
//                 ? { duration: 0.12 }
//                 : {
//                     opacity: {
//                       duration: isClosing ? 0.18 : 0.12,
//                       ease: "easeOut",
//                     },
//                     right: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                     bottom: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                     width: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                     height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                   }
//             }
//             style={{
//               position: "fixed",
//               transformOrigin: "right bottom",
//               maxHeight,
//               willChange: "right, bottom, width, height",
//             }}
//             onAnimationStart={() => setIsRevealComplete(false)}
//             onAnimationComplete={() => {
//               if (isClosing) {
//                 onCloseAnimationComplete?.();
//                 return;
//               }

//               setIsRevealComplete(true);
//             }}
//             className={cn(
//               "bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto rounded-xl text-sm shadow-lg ring-1 outline-none",
//               isRevealComplete && !isClosing
//                 ? "overflow-x-hidden overflow-y-auto"
//                 : "overflow-hidden",
//               className,
//             )}
//           >
//             <motion.div
//               initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
//               animate={{ opacity: isClosing ? 0 : 1 }}
//               transition={{
//                 duration: isClosing ? 0.08 : 0.16,
//                 delay: shouldReduceMotion || isClosing ? 0 : 0.12,
//               }}
//               className="relative grid gap-4 p-4"
//               style={{ width: finalWidth }}
//             >
//               {children}
//             </motion.div>

//             {showCloseButton && (
//               <DialogPrimitive.Close data-slot="dialog-close" asChild>
//                 <Button
//                   variant="ghost"
//                   className="absolute inset-e-2 top-2"
//                   size="icon-sm"
//                 >
//                   <XIcon />
//                   <span className="sr-only">Close</span>
//                 </Button>
//               </DialogPrimitive.Close>
//             )}
//           </motion.div>
//         </DialogPrimitive.Content>
//       </DialogPortal>
//     );
//   },
// );

// MobileBottomRightGrowDialogContent.displayName =
//   "MobileBottomRightGrowDialogContent";

// export function RequestAssessmentDialogMobile() {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     `HomePage.ConsultationSection.requestAssessment.form`,
//   );
//   const tFormErrors = useTranslations("FormErrors");
//   const triggerRef = React.useRef<HTMLButtonElement>(null);
//   const [open, setOpen] = React.useState(false);
//   const [isClosing, setIsClosing] = React.useState(false);
//   const shouldCloseAfterAnimationRef = React.useRef(false);
//   const [triggerOrigin, setTriggerOrigin] =
//     React.useState<TriggerOrigin | null>(null);

//   useScrollLock(open || isClosing, "request-assessment-dialog-mobile");

//   const isRtl = useLocale() === "fa"

//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       // services: [],
//       services: "managedServer",
//       // services: ""
//     },
//   });

//   function captureTriggerOrigin(element?: HTMLElement | null) {
//     const trigger = element ?? triggerRef.current;

//     if (!trigger) return;

//     const rect = trigger.getBoundingClientRect();
//     setTriggerOrigin({
//       right: rect.right,
//       bottom: rect.bottom,
//     });
//   }

//   function handleOpenChange(nextOpen: boolean) {
//     if (nextOpen) {
//       captureTriggerOrigin();
//       shouldCloseAfterAnimationRef.current = false;
//       setIsClosing(false);
//       setOpen(true);
//       return;
//     }

//     if (!open) return;

//     shouldCloseAfterAnimationRef.current = true;
//     setIsClosing(true);
//   }

//   function handleCloseAnimationComplete() {
//     if (!shouldCloseAfterAnimationRef.current) return;

//     shouldCloseAfterAnimationRef.current = false;
//     setOpen(false);
//     setIsClosing(false);
//   }

//   function onSubmit(data: RequestAssessmentFormType) {
//     toast("You submitted the following values:", {
//       description: (
//         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
//           <code>{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//       position: "bottom-right",
//       classNames: {
//         content: "flex flex-col gap-2",
//       },
//       style: {
//         "--border-radius": "calc(var(--radius)  + 4px)",
//       } as React.CSSProperties,
//     });
//   }

//   const translateError = (message?: string) => {
//     if (!message) return undefined;
//     return tFormErrors(message as FormErrorKey);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button
//           ref={triggerRef}
//           className="h-12 w-full"
//           onPointerDown={(event) => captureTriggerOrigin(event.currentTarget)}
//           onKeyDown={(event) => {
//             if (event.key === "Enter" || event.key === " ") {
//               captureTriggerOrigin(event.currentTarget);
//             }
//           }}
//           onClick={(event) => captureTriggerOrigin(event.currentTarget)}
//         >
//           {tNavigation(`label`)}
//         </Button>
//       </DialogTrigger>

//       <MobileBottomRightGrowDialogContent
//         origin={triggerOrigin}
//         isClosing={isClosing}
//         onCloseAnimationComplete={handleCloseAnimationComplete}
//       >
//         <DialogHeader>
//           <DialogTitle>{t(`title`)}</DialogTitle>
//           <DialogDescription className="sr-only">
//             {t(`title`)}
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           id="request-assessment-form-dialog-mobile"
//           onSubmit={form.handleSubmit(onSubmit)}
//         >
//           <FieldGroup>
//             <Controller
//               name="fullName"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-full-name"
//                     className="sr-only"
//                   >
//                     {t("fields.name.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-full-name"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.name.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="businessEmail"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-business-email"
//                     className="sr-only"
//                   >
//                     {t("fields.email.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-business-email"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.email.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="aboutProject"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-about-project"
//                     className="sr-only"
//                   >
//                     {t(`fields.aboutProject.label`)}
//                   </FieldLabel>
//                   <InputGroup>
//                     <InputGroupTextarea
//                       {...field}
//                       id="request-assessment-form-about-project"
//                       placeholder={t(`fields.aboutProject.placeholder`)}
//                       rows={6}
//                       className="min-h-24 resize-none px-4 py-4"
//                       aria-invalid={fieldState.invalid}
//                     />
//                     {field.value?.length && (
//                       <InputGroupAddon align="block-end">
//                         <InputGroupText className="tabular-nums">
//                           {field.value.length}/100 characters
//                         </InputGroupText>
//                       </InputGroupAddon>
//                     )}
//                   </InputGroup>

//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="services"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   orientation="responsive"
//                   data-invalid={fieldState.invalid}
//                   className="flex-col! items-stretch"
//                 >
//                   <FieldContent>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-budget"
//                       className="text-base"
//                     >
//                       {t(`fields.service.label`)}
//                       <RequiredInputIcon className="-m-1" />
//                     </FieldLabel>
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </FieldContent>
//                   <Select
//                     name={field.name}
//                     value={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     <SelectTrigger
//                       id="request-assessment-form-budget"
//                       aria-invalid={fieldState.invalid}
//                       className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
//                     >
//                       <SelectValue
//                         className="dark:text-white"
//                         placeholder={t(`fields.budget.placeholder`)}
//                       />
//                     </SelectTrigger>
//                     <SelectContent className="py-4" position="item-aligned">
//                       {SERVICE_KEYS.map((item) => (
//                         <SelectItem value={item} key={item}>
//                           {t(`fields.service.options.${item}`)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             />
//           </FieldGroup>
//         </form>

//         <DialogFooter className="flex flex-col-reverse!">
//           <DialogClose asChild>
//             <Button className="h-12" variant="outline">
//               {t("actions.cancel")}
//             </Button>
//           </DialogClose>
//           <Button
//             type="submit"
//             form="request-assessment-form-dialog-mobile"
//             className="h-12"
//           >
//             {t("actions.sendMessage")}
//           </Button>
//         </DialogFooter>
//       </MobileBottomRightGrowDialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import * as React from "react";
// import { useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { motion, useReducedMotion } from "framer-motion";
// import { XIcon } from "lucide-react";
// import { Dialog as DialogPrimitive } from "radix-ui";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogOverlay,
//   DialogPortal,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Field,
//   FieldContent,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequiredInputIcon } from "../required-input-icon";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// type TriggerOrigin = {
//   right: number;
//   bottom: number;
// };

// type MobileGrowDialogContentProps = React.ComponentPropsWithoutRef<
//   typeof DialogPrimitive.Content
// > & {
//   origin?: TriggerOrigin | null;
//   showCloseButton?: boolean;
// };

// function getViewportSize() {
//   if (typeof window === "undefined") {
//     return { width: 390, height: 844 };
//   }

//   return {
//     width: window.visualViewport?.width ?? window.innerWidth,
//     height: window.visualViewport?.height ?? window.innerHeight,
//   };
// }

// const MobileBottomRightGrowDialogContent = React.forwardRef<
//   React.ComponentRef<typeof DialogPrimitive.Content>,
//   MobileGrowDialogContentProps
// >(({ className, children, origin, showCloseButton = true, ...props }, ref) => {
//   const shouldReduceMotion = useReducedMotion();
//   const [viewport, setViewport] = React.useState(getViewportSize);
//   const [isRevealComplete, setIsRevealComplete] = React.useState(false);

//   React.useEffect(() => {
//     const updateViewport = () => setViewport(getViewportSize());

//     updateViewport();
//     window.addEventListener("resize", updateViewport);
//     window.visualViewport?.addEventListener("resize", updateViewport);

//     return () => {
//       window.removeEventListener("resize", updateViewport);
//       window.visualViewport?.removeEventListener("resize", updateViewport);
//     };
//   }, []);

//   const margin = 16;
//   const originRight = origin
//     ? Math.max(0, viewport.width - origin.right)
//     : margin;
//   const originBottom = origin
//     ? Math.max(0, viewport.height - origin.bottom)
//     : margin;

//   /**
//    * Keep the final panel anchored to the same right/bottom edge family.
//    * Width grows leftward because `right` stays fixed.
//    * Height grows upward because `bottom` stays fixed.
//    */
//   const finalRight = Math.max(
//     margin,
//     Math.min(originRight, viewport.width - 2),
//   );
//   const finalBottom = Math.max(
//     margin,
//     Math.min(originBottom, viewport.height - 2),
//   );
//   const finalWidth = Math.max(
//     1,
//     Math.min(384, viewport.width - finalRight - margin),
//   );
//   const maxHeight = Math.max(160, viewport.height - finalBottom - margin);

//   return (
//     <DialogPortal>
//       <DialogOverlay />

//       <DialogPrimitive.Content
//         ref={ref}
//         data-slot="dialog-content"
//         className="pointer-events-none fixed inset-0 z-50 outline-none"
//         {...props}
//       >
//         <motion.div
//           initial={
//             shouldReduceMotion
//               ? {
//                   opacity: 0,
//                   right: finalRight,
//                   bottom: finalBottom,
//                   width: finalWidth,
//                   height: "auto",
//                 }
//               : {
//                   opacity: 1,
//                   right: originRight,
//                   bottom: originBottom,
//                   width: 2,
//                   height: 2,
//                 }
//           }
//           animate={{
//             opacity: 1,
//             right: finalRight,
//             bottom: finalBottom,
//             width: finalWidth,
//             height: "auto",
//           }}
//           exit={
//             shouldReduceMotion
//               ? { opacity: 0 }
//               : {
//                   opacity: 0,
//                   right: originRight,
//                   bottom: originBottom,
//                   width: 2,
//                   height: 2,
//                 }
//           }
//           transition={
//             shouldReduceMotion
//               ? { duration: 0.12 }
//               : {
//                   opacity: { duration: 0.12, ease: "easeOut" },
//                   right: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                   bottom: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                   width: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                   height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//                 }
//           }
//           style={{
//             position: "fixed",
//             transformOrigin: "right bottom",
//             maxHeight,
//             willChange: "right, bottom, width, height",
//           }}
//           onAnimationStart={() => setIsRevealComplete(false)}
//           onAnimationComplete={() => setIsRevealComplete(true)}
//           className={cn(
//             "bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto rounded-xl text-sm shadow-lg ring-1 outline-none",
//             isRevealComplete
//               ? "overflow-x-hidden overflow-y-auto"
//               : "overflow-hidden",
//             className,
//           )}
//         >
//           <motion.div
//             initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{
//               duration: 0.16,
//               delay: shouldReduceMotion ? 0 : 0.12,
//             }}
//             className="relative grid gap-4 p-4"
//             style={{ width: finalWidth }}
//           >
//             {children}
//           </motion.div>

//           {showCloseButton && (
//             <DialogPrimitive.Close data-slot="dialog-close" asChild>
//               <Button
//                 variant="ghost"
//                 className="absolute inset-e-2 top-2"
//                 size="icon-sm"
//               >
//                 <XIcon />
//                 <span className="sr-only">Close</span>
//               </Button>
//             </DialogPrimitive.Close>
//           )}
//         </motion.div>
//       </DialogPrimitive.Content>
//     </DialogPortal>
//   );
// });

// MobileBottomRightGrowDialogContent.displayName =
//   "MobileBottomRightGrowDialogContent";

// export function RequestAssessmentDialogMobile() {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     `HomePage.ConsultationSection.requestAssessment.form`,
//   );
//   const tFormErrors = useTranslations("FormErrors");
//   const triggerRef = React.useRef<HTMLButtonElement>(null);
//   const [open, setOpen] = React.useState(false);
//   const [triggerOrigin, setTriggerOrigin] =
//     React.useState<TriggerOrigin | null>(null);

//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       // services: [],
//       services: "managedServer",
//       // services: ""
//     },
//   });

//   function captureTriggerOrigin(element?: HTMLElement | null) {
//     const trigger = element ?? triggerRef.current;

//     if (!trigger) return;

//     const rect = trigger.getBoundingClientRect();
//     setTriggerOrigin({
//       right: rect.right,
//       bottom: rect.bottom,
//     });
//   }

//   function onSubmit(data: RequestAssessmentFormType) {
//     toast("You submitted the following values:", {
//       description: (
//         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
//           <code>{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//       position: "bottom-right",
//       classNames: {
//         content: "flex flex-col gap-2",
//       },
//       style: {
//         "--border-radius": "calc(var(--radius)  + 4px)",
//       } as React.CSSProperties,
//     });
//   }

//   const translateError = (message?: string) => {
//     if (!message) return undefined;
//     return tFormErrors(message as FormErrorKey);
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           ref={triggerRef}
//           className="h-12 w-full"
//           onPointerDown={(event) => captureTriggerOrigin(event.currentTarget)}
//           onKeyDown={(event) => {
//             if (event.key === "Enter" || event.key === " ") {
//               captureTriggerOrigin(event.currentTarget);
//             }
//           }}
//           onClick={(event) => captureTriggerOrigin(event.currentTarget)}
//         >
//           {tNavigation(`label`)}
//         </Button>
//       </DialogTrigger>

//       <MobileBottomRightGrowDialogContent origin={triggerOrigin}>
//         <DialogHeader>
//           <DialogTitle>{t(`title`)}</DialogTitle>
//           <DialogDescription className="sr-only">
//             {t(`title`)}
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           id="request-assessment-form-dialog-mobile"
//           onSubmit={form.handleSubmit(onSubmit)}
//         >
//           <FieldGroup>
//             <Controller
//               name="fullName"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-full-name"
//                     className="sr-only"
//                   >
//                     {t("fields.name.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-full-name"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.name.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="businessEmail"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-business-email"
//                     className="sr-only"
//                   >
//                     {t("fields.email.label")}
//                   </FieldLabel>
//                   <Input
//                     {...field}
//                     id="request-assessment-form-business-email"
//                     aria-invalid={fieldState.invalid}
//                     placeholder={t(`fields.email.placeholder`)}
//                     autoComplete="off"
//                   />
//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="aboutProject"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid}>
//                   <FieldLabel
//                     htmlFor="request-assessment-form-about-project"
//                     className="sr-only"
//                   >
//                     {t(`fields.aboutProject.label`)}
//                   </FieldLabel>
//                   <InputGroup>
//                     <InputGroupTextarea
//                       {...field}
//                       id="request-assessment-form-about-project"
//                       placeholder={t(`fields.aboutProject.placeholder`)}
//                       rows={6}
//                       className="min-h-24 resize-none px-4 py-4"
//                       aria-invalid={fieldState.invalid}
//                     />
//                     {field.value?.length && (
//                       <InputGroupAddon align="block-end">
//                         <InputGroupText className="tabular-nums">
//                           {field.value.length}/100 characters
//                         </InputGroupText>
//                       </InputGroupAddon>
//                     )}
//                   </InputGroup>

//                   {fieldState.error?.message && (
//                     <FieldError
//                       errors={[
//                         {
//                           message: translateError(fieldState.error.message),
//                         },
//                       ]}
//                     />
//                   )}
//                 </Field>
//               )}
//             />

//             <Controller
//               name="services"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   orientation="responsive"
//                   data-invalid={fieldState.invalid}
//                   className="flex-col! items-stretch"
//                 >
//                   <FieldContent>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-budget"
//                       className="text-base"
//                     >
//                       {t(`fields.service.label`)}
//                       <RequiredInputIcon className="-m-1" />
//                     </FieldLabel>
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </FieldContent>
//                   <Select
//                     name={field.name}
//                     value={field.value}
//                     onValueChange={field.onChange}
//                   >
//                     <SelectTrigger
//                       id="request-assessment-form-budget"
//                       aria-invalid={fieldState.invalid}
//                       className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
//                     >
//                       <SelectValue
//                         className="dark:text-white"
//                         placeholder={t(`fields.budget.placeholder`)}
//                       />
//                     </SelectTrigger>
//                     <SelectContent className="py-4" position="item-aligned">
//                       {SERVICE_KEYS.map((item) => (
//                         <SelectItem value={item} key={item}>
//                           {t(`fields.service.options.${item}`)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             />
//           </FieldGroup>
//         </form>

//         <DialogFooter>
//           <DialogClose asChild>
//             <Button className="h-12" variant="outline">
//               {t("actions.cancel")}
//             </Button>
//           </DialogClose>
//           <Button
//             type="submit"
//             form="request-assessment-form-dialog-mobile"
//             className="h-12"
//           >
//             {t("actions.sendMessage")}
//           </Button>
//         </DialogFooter>
//       </MobileBottomRightGrowDialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Field,
//   FieldContent,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequiredInputIcon } from "../required-input-icon";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// export function RequestAssessmentDialogMobile() {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     `HomePage.ConsultationSection.requestAssessment.form`,
//   );
//   const tFormErrors = useTranslations("FormErrors");
//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       // services: [],
//       services: "managedServer",
//       // services: ""
//     },
//   });

//   function onSubmit(data: RequestAssessmentFormType) {
//     toast("You submitted the following values:", {
//       description: (
//         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
//           <code>{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//       position: "bottom-right",
//       classNames: {
//         content: "flex flex-col gap-2",
//       },
//       style: {
//         "--border-radius": "calc(var(--radius)  + 4px)",
//       } as React.CSSProperties,
//     });
//   }

//   const translateError = (message?: string) => {
//     if (!message) return undefined;
//     return tFormErrors(message as FormErrorKey);
//   };

//   return (
//     <Dialog>
//       <form>
//         <DialogTrigger asChild>
//           <Button className="h-12 w-full">{tNavigation(`label`)}</Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-sm">
//           <DialogHeader>
//             <DialogTitle>{t(`title`)}</DialogTitle>
//             <DialogDescription className="sr-only">
//               {t(`title`)}
//             </DialogDescription>
//           </DialogHeader>
//           <form
//             id="request-assessment-form-dialog-mobile"
//             onSubmit={form.handleSubmit(onSubmit)}
//           >
//             <FieldGroup>
//               <Controller
//                 name="fullName"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field data-invalid={fieldState.invalid}>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-full-name"
//                       className="sr-only"
//                     >
//                       {t("fields.name.label")}
//                     </FieldLabel>
//                     <Input
//                       {...field}
//                       id="request-assessment-form-full-name"
//                       aria-invalid={fieldState.invalid}
//                       placeholder={t(`fields.name.placeholder`)}
//                       autoComplete="off"
//                     />
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </Field>
//                 )}
//               />

//               <Controller
//                 name="businessEmail"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field data-invalid={fieldState.invalid}>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-business-email"
//                       className="sr-only"
//                     >
//                       {t("fields.email.label")}
//                     </FieldLabel>
//                     <Input
//                       {...field}
//                       id="request-assessment-form-business-email"
//                       aria-invalid={fieldState.invalid}
//                       placeholder={t(`fields.email.placeholder`)}
//                       autoComplete="off"
//                     />
//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </Field>
//                 )}
//               />

//               <Controller
//                 name="aboutProject"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field data-invalid={fieldState.invalid}>
//                     <FieldLabel
//                       htmlFor="request-assessment-form-about-project"
//                       className="sr-only"
//                     >
//                       {t(`fields.aboutProject.label`)}
//                     </FieldLabel>
//                     <InputGroup>
//                       <InputGroupTextarea
//                         {...field}
//                         id="request-assessment-form-about-project"
//                         placeholder={t(`fields.aboutProject.placeholder`)}
//                         rows={6}
//                         className="min-h-24 resize-none px-4 py-4"
//                         aria-invalid={fieldState.invalid}
//                       />
//                       {field.value?.length && (
//                         <InputGroupAddon align="block-end">
//                           <InputGroupText className="tabular-nums">
//                             {field.value.length}/100 characters
//                           </InputGroupText>
//                         </InputGroupAddon>
//                       )}
//                     </InputGroup>

//                     {fieldState.error?.message && (
//                       <FieldError
//                         errors={[
//                           {
//                             message: translateError(fieldState.error.message),
//                           },
//                         ]}
//                       />
//                     )}
//                   </Field>
//                 )}
//               />

//               <Controller
//                 name="services"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field
//                     orientation="responsive"
//                     data-invalid={fieldState.invalid}
//                     className="flex-col! items-stretch"
//                   >
//                     <FieldContent>
//                       <FieldLabel
//                         htmlFor="request-assessment-form-budget"
//                         className="text-base"
//                       >
//                         {t(`fields.service.label`)}
//                         <RequiredInputIcon className="-m-1" />
//                       </FieldLabel>
//                       {fieldState.error?.message && (
//                         <FieldError
//                           errors={[
//                             {
//                               message: translateError(fieldState.error.message),
//                             },
//                           ]}
//                         />
//                       )}
//                     </FieldContent>
//                     <Select
//                       name={field.name}
//                       value={field.value}
//                       onValueChange={field.onChange}
//                     >
//                       <SelectTrigger
//                         id="request-assessment-form-budget"
//                         aria-invalid={fieldState.invalid}
//                         className="h-auto w-full! min-w-30 px-4 py-5.5 text-base dark:text-white"
//                       >
//                         <SelectValue
//                           className="dark:text-white"
//                           placeholder={t(`fields.budget.placeholder`)}
//                         />
//                       </SelectTrigger>
//                       <SelectContent className="py-4" position="item-aligned">
//                         {SERVICE_KEYS.map((item) => (
//                           <SelectItem value={item} key={item}>
//                             {t(`fields.service.options.${item}`)}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                 )}
//               />
//             </FieldGroup>
//           </form>
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button className="h-12" variant="outline">
//                 {t("actions.cancel")}
//               </Button>
//             </DialogClose>
//             <Button type="submit" className="h-12">
//               {" "}
//               {t("actions.sendMessage")}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </form>
//     </Dialog>
//   );
// }
