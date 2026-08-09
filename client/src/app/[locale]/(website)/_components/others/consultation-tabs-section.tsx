import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import RequestAssessmentForm from "./request-assessment-form";
import BookConsultation from "./book-consultation";
import { cn } from "@/lib/utils";

export type ConsultationTabsSectionType = {
  className?: string;
};

export default function ConsultationTabsSection({
  className,
}: ConsultationTabsSectionType) {
  return (
    <Tabs
      defaultValue="requestAssessment"
      className={cn("mt-10 w-full", className)}
    >
      {/* <TabsList className="mx-auto mb-4 h-11! rounded-full">
        <TabsTrigger
          value="requestAssessment"
          className="dark:data-active:bg-primary data-active:bg-primary rounded-full border-none px-4 data-active:text-white data-active:hover:text-white"
        >
          {t(`tabs.requestAssessment`)}
        </TabsTrigger>
        <TabsTrigger
          value="bookConsultation"
          className="dark:data-active:bg-primary data-active:bg-primary rounded-full border-none px-4 data-active:text-white data-active:hover:text-white"
        >
          {t(`tabs.bookConsultation`)}
        </TabsTrigger>
      </TabsList> */}
      <TabsContent value="requestAssessment" className="mx-auto w-full">
        <RequestAssessmentForm />
      </TabsContent>

      <TabsContent value="bookConsultation">
        <BookConsultation />
      </TabsContent>
    </Tabs>
  );
}
