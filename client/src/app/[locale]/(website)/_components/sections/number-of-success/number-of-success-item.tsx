// "use client";

// import { motion } from "framer-motion";

// import GlowDot from "@/components/common/glow-dot";
// import { useAnimatedCounter } from "@/hooks/use-animated-counter";
// import { cn, parseLocalizedStringToNumber } from "@/lib/utils";

// type NumberOfSuccessItemProps = {
//   value: string;
//   suffix: string;
//   label: string;
//   startAnimation?: boolean;
//   index: number;
// };

// const METRIC_DOT_COLORS = [
//   {
//     color: "bg-[#446894]",
//     color2: "bg-[#446894]/80",
//     color3: "bg-[#446894]/40",
//   },
//   {
//     color: "bg-[#2ee6a6]",
//     color2: "bg-[#2ee6a6]/80",
//     color3: "bg-[#2ee6a6]/40",
//   },
//   {
//     color: "bg-[#00aaff]",
//     color2: "bg-[#00aaff]/75",
//     color3: "bg-[#00aaff]/35",
//   },
//   {
//     color: "bg-[#cfa562]",
//     color2: "bg-[#cfa562]/75",
//     color3: "bg-[#cfa562]/35",
//   },
// ] as const;

// function getMetricDotColors(index: number) {
//   return METRIC_DOT_COLORS[index] ?? METRIC_DOT_COLORS[0];
// }

// export function NumberOfSuccessItem(props: NumberOfSuccessItemProps) {
//   if (!props.suffix) {
//     return <MultipleCounter {...props} />;
//   }

//   return <SingleCounter {...props} />;
// }

// function SingleCounter({
//   value,
//   suffix,
//   label,
//   startAnimation,
//   index,
// }: NumberOfSuccessItemProps) {
//   const targetValue = parseLocalizedStringToNumber(value);

//   const { animatedValue, ref } = useAnimatedCounter(targetValue, {
//     duration: 1,
//     start: startAnimation,
//     finalValue: value,
//     delay: index,
//   });

//   const dotColors = getMetricDotColors(index);

//   return (
//     <li className="unixsee-observability-card group p-5 md:p-6">
//       <div className="unixsee-observability-card-line" />

//       <div className="font-kalameh-family flex items-start gap-4">
//         <GlowDot
//           color={dotColors.color}
//           color2={dotColors.color2}
//           color3={dotColors.color3}
//           className="mt-5 shrink-0"
//         />

//         <div>
//           <div className="unixsee-observability-title font-kalameh-family flex items-baseline gap-px text-[2.4rem] font-semibold tracking-tight md:text-[3.2rem] 2xl:text-[4.1rem]">
//             <motion.span ref={ref}>{animatedValue}</motion.span>

//             <span
//               className={cn("unixsee-observability-text", {
//                 "font-yekan-bakh-family font-semibold text-nowrap": index === 3,
//               })}
//             >
//               {suffix}
//             </span>
//           </div>

//           <p className="unixsee-observability-text mt-1 max-w-72 text-sm leading-7 md:text-base 2xl:text-lg">
//             {label}
//           </p>
//         </div>
//       </div>
//     </li>
//   );
// }

// function MultipleCounter({
//   value,
//   label,
//   startAnimation,
//   index,
// }: NumberOfSuccessItemProps) {
//   const [number1, number2] = value.split("/");
//   const targetValue1 = parseLocalizedStringToNumber(number1);
//   const targetValue2 = parseLocalizedStringToNumber(number2);

//   const { animatedValue: animatedValue1, ref: ref1 } = useAnimatedCounter(
//     targetValue1,
//     {
//       duration: 1,
//       delay: index,
//       start: startAnimation,
//     },
//   );

//   const { animatedValue: animatedValue2, ref: ref2 } = useAnimatedCounter(
//     targetValue2,
//     {
//       duration: 1,
//       delay: index,
//       start: startAnimation,
//     },
//   );

//   const dotColors = getMetricDotColors(index);

//   return (
//     <li className="unixsee-observability-card group p-5 md:p-6">
//       <div className="unixsee-observability-card-line" />

//       <div className="flex items-start gap-4">
//         <GlowDot
//           color={dotColors.color}
//           color2={dotColors.color2}
//           color3={dotColors.color3}
//           className="mt-5 shrink-0"
//         />

//         <div>
//           <div className="unixsee-observability-title font-kalameh-family flex items-baseline gap-px text-[2.4rem] font-semibold tracking-tight md:text-[3.2rem] 2xl:text-[4.1rem]">
//             <motion.span ref={ref2}>{animatedValue2}</motion.span>
//             <span>/</span>
//             <motion.span ref={ref1}>{animatedValue1}</motion.span>
//           </div>

//           <p className="unixsee-observability-text mt-1 max-w-72 text-sm leading-7 md:text-base 2xl:text-lg">
//             {label}
//           </p>
//         </div>
//       </div>
//     </li>
//   );
// }

"use client";

import { motion } from "framer-motion";

import GlowDot from "@/components/common/glow-dot";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { cn, parseLocalizedStringToNumber } from "@/lib/utils";

type NumberOfSuccessItemProps = {
  value: string;
  suffix: string;
  label: string;
  startAnimation?: boolean;
  index: number;
};

export function NumberOfSuccessItem(props: NumberOfSuccessItemProps) {
  if (!props.suffix) {
    return <MultipleCounter {...props} />;
  }

  return <SingleCounter {...props} />;
}

function SingleCounter({
  value,
  suffix,
  label,
  startAnimation,
  index,
}: NumberOfSuccessItemProps) {
  const targetValue = parseLocalizedStringToNumber(value);

  const { animatedValue, ref } = useAnimatedCounter(targetValue, {
    duration: 1,
    start: startAnimation,
    finalValue: value,
    delay: index,
  });

  const color =
    index === 0
      ? "bg-[#00aaff]"
      : index === 1
        ? "bg-[#00d557]"
        : index === 2
          ? "bg-[#fdc700]"
          : index === 3
            ? "bg-[#ff4b4b]"
            : "";

  const color2 =
    index === 0
      ? "bg-[#00aaff]/90"
      : index === 1
        ? "bg-[#00d557]/90"
        : index === 2
          ? "bg-[#fdc700]/90"
          : index === 3
            ? "bg-[#ff4b4b]/90"
            : "";

  const color3 =
    index === 0
      ? "bg-[#00aaff]/70"
      : index === 1
        ? "bg-[#00d557]/70"
        : index === 2
          ? "bg-[#fdc700]/70"
          : index === 3
            ? "bg-[#ff4b4b]/70"
            : "";

  return (
    <li className="border-foreground/20 flex flex-col items-center gap-2 border-b pb-6">
      <div className="font-kalameh-family flex items-center gap-4">
        <GlowDot
          color={color}
          color2={color2}
          color3={color3}
          className="mt-4"
        />

        <div className="flex gap-px text-[1.6rem] font-semibold md:text-[3rem] 2xl:text-[4rem]">
          <motion.span className="font-semibold" ref={ref}>
            {animatedValue}
          </motion.span>
          <span
            className={cn("font-semibold", {
              "font-yekan-bakh-family font-semibold text-nowrap": index === 3,
            })}
          >
            {suffix}
          </span>
        </div>
      </div>

      <p className="text-center text-xs md:text-base 2xl:text-lg">{label}</p>
    </li>
  );
}

function MultipleCounter({
  value,
  label,
  startAnimation,
  index,
}: NumberOfSuccessItemProps) {
  const [number1, number2] = value.split("/");
  const targetValue1 = parseLocalizedStringToNumber(number1);
  const targetValue2 = parseLocalizedStringToNumber(number2);

  const { animatedValue: animatedValue1, ref: ref1 } = useAnimatedCounter(
    targetValue1,
    {
      duration: 1,
      delay: index,
      start: startAnimation,
    },
  );

  const { animatedValue: animatedValue2, ref: ref2 } = useAnimatedCounter(
    targetValue2,
    {
      duration: 1,
      delay: index,
      start: startAnimation,
    },
  );

  return (
    <li className="border-foreground/20 flex flex-col items-center gap-2 border-b pb-6">
      <div className="flex items-center gap-4">
        <GlowDot
          color="bg-[#fdc700]"
          color2={"bg-[#fdc700]/90"}
          color3={"bg-[#fdc700]/70"}
          className="mt-4"
        />
        <div className="font-kalameh-family flex gap-1 text-[1.6rem] font-semibold md:text-[3rem] 2xl:text-[4rem]">
          <motion.span className="font-semibold" ref={ref2}>
            {animatedValue2}
          </motion.span>
          <span className="font-semibold">/</span>
          <motion.span className="font-semibold" ref={ref1}>
            {animatedValue1}
          </motion.span>
        </div>
      </div>
      <p className="text-xs md:text-base 2xl:text-lg">{label}</p>
    </li>
  );
}
