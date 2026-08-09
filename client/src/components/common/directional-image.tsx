import { useLocale } from "next-intl";
import Image, { type ImageProps } from "next/image";

type DirectionalImageProps = {
  src: {
    ltr: string;
    rtl: string;
  };
} & Omit<ImageProps, "src">;

export function DirectionalImage({
  src,
  alt,
  ...props
}: DirectionalImageProps) {
  const isRtl = useLocale() === "fa";

  return <Image src={isRtl ? src.rtl : src.ltr} alt={alt} {...props} />;
}
