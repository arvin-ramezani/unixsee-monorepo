import { Badge } from "@/components/ui/badge";
import ArrowLinkCircle from "./arrow-link-circle";
import SubTitle from "@/components/common/subtitle";

const backgroundClass = "bg-card";

export type ProcessSectionCardType = {
  step: string;
  title: string;
  description: string;
  duration: string;
};

export default function ProcessSectionCard({
  step,
  title,
  description,
  duration,
}: ProcessSectionCardType) {
  return (
    <div className="relative w-full rounded-4xl">
      <div
        className={
          "bg-background absolute inset-e-0 top-0 z-20 size-15 rounded-es-[40px]"
        }
      />

      <div
        className={
          "absolute inset-e-0 bottom-0 h-[calc(100%-59px)] w-15 rounded-[26px] rounded-es-none " +
          backgroundClass
        }
      />
      <div
        className={
          "absolute inset-s-0 h-8 w-[calc(100%-58px)] rounded-[26px] rounded-ee-none rounded-es-none " +
          backgroundClass
        }
      />

      <ArrowLinkCircle />
      <div
        className={
          "absolute inset-s-0 bottom-0 ms-auto h-[calc(100%-31px)] w-[calc(100%-32px)] rounded-es-4xl " +
          backgroundClass
        }
      ></div>

      <div className="relative flex h-full w-full flex-col gap-10 p-8 lg:flex-row-reverse">
        <div className="mx-auto aspect-square w-full max-w-60 rounded-se-[150px] rounded-es-[150px] bg-white/50" />
        <div className="lg:flex lg:w-[40%] lg:flex-col">
          <p className="text-primary/60 text-3xl select-text dark:text-white/70">
            {step}
          </p>
          <h4 className="dark:text-secondary min-h-18 max-w-72 text-3xl font-extrabold select-text lg:mt-52.5 lg:flex lg:min-h-auto lg:max-w-[unset]">
            {title}
          </h4>
          <SubTitle className="mt-2 text-base! select-text lg:mt-4">
            {description}
          </SubTitle>

          {/* <Badge className="font-sm bg-primary/20 border-primary/30 text-primary mt-4 border px-3 py-1 pb-2 select-text dark:text-white/50"> */}
          <Badge className="font-sm mt-4 px-3 py-1">{duration}</Badge>
        </div>
      </div>
    </div>
  );
}
