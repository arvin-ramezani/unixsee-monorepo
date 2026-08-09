"use client";

import { useRef, useState, useCallback, useId } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HelpSearchTopicItem {
  id: string;
  title: string;
  summary: string;
  href: string;
}

export interface HelpSearchArticleItem {
  id: string;
  title: string;
  topicTitle: string;
  href: string;
}

interface HelpSearchProps {
  /** Pre-resolved topic items (title + summary from messages). */
  topics: HelpSearchTopicItem[];
  /** Pre-resolved article items (title + topicTitle from messages). */
  articles: HelpSearchArticleItem[];
  /** Optional: restrict placeholder to topic context. */
  topicContext?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function match(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HelpSearch({
  topics,
  articles,
  topicContext,
}: HelpSearchProps) {
  const t = useTranslations("HelpCenter.search");
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const trimmed = query.trim();
  const isTyping = trimmed.length > 0;

  // ── Filtered suggestions ──────────────────────────────────────────────────
  const suggestedTopics: HelpSearchTopicItem[] = isTyping
    ? topics.filter(
        (tp) => match(tp.title, trimmed) || match(tp.summary, trimmed),
      )
    : topics.slice(0, 6);

  const suggestedArticles: HelpSearchArticleItem[] = isTyping
    ? articles
        .filter((a) => match(a.title, trimmed) || match(a.topicTitle, trimmed))
        .slice(0, 6)
    : [];

  const allItems: Array<{ href: string }> = [
    ...suggestedArticles,
    ...suggestedTopics,
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const close = useCallback(() => {
    setOpen(false);
    setActiveIdx(-1);
  }, []);

  const submit = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      close();
      // TODO: Replace dummy search with Help Center search API
      router.push({
        pathname: "/dashboard/help-center",
        query: { q: q.trim() },
      });
    },
    [close, router],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && allItems[activeIdx]) {
        close();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push(allItems[activeIdx].href as any);
      } else {
        submit(trimmed);
      }
    }
  }

  const showDropdown =
    open && (suggestedTopics.length > 0 || suggestedArticles.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <Label htmlFor={inputId} className="relative block">
        <span className="sr-only">{t("label")}</span>
        <Input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={
            activeIdx >= 0 ? `${listId}-item-${activeIdx}` : undefined
          }
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              close();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            topicContext
              ? t("topicContext", { topic: topicContext })
              : t("placeholder")
          }
          className="h-14 rounded-xl border border-border bg-background ps-4 pe-38 text-base shadow transition-[box-shadow,border-color] placeholder:text-muted-foreground/50 hover:border-border focus-visible:border-ring/50 focus-visible:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label={t("clear")}
            className="absolute inset-e-26 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4.5" />
          </button>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => submit(trimmed)}
          className="absolute inset-e-2 top-1/2 -translate-y-1/2 flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span>{t("searchButton")}</span>
        </button>
      </Label>

      {!isTyping && (
        <p className="mt-2 text-xs text-muted-foreground/70 ps-1" dir="auto">
          {t("hint")}
        </p>
      )}

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          aria-label={t("label")}
          className="absolute inset-x-0 top-[calc(100%-1rem)] z-50 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-xl"
        >
          {/* Article suggestions (typing only) */}
          {suggestedArticles.length > 0 && (
            <section className="py-1.5">
              <p className="px-4 pb-1 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t("articleSuggestionsLabel")}
              </p>
              {suggestedArticles.map((article, i) => {
                const idx = i;
                return (
                  <Link
                    key={article.id}
                    id={`${listId}-item-${idx}`}
                    role="option"
                    aria-selected={activeIdx === idx}
                    href={article.href}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => close()}
                    className={`flex items-start gap-3 px-4 py-2.5 text-start transition-colors hover:bg-accent/60 focus:outline-none ${activeIdx === idx ? "bg-accent/60" : ""}`}
                  >
                    <span className="flex-1 min-w-0">
                      <span
                        className="block text-sm font-medium text-foreground leading-snug"
                        dir="auto"
                      >
                        {article.title}
                      </span>
                      <span
                        className="block text-xs text-muted-foreground mt-0.5"
                        dir="auto"
                      >
                        {article.topicTitle}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          )}

          {/* Topic suggestions */}
          {suggestedTopics.length > 0 && (
            <section
              className={`py-1.5 ${suggestedArticles.length > 0 ? "border-t border-border/40" : ""}`}
            >
              <p className="px-4 pb-1 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {isTyping
                  ? t("topicSuggestionsLabel")
                  : t("popularTopicsLabel")}
              </p>
              {suggestedTopics.map((topic, i) => {
                const idx = suggestedArticles.length + i;
                return (
                  <Link
                    key={topic.id}
                    id={`${listId}-item-${idx}`}
                    role="option"
                    aria-selected={activeIdx === idx}
                    href={topic.href}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => close()}
                    className={`flex items-start gap-3 px-4 py-2.5 text-start transition-colors hover:bg-accent/60 focus:outline-none ${activeIdx === idx ? "bg-accent/60" : ""}`}
                  >
                    <span className="flex-1 min-w-0">
                      <span
                        className="block text-sm font-medium text-foreground leading-snug"
                        dir="auto"
                      >
                        {topic.title}
                      </span>
                      <span
                        className="block text-xs text-muted-foreground mt-0.5"
                        dir="auto"
                      >
                        {topic.summary}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          )}

          {/* Submit hint */}
          {isTyping && (
            <div className="border-t border-border/60 px-4 py-2.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => submit(trimmed)}
                className="w-full text-start text-sm text-link hover:underline underline-offset-4"
                dir="auto"
              >
                {t("searchAll", { query: trimmed })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
