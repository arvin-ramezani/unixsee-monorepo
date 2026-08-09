import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export type TestimonialItemProps = {
  testimonial: string;
  author: string;
  authorImage: {
    src: string;
    alt: string;
  };
  role: string;
};

export default function TestimonialItem({
  author,
  authorImage,
  role,
  testimonial,
}: TestimonialItemProps) {
  return (
    <Card className="border-border-primary bg-bg-secondary h-full rounded-2xl border ring-0">
      <CardContent className="flex h-full flex-col items-center justify-between gap-8 p-6 lg:p-8">
        <p className="text-text-primary text-center text-base select-text lg:text-lg">
          {testimonial}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={authorImage.src}
              alt={authorImage.alt}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <h6 className="text-text-primary text-sm font-extrabold select-text lg:text-base">
              {author}
            </h6>
            <p className="text-text-secondary text-sm select-text">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
