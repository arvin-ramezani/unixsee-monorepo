// "use client";

// import { useTranslations } from "next-intl";
// import { useInView } from "framer-motion";
// import { useRef } from "react";

// import { NumberOfSuccessItem } from "./number-of-success-item";
// import { NUMBER_OF_SUCCESS_ITEM_KEYS } from "./number-of-success-section";

// type NumberOfSuccessListType = {
//   itemKeys: readonly (typeof NUMBER_OF_SUCCESS_ITEM_KEYS)[number][];
// };

// export function NumberOfSuccessList({ itemKeys }: NumberOfSuccessListType) {
//   const t = useTranslations("HomePage.NumberOfSuccess");

//   const ref = useRef<HTMLUListElement>(null);
//   const isInView = useInView(ref, {
//     margin: "0px 0px -25% 0px",
//     once: true,
//   });

//   return (
//     <ul
//       ref={ref}
//       className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 2xl:gap-8"
//     >
//       {itemKeys.map((item, index) => (
//         <NumberOfSuccessItem
//           index={index}
//           key={item}
//           value={t(`items.${item}.value`)}
//           suffix={t(`items.${item}.suffix`)}
//           label={t(`items.${item}.label`)}
//           startAnimation={isInView}
//         />
//       ))}
//     </ul>
//   );
// }

"use client";

import { useTranslations } from "next-intl";
import { useInView } from "framer-motion";
import { useRef } from "react";

import { NumberOfSuccessItem } from "./number-of-success-item";
import { NUMBER_OF_SUCCESS_ITEM_KEYS } from "./number-of-success-section";

type NumberOfSuccessListType = {
  itemKeys: readonly (typeof NUMBER_OF_SUCCESS_ITEM_KEYS)[number][];
};
export function NumberOfSuccessList({ itemKeys }: NumberOfSuccessListType) {
  const t = useTranslations("HomePage.NumberOfSuccess");

  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, {
    margin: "0px 0px -25% 0px",
  });

  return (
    <ul ref={ref} className="grid grid-cols-2 gap-6 lg:gap-14 2xl:grid-cols-2">
      {itemKeys.map((item, index) => (
        <NumberOfSuccessItem
          index={index}
          key={item}
          value={t(`items.${item}.value`)}
          suffix={t(`items.${item}.suffix`)}
          label={t(`items.${item}.label`)}
          startAnimation={isInView}
        />
      ))}
    </ul>
  );
}
