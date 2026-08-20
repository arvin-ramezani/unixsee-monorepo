import { parseIranPhoneInput } from "@/lib/auth/iran-phone";
import type { SafeAuthUser } from "@/types/auth.types";
import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";

export type RequestAssessmentContactChannel = "phone" | "email";

export function toNationalIranPhone(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return parseIranPhoneInput(value).national;
}

export function phonesMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = toNationalIranPhone(left);
  const b = toNationalIranPhone(right);
  return a.length > 0 && a === b;
}

export function emailsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = left?.trim().toLowerCase() ?? "";
  const b = right?.trim().toLowerCase() ?? "";
  return a.length > 0 && a === b;
}

export function getAccountContact(user: SafeAuthUser | null) {
  const phone = toNationalIranPhone(user?.phoneNumber);
  const email = user?.email?.trim() ?? "";

  return {
    fullName: user?.fullName?.trim() ?? "",
    phone,
    email,
    preferredContact: (phone
      ? "phone"
      : email
        ? "email"
        : "phone") as RequestAssessmentContactChannel,
  };
}

export function mergeAccountContactIntoValues(
  values: RequestAssessmentSchemaType,
  user: SafeAuthUser | null,
): RequestAssessmentSchemaType {
  if (!user) {
    return values;
  }

  const account = getAccountContact(user);
  const phone = values.phone?.trim() ? values.phone : account.phone;
  const email = values.email?.trim() ? values.email : account.email;
  const fullName = values.fullName?.trim() ? values.fullName : account.fullName;

  let preferredContact = values.preferredContact;
  if (!values.phone?.trim() && !values.email?.trim()) {
    preferredContact = account.preferredContact;
  }

  return {
    ...values,
    fullName,
    phone,
    email,
    preferredContact,
  };
}

export function isPreferredContactVerified(input: {
  preferredContact: RequestAssessmentContactChannel;
  phone: string;
  email: string;
  accountPhone: string;
  accountEmail: string;
  otpVerifiedPhone: string | null;
  otpVerifiedEmail: string | null;
}): boolean {
  if (input.preferredContact === "phone") {
    return (
      phonesMatch(input.phone, input.accountPhone) ||
      phonesMatch(input.phone, input.otpVerifiedPhone)
    );
  }

  return (
    emailsMatch(input.email, input.accountEmail) ||
    emailsMatch(input.email, input.otpVerifiedEmail)
  );
}

export function getVerifiedChannel(input: {
  preferredContact: RequestAssessmentContactChannel;
  phone: string;
  email: string;
  accountPhone: string;
  accountEmail: string;
  otpVerifiedPhone: string | null;
  otpVerifiedEmail: string | null;
}): RequestAssessmentContactChannel | null {
  return isPreferredContactVerified(input) ? input.preferredContact : null;
}
