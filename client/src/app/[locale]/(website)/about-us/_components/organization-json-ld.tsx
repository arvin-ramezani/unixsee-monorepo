import { useTranslations } from "next-intl";

/**
 * The site's own origin, as already published in the footer copyright link
 * (`components/layout/footer/footer.tsx`). There is no `metadataBase` or shared
 * site-URL config in this app yet, so it is repeated here rather than derived.
 * `NEXT_PUBLIC_APP_URL` is deliberately not used: it defaults to a localhost
 * origin, and a localhost URL inside production structured data is worse than
 * no URL at all. Fold both copies into one constant when `metadataBase` lands.
 */
const SITE_URL = "https://unixsee.com";

/**
 * `Organization` structured data for the About page.
 *
 * Only fields backed by a confirmed value are emitted. `legalName`,
 * `foundingDate`, and `sameAs` are absent because the registered entity name,
 * the operating-since date, and the social profiles have not been supplied —
 * asserting any of them would be an unverified claim in machine-readable form,
 * which is the one place a reader cannot judge it for themselves.
 *
 * This node must never reference the parent company: no parent name, URL, or
 * mailbox belongs in it, the same brand boundary the visible page keeps.
 */
export default function OrganizationJsonLd() {
  const t = useTranslations("Metadata.about");
  const tCommon = useTranslations("common");

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: tCommon("brand"),
    description: t("description"),
    slogan: tCommon("slogan"),
    url: SITE_URL,
    logo: `${SITE_URL}/logo-light.webp`,
    telephone: tCommon("phone.href"),
    address: {
      "@type": "PostalAddress",
      streetAddress: tCommon("address.value"),
      addressLocality: tCommon("address.locality"),
      addressRegion: tCommon("address.region"),
      addressCountry: "IR",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Every value above comes from the message catalogue or a local constant,
      // so there is no external input here. `<` is still escaped so a future
      // copy edit cannot terminate the script element early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
      }}
    />
  );
}
