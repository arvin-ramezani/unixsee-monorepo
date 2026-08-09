// site address
// حوضه فعالیت
// files

import ContactFormSection from "./_components/contact-form-section";
import ContactInfoSection from "./_components/contact-info-section";

export type ContactUsPageProps = object;

export default function ContactUsPage({}: ContactUsPageProps) {
  return (
    <main className="flex flex-col items-center py-20">
      <ContactFormSection />

      <ContactInfoSection />
    </main>
  );
}
