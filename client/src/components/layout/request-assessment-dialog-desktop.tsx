"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useActionState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import {
  createRequestAssessmentAction,
  type RequestAssessmentActionMessageKey,
} from "@/actions/request-assessment-action";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover-improved";
import { FormErrorKey } from "@/lib/form-errors";
import {
  requestAssessmentSchema,
  RequestAssessmentSchemaType,
} from "@/lib/zod-schemas/request-assessment-schema";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { cn, formatNumberByLocale } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { RadialRevealButton } from "../common/radial-reveal/radial-reveal-button";
import { useLightHeaderStore } from "@/providers/light-header-provider";
import { initialServerActionState } from "@/types/server-action-state";

const SERVICE_KEYS = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

const requestAssessmentDefaultValues: RequestAssessmentSchemaType = {
  fullName: "",
  businessEmail: "",
  aboutProject: "",
  services: "managedServer",
};

export type RequestAssessmentDialogDesktopProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function RequestAssessmentDialogDesktop({
  open,
  setOpen,
}: RequestAssessmentDialogDesktopProps) {
  const tNavigation = useTranslations("Layout.Navigation.primaryCta");
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );
  const tFormErrors = useTranslations("FormErrors");
  const tActionMessages = useTranslations(
    "ServerActionMessages.requestAssessment",
  );

  const locale = useLocale();

  const headerTone = useLightHeaderStore((state) => state.tone);

  useScrollLock(open, "request-assessment-form-dialog-desktop");

  const form = useForm<RequestAssessmentSchemaType>({
    resolver: zodResolver(requestAssessmentSchema),
    defaultValues: requestAssessmentDefaultValues,
  });

  const [actionState, submitRequestAssessment, isActionPending] =
    useActionState(createRequestAssessmentAction, initialServerActionState);

  const lastHandledSubmissionRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (
      !actionState.submittedAt ||
      lastHandledSubmissionRef.current === actionState.submittedAt
    ) {
      return;
    }

    lastHandledSubmissionRef.current = actionState.submittedAt;

    const message = tActionMessages(
      actionState.message as RequestAssessmentActionMessageKey,
    );

    if (actionState.ok) {
      toast.success(message);
      form.reset(requestAssessmentDefaultValues);
      setOpen(false);
      return;
    }

    toast.error(message);
  }, [actionState, form, setOpen, tActionMessages]);

  function onSubmit(data: RequestAssessmentSchemaType) {
    React.startTransition(() => {
      submitRequestAssessment({ ...data, locale });
    });
  }

  const isSubmitting = form.formState.isSubmitting || isActionPending;

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setOpen(false)}
            className={cn(
              "w-full-scrollbar -inset-s-scrollbar-width absolute -inset-bs-1 z-10 h-full min-h-dvh bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
            )}
          />
        )}
      </AnimatePresence>

      <PopoverTrigger
        asChild
        className={cn("relative z-10 transition-all", {
          "bg-popover dark:bg-popover shadow-lg": open,
        })}
      >
        <div
          className={cn(
            "pointer-events-none flex h-15 w-47.5 items-center justify-center rounded-sm rounded-b-none border-b-0 border-transparent pb-1 text-xs! transition-colors duration-100 xl:px-4",
            {
              "border-border": open,
            },
          )}
        >
          <RadialRevealButton
            // revealClassName="bg-background data-[radial-active=true]:text-secondary-foreground"
            className="bg-primary pointer-events-auto flex h-10 items-center justify-center rounded-sm text-xs lg:flex"
          >
            {tNavigation("label")}
          </RadialRevealButton>
          {/* <Button className="bg-primary pointer-events-auto flex h-10 items-center justify-center rounded-sm text-xs lg:flex">
            {tNavigation("label")}
          </Button> */}
        </div>
      </PopoverTrigger>

      <PopoverContent
        preventOutsideClose
        showCloseButton={false}
        align="end"
        className={cn(
          "fixed inset-e-0 -top-1.75 w-md origin-top-right! overflow-visible rounded-se-none border-t-0 bg-transparent p-0 ring-0 duration-100",
          {
            dark: headerTone === "dark",
          },
        )}
        open={open}
      >
        <motion.div
          initial={{ height: "0px" }}
          animate={{ height: "auto" }}
          exit={{ height: "0px" }}
          transition={{ duration: 0.15 }}
          className="bg-popover origin-top-left overflow-hidden rounded rounded-se-none px-4 pb-4"
        >
          <div className="relative flex items-center justify-between py-4">
            <PopoverTitle className="text-lg font-extrabold">
              {t("title")}
            </PopoverTitle>
          </div>

          <form
            className="flex flex-col gap-4"
            id="request-assessment-form-dialog-desktop"
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
                      autoComplete="name"
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
                      type="email"
                      autoComplete="email"
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
                    <InputGroup className="border-none! ring-0!">
                      <InputGroupTextarea
                        {...field}
                        id="request-assessment-form-about-project"
                        placeholder={t("fields.aboutProject.placeholder")}
                        rows={6}
                        className="min-h-24 resize-none px-4 py-4"
                        aria-invalid={fieldState.invalid}
                      />
                      {!!field.value?.length && (
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {formatNumberByLocale(field.value?.length, locale)}/
                            {formatNumberByLocale(100, locale)}
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
                        className="h-auto px-4 py-5.5 dark:text-white"
                      >
                        <SelectValue
                          className="dark:text-white"
                          placeholder={t("fields.budget.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className={cn("rounded-md", {
                          dark: headerTone === "dark",
                        })}
                      >
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

            <div className="flex flex-col gap-2">
              <RadialRevealButton
                type="submit"
                form="request-assessment-form-dialog-desktop"
                className="h-12 w-full"
                loading={isSubmitting}
                loadingLabel={t("actions.submitting")}
              >
                {t("actions.sendMessage")}
              </RadialRevealButton>

              <PopoverClose asChild>
                <Button
                  type="button"
                  className="h-12 w-full"
                  variant={"outline"}
                  disabled={isSubmitting}
                >
                  {t("actions.cancel")}
                </Button>
              </PopoverClose>
            </div>
          </form>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

// "use client";

// import * as React from "react";
// import { useTranslations } from "next-intl";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { motion } from "framer-motion";

// import { Button } from "@/components/ui/button";
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
// import {
//   MotionGrowDialogDescription,
//   MotionGrowDialogHeader,
//   MotionGrowDialogTitle,
// } from "@/components/common/motion/motion-grow-dialog";
// import { FormErrorKey } from "@/lib/form-errors";
// import {
//   requestAssessmentSchema,
//   RequestAssessmentSchemaType,
// } from "@/lib/zod-schemas/request-assessment-schema";
// import { RequestAssessmentFormType } from "@/app/[locale]/_components/others/request-assessment-form";
// import { cn } from "@/lib/utils";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogTrigger,
// } from "../ui/dialog";
// // import { RequiredInputIcon } from "../required-input-icon";

// const SERVICE_KEYS = [
//   "managedServer",
//   "migrationOptimization",
//   "woocommerceSupport",
//   "seo",
//   "graphicDesign",
//   "productDataEntry",
//   "socialMedia",
// ] as const;

// type RequestAssessmentDialogDesktopProps = object;

// export function RequestAssessmentDialogDesktop({}: RequestAssessmentDialogDesktopProps) {
//   const tNavigation = useTranslations("Layout.Navigation.primaryCta");
//   const t = useTranslations(
//     "HomePage.ConsultationSection.requestAssessment.form",
//   );
//   const tFormErrors = useTranslations("FormErrors");
// const tActionMessages = useTranslations(
//   "ServerActionMessages.requestAssessment",
// );

//   const [open, setOpen] = React.useState(false);

//   const form = useForm<RequestAssessmentSchemaType>({
//     resolver: zodResolver(requestAssessmentSchema),
//     defaultValues: {
//       fullName: "",
//       businessEmail: "",
//       services: "managedServer",
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
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger className="relative" asChild>
//         <motion.div
//           className={cn("rounded-2xl border border-transparent p-2", {
//             "border-border": open,
//           })}
//         >
//           <Button className={cn("h-12 w-full")}>{tNavigation("label")}</Button>
//         </motion.div>
//       </DialogTrigger>

//       <DialogContent className="">
//         <MotionGrowDialogHeader>
//           <MotionGrowDialogTitle>{t("title")}</MotionGrowDialogTitle>
//           <MotionGrowDialogDescription className="sr-only">
//             {t("title")}
//           </MotionGrowDialogDescription>
//         </MotionGrowDialogHeader>

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
//                     placeholder={t("fields.name.placeholder")}
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
//                     placeholder={t("fields.email.placeholder")}
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
//                     {t("fields.aboutProject.label")}
//                   </FieldLabel>
//                   <InputGroup>
//                     <InputGroupTextarea
//                       {...field}
//                       id="request-assessment-form-about-project"
//                       placeholder={t("fields.aboutProject.placeholder")}
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
//                       {t("fields.service.label")}
//                       {/* <RequiredInputIcon className="-m-1" /> */}
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
//                         placeholder={t("fields.budget.placeholder")}
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
//       </DialogContent>
//     </Dialog>
//   );
// }
