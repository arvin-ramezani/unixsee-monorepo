"use client";

import TestimonialsCarousel from "./testimonials-carousel";
import TestimonialsVideosCarousel from "./testimonials-videos-carousel";

export const TESTIMONIAL_KEYS = [
  "item1",
  "item2",
  "item3",
  "item4",
  "item5",
  "item6",
] as const;

export type TestimonialKeyType = (typeof TESTIMONIAL_KEYS)[number];

export type TestimonialsCarouselContainerProps = object;

export default function TestimonialsCarouselContainer({}: TestimonialsCarouselContainerProps) {
  return (
    <div className="lg:flex">
      <TestimonialsCarousel
        className="hidden lg:flex"
        testimonialKeys={TESTIMONIAL_KEYS}
      />

      <TestimonialsVideosCarousel
        className="flex lg:hidden"
        testimonialKeys={TESTIMONIAL_KEYS}
      />
    </div>
  );
}
