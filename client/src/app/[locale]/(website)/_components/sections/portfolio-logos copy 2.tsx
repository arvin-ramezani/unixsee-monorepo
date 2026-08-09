"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import Section from "@/components/common/section";
import { Link } from "@/i18n/navigation";

const ALL_LOGOS = [
  {
    name: "company-0",
    logo: "/images/portfolio/farcoland.png",
    href: "https://farcoland.com/",
  },
  {
    name: "company-1",
    logo: "/images/portfolio/gallery khas.png",
    href: "https://gallerykhas.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/joorlnd.png",
    href: "https://jooriland.com/",
  },
  {
    name: "company-5",
    logo: "/images/portfolio/kalaoma.png",
    href: "https://kalaoma.com/",
  },
  {
    name: "company-6",
    logo: "/images/portfolio/netoff.png",
    href: "https://netoffshop.ir/",
  },
  {
    name: "company-7",
    logo: "/images/portfolio/newpoosh.png",
    href: "https://newpoosh.com/",
  },
  {
    name: "company-8",
    logo: "/images/portfolio/parhoon.png",
    href: "https://parhoonshop.com/",
  },
  {
    name: "company-9",
    logo: "/images/portfolio/remowin.png",
    href: "https://remowin.com/",
  },
  {
    name: "company-10",
    logo: "/images/portfolio/beezket.png",
    href: "https://beezket.com/",
  },
  {
    name: "company-11",
    logo: "/images/portfolio/behpoosh.png",
    href: "https://behpooshshop.com/",
  },
  {
    name: "company-13",
    logo: "/images/portfolio/markopoosh.png",
    href: "https://markopoosh.com/",
  },
  {
    name: "company-14",
    logo: "/images/portfolio/tarhandishan.png",
    href: "https://tarhandishan.shop/",
  },
  {
    name: "company-15",
    logo: "/images/portfolio/luxstar.png",
    href: "https://luxstar.ir/",
  },
  {
    name: "company-16",
    logo: "/images/portfolio/gamario.png",
    href: "https://gamario.com/",
  },
  {
    name: "company-17",
    logo: "/images/portfolio/ifoods.png",
    href: "https://ifoods.ir/contact/",
  },
  {
    name: "company-18",
    logo: "/images/portfolio/nabik.png",
    href: "https://nabik.net/",
  },
  {
    name: "company-19",
    logo: "/images/portfolio/arshia365.png",
    href: "https://arshia365.com/",
  },
  {
    name: "company-20",
    logo: "/images/portfolio/prosazeh.png",
    href: "https://prosazeh.com/",
  },
  {
    name: "company-21",
    logo: "/images/portfolio/maxbax.png",
    href: "https://maxbax.com/",
  },
  { name: "company-12", logo: "/images/portfolio/iransalem.png", href: "" },
  { name: "company-2", logo: "/images/portfolio/haste tarahi.png", href: "" },
  { name: "company-4", logo: "/images/portfolio/jooyab.png", href: "" },
] as const;

const PERSIAN_LOGOS = [
  {
    name: "company-0",
    logo: "/images/portfolio/persian/1.newpoosh.png",
    href: "https://farcoland.com/",
  },
  {
    name: "company-1",
    logo: "/images/portfolio/persian/2.parhoon.png",
    href: "https://gallerykhas.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/persian/3.remowin.png",
    href: "https://jooriland.com/",
  },
  {
    name: "company-5",
    logo: "/images/portfolio/persian/5.joorlnd.png",
    href: "https://kalaoma.com/",
  },
  {
    name: "company-6",
    logo: "/images/portfolio/persian/jooyab.png",
    href: "https://netoffshop.ir/",
  },
  {
    name: "company-7",
    logo: "/images/portfolio/persian/13.iransalem.png",
    href: "https://newpoosh.com/",
  },
  {
    name: "company-8",
    logo: "/images/portfolio/persian/15.tarhandishan.png",
    href: "https://parhoonshop.com/",
  },
  {
    name: "company-9",
    logo: "/images/portfolio/persian/17.gamario.png",
    href: "https://remowin.com/",
  },
  {
    name: "company-10",
    logo: "/images/portfolio/persian/barghe zomorod PNG.png",
    href: "https://beezket.com/",
  },
  {
    name: "company-11",
    logo: "/images/portfolio/persian/bobespresso.png",
    href: "https://behpooshshop.com/",
  },
  {
    name: "company-13",
    logo: "/images/portfolio/persian/dyan kala.png",
    href: "https://markopoosh.com/",
  },
  {
    name: "company-14",
    logo: "/images/portfolio/persian/fixabzar.png",
    href: "https://tarhandishan.shop/",
  },
  {
    name: "company-15",
    logo: "/images/portfolio/persian/lakpack.png",
    href: "https://luxstar.ir/",
  },
  {
    name: "company-16",
    logo: "/images/portfolio/persian/technobenis.png",
    href: "https://luxstar.ir/",
  },
];

const ENGLISH_LOGOS = [
  {
    name: "company-0",
    logo: "/images/portfolio/english/6.gallery khas.png",
    href: "https://farcoland.com/",
  },
  {
    name: "company-1",
    logo: "/images/portfolio/english/8.netoff.png",
    href: "https://gallerykhas.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/english/10.kalaoma.png",
    href: "https://jooriland.com/",
  },
  {
    name: "company-5",
    logo: "/images/portfolio/english/12.behpoosh.png",
    href: "https://kalaoma.com/",
  },
  {
    name: "company-6",
    logo: "/images/portfolio/english/14.markopoosh.png",
    href: "https://netoffshop.ir/",
  },
  {
    name: "company-7",
    logo: "/images/portfolio/english/22.maxbax.png",
    href: "https://newpoosh.com/",
  },
  {
    name: "company-8",
    logo: "/images/portfolio/english/hazhirshop.png",
    href: "https://parhoonshop.com/",
  },
  {
    name: "company-9",
    logo: "/images/portfolio/english/iliagadgets.png",
    href: "https://remowin.com/",
  },
  {
    name: "company-10",
    logo: "/images/portfolio/english/lunapoosh.png",
    href: "https://beezket.com/",
  },
  {
    name: "company-11",
    logo: "/images/portfolio/english/navikmax.png",
    href: "https://behpooshshop.com/",
  },
];

const BOLD_LOGOS = [
  {
    name: "company-0",
    logo: "/images/portfolio/bold/4.farcoland.png",
    href: "https://farcoland.com/",
  },
  {
    name: "company-1",
    logo: "/images/portfolio/bold/18.ifoods.png",
    href: "https://gallerykhas.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/bold/papis.png",
    href: "https://jooriland.com/",
  },
  {
    name: "company-4",
    logo: "/images/portfolio/bold/salibar.png",
    href: "https://jooriland.com/",
  },
];

const GRID_COLUMNS_COUNT = 4;
const TOTAL_CELLS_COUNT = 12;
const EMPTY_CELL_INDICES = new Set([8, 11]);
const VISIBLE_SLOTS_COUNT = TOTAL_CELLS_COUNT - EMPTY_CELL_INDICES.size;
const SWAP_INTERVAL_MILLISECONDS = 2200;
const ANIMATION_DURATION_RESET_MILLISECONDS = 550;

function getRandomInteger(maximum: number): number {
  return Math.floor(Math.random() * maximum);
}

function shuffleArray<T>(array: T[]): T[] {
  const shallowCopy = [...array];
  for (let index = shallowCopy.length - 1; index > 0; index--) {
    const swapTargetIndex = getRandomInteger(index + 1);
    [shallowCopy[index], shallowCopy[swapTargetIndex]] = [
      shallowCopy[swapTargetIndex],
      shallowCopy[index],
    ];
  }
  return shallowCopy;
}

function generateInitialVisibleLogoIndices(): number[] {
  const initialPool = Array.from(
    { length: ALL_LOGOS.length },
    (_, index) => index,
  );
  return shuffleArray(initialPool).slice(0, VISIBLE_SLOTS_COUNT);
}

interface LogoCellProps {
  logoIndex: number;
  shouldAnimate: boolean;
}

function LogoCell({ logoIndex, shouldAnimate }: LogoCellProps) {
  const companyLogo = ALL_LOGOS[logoIndex];

  if (!companyLogo) return null;

  const wrapperClassName =
    "relative m-2 flex aspect-square w-full items-center justify-center lg:mx-4 lg:my-2 lg:aspect-120/36 lg:w-[50%] 2xl:w-[40%]";
  const imageElement = (
    <Image
      src={companyLogo.logo}
      alt={companyLogo.name}
      className="object-contain dark:invert-0"
      fill
      unoptimized
    />
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${companyLogo.name}-${logoIndex}`}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex h-full w-full items-center justify-center"
      >
        {companyLogo.href ? (
          <Link
            href={companyLogo.href}
            target="_blank"
            className={wrapperClassName}
          >
            {imageElement}
          </Link>
        ) : (
          <div className={wrapperClassName}>{imageElement}</div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function PortfolioLogos() {
  const [animatingSlotIndex, setAnimatingSlotIndex] = useState<number | null>(
    null,
  );
  const [visibleLogoIndices, setVisibleLogoIndices] = useState<number[]>(() =>
    Array.from({ length: VISIBLE_SLOTS_COUNT }, (_, index) => index),
  );

  const isInitialized = useRef(false);

  // Track order sequences of cells to replace next
  const targetSlotSequenceQueue = useRef<number[]>([]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    setVisibleLogoIndices(generateInitialVisibleLogoIndices());
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Re-populate and randomize the sequence queue when empty
      if (targetSlotSequenceQueue.current.length === 0) {
        const baseSequence = Array.from(
          { length: VISIBLE_SLOTS_COUNT },
          (_, index) => index,
        );
        targetSlotSequenceQueue.current = shuffleArray(baseSequence);
      }

      // Dequeue the next cell slot safely
      const targetSlotIndex = targetSlotSequenceQueue.current.pop()!;

      setVisibleLogoIndices((currentVisibleIndices) => {
        const currentlyDisplayedSet = new Set(currentVisibleIndices);
        const availablePoolIndices = ALL_LOGOS.map((_, index) => index).filter(
          (index) => !currentlyDisplayedSet.has(index),
        );

        if (availablePoolIndices.length === 0) return currentVisibleIndices;

        const randomPoolIndex = getRandomInteger(availablePoolIndices.length);
        const incomingLogoIndex = availablePoolIndices[randomPoolIndex];

        setAnimatingSlotIndex(targetSlotIndex);

        const updatedVisibleIndices = [...currentVisibleIndices];
        updatedVisibleIndices[targetSlotIndex] = incomingLogoIndex;
        return updatedVisibleIndices;
      });

      setTimeout(
        () => setAnimatingSlotIndex(null),
        ANIMATION_DURATION_RESET_MILLISECONDS,
      );
    }, SWAP_INTERVAL_MILLISECONDS);

    return () => clearInterval(intervalId);
  }, []);

  let visibleSlotCursor = 0;

  return (
    <Section className="min-h-[unset]" containerClassName="py-0!">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%,#3b82f61f_0%,#0000_70%)] sm:bg-[radial-gradient(50%_40%_at_50%_50%,rgba(59,130,246,0.16)_0%,transparent_72%)] md:bg-[radial-gradient(75%_70%,#3b82f624_0%,#0000_65%)] lg:bg-[radial-gradient(85%_80%,#3b82f624_0%,#0000_65%)] dark:bg-[radial-gradient(60%_60%,#2347814d_0%,#0000_70%)] dark:sm:bg-[radial-gradient(75%_75%,#17397047_0%,#0000_72%)] dark:md:bg-[radial-gradient(70%_60%,#1f437c42_0%,#0000_75%)] dark:lg:bg-[radial-gradient(55%_57%,#2e579b42_0%,#0000_75%)]" />

        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS_COUNT}, 1fr)` }}
        >
          {Array.from({ length: TOTAL_CELLS_COUNT }, (_, cellIndex) => {
            const isLastColumn = (cellIndex + 1) % GRID_COLUMNS_COUNT === 0;
            const isLastRow =
              cellIndex >= TOTAL_CELLS_COUNT - GRID_COLUMNS_COUNT;

            const borderClasses = [
              !isLastColumn ? "border-e" : "",
              !isLastRow ? "border-b" : "",
              "border-foreground/7",
            ]
              .filter(Boolean)
              .join(" ");

            if (EMPTY_CELL_INDICES.has(cellIndex)) {
              return (
                <div
                  key={cellIndex}
                  className={`flex h-24 items-center justify-center ${borderClasses}`}
                />
              );
            }

            const currentSlotIndex = visibleSlotCursor++;
            const shouldAnimate = animatingSlotIndex === currentSlotIndex;

            return (
              <div
                key={cellIndex}
                className={`relative flex h-24 items-center justify-center overflow-hidden ${borderClasses}`}
              >
                <LogoCell
                  logoIndex={visibleLogoIndices[currentSlotIndex]}
                  shouldAnimate={shouldAnimate}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// "use client";

// import Image from "next/image";
// import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useRef, useState } from "react";

// import Section from "@/components/common/section";
// import { Link } from "@/i18n/navigation";

// const ALL_LOGOS = [
//   {
//     name: "company-0",
//     logo: "/images/portfolio/farcoland.png",
//     href: "https://farcoland.com/",
//   },
//   {
//     name: "company-1",
//     logo: "/images/portfolio/gallery khas.png",
//     href: "https://gallerykhas.com/",
//   },
//   {
//     name: "company-3",
//     logo: "/images/portfolio/joorlnd.png",
//     href: "https://jooriland.com/",
//   },
//   {
//     name: "company-5",
//     logo: "/images/portfolio/kalaoma.png",
//     href: "https://kalaoma.com/",
//   },
//   {
//     name: "company-6",
//     logo: "/images/portfolio/netoff.png",
//     href: "https://netoffshop.ir/",
//   },
//   {
//     name: "company-7",
//     logo: "/images/portfolio/newpoosh.png",
//     href: "https://newpoosh.com/",
//   },
//   {
//     name: "company-8",
//     logo: "/images/portfolio/parhoon.png",
//     href: "https://parhoonshop.com/",
//   },
//   {
//     name: "company-9",
//     logo: "/images/portfolio/remowin.png",
//     href: "https://remowin.com/",
//   },
//   {
//     name: "company-10",
//     logo: "/images/portfolio/beezket.png",
//     href: "https://beezket.com/",
//   },
//   {
//     name: "company-11",
//     logo: "/images/portfolio/behpoosh.png",
//     href: "https://behpooshshop.com/",
//   },
//   {
//     name: "company-13",
//     logo: "/images/portfolio/markopoosh.png",
//     href: "https://markopoosh.com/",
//   },
//   {
//     name: "company-14",
//     logo: "/images/portfolio/tarhandishan.png",
//     href: "https://tarhandishan.shop/",
//   },
//   {
//     name: "company-15",
//     logo: "/images/portfolio/luxstar.png",
//     href: "https://luxstar.ir/",
//   },
//   {
//     name: "company-16",
//     logo: "/images/portfolio/gamario.png",
//     href: "https://gamario.com/",
//   },
//   {
//     name: "company-17",
//     logo: "/images/portfolio/ifoods.png",
//     href: "https://ifoods.ir/contact/",
//   },
//   {
//     name: "company-18",
//     logo: "/images/portfolio/nabik.png",
//     href: "https://nabik.net/",
//   },
//   {
//     name: "company-19",
//     logo: "/images/portfolio/arshia365.png",
//     href: "https://arshia365.com/",
//   },
//   {
//     name: "company-20",
//     logo: "/images/portfolio/prosazeh.png",
//     href: "https://prosazeh.com/",
//   },
//   {
//     name: "company-21",
//     logo: "/images/portfolio/maxbax.png",
//     href: "https://maxbax.com/",
//   },
//   {
//     name: "company-12",
//     logo: "/images/portfolio/iransalem.png",
//     href: "",
//   },
//   {
//     name: "company-2",
//     logo: "/images/portfolio/haste tarahi.png",
//     href: "",
//   },
//   {
//     name: "company-4",
//     logo: "/images/portfolio/jooyab.png",
//     href: "",
//   },
// ] as const;

// const GRID_COLS = 4;
// const TOTAL_CELLS = 12;
// const EMPTY_SLOT_INDICES = new Set([8, 11]); // 0-indexed; matches original layout (row 3, col 1 and col 4)
// const VISIBLE_SLOTS = TOTAL_CELLS - EMPTY_SLOT_INDICES.size; // 10 visible
// const SWAP_INTERVAL_MS = 2200;

// function randInt(max: number) {
//   return Math.floor(Math.random() * max);
// }

// /**
//  * Builds the initial mapping of visible-slot-index → logo index from ALL_LOGOS.
//  * Each visible slot gets a unique logo.
//  */
// function buildInitialSlots(): number[] {
//   const indices = Array.from({ length: ALL_LOGOS.length }, (_, i) => i);
//   // Shuffle
//   for (let i = indices.length - 1; i > 0; i--) {
//     const j = randInt(i + 1);
//     [indices[i], indices[j]] = [indices[j], indices[i]];
//   }
//   return indices.slice(0, VISIBLE_SLOTS);
// }

// interface LogoCellProps {
//   logoIndex: number;
//   isAnimating: boolean;
// }

// function LogoCell({ logoIndex, isAnimating }: LogoCellProps) {
//   const logo = ALL_LOGOS[logoIndex];

//   if (!logo) return null;

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={`${logo.name}-${logoIndex}`}
//         initial={isAnimating ? { opacity: 0 } : false}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.5, ease: "easeInOut" }}
//         className="flex h-full w-full items-center justify-center"
//       >
//         {!!logo?.href ? (
//           <Link
//             href={logo.href}
//             target={"_blank"}
//             className="relative m-2 flex aspect-square w-full items-center justify-center lg:mx-4 lg:my-2 lg:aspect-120/36 lg:w-[50%] 2xl:w-[40%]"
//           >
//             <Image
//               src={logo.logo}
//               alt={logo.name}
//               // width={120}
//               // height={36}
//               className="object-contain dark:invert-0"
//               fill
//               unoptimized
//             />
//           </Link>
//         ) : (
//           <div className="relative m-2 flex aspect-square w-full items-center justify-center lg:mx-4 lg:my-2 lg:aspect-120/36 lg:w-[50%] 2xl:w-[40%]">
//             <Image
//               src={logo.logo}
//               alt={logo.name}
//               // width={120}
//               // height={36}
//               className="object-contain dark:invert-0"
//               fill
//               unoptimized
//             />
//           </div>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export type PortfolioLogosProps = object;

// export default function PortfolioLogos({}: PortfolioLogosProps) {
//   const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);
//   // const [visibleSlots, setVisibleSlots] = useState<number[]>(buildInitialSlots);
//   const [visibleSlots, setVisibleSlots] = useState<number[]>(
//     Array.from({ length: VISIBLE_SLOTS }, (_, i) => i),
//   );

//   const hasInitializedRef = useRef(false);

//   useEffect(() => {
//     if (hasInitializedRef.current) return;
//     hasInitializedRef.current = true;

//     setVisibleSlots(buildInitialSlots());
//     nextLogoRef.current = VISIBLE_SLOTS % ALL_LOGOS.length;
//   }, []);

//   const nextLogoRef = useRef<number>(VISIBLE_SLOTS % ALL_LOGOS.length);

//   const lastReplacedSlotRef = useRef<number>(-1);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       // The logo to swap IN is always the next one in ALL_LOGOS (sequential).
//       const incomingLogoIdx = nextLogoRef.current;
//       nextLogoRef.current = (nextLogoRef.current + 1) % ALL_LOGOS.length;

//       // Pick a random slot, excluding the one replaced on the previous tick.
//       const last = lastReplacedSlotRef.current;
//       let targetSlot = randInt(VISIBLE_SLOTS);
//       if (targetSlot === last) {
//         targetSlot = (targetSlot + 1) % VISIBLE_SLOTS;
//       }
//       lastReplacedSlotRef.current = targetSlot;

//       setAnimatingSlot(targetSlot);
//       setVisibleSlots((prev) => {
//         const next = [...prev];
//         next[targetSlot] = incomingLogoIdx;
//         return next;
//       });

//       // Clear animating flag after transition completes
//       setTimeout(() => setAnimatingSlot(null), 550);
//     }, SWAP_INTERVAL_MS);

//     return () => clearInterval(timer);
//   }, []);

//   let visibleSlotCursor = 0;

//   const cells = Array.from({ length: TOTAL_CELLS }, (_, cellIdx) => {
//     const isLastCol = (cellIdx + 1) % GRID_COLS === 0;
//     const isLastRow = cellIdx >= TOTAL_CELLS - GRID_COLS;

//     const borderClasses = [
//       !isLastCol ? "border-e" : "",
//       !isLastRow ? "border-b" : "",
//       "border-foreground/7",
//     ]
//       .filter(Boolean)
//       .join(" ");

//     if (EMPTY_SLOT_INDICES.has(cellIdx)) {
//       return (
//         <div
//           key={cellIdx}
//           className={`flex h-24 items-center justify-center ${borderClasses}`}
//         />
//       );
//     }

//     const slotIndex = visibleSlotCursor++;
//     const isAnimating = animatingSlot === slotIndex;

//     return (
//       <div
//         key={cellIdx}
//         className={`relative flex h-24 items-center justify-center overflow-hidden ${borderClasses}`}
//       >
//         <LogoCell
//           logoIndex={visibleSlots[slotIndex]}
//           isAnimating={isAnimating}
//         />
//       </div>
//     );
//   });

//   return (
//     <Section className="min-h-[unset]" containerClassName="py-0!">
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%,#3b82f61f_0%,#0000_70%)] sm:bg-[radial-gradient(50%_40%_at_50%_50%,rgba(59,130,246,0.16)_0%,transparent_72%)] md:bg-[radial-gradient(75%_70%,#3b82f624_0%,#0000_65%)] lg:bg-[radial-gradient(85%_80%,#3b82f624_0%,#0000_65%)] dark:bg-[radial-gradient(60%_60%,#2347814d_0%,#0000_70%)] dark:sm:bg-[radial-gradient(75%_75%,#17397047_0%,#0000_72%)] dark:md:bg-[radial-gradient(70%_60%,#1f437c42_0%,#0000_75%)] dark:lg:bg-[radial-gradient(55%_57%,#2e579b42_0%,#0000_75%)]" />

//         <div
//           className="relative grid"
//           style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
//         >
//           {cells}
//         </div>
//       </div>
//     </Section>
//   );
// }
