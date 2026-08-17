import { redirect } from "@/i18n/navigation";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export default async function RegisterRedirectPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/auth", locale });
}
