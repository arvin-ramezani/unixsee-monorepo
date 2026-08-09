export const FORM_ERROR_KEYS = [
  "fullNameRequired",
  "fullNameInvalid",
  "businessEmailRequired",
  "businessEmailInvalid",
  "aboutProjectTooLong",
  "budgetRequired",
  "servicesRequired",
  "phoneRequired",
  "phoneInvalid",
  "messageTooShort",
  "messageRequired",
  "emailRequired",
  "emailInvalid",
  "websiteInvalid",
] as const;

export type FormErrorKey = (typeof FORM_ERROR_KEYS)[number];

export const errorKey = (key: FormErrorKey) => key;
