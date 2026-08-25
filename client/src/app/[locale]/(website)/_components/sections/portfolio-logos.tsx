"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import Section from "@/components/common/section";
import { Link } from "@/i18n/navigation";

const PERSIAN_LOGOS = [
  {
    name: "company-0",
    logo: "/images/portfolio/persian/1.newpoosh.png",
    href: "https://newpoosh.com/",
  },
  {
    name: "company-6",
    logo: "/images/portfolio/persian/7.jooyab.png",
    href: "",
  },

  {
    name: "company-1",
    logo: "/images/portfolio/persian/2.parhoon.png",
    href: "https://parhoonshop.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/persian/3.remowin.png",
    href: "https://remowin.com/",
  },

  {
    name: "company-5",
    logo: "/images/portfolio/persian/5.joorlnd.png",
    href: "https://joorland.com/",
  },
  {
    name: "company-7",
    logo: "/images/portfolio/persian/13.iransalem.png",
    href: "",
  },
  {
    name: "company-8",
    logo: "/images/portfolio/persian/15.tarhandishan.png",
    href: "https://tarhandishan.shop/",
  },
  {
    name: "company-9",
    logo: "/images/portfolio/persian/17.gamario.png",
    href: "https://gamario.com/",
  },
  {
    name: "company-10",
    logo: "/images/portfolio/persian/barghe zomorod PNG.png",
    href: "https://barghezomorod.com/",
  },
  {
    name: "company-11",
    logo: "/images/portfolio/persian/bobespresso.png",
    href: "",
  },
  {
    name: "company-13",
    logo: "/images/portfolio/persian/dyan kala.png",
    href: "",
  },
  {
    name: "company-14",
    logo: "/images/portfolio/persian/fixabzar.png",
    href: "https://fixabzar.com/",
  },
  {
    name: "company-15",
    logo: "/images/portfolio/persian/lakpack.png",
    href: "",
  },
  {
    name: "company-16",
    logo: "/images/portfolio/persian/technobenis.png",
    href: "https://technobenis.com/",
  },
];

const ENGLISH_LOGOS = [
  {
    name: "company-5",
    logo: "/images/portfolio/english/12.behpoosh.png",
    href: "https://behpooshshop.com/",
  },

  {
    name: "company-1",
    logo: "/images/portfolio/english/8.netoff.png",
    href: "https://netoffshop.ir/",
  },
  {
    name: "company-0",
    logo: "/images/portfolio/english/6.gallery khas.png",
    href: "https://gallerykhas.com/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/english/10.kalaoma.png",
    href: "https://kalaoma.com/",
  },
  {
    name: "company-6",
    logo: "/images/portfolio/english/14.markopoosh.png",
    href: "https://markopoosh.com/",
  },
  {
    name: "company-7",
    logo: "/images/portfolio/english/22.maxbax.png",
    href: "https://newpoosh.com/",
  },
  {
    name: "company-8",
    logo: "/images/portfolio/english/hazhirshop.png",
    href: "https://maxbax.com/",
  },
  {
    name: "company-9",
    logo: "/images/portfolio/english/iliagadgets.png",
    href: "https://iliagadgets.com/",
  },
  {
    name: "company-10",
    logo: "/images/portfolio/english/lunapoosh.png",
    href: "",
  },
  {
    name: "company-11",
    logo: "/images/portfolio/english/navikmax.png",
    href: "https://navikmax.com/",
  },
];

const BOLD_LOGOS = [
  {
    name: "company-4",
    logo: "/images/portfolio/bold/salibar.png",
    href: "",
  },
  {
    name: "company-0",
    logo: "/images/portfolio/bold/4.farcoland.png",
    href: "https://farcoland.com/",
  },
  {
    name: "company-1",
    logo: "/images/portfolio/bold/18.ifoods.png",
    href: "https://ifoods.ir/shop/",
  },
  {
    name: "company-3",
    logo: "/images/portfolio/bold/papis.png",
    href: "https://papis.ir/my-orders/",
  },
];

const GRID_COLUMNS_COUNT = 4;
const TOTAL_CELLS_COUNT = 12;
const EMPTY_CELL_INDICES = new Set([8, 11]);

const PERSIAN_ROW_COLUMNS_COUNT = 4;
const ENGLISH_ROW_COLUMNS_COUNT = 4;
const BOLD_ROW_COLUMNS_COUNT = 2;

const SWAP_INTERVAL_MILLISECONDS = 2200;
const ANIMATION_DURATION_RESET_MILLISECONDS = 550;

type PortfolioLogo =
  | (typeof PERSIAN_LOGOS)[number]
  | (typeof ENGLISH_LOGOS)[number]
  | (typeof BOLD_LOGOS)[number];

type LogoRowId = "persian" | "english" | "bold";

type LogoRowConfig = {
  rowId: LogoRowId;
  logos: readonly PortfolioLogo[];
  visibleSlotsCount: number;
};

type VisibleLogoRow = {
  rowId: LogoRowId;
  logos: PortfolioLogo[];
};

type AnimatingCell = {
  rowId: LogoRowId;
  slotIndex: number;
} | null;

type GridCellSlot = {
  rowId: LogoRowId;
  slotIndex: number;
} | null;

const LOGO_ROWS = [
  {
    rowId: "persian",
    logos: PERSIAN_LOGOS,
    visibleSlotsCount: PERSIAN_ROW_COLUMNS_COUNT,
  },
  {
    rowId: "english",
    logos: ENGLISH_LOGOS,
    visibleSlotsCount: ENGLISH_ROW_COLUMNS_COUNT,
  },
  {
    rowId: "bold",
    logos: BOLD_LOGOS,
    visibleSlotsCount: BOLD_ROW_COLUMNS_COUNT,
  },
] as const satisfies readonly LogoRowConfig[];

function getRandomInteger(maximum: number): number {
  return Math.floor(Math.random() * maximum);
}

function shuffleArray<T>(array: readonly T[]): T[] {
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

function getLogoKey(logo: PortfolioLogo): string {
  return logo.logo;
}

function getUniqueLogos(logos: readonly PortfolioLogo[]): PortfolioLogo[] {
  const seenLogoKeys = new Set<string>();

  return logos.filter((logo) => {
    const logoKey = getLogoKey(logo);

    if (seenLogoKeys.has(logoKey)) {
      return false;
    }

    seenLogoKeys.add(logoKey);
    return true;
  });
}

function getRowConfig(rowId: LogoRowId): LogoRowConfig {
  return LOGO_ROWS.find((row) => row.rowId === rowId)!;
}

function getGridCellSlot(cellIndex: number): GridCellSlot {
  if (EMPTY_CELL_INDICES.has(cellIndex)) {
    return null;
  }

  if (cellIndex >= 0 && cellIndex <= 3) {
    return {
      rowId: "persian",
      slotIndex: cellIndex,
    };
  }

  if (cellIndex >= 4 && cellIndex <= 7) {
    return {
      rowId: "english",
      slotIndex: cellIndex - 4,
    };
  }

  if (cellIndex === 9) {
    return {
      rowId: "bold",
      slotIndex: 0,
    };
  }

  if (cellIndex === 10) {
    return {
      rowId: "bold",
      slotIndex: 1,
    };
  }

  return null;
}

function createInitialVisibleRows(): VisibleLogoRow[] {
  return LOGO_ROWS.map((row) => {
    const selectedLogos = shuffleArray(getUniqueLogos(row.logos)).slice(
      0,
      row.visibleSlotsCount,
    );

    return {
      rowId: row.rowId,
      logos: selectedLogos,
    };
  });
}

function repairDuplicateLogosInRows(
  visibleRows: readonly VisibleLogoRow[],
): VisibleLogoRow[] {
  return visibleRows.map((row) => {
    const rowConfig = getRowConfig(row.rowId);
    const rowLogoPool = shuffleArray(getUniqueLogos(rowConfig.logos));
    const usedLogoKeys = new Set<string>();

    const repairedLogos = Array.from(
      { length: rowConfig.visibleSlotsCount },
      (_, slotIndex) => {
        const currentLogo = row.logos[slotIndex];
        const currentLogoKey = currentLogo ? getLogoKey(currentLogo) : null;

        if (
          currentLogo &&
          currentLogoKey &&
          !usedLogoKeys.has(currentLogoKey)
        ) {
          usedLogoKeys.add(currentLogoKey);
          return currentLogo;
        }

        const replacementLogo = rowLogoPool.find((candidateLogo) => {
          const candidateLogoKey = getLogoKey(candidateLogo);

          return !usedLogoKeys.has(candidateLogoKey);
        });

        if (replacementLogo) {
          usedLogoKeys.add(getLogoKey(replacementLogo));
          return replacementLogo;
        }

        return currentLogo;
      },
    ).filter(Boolean) as PortfolioLogo[];

    return {
      rowId: row.rowId,
      logos: repairedLogos,
    };
  });
}

interface LogoCellProps {
  logo: PortfolioLogo;
  shouldAnimate: boolean;
}

function LogoCell({ logo, shouldAnimate }: LogoCellProps) {
  const wrapperClassName =
    "relative m-2 sm:mx-4 flex h-full md:mx-6 w-full items-center justify-center lg:mx-4 lg:my-2 lg:aspect-120/36 lg:w-[50%] 2xl:w-[40%]";

  const imageElement = (
    <Image
      src={logo.logo}
      alt={logo.name}
      className="object-contain dark:invert-0"
      fill
      unoptimized
    />
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={getLogoKey(logo)}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex h-full w-full items-center justify-center"
      >
        {logo.href ? (
          <Link href={logo.href} target="_blank" className={wrapperClassName}>
            {imageElement}
          </Link>
        ) : (
          <div className={wrapperClassName}>{imageElement}</div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export type PortfolioLogosProps = { id?: string };

export default function PortfolioLogos({ id }: PortfolioLogosProps) {
  const [visibleRows, setVisibleRows] = useState<VisibleLogoRow[]>(() =>
    createInitialVisibleRows(),
  );

  const [animatingCell, setAnimatingCell] = useState<AnimatingCell>(null);

  const targetSlotSequenceQueue = useRef<Record<LogoRowId, number[]>>({
    persian: [],
    english: [],
    bold: [],
  });

  const targetRowSequenceQueue = useRef<LogoRowId[]>([]);

  const resetAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisibleRows((currentVisibleRows) => {
        const repairedVisibleRows =
          repairDuplicateLogosInRows(currentVisibleRows);

        const eligibleRowIds = LOGO_ROWS.filter((rowConfig) => {
          const currentRow = repairedVisibleRows.find(
            (row) => row.rowId === rowConfig.rowId,
          );

          if (!currentRow || currentRow.logos.length === 0) {
            return false;
          }

          const visibleRowLogoKeys = new Set(currentRow.logos.map(getLogoKey));

          return getUniqueLogos(rowConfig.logos).some(
            (logo) => !visibleRowLogoKeys.has(getLogoKey(logo)),
          );
        }).map((rowConfig) => rowConfig.rowId);

        if (eligibleRowIds.length === 0) {
          return repairedVisibleRows;
        }

        if (
          targetRowSequenceQueue.current.length === 0 ||
          !targetRowSequenceQueue.current.some((rowId) =>
            eligibleRowIds.includes(rowId),
          )
        ) {
          targetRowSequenceQueue.current = shuffleArray(eligibleRowIds);
        }

        let targetRowId = targetRowSequenceQueue.current.pop();

        while (targetRowId && !eligibleRowIds.includes(targetRowId)) {
          targetRowId = targetRowSequenceQueue.current.pop();
        }

        if (!targetRowId) {
          return repairedVisibleRows;
        }

        const targetRow = repairedVisibleRows.find(
          (row) => row.rowId === targetRowId,
        );

        if (!targetRow) {
          return repairedVisibleRows;
        }

        const targetRowConfig = getRowConfig(targetRowId);

        if (targetSlotSequenceQueue.current[targetRowId].length === 0) {
          targetSlotSequenceQueue.current[targetRowId] = shuffleArray(
            Array.from(
              { length: targetRowConfig.visibleSlotsCount },
              (_, index) => index,
            ),
          );
        }

        const targetSlotIndex =
          targetSlotSequenceQueue.current[targetRowId].pop();

        if (targetSlotIndex === undefined) {
          return repairedVisibleRows;
        }

        const visibleTargetRowLogoKeysExceptTarget = new Set(
          targetRow.logos
            .filter((_, slotIndex) => slotIndex !== targetSlotIndex)
            .map(getLogoKey),
        );

        const outgoingLogo = targetRow.logos[targetSlotIndex];
        const outgoingLogoKey = outgoingLogo ? getLogoKey(outgoingLogo) : null;

        const availableIncomingLogos = getUniqueLogos(
          targetRowConfig.logos,
        ).filter((logo) => {
          const logoKey = getLogoKey(logo);

          return (
            logoKey !== outgoingLogoKey &&
            !visibleTargetRowLogoKeysExceptTarget.has(logoKey)
          );
        });

        if (availableIncomingLogos.length === 0) {
          return repairedVisibleRows;
        }

        const incomingLogo =
          availableIncomingLogos[
            getRandomInteger(availableIncomingLogos.length)
          ];

        setAnimatingCell({
          rowId: targetRowId,
          slotIndex: targetSlotIndex,
        });

        if (resetAnimationTimeoutRef.current) {
          clearTimeout(resetAnimationTimeoutRef.current);
        }

        resetAnimationTimeoutRef.current = setTimeout(() => {
          setAnimatingCell(null);
        }, ANIMATION_DURATION_RESET_MILLISECONDS);

        return repairedVisibleRows.map((row) => {
          if (row.rowId !== targetRowId) {
            return row;
          }

          const updatedLogos = [...row.logos];
          updatedLogos[targetSlotIndex] = incomingLogo;

          return {
            ...row,
            logos: updatedLogos,
          };
        });
      });
    }, SWAP_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(intervalId);

      if (resetAnimationTimeoutRef.current) {
        clearTimeout(resetAnimationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Section
      id={id}
      className="min-h-[unset]"
      containerClassName="py-0! lg:py-12!"
    >
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

            const gridCellSlot = getGridCellSlot(cellIndex);

            if (!gridCellSlot) {
              return (
                <div
                  key={cellIndex}
                  className={`flex h-24 items-center justify-center ${borderClasses}`}
                />
              );
            }

            const currentRow = visibleRows.find(
              (row) => row.rowId === gridCellSlot.rowId,
            );

            const logo = currentRow?.logos[gridCellSlot.slotIndex];

            const shouldAnimate =
              animatingCell?.rowId === gridCellSlot.rowId &&
              animatingCell.slotIndex === gridCellSlot.slotIndex;

            return (
              <div
                key={cellIndex}
                className={`relative flex h-24 items-center justify-center overflow-hidden ${borderClasses}`}
              >
                {logo && (
                  <LogoCell logo={logo} shouldAnimate={shouldAnimate} />
                )}
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

// const PERSIAN_LOGOS = [
//   {
//     name: "company-0",
//     logo: "/images/portfolio/persian/1.newpoosh.png",
//     href: "https://newpoosh.com/",
//   },
//   {
//     name: "company-1",
//     logo: "/images/portfolio/persian/2.parhoon.png",
//     href: "https://parhoonshop.com/",
//   },
//   {
//     name: "company-3",
//     logo: "/images/portfolio/persian/3.remowin.png",
//     href: "https://remowin.com/",
//   },
//   {
//     name: "company-5",
//     logo: "/images/portfolio/persian/5.joorlnd.png",
//     href: "https://joorland.com/",
//   },
//   {
//     name: "company-6",
//     logo: "/images/portfolio/persian/7.jooyab.png",
//     href: "",
//   },
//   {
//     name: "company-7",
//     logo: "/images/portfolio/persian/13.iransalem.png",
//     href: "",
//   },
//   {
//     name: "company-8",
//     logo: "/images/portfolio/persian/15.tarhandishan.png",
//     href: "https://tarhandishan.shop/",
//   },
//   {
//     name: "company-9",
//     logo: "/images/portfolio/persian/17.gamario.png",
//     href: "https://gamario.com/",
//   },
//   {
//     name: "company-10",
//     logo: "/images/portfolio/persian/barghe zomorod PNG.png",
//     href: "https://barghezomorod.com/",
//   },
//   {
//     name: "company-11",
//     logo: "/images/portfolio/persian/bobespresso.png",
//     href: "",
//   },
//   {
//     name: "company-13",
//     logo: "/images/portfolio/persian/dyan kala.png",
//     href: "",
//   },
//   {
//     name: "company-14",
//     logo: "/images/portfolio/persian/fixabzar.png",
//     href: "https://fixabzar.com/",
//   },
//   {
//     name: "company-15",
//     logo: "/images/portfolio/persian/lakpack.png",
//     href: "",
//   },
//   {
//     name: "company-16",
//     logo: "/images/portfolio/persian/technobenis.png",
//     href: "https://technobenis.com/",
//   },
// ];

// const ENGLISH_LOGOS = [
//   {
//     name: "company-0",
//     logo: "/images/portfolio/english/6.gallery khas.png",
//     href: "https://gallerykhas.com/",
//   },
//   {
//     name: "company-1",
//     logo: "/images/portfolio/english/8.netoff.png",
//     href: "https://netoffshop.ir/",
//   },
//   {
//     name: "company-3",
//     logo: "/images/portfolio/english/10.kalaoma.png",
//     href: "https://kalaoma.com/",
//   },
//   {
//     name: "company-5",
//     logo: "/images/portfolio/english/12.behpoosh.png",
//     href: "https://behpooshshop.com/",
//   },
//   {
//     name: "company-6",
//     logo: "/images/portfolio/english/14.markopoosh.png",
//     href: "https://markopoosh.com/",
//   },
//   {
//     name: "company-7",
//     logo: "/images/portfolio/english/22.maxbax.png",
//     href: "https://newpoosh.com/",
//   },
//   {
//     name: "company-8",
//     logo: "/images/portfolio/english/hazhirshop.png",
//     href: "https://maxbax.com/",
//   },
//   {
//     name: "company-9",
//     logo: "/images/portfolio/english/iliagadgets.png",
//     href: "https://iliagadgets.com/",
//   },
//   {
//     name: "company-10",
//     logo: "/images/portfolio/english/lunapoosh.png",
//     href: "",
//   },
//   {
//     name: "company-11",
//     logo: "/images/portfolio/english/navikmax.png",
//     href: "https://navikmax.com/",
//   },
// ];

// const BOLD_LOGOS = [
//   {
//     name: "company-0",
//     logo: "/images/portfolio/bold/4.farcoland.png",
//     href: "https://farcoland.com/",
//   },
//   {
//     name: "company-1",
//     logo: "/images/portfolio/bold/18.ifoods.png",
//     href: "https://ifoods.ir/shop/",
//   },
//   {
//     name: "company-3",
//     logo: "/images/portfolio/bold/papis.png",
//     href: "https://papis.ir/my-orders/",
//   },
//   {
//     name: "company-4",
//     logo: "/images/portfolio/bold/salibar.png",
//     href: "",
//   },
// ];

// const GRID_COLUMNS_COUNT = 4;
// const TOTAL_CELLS_COUNT = 12;
// const EMPTY_CELL_INDICES = new Set([8, 11]);

// const PERSIAN_ROW_COLUMNS_COUNT = 4;
// const ENGLISH_ROW_COLUMNS_COUNT = 4;
// const BOLD_ROW_COLUMNS_COUNT = 2;

// const SWAP_INTERVAL_MILLISECONDS = 2200;
// const ANIMATION_DURATION_RESET_MILLISECONDS = 550;

// type PortfolioLogo =
//   | (typeof PERSIAN_LOGOS)[number]
//   | (typeof ENGLISH_LOGOS)[number]
//   | (typeof BOLD_LOGOS)[number];

// type LogoRowId = "persian" | "english" | "bold";

// type LogoRowConfig = {
//   rowId: LogoRowId;
//   logos: readonly PortfolioLogo[];
//   visibleSlotsCount: number;
// };

// type VisibleLogoRow = {
//   rowId: LogoRowId;
//   logos: PortfolioLogo[];
// };

// type AnimatingCell = {
//   rowId: LogoRowId;
//   slotIndex: number;
// } | null;

// type GridCellSlot = {
//   rowId: LogoRowId;
//   slotIndex: number;
// } | null;

// const LOGO_ROWS = [
//   {
//     rowId: "persian",
//     logos: PERSIAN_LOGOS,
//     visibleSlotsCount: PERSIAN_ROW_COLUMNS_COUNT,
//   },
//   {
//     rowId: "english",
//     logos: ENGLISH_LOGOS,
//     visibleSlotsCount: ENGLISH_ROW_COLUMNS_COUNT,
//   },
//   {
//     rowId: "bold",
//     logos: BOLD_LOGOS,
//     visibleSlotsCount: BOLD_ROW_COLUMNS_COUNT,
//   },
// ] as const satisfies readonly LogoRowConfig[];

// function getRandomInteger(maximum: number): number {
//   return Math.floor(Math.random() * maximum);
// }

// function shuffleArray<T>(array: readonly T[]): T[] {
//   const shallowCopy = [...array];

//   for (let index = shallowCopy.length - 1; index > 0; index--) {
//     const swapTargetIndex = getRandomInteger(index + 1);

//     [shallowCopy[index], shallowCopy[swapTargetIndex]] = [
//       shallowCopy[swapTargetIndex],
//       shallowCopy[index],
//     ];
//   }

//   return shallowCopy;
// }

// function getLogoKey(logo: PortfolioLogo): string {
//   return logo.logo;
// }

// function getUniqueLogos(logos: readonly PortfolioLogo[]): PortfolioLogo[] {
//   const seenLogoKeys = new Set<string>();

//   return logos.filter((logo) => {
//     const logoKey = getLogoKey(logo);

//     if (seenLogoKeys.has(logoKey)) {
//       return false;
//     }

//     seenLogoKeys.add(logoKey);
//     return true;
//   });
// }

// function getRowConfig(rowId: LogoRowId): LogoRowConfig {
//   return LOGO_ROWS.find((row) => row.rowId === rowId)!;
// }

// function getGridCellSlot(cellIndex: number): GridCellSlot {
//   if (EMPTY_CELL_INDICES.has(cellIndex)) {
//     return null;
//   }

//   if (cellIndex >= 0 && cellIndex <= 3) {
//     return {
//       rowId: "persian",
//       slotIndex: cellIndex,
//     };
//   }

//   if (cellIndex >= 4 && cellIndex <= 7) {
//     return {
//       rowId: "english",
//       slotIndex: cellIndex - 4,
//     };
//   }

//   if (cellIndex === 9) {
//     return {
//       rowId: "bold",
//       slotIndex: 0,
//     };
//   }

//   if (cellIndex === 10) {
//     return {
//       rowId: "bold",
//       slotIndex: 1,
//     };
//   }

//   return null;
// }

// function createInitialVisibleRows(): VisibleLogoRow[] {
//   const globallyUsedLogoKeys = new Set<string>();

//   return LOGO_ROWS.map((row) => {
//     const availableLogos = shuffleArray(getUniqueLogos(row.logos)).filter(
//       (logo) => !globallyUsedLogoKeys.has(getLogoKey(logo)),
//     );

//     const selectedLogos = availableLogos.slice(0, row.visibleSlotsCount);

//     selectedLogos.forEach((logo) => {
//       globallyUsedLogoKeys.add(getLogoKey(logo));
//     });

//     return {
//       rowId: row.rowId,
//       logos: selectedLogos,
//     };
//   });
// }

// interface LogoCellProps {
//   logo: PortfolioLogo;
//   shouldAnimate: boolean;
// }

// function LogoCell({ logo, shouldAnimate }: LogoCellProps) {
//   const wrapperClassName =
//     "relative m-2 sm:mx-4 flex h-full md:mx-6 w-full items-center justify-center lg:mx-4 lg:my-2 lg:aspect-120/36 lg:w-[50%] 2xl:w-[40%]";

//   const imageElement = (
//     <Image
//       src={logo.logo}
//       alt={logo.name}
//       className="object-contain dark:invert-0"
//       fill
//       unoptimized
//     />
//   );

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={getLogoKey(logo)}
//         initial={shouldAnimate ? { opacity: 0 } : false}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.5, ease: "easeInOut" }}
//         className="flex h-full w-full items-center justify-center"
//       >
//         {logo.href ? (
//           <Link href={logo.href} target="_blank" className={wrapperClassName}>
//             {imageElement}
//           </Link>
//         ) : (
//           <div className={wrapperClassName}>{imageElement}</div>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default function PortfolioLogos() {
//   const [visibleRows, setVisibleRows] = useState<VisibleLogoRow[]>(() =>
//     createInitialVisibleRows(),
//   );

//   const [animatingCell, setAnimatingCell] = useState<AnimatingCell>(null);

//   const targetSlotSequenceQueue = useRef<Record<LogoRowId, number[]>>({
//     persian: [],
//     english: [],
//     bold: [],
//   });

//   const targetRowSequenceQueue = useRef<LogoRowId[]>([]);

//   const resetAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
//     null,
//   );

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setVisibleRows((currentVisibleRows) => {
//         const globallyVisibleLogoKeys = new Set(
//           currentVisibleRows.flatMap((row) => row.logos.map(getLogoKey)),
//         );

//         const eligibleRowIds = LOGO_ROWS.filter((rowConfig) => {
//           const currentRow = currentVisibleRows.find(
//             (row) => row.rowId === rowConfig.rowId,
//           );

//           if (!currentRow || currentRow.logos.length === 0) {
//             return false;
//           }

//           const availableLogos = getUniqueLogos(rowConfig.logos).filter(
//             (logo) => !globallyVisibleLogoKeys.has(getLogoKey(logo)),
//           );

//           return availableLogos.length > 0;
//         }).map((rowConfig) => rowConfig.rowId);

//         if (eligibleRowIds.length === 0) {
//           return currentVisibleRows;
//         }

//         if (
//           targetRowSequenceQueue.current.length === 0 ||
//           !targetRowSequenceQueue.current.some((rowId) =>
//             eligibleRowIds.includes(rowId),
//           )
//         ) {
//           targetRowSequenceQueue.current = shuffleArray(eligibleRowIds);
//         }

//         let targetRowId = targetRowSequenceQueue.current.pop();

//         while (targetRowId && !eligibleRowIds.includes(targetRowId)) {
//           targetRowId = targetRowSequenceQueue.current.pop();
//         }

//         if (!targetRowId) {
//           return currentVisibleRows;
//         }

//         const targetRow = currentVisibleRows.find(
//           (row) => row.rowId === targetRowId,
//         );

//         if (!targetRow) {
//           return currentVisibleRows;
//         }

//         const targetRowConfig = getRowConfig(targetRowId);

//         if (targetSlotSequenceQueue.current[targetRowId].length === 0) {
//           targetSlotSequenceQueue.current[targetRowId] = shuffleArray(
//             Array.from(
//               { length: targetRowConfig.visibleSlotsCount },
//               (_, index) => index,
//             ),
//           );
//         }

//         const targetSlotIndex =
//           targetSlotSequenceQueue.current[targetRowId].pop();

//         if (targetSlotIndex === undefined) {
//           return currentVisibleRows;
//         }

//         const availableIncomingLogos = getUniqueLogos(
//           targetRowConfig.logos,
//         ).filter((logo) => !globallyVisibleLogoKeys.has(getLogoKey(logo)));

//         if (availableIncomingLogos.length === 0) {
//           return currentVisibleRows;
//         }

//         const incomingLogo =
//           availableIncomingLogos[
//             getRandomInteger(availableIncomingLogos.length)
//           ];

//         setAnimatingCell({
//           rowId: targetRowId,
//           slotIndex: targetSlotIndex,
//         });

//         if (resetAnimationTimeoutRef.current) {
//           clearTimeout(resetAnimationTimeoutRef.current);
//         }

//         resetAnimationTimeoutRef.current = setTimeout(() => {
//           setAnimatingCell(null);
//         }, ANIMATION_DURATION_RESET_MILLISECONDS);

//         return currentVisibleRows.map((row) => {
//           if (row.rowId !== targetRowId) {
//             return row;
//           }

//           const updatedLogos = [...row.logos];
//           updatedLogos[targetSlotIndex] = incomingLogo;

//           return {
//             ...row,
//             logos: updatedLogos,
//           };
//         });
//       });
//     }, SWAP_INTERVAL_MILLISECONDS);

//     return () => {
//       clearInterval(intervalId);

//       if (resetAnimationTimeoutRef.current) {
//         clearTimeout(resetAnimationTimeoutRef.current);
//       }
//     };
//   }, []);

//   return (
//     <Section className="min-h-[unset]" containerClassName="py-0!">
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%,#3b82f61f_0%,#0000_70%)] sm:bg-[radial-gradient(50%_40%_at_50%_50%,rgba(59,130,246,0.16)_0%,transparent_72%)] md:bg-[radial-gradient(75%_70%,#3b82f624_0%,#0000_65%)] lg:bg-[radial-gradient(85%_80%,#3b82f624_0%,#0000_65%)] dark:bg-[radial-gradient(60%_60%,#2347814d_0%,#0000_70%)] dark:sm:bg-[radial-gradient(75%_75%,#17397047_0%,#0000_72%)] dark:md:bg-[radial-gradient(70%_60%,#1f437c42_0%,#0000_75%)] dark:lg:bg-[radial-gradient(55%_57%,#2e579b42_0%,#0000_75%)]" />

//         <div
//           className="relative grid"
//           style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS_COUNT}, 1fr)` }}
//         >
//           {Array.from({ length: TOTAL_CELLS_COUNT }, (_, cellIndex) => {
//             const isLastColumn = (cellIndex + 1) % GRID_COLUMNS_COUNT === 0;
//             const isLastRow =
//               cellIndex >= TOTAL_CELLS_COUNT - GRID_COLUMNS_COUNT;

//             const borderClasses = [
//               !isLastColumn ? "border-e" : "",
//               !isLastRow ? "border-b" : "",
//               "border-foreground/7",
//             ]
//               .filter(Boolean)
//               .join(" ");

//             const gridCellSlot = getGridCellSlot(cellIndex);

//             if (!gridCellSlot) {
//               return (
//                 <div
//                   key={cellIndex}
//                   className={`flex h-24 items-center justify-center ${borderClasses}`}
//                 />
//               );
//             }

//             const currentRow = visibleRows.find(
//               (row) => row.rowId === gridCellSlot.rowId,
//             );

//             const logo = currentRow?.logos[gridCellSlot.slotIndex];

//             const shouldAnimate =
//               animatingCell?.rowId === gridCellSlot.rowId &&
//               animatingCell.slotIndex === gridCellSlot.slotIndex;

//             return (
//               <div
//                 key={cellIndex}
//                 className={`relative flex h-24 items-center justify-center overflow-hidden ${borderClasses}`}
//               >
//                 {logo ? (
//                   <LogoCell logo={logo} shouldAnimate={shouldAnimate} />
//                 ) : null}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </Section>
//   );
// }
