import Title from "@/components/common/title";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import Image from "next/image";

type InfiniteScrollItem = {
  title: string;
  image: string;
};
type InfiniteHorizontalScrollProps = {
  items: InfiniteScrollItem[];
  className?: string;
  title?: string;
};

export function InfiniteHorizontalScroll({
  items,
  className,
  title,
}: InfiniteHorizontalScrollProps) {
  const isRtl = useLocale() === "fa";

  const orderedItems = isRtl ? [...items].reverse() : items;

  return (
    <div
      dir="ltr"
      className={cn(
        "w-full overflow-hidden pt-24",
        "mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      {title && (
        <Title
          as="h3"
          className="bottom-32 z-50 mb-6 w-full text-center text-sm! uppercase dark:text-white/50"
        >
          {title}
        </Title>
      )}

      <div
        className={cn(
          "flex w-max min-w-max will-change-transform",
          isRtl
            ? "animate-infinite-horizontal-scroll-rtl"
            : "animate-infinite-horizontal-scroll-ltr",
        )}
      >
        {[0, 1, 2].map((group) => (
          <div
            key={group}
            aria-hidden={group !== 0}
            className="flex shrink-0 items-center gap-6 pr-6"
          >
            {orderedItems.map((item) => (
              <div
                key={`${group}-${item.title}`}
                dir={isRtl ? "rtl" : "ltr"}
                className="border-border-primary bg-bg-secondary flex min-w-48 shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-4"
              >
                <div className="bg-primary/40 size-10 rounded-lg" />

                <span className="text-text-primary text-sm font-medium whitespace-nowrap">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
