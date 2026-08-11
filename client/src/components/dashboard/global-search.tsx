"use client";

import {
  BookOpenText,
  ChevronRight,
  Globe2,
  Headphones,
  History,
  LayoutGrid,
  LifeBuoy,
  MessageSquarePlus,
  Plus,
  Search,
  SearchX,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { Link, useRouter } from "@/i18n/navigation";
import {
  defaultRecentSearchIds,
  globalSearchSources,
  type GlobalSearchGroup,
  type GlobalSearchSource,
  quickActionSearchIds,
  suggestedDestinationSearchIds,
} from "@/lib/data/search/global-search-data";
import { cn } from "@/lib/utils";

type SearchItemIcon =
  | "website"
  | "ticket"
  | "help"
  | "addWebsite"
  | "createTicket"
  | "viewActivities"
  | "websites"
  | "tickets"
  | "helpCenter";

interface GlobalSearchItem {
  id: string;
  group: GlobalSearchGroup;
  href: string;
  label: string;
  context: string;
  meta: string;
  icon: SearchItemIcon;
  searchText: string;
  statusTone?: "default" | "success" | "warning";
}

interface SearchSection {
  id: string;
  label: string;
  items: GlobalSearchItem[];
}

const recentStorageKey = "unixsee-global-search-recent-v1";
const groupOrder: GlobalSearchGroup[] = [
  "websites",
  "tickets",
  "helpCenter",
  "pagesActions",
];

const searchIcons: Record<SearchItemIcon, LucideIcon> = {
  website: Globe2,
  ticket: Ticket,
  help: BookOpenText,
  addWebsite: Plus,
  createTicket: MessageSquarePlus,
  viewActivities: History,
  websites: LayoutGrid,
  tickets: Headphones,
  helpCenter: LifeBuoy,
};

function subscribeToPlatform() {
  return () => undefined;
}

function getClientShortcut() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘ K" : "Ctrl + K";
}

function getServerShortcut() {
  return "Ctrl K";
}

function readStoredRecentIds() {
  try {
    const storedValue = window.localStorage.getItem(recentStorageKey);
    if (!storedValue) return undefined;

    const stored = JSON.parse(storedValue);
    if (
      Array.isArray(stored) &&
      stored.length > 0 &&
      stored.every((id) => typeof id === "string")
    ) {
      return stored.slice(0, 4) as string[];
    }
  } catch {
    // Keep deterministic defaults when storage is unavailable or malformed.
  }

  return undefined;
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/\u200c/g, " ")
    .toLocaleLowerCase()
    .trim();
}

function filterItems(items: readonly GlobalSearchItem[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return [];

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return items
    .filter((item) => {
      const haystack = normalizeSearchValue(item.searchText);
      return terms.every((term) => haystack.includes(term));
    })
    .sort((first, second) => {
      const firstLabel = normalizeSearchValue(first.label);
      const secondLabel = normalizeSearchValue(second.label);
      const firstRank = firstLabel.startsWith(normalizedQuery)
        ? 0
        : firstLabel.includes(normalizedQuery)
          ? 1
          : 2;
      const secondRank = secondLabel.startsWith(normalizedQuery)
        ? 0
        : secondLabel.includes(normalizedQuery)
          ? 1
          : 2;
      return firstRank - secondRank;
    });
}

function itemStatusTone(source: GlobalSearchSource) {
  if (source.group === "websites") {
    if (source.status === "online") return "success" as const;
    if (source.status === "needsAttention") return "warning" as const;
  }

  if (source.group === "tickets") {
    if (source.status === "resolved" || source.status === "closed") {
      return "success" as const;
    }
    if (source.status === "waiting_for_user") return "warning" as const;
  }

  return "default" as const;
}

const fixtureTicketStatusKey = {
  submitted: "SUBMITTED",
  in_progress: "IN_PROGRESS",
  waiting_for_user: "WAITING_CUSTOMER",
  resolved: "RESOLVED",
  closed: "CLOSED",
} as const;

function useLocalizedGlobalSearchItems() {
  const t = useTranslations("Header.globalSearch");
  const websites = useTranslations("Websites");
  const tickets = useTranslations("Tickets");
  const helpCenter = useTranslations("HelpCenter");

  return globalSearchSources.map((source): GlobalSearchItem => {
    if (source.group === "websites") {
      const meta = websites(`tabs.${source.status}`);
      return {
        id: source.id,
        group: source.group,
        href: source.href,
        label: source.name,
        context: source.domain,
        meta,
        icon: "website",
        searchText: `${source.name} ${source.domain} ${meta}`,
        statusTone: itemStatusTone(source),
      };
    }

    if (source.group === "tickets") {
      const label = tickets(`fixtures.subjects.${source.subjectKey}`);
      const meta = tickets(
        `statuses.${fixtureTicketStatusKey[source.status]}`,
      );
      const websiteContext = source.websiteName
        ? ` · ${source.websiteName}`
        : "";
      return {
        id: source.id,
        group: source.group,
        href: source.href,
        label,
        context: `#${source.number}${websiteContext}`,
        meta,
        icon: "ticket",
        searchText: `${source.number} ${label} ${source.websiteName ?? ""} ${source.websiteDomain ?? ""} ${meta}`,
        statusTone: itemStatusTone(source),
      };
    }

    if (source.group === "helpCenter") {
      const titleKey = `topicPages.${source.topicKey}.articles.${source.articleKey}.title`;
      const label = String(helpCenter.raw(titleKey as never));
      const context = helpCenter(`topics.items.${source.topicKey}.title`);
      const meta = t("types.helpArticle");
      return {
        id: source.id,
        group: source.group,
        href: source.href,
        label,
        context,
        meta,
        icon: "help",
        searchText: `${label} ${context} ${meta}`,
      };
    }

    const label = t(`items.${source.itemKey}.label`);
    const context = t(`items.${source.itemKey}.description`);
    const meta = t(`types.${source.itemType}`);
    return {
      id: source.id,
      group: source.group,
      href: source.href,
      label,
      context,
      meta,
      icon: source.itemKey,
      searchText: `${label} ${context} ${meta}`,
    };
  });
}

function getItemsById(
  items: readonly GlobalSearchItem[],
  ids: readonly string[],
) {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = itemMap.get(id);
    return item ? [item] : [];
  });
}

function highlightMatch(value: string, query: string): ReactNode {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return value;

  const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = value.split(new RegExp(`(${escapedQuery})`, "giu"));

  return parts.map((part, index) =>
    part.localeCompare(normalizedQuery, undefined, { sensitivity: "base" }) ===
    0 ? (
      <mark
        key={`${part}-${index}`}
        className="bg-secondary/25 text-foreground rounded-sm px-0.5 font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function optionId(panelId: string, itemId: string) {
  return `${panelId}-option-${itemId.replace(/[^a-zA-Z0-9-]/g, "-")}`;
}

function SearchResultRow({
  active = false,
  item,
  onClick,
  onPointerMove,
  panelId,
  query,
  role = "link",
}: {
  active?: boolean;
  item: GlobalSearchItem;
  onClick?: () => void;
  onPointerMove?: () => void;
  panelId?: string;
  query: string;
  role?: "link" | "option";
}) {
  const Icon = searchIcons[item.icon];

  return (
    <Link
      href={item.href}
      id={panelId ? optionId(panelId, item.id) : undefined}
      role={role === "option" ? "option" : undefined}
      aria-selected={role === "option" ? active : undefined}
      onClick={onClick}
      onPointerMove={onPointerMove}
      className={cn(
        "group/search-result hover:bg-muted focus-visible:ring-ring flex min-h-15 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset",
        active && "bg-muted",
      )}
    >
      <span className="bg-primary/7 text-primary dark:bg-link/15 dark:text-link grid size-9 shrink-0 place-items-center rounded-lg">
        <Icon aria-hidden="true" className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-sm leading-5 font-semibold">
          {highlightMatch(item.label, query)}
        </span>
        <span className="text-muted-foreground mt-0.5 block truncate text-xs leading-4">
          {highlightMatch(item.context, query)}
        </span>
      </span>
      <span
        className={cn(
          "bg-muted text-muted-foreground hidden max-w-28 shrink-0 truncate rounded-full px-2 py-1 text-[0.68rem] font-medium sm:block",
          item.statusTone === "success" &&
            "bg-success/12 text-success-foreground dark:text-success",
          item.statusTone === "warning" &&
            "bg-warning/16 text-warning-foreground dark:text-warning",
        )}
      >
        {highlightMatch(item.meta, query)}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="text-muted-foreground size-4 shrink-0 transition-transform group-hover/search-result:translate-x-0.5 rtl:rotate-180 rtl:group-hover/search-result:-translate-x-0.5"
      />
    </Link>
  );
}

function SearchPopupContent({
  activeIndex,
  onActiveIndexChange,
  onSelect,
  panelId,
  query,
  sections,
  totalMatches,
}: {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: GlobalSearchItem) => void;
  panelId: string;
  query: string;
  sections: SearchSection[];
  totalMatches: number;
}) {
  const t = useTranslations("Header.globalSearch");
  const visibleCount = sections.reduce(
    (count, section) => count + section.items.length,
    0,
  );

  return (
    <div id={panelId}>
      {visibleCount > 0 ? (
        <div
          id={`${panelId}-listbox`}
          role="listbox"
          aria-label={t("resultsLabel")}
          className="p-2"
        >
          {sections.map((section) => (
            <section
              key={section.id}
              role="group"
              aria-labelledby={`${panelId}-${section.id}-label`}
              className="not-first:mt-2"
            >
              <h2
                id={`${panelId}-${section.id}-label`}
                className="text-muted-foreground px-3 pt-2 pb-1.5 text-[0.68rem] font-semibold tracking-[0.08em] uppercase"
              >
                {section.label}
              </h2>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const currentIndex = sections
                    .flatMap((sectionItem) => sectionItem.items)
                    .findIndex((sectionItem) => sectionItem.id === item.id);
                  return (
                    <SearchResultRow
                      key={item.id}
                      item={item}
                      query={query}
                      panelId={panelId}
                      role="option"
                      active={activeIndex === currentIndex}
                      onPointerMove={() => onActiveIndexChange(currentIndex)}
                      onClick={() => onSelect(item)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div
          id={`${panelId}-listbox`}
          role="listbox"
          aria-label={t("resultsLabel")}
          className="px-6 py-10 text-center"
        >
          <SearchX
            aria-hidden="true"
            className="text-muted-foreground mx-auto size-6"
          />
          <p className="mt-3 text-sm font-semibold">{t("noResultsTitle")}</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-80 text-xs leading-5">
            {t("noResultsDescription")}
          </p>
        </div>
      )}

      {query.trim() && totalMatches > visibleCount ? (
        <div className="border-border border-t p-2">
          <Link
            href={{ pathname: "/dashboard/search", query: { q: query } }}
            className="text-link hover:bg-muted focus-visible:ring-ring flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
          >
            {t("viewAllResults", { count: totalMatches })}
            <ChevronRight
              aria-hidden="true"
              className="size-4 rtl:rotate-180"
            />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function GlobalSearch() {
  const t = useTranslations("Header.globalSearch");
  const router = useRouter();
  const items = useLocalizedGlobalSearchItems();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const shortcut = useSyncExternalStore(
    subscribeToPlatform,
    getClientShortcut,
    getServerShortcut,
  );
  const [recentIds, setRecentIds] = useState<string[]>([
    ...defaultRecentSearchIds,
  ]);

  const matches = filterItems(items, query);
  const isTyping = query.trim().length > 0;
  const recentItems = getItemsById(items, recentIds).filter(
    (item) => item.group === "websites" || item.group === "tickets",
  );
  const sections: SearchSection[] = isTyping
    ? groupOrder.flatMap((group) => {
        const groupItems = matches
          .filter((item) => item.group === group)
          .slice(0, 3);
        return groupItems.length
          ? [
              {
                id: group,
                label: t(`groups.${group}`),
                items: groupItems,
              },
            ]
          : [];
      })
    : [
        {
          id: "recent",
          label: t("groups.recent"),
          items: recentItems,
        },
        {
          id: "quickActions",
          label: t("groups.quickActions"),
          items: getItemsById(items, quickActionSearchIds),
        },
        {
          id: "destinations",
          label: t("groups.destinations"),
          items: getItemsById(items, suggestedDestinationSearchIds),
        },
      ].filter((section) => section.items.length > 0);
  const visibleItems = sections.flatMap((section) => section.items);
  const activeItem = visibleItems[activeIndex];
  const isOpen = desktopOpen || mobileOpen;

  useScrollLock(isOpen, "dashboard-global-search");

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (
        event.key.toLocaleLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey
      ) {
        event.preventDefault();
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        const storedRecentIds = readStoredRecentIds();
        if (storedRecentIds) setRecentIds(storedRecentIds);
        setActiveIndex(0);

        if (window.matchMedia("(max-width: 767px)").matches) {
          setMobileOpen(true);
        } else {
          // Focus before opening: the input lives in the PopoverAnchor, outside
          // PopoverContent. Opening first and moving focus afterward makes the
          // non-modal Radix popover treat the focus shift as an interaction
          // outside its content and dismiss itself immediately. Focusing first
          // means the content mounts with focus already settled on the input.
          desktopInputRef.current?.focus();
          desktopInputRef.current?.select();
          setDesktopOpen(true);
        }
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function rememberItem(item: GlobalSearchItem) {
    if (item.group !== "websites" && item.group !== "tickets") return;

    const nextRecentIds = [
      item.id,
      ...recentIds.filter((id) => id !== item.id),
    ].slice(0, 4);
    setRecentIds(nextRecentIds);
    try {
      window.localStorage.setItem(
        recentStorageKey,
        JSON.stringify(nextRecentIds),
      );
    } catch {
      // Navigation remains available when storage is blocked.
    }
  }

  function closeSearch({ restoreFocus = false } = {}) {
    setDesktopOpen(false);
    setMobileOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => previousFocusRef.current?.focus());
    }
  }

  function selectItem(item: GlobalSearchItem) {
    rememberItem(item);
    closeSearch();
  }

  function navigateToItem(item: GlobalSearchItem) {
    selectItem(item);
    router.push(item.href);
  }

  function openDesktopSearch() {
    const storedRecentIds = readStoredRecentIds();
    if (storedRecentIds) setRecentIds(storedRecentIds);
    setActiveIndex(0);
    setDesktopOpen(true);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActiveIndex(0);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) setDesktopOpen(true);
      setActiveIndex((index) =>
        visibleItems.length ? (index + 1) % visibleItems.length : -1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setDesktopOpen(true);
      setActiveIndex((index) =>
        visibleItems.length
          ? (index <= 0 ? visibleItems.length : index) - 1
          : -1,
      );
      return;
    }

    if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      navigateToItem(activeItem);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeSearch({ restoreFocus: true });
    }
  }

  const sharedInputProps = {
    role: "combobox" as const,
    "aria-autocomplete": "list" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": isOpen,
    "aria-activedescendant": activeItem
      ? optionId(
          mobileOpen ? "global-search-mobile" : "global-search-desktop",
          activeItem.id,
        )
      : undefined,
    "aria-keyshortcuts": "Meta+K Control+K",
    value: query,
    onChange: handleInputChange,
    onKeyDown: handleInputKeyDown,
    placeholder: t("placeholder"),
  };

  return (
    <>
      <Popover
        open={desktopOpen}
        onOpenChange={(open) => {
          setDesktopOpen(open);
          if (open)
            previousFocusRef.current = document.activeElement as HTMLElement;
        }}
      >
        <PopoverAnchor asChild>
          <div className="relative hidden w-[clamp(16rem,36vw,29.5rem)] md:block">
            <span className="sr-only" id="global-search-desktop-label">
              {t("label")}
            </span>
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute inset-s-4 top-1/2 size-[1.1rem] -translate-y-1/2"
            />
            <Input
              {...sharedInputProps}
              ref={desktopInputRef}
              type="search"
              aria-labelledby="global-search-desktop-label"
              aria-controls="global-search-desktop-listbox"
              onFocus={openDesktopSearch}
              onClick={openDesktopSearch}
              className="h-12 rounded-[0.7rem] ps-11 pe-22 shadow-sm"
            />
            <kbd
              aria-hidden="true"
              className="bg-muted text-muted-foreground pointer-events-none absolute inset-e-3 top-1/2 min-w-16 -translate-y-1/2 rounded-md px-2 py-1 text-center font-mono text-xs"
            >
              {shortcut}
            </kbd>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            desktopInputRef.current?.focus();
          }}
          onInteractOutside={(event) => {
            // The input is the PopoverAnchor, which lives outside PopoverContent.
            // Without this guard, clicking the already-open input registers as an
            // outside interaction: Radix dismisses the popover and our focus/click
            // handler reopens it, producing a close/open flicker. Treat clicks on
            // the input as inside so the open state stays stable.
            if (desktopInputRef.current?.contains(event.target as Node)) {
              event.preventDefault();
            }
          }}
          className="border-border bg-popover hidden w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-xl p-0 shadow-lg md:block"
        >
          <ScrollArea
            type="auto"
            className="max-h-[min(36rem,calc(100dvh-6rem))] **:data-[slot=scroll-area-viewport]:max-h-[min(36rem,calc(100dvh-6rem))]"
          >
            <SearchPopupContent
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              onSelect={selectItem}
              panelId="global-search-desktop"
              query={query}
              sections={sections}
              totalMatches={matches.length}
            />
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="plain"
        aria-label={t("open")}
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          previousFocusRef.current = document.activeElement as HTMLElement;
          const storedRecentIds = readStoredRecentIds();
          if (storedRecentIds) setRecentIds(storedRecentIds);
          setActiveIndex(0);
          setMobileOpen(true);
        }}
        className="hover:bg-muted focus-visible:ring-ring grid size-11 place-items-center rounded-lg focus-visible:ring-2 md:hidden"
      >
        <Search aria-hidden="true" className="size-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="top"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            mobileInputRef.current?.focus();
          }}
          className="inset-0 h-dvh w-screen max-w-none gap-0 border-0 p-0 shadow-none md:hidden"
        >
          <SheetHeader className="border-border border-b p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <SheetTitle className="sr-only">{t("title")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("description")}
            </SheetDescription>
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="text-muted-foreground pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2"
                />
                <Input
                  {...sharedInputProps}
                  ref={mobileInputRef}
                  type="search"
                  aria-label={t("label")}
                  aria-controls="global-search-mobile-listbox"
                  className="h-11 rounded-lg ps-10 pe-10"
                />
                {!!query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="plain"
                    aria-label={t("clear")}
                    onClick={() => {
                      setQuery("");
                      setActiveIndex(0);
                      mobileInputRef.current?.focus();
                    }}
                    className="absolute inset-e-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="plain"
                onClick={() => closeSearch({ restoreFocus: true })}
                className="h-11 shrink-0 px-2 text-sm font-medium"
              >
                {t("cancel")}
              </Button>
            </div>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 pb-[env(safe-area-inset-bottom)]">
            <SearchPopupContent
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              onSelect={selectItem}
              panelId="global-search-mobile"
              query={query}
              sections={sections}
              totalMatches={matches.length}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function GlobalSearchResults({ query }: { query: string }) {
  const t = useTranslations("Header.globalSearch");
  const items = useLocalizedGlobalSearchItems();
  const matches = filterItems(items, query);
  const sections = groupOrder.flatMap((group) => {
    const groupItems = matches.filter((item) => item.group === group);
    return groupItems.length
      ? [{ id: group, label: t(`groups.${group}`), items: groupItems }]
      : [];
  });

  return (
    <section className="w-full max-w-6xl pt-6 pb-10 sm:pt-7">
      <header className="max-w-3xl">
        <h1 className="text-[1.8rem] font-semibold tracking-tight">
          {t("allResults.title")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {query.trim()
            ? t("allResults.summary", { count: matches.length, query })
            : t("allResults.description")}
        </p>
      </header>

      {query.trim() && sections.length ? (
        <div className="mt-7 max-w-4xl space-y-7">
          {sections.map((section) => (
            <section key={section.id} aria-labelledby={`search-${section.id}`}>
              <h2
                id={`search-${section.id}`}
                className="text-muted-foreground mb-2 text-sm font-semibold"
              >
                {section.label}
              </h2>
              <div className="divide-border border-border bg-background divide-y overflow-hidden rounded-xl border p-1">
                {section.items.map((item) => (
                  <SearchResultRow key={item.id} item={item} query={query} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="border-border mt-7 max-w-4xl rounded-xl border px-6 py-12 text-center">
          <SearchX
            aria-hidden="true"
            className="text-muted-foreground mx-auto size-7"
          />
          <h2 className="mt-3 text-base font-semibold">
            {query.trim() ? t("noResultsTitle") : t("allResults.emptyTitle")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm leading-6">
            {query.trim()
              ? t("noResultsDescription")
              : t("allResults.description")}
          </p>
        </div>
      )}
    </section>
  );
}
