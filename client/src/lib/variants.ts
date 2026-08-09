import { Variants } from "framer-motion";

export const slideIn: Variants = {
  initial: (isRtl: boolean = false) => ({
    opacity: 0,
    x: isRtl ? "100%" : "-100%",
  }),
  animate: () => ({
    opacity: 1,
    x: "0",
  }),
};
