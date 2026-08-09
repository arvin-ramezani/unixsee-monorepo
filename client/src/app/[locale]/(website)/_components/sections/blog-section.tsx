import { ScaleTitle } from "@/components/common/motion/scale-title";
import Section from "@/components/common/section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const blogCards = [
  {
    img: "https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/blog/image-1.png",
    alt: "Modern house",
    title: "Laws of Transfer of Immovable Property",
    description:
      "Experience the charm of this lovely and cozy apartment, featuring warm decor and inviting spaces, perfect for relaxation and comfort, ideal for your next getaway.",
    blogLink: "#",
    key: "woocommercePerformance",
  },
  {
    img: "https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/blog/image-2.png",
    alt: "Traditional house",
    title: "Thane Development Plan 2026 & Master Plan",
    description:
      "Discover a unique nook in the heart of the city, offering convenience and access to attractions. Stylishly designed, it provides a comfortable retreat.",
    blogLink: "#",
    key: "serverMonitoring",
  },
  {
    img: "https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/blog/image-3.png",
    alt: "Modern house with pool",
    title: "What is a Property Sale Agreement?",
    description:
      "Welcome to this charming independent house bedroom, featuring a spacious layout and cozy furnishings. Enjoy abundant natural light and peaceful.",
    blogLink: "#",
    key: "migrationGuide",
  },
] as const;

export type BlogSectionProps = { id?: string };

export default function BlogSection({ id }: BlogSectionProps) {
  const t = useTranslations("HomePage.BlogSection");
  return (
    <Section id={id} className="relative min-h-auto">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-4 text-center sm:mb-10 lg:mb-16">
          <ScaleTitle
            as={"h2"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            className="flex justify-center text-4xl!"
          >
            {t(`title`)}
          </ScaleTitle>
          <ScaleTitle
            as={"p"}
            scaleFrom={0.6}
            scaleTo={1}
            transformOrigin="center center"
            className="mt-2 flex justify-center text-center text-sm! 2xl:mt-4 2xl:text-lg!"
          >
            {t(`description`)}
          </ScaleTitle>
        </div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-auto md:grid-cols-2 lg:grid lg:grid-cols-3 lg:gap-6">
          {blogCards.map((item, index) => (
            <Card
              className="lg:bg-card min-w-[43%] cursor-pointer snap-center rounded-none bg-transparent pt-0 shadow-none ring-0 max-lg:last:col-span-full lg:rounded-xl"
              key={index}
            >
              <CardContent className="px-0">
                <div className="bg-primary aspect-video w-full rounded-md object-cover lg:rounded-none lg:rounded-t-xl" />
              </CardContent>
              <CardHeader className="mb-2 gap-3">
                <CardTitle className="line-clamp-2 h-10 text-sm font-normal lg:h-14 lg:text-xl">
                  <Link href={item.blogLink}>
                    {t(`items.${item.key}.title`)}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2 hidden text-sm lg:block lg:text-base">
                  {t(`items.${item.key}.description`)}
                </CardDescription>
              </CardHeader>
              {/* <CardFooter className="mt-auto bg-transparent">
                <Button
                  className="group ms-auto h-12 rounded-lg text-base has-[>svg]:px-6"
                  size="lg"
                  asChild
                >
                  <Link
                    className="text-sm font-extralight"
                    href={t(`items.${item.key}.action.href`)}
                  >
                    {t(`items.${item.key}.action.label`)}
                    <ArrowTopRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-rotate-90 rtl:group-hover:-translate-x-0.5" />
                  </Link>
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
