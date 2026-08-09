export const ERROR_MESSAGES = {
  fa: {
    userExist: 'کاربر با این نام کاربری ثبت نام کرده است.',
    userNotExist: 'کاربری با این نام ثبت نام نکرده است.',
    unauthenticated: 'اطلاعات وارد شده اشتباه است.',
    forbidden: 'شما مجوز انجام این عملیات را ندارید.',
    notFound: 'مورد درخواستی یافت نشد.',
    conflict: 'درخواست تکراری است یا با وضعیت فعلی در تعارض است.',
    tenantRequired: 'برای ادامه باید عضو یک مستأجر باشید.',
    validation: 'اطلاعات ارسالی نامعتبر است.',
    suspended: 'حساب کاربری معلق شده است.',
  },
  en: {
    userExist: 'A user with this username is already registered.',
    userNotExist: 'No user is registered with these credentials.',
    unauthenticated: 'The provided credentials are incorrect.',
    forbidden: 'You are not allowed to perform this action.',
    notFound: 'The requested resource was not found.',
    conflict: 'The request conflicts with the current state.',
    tenantRequired: 'You must belong to a tenant to continue.',
    validation: 'The submitted data is invalid.',
    suspended: 'This account has been suspended.',
  },
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES.fa;
