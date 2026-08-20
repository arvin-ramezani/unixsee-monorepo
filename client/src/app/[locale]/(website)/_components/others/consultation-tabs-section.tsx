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
      <TabsContent value="requestAssessment" className="mx-auto w-full">
        <RequestAssessmentForm />
      </TabsContent>

      <TabsContent value="bookConsultation">
        <BookConsultation />
      </TabsContent>
    </Tabs>
  );
}
