"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type StickyScrollCardsProps = {
  items: {
    title: string;
    description: string;
    tags: string[];
    cta: {
      label: string;
      href: string;
    };
  }[];
};

const STACK_SCALE_STEP = 0.1;
const MIN_STACK_SCALE = 0.6;

/**
 * Native sticky cards need real scroll room after the last card.
 * The extra room is visually collapsed with a negative margin, so the
 * last card can remain pinned without creating a huge empty bottom gap.
 */
const LAST_CARD_STICKY_HOLD_PX = 280;
const LAST_CARD_VISIBLE_BOTTOM_SPACE_PX = 96;

// TODO: change top position
const STACK_TOP_START_PX = 80;
const STACK_TOP_STEP_PX = 32;

const getStickyTop = (index: number) =>
  STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

/**
 * Scale finishes when the next card has covered this much of the previous card.
 * 0.22 = finish early, before half-cover.
 * Increase to 0.3 if you want slower.
 * Decrease to 0.15 if you want sharper/faster.
 */
const SCALE_FINISH_OVERLAP_RATIO = 0.9;

const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const totalCards = items.length;

  const cardRefs = React.useMemo(
    () => items.map(() => React.createRef<HTMLDivElement>()),
    [items],
  );

  const [bottomScrollRoom, setBottomScrollRoom] = useState(
    LAST_CARD_STICKY_HOLD_PX + LAST_CARD_VISIBLE_BOTTOM_SPACE_PX,
  );

  useLayoutEffect(() => {
    if (!totalCards) return;

    const lastCard = cardRefs[totalCards - 1]?.current;
    if (!lastCard) return;

    const updateBottomScrollRoom = () => {
      const lastStickyTop = getStickyTop(totalCards - 1);
      const lastCardHeight = lastCard.getBoundingClientRect().height;

      /**
       * If the last card is taller than the remaining viewport area below
       * its staggered sticky top, the section bottom constraint pushes it
       * upward before it visually sits in place. This extra protection keeps
       * the parent boundary below the card while the next section approaches.
       */
      const releaseProtectionPx = Math.max(
        0,
        lastCardHeight + lastStickyTop - window.innerHeight,
      );

      setBottomScrollRoom(
        Math.ceil(
          releaseProtectionPx +
            LAST_CARD_STICKY_HOLD_PX +
            LAST_CARD_VISIBLE_BOTTOM_SPACE_PX,
        ),
      );
    };

    updateBottomScrollRoom();

    const resizeObserver = new ResizeObserver(updateBottomScrollRoom);
    resizeObserver.observe(lastCard);

    window.addEventListener("resize", updateBottomScrollRoom);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBottomScrollRoom);
    };
  }, [cardRefs, totalCards]);

  const bottomVisualCompensation = Math.max(
    0,
    bottomScrollRoom - LAST_CARD_VISIBLE_BOTTOM_SPACE_PX,
  );

  return (
    <div
      ref={sectionRef}
      className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
      style={{
        paddingBottom: bottomScrollRoom,
        marginBottom: -bottomVisualCompensation,
      }}
    >
      {items.map((item, i) => {
        const cardsAbove = totalCards - i - 1;
        const targetScale = Math.max(
          1 - cardsAbove * STACK_SCALE_STEP,
          MIN_STACK_SCALE,
        );

        return (
          <StickyScrollCard
            key={`sticky-card-${i}`}
            i={i}
            targetScale={targetScale}
            cardRefs={cardRefs}
            {...item}
          />
        );
      })}
    </div>
  );
};

const StickyScrollCard = ({
  i,
  title,
  description,
  tags,
  cta,
  targetScale,
  cardRefs,
}: {
  i: number;
  title: string;
  targetScale: number;
  description: string;
  tags: string[];
  cardRefs: React.RefObject<HTMLDivElement | null>[];
  cta: {
    label: string;
    href: string;
  };
}) => {
  const PRIMARY_VARIANTS = [
    "#1F2A3A",
    "#253246",
    "#2B3950",
    "#32405A",
    "#3A4A66",
  ] as const;

  const { scrollY } = useScroll();

  const [scaleRange, setScaleRange] = useState<{
    input: number[];
    output: number[];
  }>({
    input: [0, 1],
    output: [1, 1],
  });

  const stickyTop = getStickyTop(i);

  useLayoutEffect(() => {
    const currentCard = cardRefs[i]?.current;

    if (!currentCard) return;

    const buildScaleRange = () => {
      const currentRect = currentCard.getBoundingClientRect();
      const currentCardHeight = currentRect.height;

      const input: number[] = [0];
      const output: number[] = [1];

      /**
       * Important:
       * Each card only reacts to the card directly after it.
       *
       * item 0 -> reacts only to item 1, then freezes
       * item 1 -> reacts only to item 2, then freezes
       * item 2 -> reacts only to item 3, then freezes
       */
      const nextIndex = i + 1;
      const nextCard = cardRefs[nextIndex]?.current;

      if (nextCard) {
        const nextRect = nextCard.getBoundingClientRect();
        const nextCardAbsoluteTop = window.scrollY + nextRect.top;

        const shrinkStart =
          nextCardAbsoluteTop - (stickyTop + currentCardHeight);

        const shrinkEnd =
          nextCardAbsoluteTop -
          (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

        input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

        /**
         * Use this card's final stack scale.
         * This prevents the card from shrinking again when later cards arrive.
         */
        output.push(1, targetScale);
      }

      setScaleRange({ input, output });
    };

    buildScaleRange();

    const resizeObserver = new ResizeObserver(buildScaleRange);

    cardRefs.forEach((ref) => {
      if (ref.current) {
        resizeObserver.observe(ref.current);
      }
    });

    window.addEventListener("resize", buildScaleRange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", buildScaleRange);
    };
  }, [cardRefs, i, stickyTop, targetScale]);

  const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
    clamp: true,
  });

  return (
    <div
      ref={cardRefs[i]}
      className="sticky flex items-center justify-center"
      style={{
        zIndex: i + 1,
        // TODO: all staggered
        top: stickyTop,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
      >
        <Card
          style={{
            backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
          }}
          className="py-8"
        >
          <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
            <div className="flex flex-col items-start lg:pt-52.5">
              <Title as="h3" className="text-2xl font-medium text-white">
                {title}
              </Title>

              <TagsList tags={tags} />

              <SubTitle className="text-border dark:text-text-secondary mt-4">
                {description}
              </SubTitle>

              <Link
                href={cta.href}
                className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
              >
                {cta.label}
              </Link>
            </div>

            <Image
              className="mt-14 lg:mt-0 lg:self-start"
              src="/sample.svg"
              alt={title}
              width={231}
              height={231}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

function TagsList({ tags }: { tags: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, useScroll, useTransform } from "framer-motion";
// import React, { useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// /**
//  * The last card needs enough real scroll room to stay sticky at its
//  * staggered top position before the section releases it.
//  *
//  * Do not expose all of that as visible empty space. The section receives
//  * enough padding for sticky mechanics, then a negative margin pulls the next
//  * section back up visually.
//  */
// const LAST_CARD_MIN_STICKY_HOLD_PX = 360;
// const LAST_CARD_STICKY_BUFFER_PX = 160;
// const LAST_CARD_VISIBLE_BOTTOM_SPACE_PX = 144;

// // TODO: change top position
// const STACK_TOP_START_PX = 80;
// const STACK_TOP_STEP_PX = 32;

// const getStickyTop = (index: number) =>
//   STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   const lastStickyTop = getStickyTop(totalCards - 1);

//   const bottomScrollRoom = Math.max(
//     LAST_CARD_MIN_STICKY_HOLD_PX,
//     lastStickyTop + LAST_CARD_STICKY_BUFFER_PX,
//   );

//   const bottomVisualCompensation = Math.max(
//     0,
//     bottomScrollRoom - LAST_CARD_VISIBLE_BOTTOM_SPACE_PX,
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
//       style={{
//         paddingBottom: bottomScrollRoom,
//         marginBottom: -bottomVisualCompensation,
//       }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   // progress,
//   // range,
//   // step,
//   targetScale,
//   cardRefs,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   const stickyTop = getStickyTop(i);

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     // const buildScaleRange = () => {
//     //   const currentRect = currentCard.getBoundingClientRect();
//     //   const currentCardHeight = currentRect.height;

//     //   const input: number[] = [0];
//     //   const output: number[] = [1];

//     //   let previousScale = 1;

//     //   for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//     //     const nextCard = cardRefs[nextIndex]?.current;

//     //     if (!nextCard) continue;

//     //     const nextRect = nextCard.getBoundingClientRect();
//     //     const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//     //     const cardsOnTop = nextIndex - i;

//     //     /**
//     //      * Start scaling exactly when the next card starts touching / covering
//     //      * the current sticky card.
//     //      */
//     //     const shrinkStart =
//     //       nextCardAbsoluteTop - (stickyTop + currentCardHeight);
//     //     // const shrinkStart =
//     //     //   nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//     //     /**
//     //      * Finish scaling while the next card has only covered a small part
//     //      * of the current card, not half of it.
//     //      */
//     //     const shrinkEnd =
//     //       nextCardAbsoluteTop -
//     //       (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));
//     //     // const shrinkEnd =
//     //     //   nextCardAbsoluteTop -
//     //     //   (STICKY_TOP_PX +
//     //     //     currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//     //     const nextScale = Math.max(
//     //       1 - cardsOnTop * STACK_SCALE_STEP,
//     //       MIN_STACK_SCALE,
//     //     );

//     //     input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//     //     output.push(previousScale, nextScale);

//     //     previousScale = nextScale;
//     //   }

//     //   setScaleRange({ input, output });
//     // };

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       /**
//        * Important:
//        * Each card only reacts to the card directly after it.
//        *
//        * item 0 -> reacts only to item 1, then freezes
//        * item 1 -> reacts only to item 2, then freezes
//        * item 2 -> reacts only to item 3, then freezes
//        */
//       const nextIndex = i + 1;
//       const nextCard = cardRefs[nextIndex]?.current;

//       if (nextCard) {
//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const shrinkStart =
//           nextCardAbsoluteTop - (stickyTop + currentCardHeight);

//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

//         /**
//          * Use this card's final stack scale.
//          * This prevents the card from shrinking again when later cards arrive.
//          */
//         output.push(1, targetScale);
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards, stickyTop, targetScale]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//         // TODO: all staggered
//         top: stickyTop,
//       }}
//     >
//       <motion.div
//         style={{
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, useScroll, useTransform } from "framer-motion";
// import React, { useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// /**
//  * The only real scroll room after the last card.
//  * This controls how long the final card remains sticky.
//  * Keep it small to avoid the large empty bottom area.
//  */
// const LAST_CARD_HOLD_PX = 144;

// // TODO: change top position
// const STACK_TOP_START_PX = 80;
// const STACK_TOP_STEP_PX = 32;

// const getStickyTop = (index: number) =>
//   STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
//       style={{
//         paddingBottom: LAST_CARD_HOLD_PX,
//       }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   // progress,
//   // range,
//   // step,
//   targetScale,
//   cardRefs,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   const stickyTop = getStickyTop(i);

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     // const buildScaleRange = () => {
//     //   const currentRect = currentCard.getBoundingClientRect();
//     //   const currentCardHeight = currentRect.height;

//     //   const input: number[] = [0];
//     //   const output: number[] = [1];

//     //   let previousScale = 1;

//     //   for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//     //     const nextCard = cardRefs[nextIndex]?.current;

//     //     if (!nextCard) continue;

//     //     const nextRect = nextCard.getBoundingClientRect();
//     //     const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//     //     const cardsOnTop = nextIndex - i;

//     //     /**
//     //      * Start scaling exactly when the next card starts touching / covering
//     //      * the current sticky card.
//     //      */
//     //     const shrinkStart =
//     //       nextCardAbsoluteTop - (stickyTop + currentCardHeight);
//     //     // const shrinkStart =
//     //     //   nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//     //     /**
//     //      * Finish scaling while the next card has only covered a small part
//     //      * of the current card, not half of it.
//     //      */
//     //     const shrinkEnd =
//     //       nextCardAbsoluteTop -
//     //       (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));
//     //     // const shrinkEnd =
//     //     //   nextCardAbsoluteTop -
//     //     //   (STICKY_TOP_PX +
//     //     //     currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//     //     const nextScale = Math.max(
//     //       1 - cardsOnTop * STACK_SCALE_STEP,
//     //       MIN_STACK_SCALE,
//     //     );

//     //     input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//     //     output.push(previousScale, nextScale);

//     //     previousScale = nextScale;
//     //   }

//     //   setScaleRange({ input, output });
//     // };

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       /**
//        * Important:
//        * Each card only reacts to the card directly after it.
//        *
//        * item 0 -> reacts only to item 1, then freezes
//        * item 1 -> reacts only to item 2, then freezes
//        * item 2 -> reacts only to item 3, then freezes
//        */
//       const nextIndex = i + 1;
//       const nextCard = cardRefs[nextIndex]?.current;

//       if (nextCard) {
//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const shrinkStart =
//           nextCardAbsoluteTop - (stickyTop + currentCardHeight);

//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

//         /**
//          * Use this card's final stack scale.
//          * This prevents the card from shrinking again when later cards arrive.
//          */
//         output.push(1, targetScale);
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards, stickyTop, targetScale]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//         // TODO: all staggered
//         top: stickyTop,
//       }}
//     >
//       <motion.div
//         style={{
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
// import React, { useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// const STACK_EXIT_START_PROGRESS = 0.88;
// const STACK_EXIT_END_PROGRESS = 0.98;
// const STACK_EXIT_EXTRA_PX = 120;

// /**
//  * Sticky needs some real scroll room after the final card.
//  * Keep this small: too much padding creates a visible empty tail under the section.
//  */
// const LAST_CARD_STICKY_BUFFER_PX = 48;

// /**
//  * Keep a small visual breathing space, but pull the next section upward so the
//  * technical sticky scroll room does not become a huge visible blank area.
//  */
// const LAST_CARD_VISIBLE_BOTTOM_SPACE_PX = 96;

// // TODO: change top position
// const STACK_TOP_START_PX = 80;
// const STACK_TOP_STEP_PX = 32;

// const getStickyTop = (index: number) =>
//   STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   const lastStickyTop = getStickyTop(totalCards - 1);

//   const stackExitDistance = lastStickyTop + STACK_EXIT_EXTRA_PX;
//   const bottomSpacer = stackExitDistance + LAST_CARD_STICKY_BUFFER_PX;
//   const bottomVisualCompensation = Math.max(
//     0,
//     bottomSpacer - LAST_CARD_VISIBLE_BOTTOM_SPACE_PX,
//   );

//   const stackExitY = useTransform(
//     scrollYProgress,
//     [STACK_EXIT_START_PROGRESS, STACK_EXIT_END_PROGRESS],
//     [0, -stackExitDistance],
//     {
//       clamp: true,
//     },
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
//       style={{
//         paddingBottom: bottomSpacer,
//         marginBottom: -bottomVisualCompensation,
//       }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             stackExitY={stackExitY}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   // progress,
//   // range,
//   // step,
//   targetScale,
//   cardRefs,
//   stackExitY,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   stackExitY: MotionValue<number>;
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   const stickyTop = getStickyTop(i);

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     // const buildScaleRange = () => {
//     //   const currentRect = currentCard.getBoundingClientRect();
//     //   const currentCardHeight = currentRect.height;

//     //   const input: number[] = [0];
//     //   const output: number[] = [1];

//     //   let previousScale = 1;

//     //   for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//     //     const nextCard = cardRefs[nextIndex]?.current;

//     //     if (!nextCard) continue;

//     //     const nextRect = nextCard.getBoundingClientRect();
//     //     const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//     //     const cardsOnTop = nextIndex - i;

//     //     /**
//     //      * Start scaling exactly when the next card starts touching / covering
//     //      * the current sticky card.
//     //      */
//     //     const shrinkStart =
//     //       nextCardAbsoluteTop - (stickyTop + currentCardHeight);
//     //     // const shrinkStart =
//     //     //   nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//     //     /**
//     //      * Finish scaling while the next card has only covered a small part
//     //      * of the current card, not half of it.
//     //      */
//     //     const shrinkEnd =
//     //       nextCardAbsoluteTop -
//     //       (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));
//     //     // const shrinkEnd =
//     //     //   nextCardAbsoluteTop -
//     //     //   (STICKY_TOP_PX +
//     //     //     currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//     //     const nextScale = Math.max(
//     //       1 - cardsOnTop * STACK_SCALE_STEP,
//     //       MIN_STACK_SCALE,
//     //     );

//     //     input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//     //     output.push(previousScale, nextScale);

//     //     previousScale = nextScale;
//     //   }

//     //   setScaleRange({ input, output });
//     // };

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       /**
//        * Important:
//        * Each card only reacts to the card directly after it.
//        *
//        * item 0 -> reacts only to item 1, then freezes
//        * item 1 -> reacts only to item 2, then freezes
//        * item 2 -> reacts only to item 3, then freezes
//        */
//       const nextIndex = i + 1;
//       const nextCard = cardRefs[nextIndex]?.current;

//       if (nextCard) {
//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const shrinkStart =
//           nextCardAbsoluteTop - (stickyTop + currentCardHeight);

//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

//         /**
//          * Use this card's final stack scale.
//          * This prevents the card from shrinking again when later cards arrive.
//          */
//         output.push(1, targetScale);
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards, stickyTop, targetScale]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//         // TODO: all staggered
//         top: stickyTop,
//       }}
//     >
//       <motion.div
//         style={{
//           // y: entryY,
//           // TODO: all goes to top
//           y: stackExitY,
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
// import React, { useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// const STACK_EXIT_START_PROGRESS = 0.94;
// const STACK_EXIT_END_PROGRESS = 1;
// const STACK_EXIT_EXTRA_PX = 120;

// /**
//  * The last sticky card needs real scroll space after it.
//  * Without this spacer, the parent container ends too early and the browser
//  * releases the final sticky item before it has time to sit in its stack slot.
//  */
// const LAST_CARD_HOLD_VIEWPORT_RATIO = 0.85;
// const LAST_CARD_HOLD_MIN_PX = 420;

// // TODO: change top position
// const STACK_TOP_START_PX = 80;
// const STACK_TOP_STEP_PX = 32;

// const getStickyTop = (index: number) =>
//   STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

// /**
//  * Must match sticky top-20.
//  * Tailwind top-20 = 5rem = 80px by default.
//  */
// const STICKY_TOP_PX = 80;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   const lastStickyTop = getStickyTop(totalCards - 1);

//   const stackExitDistance = lastStickyTop + STACK_EXIT_EXTRA_PX;

//   const [bottomSpacer, setBottomSpacer] = useState(LAST_CARD_HOLD_MIN_PX);

//   useLayoutEffect(() => {
//     if (!totalCards) return;

//     const buildBottomSpacer = () => {
//       const viewportHeight = window.innerHeight;

//       /**
//        * The last card's sticky hold duration is basically the free space after
//        * the last card in the parent. Keep at least most of one viewport there,
//        * and also account for the last card's staggered top offset.
//        */
//       const viewportBasedHold = viewportHeight * LAST_CARD_HOLD_VIEWPORT_RATIO;
//       const stickySlotHold =
//         viewportHeight - lastStickyTop + STACK_EXIT_EXTRA_PX;

//       setBottomSpacer(
//         Math.max(viewportBasedHold, stickySlotHold, LAST_CARD_HOLD_MIN_PX),
//       );
//     };

//     buildBottomSpacer();

//     const resizeObserver = new ResizeObserver(buildBottomSpacer);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildBottomSpacer);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildBottomSpacer);
//     };
//   }, [cardRefs, lastStickyTop, totalCards]);

//   const stackExitY = useTransform(
//     scrollYProgress,
//     [STACK_EXIT_START_PROGRESS, STACK_EXIT_END_PROGRESS],
//     [0, -stackExitDistance],
//     {
//       clamp: true,
//     },
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
//       style={{
//         paddingBottom: bottomSpacer,
//       }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             stackExitY={stackExitY}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   // progress,
//   // range,
//   // step,
//   targetScale,
//   cardRefs,
//   stackExitY,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   stackExitY: MotionValue<number>;
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   const stickyTop = getStickyTop(i);

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     // const buildScaleRange = () => {
//     //   const currentRect = currentCard.getBoundingClientRect();
//     //   const currentCardHeight = currentRect.height;

//     //   const input: number[] = [0];
//     //   const output: number[] = [1];

//     //   let previousScale = 1;

//     //   for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//     //     const nextCard = cardRefs[nextIndex]?.current;

//     //     if (!nextCard) continue;

//     //     const nextRect = nextCard.getBoundingClientRect();
//     //     const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//     //     const cardsOnTop = nextIndex - i;

//     //     /**
//     //      * Start scaling exactly when the next card starts touching / covering
//     //      * the current sticky card.
//     //      */
//     //     const shrinkStart =
//     //       nextCardAbsoluteTop - (stickyTop + currentCardHeight);
//     //     // const shrinkStart =
//     //     //   nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//     //     /**
//     //      * Finish scaling while the next card has only covered a small part
//     //      * of the current card, not half of it.
//     //      */
//     //     const shrinkEnd =
//     //       nextCardAbsoluteTop -
//     //       (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));
//     //     // const shrinkEnd =
//     //     //   nextCardAbsoluteTop -
//     //     //   (STICKY_TOP_PX +
//     //     //     currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//     //     const nextScale = Math.max(
//     //       1 - cardsOnTop * STACK_SCALE_STEP,
//     //       MIN_STACK_SCALE,
//     //     );

//     //     input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//     //     output.push(previousScale, nextScale);

//     //     previousScale = nextScale;
//     //   }

//     //   setScaleRange({ input, output });
//     // };

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       /**
//        * Important:
//        * Each card only reacts to the card directly after it.
//        *
//        * item 0 -> reacts only to item 1, then freezes
//        * item 1 -> reacts only to item 2, then freezes
//        * item 2 -> reacts only to item 3, then freezes
//        */
//       const nextIndex = i + 1;
//       const nextCard = cardRefs[nextIndex]?.current;

//       if (nextCard) {
//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const shrinkStart =
//           nextCardAbsoluteTop - (stickyTop + currentCardHeight);

//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

//         /**
//          * Use this card's final stack scale.
//          * This prevents the card from shrinking again when later cards arrive.
//          */
//         output.push(1, targetScale);
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards, stickyTop, targetScale]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//         // TODO: all staggered
//         top: stickyTop,
//       }}
//     >
//       <motion.div
//         style={{
//           // y: entryY,
//           // TODO: all goes to top
//           y: stackExitY,
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
// import React, { useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// const STACK_EXIT_START_PROGRESS = 0.88;
// const STACK_EXIT_END_PROGRESS = 0.98;
// const STACK_EXIT_EXTRA_PX = 180;

// // TODO: change top position
// const STACK_TOP_START_PX = 80;
// const STACK_TOP_STEP_PX = 32;

// const getStickyTop = (index: number) =>
//   STACK_TOP_START_PX + index * STACK_TOP_STEP_PX;

// /**
//  * Must match sticky top-20.
//  * Tailwind top-20 = 5rem = 80px by default.
//  */
// const STICKY_TOP_PX = 80;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   scrollYProgress.on("change", (latest) => {
//     console.log(latest);
//   });

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   const lastStickyTop = getStickyTop(totalCards - 1);

//   const stackExitDistance = lastStickyTop + STACK_EXIT_EXTRA_PX;

//   const stackExitY = useTransform(
//     scrollYProgress,
//     [STACK_EXIT_START_PROGRESS, STACK_EXIT_END_PROGRESS],
//     [0, -stackExitDistance],
//     {
//       clamp: true,
//     },
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-40 flex w-full flex-col items-center justify-center gap-8"
//       style={{
//         paddingBottom: stackExitDistance,
//       }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             stackExitY={stackExitY}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   // progress,
//   // range,
//   // step,
//   targetScale,
//   cardRefs,
//   stackExitY,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   stackExitY: MotionValue<number>;
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   const stickyTop = getStickyTop(i);

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     // const buildScaleRange = () => {
//     //   const currentRect = currentCard.getBoundingClientRect();
//     //   const currentCardHeight = currentRect.height;

//     //   const input: number[] = [0];
//     //   const output: number[] = [1];

//     //   let previousScale = 1;

//     //   for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//     //     const nextCard = cardRefs[nextIndex]?.current;

//     //     if (!nextCard) continue;

//     //     const nextRect = nextCard.getBoundingClientRect();
//     //     const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//     //     const cardsOnTop = nextIndex - i;

//     //     /**
//     //      * Start scaling exactly when the next card starts touching / covering
//     //      * the current sticky card.
//     //      */
//     //     const shrinkStart =
//     //       nextCardAbsoluteTop - (stickyTop + currentCardHeight);
//     //     // const shrinkStart =
//     //     //   nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//     //     /**
//     //      * Finish scaling while the next card has only covered a small part
//     //      * of the current card, not half of it.
//     //      */
//     //     const shrinkEnd =
//     //       nextCardAbsoluteTop -
//     //       (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));
//     //     // const shrinkEnd =
//     //     //   nextCardAbsoluteTop -
//     //     //   (STICKY_TOP_PX +
//     //     //     currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//     //     const nextScale = Math.max(
//     //       1 - cardsOnTop * STACK_SCALE_STEP,
//     //       MIN_STACK_SCALE,
//     //     );

//     //     input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//     //     output.push(previousScale, nextScale);

//     //     previousScale = nextScale;
//     //   }

//     //   setScaleRange({ input, output });
//     // };

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       /**
//        * Important:
//        * Each card only reacts to the card directly after it.
//        *
//        * item 0 -> reacts only to item 1, then freezes
//        * item 1 -> reacts only to item 2, then freezes
//        * item 2 -> reacts only to item 3, then freezes
//        */
//       const nextIndex = i + 1;
//       const nextCard = cardRefs[nextIndex]?.current;

//       if (nextCard) {
//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const shrinkStart =
//           nextCardAbsoluteTop - (stickyTop + currentCardHeight);

//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (stickyTop + currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));

//         /**
//          * Use this card's final stack scale.
//          * This prevents the card from shrinking again when later cards arrive.
//          */
//         output.push(1, targetScale);
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards, stickyTop, targetScale]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//         // TODO: all staggered
//         top: stickyTop,
//       }}
//     >
//       <motion.div
//         style={{
//           // y: entryY,
//           // TODO: all goes to top
//           y: stackExitY,
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };

// "use client";

// import { motion, useScroll, useTransform } from "framer-motion";
// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import Image from "next/image";

// import SubTitle from "@/components/common/subtitle";
// import Title from "@/components/common/title";
// import { Card, CardContent } from "@/components/ui/card";
// import { Link } from "@/i18n/navigation";

// type StickyScrollCardsProps = {
//   items: {
//     title: string;
//     description: string;
//     tags: string[];
//     cta: {
//       label: string;
//       href: string;
//     };
//   }[];
// };

// // const STACK_SCALE_STEP = 0.06;
// // const MIN_STACK_SCALE = 0.72;
// const STACK_SCALE_STEP = 0.1;
// const MIN_STACK_SCALE = 0.6;

// const ENTER_DURATION = 0.35;

// /**
//  * Must match sticky top-20.
//  * Tailwind top-20 = 5rem = 80px by default.
//  */
// const STICKY_TOP_PX = 80;

// /**
//  * Scale finishes when the next card has covered this much of the previous card.
//  * 0.22 = finish early, before half-cover.
//  * Increase to 0.3 if you want slower.
//  * Decrease to 0.15 if you want sharper/faster.
//  */
// const SCALE_FINISH_OVERLAP_RATIO = 0.9;
// /**
//  * Negative means: start shrinking before the next card reaches its own range.
//  * This keeps the same stacking behavior, but makes the scale response earlier.
//  */
// // const SHRINK_START_OFFSET = -1;
// // const SHRINK_END_OFFSET = 0.0;
// const SHRINK_START_OFFSET = 0.08;
// const SHRINK_END_OFFSET = 0.65;

// const StickyScrollCards = ({ items }: StickyScrollCardsProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start start", "end end"],
//   });

//   const totalCards = items.length;
//   const step = 1 / totalCards;

//   scrollYProgress.on("change", (latest) => {
//     console.log(latest);
//   });

//   const cardRefs = React.useMemo(
//     () => items.map(() => React.createRef<HTMLDivElement>()),
//     [items],
//   );

//   return (
//     <div
//       ref={sectionRef}
//       className="relative container mt-20 flex w-full flex-col items-center justify-center gap-8"
//       // style={{ height: `calc(${totalCards * 100}vh + 50vh)` }}
//     >
//       {items.map((item, i) => {
//         const start = i * step;
//         const end = (i + 1) * step;
//         const cardsAbove = totalCards - i - 1;
//         const targetScale = Math.max(
//           1 - cardsAbove * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         return (
//           <StickyScrollCard
//             key={`sticky-card-${i}`}
//             i={i}
//             totalCards={totalCards}
//             progress={scrollYProgress}
//             range={[start, end]}
//             step={step}
//             targetScale={targetScale}
//             cardRefs={cardRefs}
//             {...item}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const StickyScrollCard = ({
//   i,
//   totalCards,
//   title,
//   description,
//   tags,
//   cta,
//   progress,
//   range,
//   step,
//   targetScale,
//   cardRefs,
// }: {
//   i: number;
//   totalCards: number;
//   title: string;
//   progress: ReturnType<typeof useScroll>["scrollYProgress"];
//   range: [number, number];
//   step: number;
//   targetScale: number;
//   description: string;
//   tags: string[];
//   cardRefs: React.RefObject<HTMLDivElement | null>[];
//   cta: {
//     label: string;
//     href: string;
//   };
// }) => {
//   const container = useRef<HTMLDivElement>(null);

//   const PRIMARY_VARIANTS = [
//     "#1F2A3A",
//     "#253246",
//     "#2B3950",
//     "#32405A",
//     "#3A4A66",
//   ] as const;

//   const [start] = range;

//   /**
//    * The card enters from below at normal size.
//    * No zoom-in / overview effect here: scale stays 1 while entering.
//    */

//   const enterEnd = start + step * ENTER_DURATION;
//   const entryY = useTransform(progress, [start, enterEnd], ["18vh", "0vh"], {
//     clamp: true,
//   });

//   /**
//    * After this card has reached its sticky position, every following card
//    * pushes it one layer deeper into the stack.
//    */
//   // const scaleInput = [start, enterEnd];
//   // const scaleOutput = [1, 1];

//   // for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//   //   const cardsOnTop = nextIndex - i;
//   //   scaleInput.push(nextIndex * step + step * 0.15);
//   //   const nextScale = Math.max(
//   //     1 - cardsOnTop * STACK_SCALE_STEP,
//   //     MIN_STACK_SCALE,
//   //   );

//   //   scaleOutput.push(nextIndex === totalCards - 1 ? targetScale : nextScale);
//   // }

//   // const scale = useTransform(progress, scaleInput, scaleOutput, {
//   //   clamp: true,
//   // });
//   const { scrollY } = useScroll();

//   const [scaleRange, setScaleRange] = useState<{
//     input: number[];
//     output: number[];
//   }>({
//     input: [0, 1],
//     output: [1, 1],
//   });

//   useLayoutEffect(() => {
//     const currentCard = cardRefs[i]?.current;

//     if (!currentCard) return;

//     const buildScaleRange = () => {
//       const currentRect = currentCard.getBoundingClientRect();
//       const currentCardHeight = currentRect.height;

//       const input: number[] = [0];
//       const output: number[] = [1];

//       let previousScale = 1;

//       for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//         const nextCard = cardRefs[nextIndex]?.current;

//         if (!nextCard) continue;

//         const nextRect = nextCard.getBoundingClientRect();
//         const nextCardAbsoluteTop = window.scrollY + nextRect.top;

//         const cardsOnTop = nextIndex - i;

//         /**
//          * Start scaling exactly when the next card starts touching / covering
//          * the current sticky card.
//          */
//         const shrinkStart =
//           nextCardAbsoluteTop - (STICKY_TOP_PX + currentCardHeight);

//         /**
//          * Finish scaling while the next card has only covered a small part
//          * of the current card, not half of it.
//          */
//         const shrinkEnd =
//           nextCardAbsoluteTop -
//           (STICKY_TOP_PX +
//             currentCardHeight * (1 - SCALE_FINISH_OVERLAP_RATIO));

//         const nextScale = Math.max(
//           1 - cardsOnTop * STACK_SCALE_STEP,
//           MIN_STACK_SCALE,
//         );

//         input.push(shrinkStart, Math.max(shrinkStart + 1, shrinkEnd));
//         output.push(previousScale, nextScale);

//         previousScale = nextScale;
//       }

//       setScaleRange({ input, output });
//     };

//     buildScaleRange();

//     const resizeObserver = new ResizeObserver(buildScaleRange);

//     cardRefs.forEach((ref) => {
//       if (ref.current) {
//         resizeObserver.observe(ref.current);
//       }
//     });

//     window.addEventListener("resize", buildScaleRange);

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("resize", buildScaleRange);
//     };
//   }, [cardRefs, i, totalCards]);

//   const scale = useTransform(scrollY, scaleRange.input, scaleRange.output, {
//     clamp: true,
//   });

//   // const scaleInput: number[] = [start, enterEnd];
//   // const scaleOutput: number[] = [1, 1];

//   // let previousScale = 1;

//   // for (let nextIndex = i + 1; nextIndex < totalCards; nextIndex += 1) {
//   //   const cardsOnTop = nextIndex - i;

//   //   const shrinkStart = nextIndex * step + step * SHRINK_START_OFFSET;
//   //   const shrinkEnd = nextIndex * step + step * SHRINK_END_OFFSET;

//   //   const nextScale = Math.max(
//   //     1 - cardsOnTop * STACK_SCALE_STEP,
//   //     MIN_STACK_SCALE,
//   //   );

//   //   scaleInput.push(shrinkStart, shrinkEnd);
//   //   scaleOutput.push(previousScale, nextScale);

//   //   previousScale = nextScale;
//   // }

//   // const scale = useTransform(progress, scaleInput, scaleOutput, {
//   //   clamp: true,
//   // });

//   return (
//     <div
//       ref={cardRefs[i]}
//       className="sticky top-20 flex items-center justify-center"
//       style={{
//         zIndex: i + 1,
//       }}
//     >
//       <motion.div
//         style={{
//           // y: entryY,
//           scale,
//         }}
//         className="relative flex w-full origin-top flex-col overflow-hidden rounded-4xl will-change-transform"
//       >
//         <Card
//           style={{
//             backgroundColor: PRIMARY_VARIANTS[i % PRIMARY_VARIANTS.length],
//           }}
//           className="py-8"
//         >
//           <CardContent className="px-8 lg:flex lg:flex-row lg:justify-between">
//             <div className="flex flex-col items-start lg:pt-52.5">
//               <Title as="h3" className="text-2xl font-medium text-white">
//                 {title}
//               </Title>

//               <TagsList tags={tags} />

//               <SubTitle className="text-border dark:text-text-secondary mt-4">
//                 {description}
//               </SubTitle>

//               <Link
//                 href={cta.href}
//                 className="bg-secondary mt-6 inline-block rounded-lg px-3 py-2 text-white"
//               >
//                 {cta.label}
//               </Link>
//             </div>

//             <Image
//               className="mt-14 lg:mt-0 lg:self-start"
//               src="/sample.svg"
//               alt={title}
//               width={231}
//               height={231}
//             />
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// function TagsList({ tags }: { tags: string[] }) {
//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {tags.map((tag, index) => (
//         <span
//           key={index}
//           className="border-secondary text-secondary mt-2 rounded-full border px-3 py-1"
//         >
//           {tag}
//         </span>
//       ))}
//     </div>
//   );
// }

// export { StickyScrollCards, StickyScrollCard };
