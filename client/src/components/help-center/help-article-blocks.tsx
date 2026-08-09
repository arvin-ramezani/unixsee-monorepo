import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ArticleBlock,
  ArticleBodyTextKey,
  NoticeVariant,
} from "@/lib/data/help-center/article-content";
import { ArticleCodeBlock } from "./help-article-code-block";
import { ArticleChecklist } from "./help-article-checklist";
import { DirectionalImage } from "../common/directional-image";

// ─── Notice configuration ────────────────────────────────────────────────────

type NoticeConfig = {
  icon: typeof Info;
  container: string;
  iconClass: string;
  labelClass: string;
};

const noticeConfig: Record<NoticeVariant, NoticeConfig> = {
  beforeYouBegin: {
    icon: Info,
    container: "border-border bg-muted/40",
    iconClass: "text-muted-foreground",
    labelClass: "text-foreground",
  },
  tip: {
    icon: Lightbulb,
    container: "border-primary/20 bg-primary/5 dark:bg-primary/10",
    iconClass: "text-primary",
    labelClass: "text-primary",
  },
  important: {
    icon: AlertCircle,
    container:
      "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
    iconClass: "text-amber-600 dark:text-amber-400",
    labelClass: "text-amber-700 dark:text-amber-300",
  },
  warning: {
    icon: TriangleAlert,
    container: "border-destructive/20 bg-destructive/5 dark:bg-destructive/10",
    iconClass: "text-destructive",
    labelClass: "text-destructive",
  },
};

// ─── Internal Notice block ────────────────────────────────────────────────────

function Notice({
  variant,
  text,
  label,
}: {
  variant: NoticeVariant;
  text: string;
  label: string;
}) {
  const cfg = noticeConfig[variant];
  const Icon = cfg.icon;

  return (
    <div
      role="note"
      className={cn("my-4 rounded-xl border px-4 py-3", cfg.container)}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className={cn("mt-0.5 size-4 shrink-0", cfg.iconClass)}
          strokeWidth={2}
        />
        <div className="flex-1 space-y-1">
          <p className={cn("text-sm font-semibold", cfg.labelClass)} dir="auto">
            {label}
          </p>
          <p className="text-foreground/80 text-sm leading-6" dir="auto">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface HelpArticleBlocksProps {
  blocks: ArticleBlock[];
  /** Resolves a leaf message key to its localized text string. */
  resolveText: (key: ArticleBodyTextKey) => string;
  /** Pre-resolved notice kind labels. */
  noticeLabels: Record<NoticeVariant, string>;
  copyLabel: string;
  copiedLabel: string;
  keyTakeawaysLabel: string;
  expectedOutcomeLabel: string;
  /** Shown below the checklist to clarify state is not persisted. */
  checklistHint: string;
  className?: string;
}

// ─── Renderer ────────────────────────────────────────────────────────────────

/**
 * Renders an ordered list of ArticleBlock models to JSX (UX spec §8, §9, §10,
 * §12). Each block kind maps to the appropriate HTML element and variant style.
 *
 * Client components (code copy, interactive checklist) are imported and
 * rendered server-side here; their interactivity hydrates on the client.
 */
export function HelpArticleBlocks({
  blocks,
  resolveText,
  noticeLabels,
  copyLabel,
  copiedLabel,
  keyTakeawaysLabel,
  expectedOutcomeLabel,
  checklistHint,
  className,
}: HelpArticleBlocksProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {blocks.map((block, idx) => {
        switch (block.kind) {
          // ── Paragraph ────────────────────────────────────────────────────
          case "paragraph":
            return (
              <p
                key={idx}
                className="text-foreground/90 text-base leading-7"
                dir="auto"
              >
                {resolveText(block.textKey)}
              </p>
            );

          // ── Heading (section anchor) ──────────────────────────────────────
          case "heading":
            return (
              <h2
                key={idx}
                id={block.id}
                // scroll-mt accommodates the sticky dashboard header + topic bar.
                className="text-foreground mt-8 mb-3 scroll-mt-24 text-start text-xl font-semibold first:mt-0"
                dir="auto"
              >
                {resolveText(block.textKey)}
              </h2>
            );

          // ── List (ordered or unordered) ───────────────────────────────────
          case "list":
            if (block.ordered) {
              return (
                <ol
                  key={idx}
                  className="text-foreground/90 list-decimal space-y-2 ps-5 text-base leading-7"
                >
                  {block.itemKeys.map((key, i) => (
                    <li key={i} dir="auto">
                      {resolveText(key)}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={idx}
                className="text-foreground/90 list-disc space-y-2 ps-5 text-base leading-7"
              >
                {block.itemKeys.map((key, i) => (
                  <li key={i} dir="auto">
                    {resolveText(key)}
                  </li>
                ))}
              </ul>
            );

          // ── Numbered steps ────────────────────────────────────────────────
          case "steps": {
            let n = 0;
            return (
              <ol key={idx} className="space-y-6">
                {block.items.map((step, i) => {
                  n++;
                  return (
                    <li key={i} className="flex gap-4">
                      {/* Step number bubble */}
                      <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                        {n}
                      </span>
                      <div className="flex-1 space-y-2 pt-0.5">
                        {/* Risk notice placed BEFORE the risky action (spec §9). */}
                        {step.note && (
                          <Notice
                            variant={step.note.variant}
                            text={resolveText(step.note.textKey)}
                            label={noticeLabels[step.note.variant]}
                          />
                        )}
                        <p
                          className="text-foreground/90 text-base leading-7"
                          dir="auto"
                        >
                          {resolveText(step.textKey)}
                        </p>
                        {step.code && (
                          <ArticleCodeBlock
                            code={step.code}
                            copyLabel={copyLabel}
                            copiedLabel={copiedLabel}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            );
          }

          // ── Standalone notice ─────────────────────────────────────────────
          case "notice":
            return (
              <Notice
                key={idx}
                variant={block.variant}
                text={resolveText(block.textKey)}
                label={noticeLabels[block.variant]}
              />
            );

          // ── Code block with copy action ───────────────────────────────────
          case "code":
            return (
              <ArticleCodeBlock
                key={idx}
                code={block.code}
                caption={
                  block.captionKey ? resolveText(block.captionKey) : undefined
                }
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            );

          // ── Interactive checklist ─────────────────────────────────────────
          case "checklist":
            return (
              <ArticleChecklist
                key={idx}
                items={block.items.map((item) => ({
                  id: item.id,
                  text: resolveText(item.textKey),
                }))}
                hint={checklistHint}
              />
            );

          // ── Reference table ───────────────────────────────────────────────
          case "table":
            return (
              <div
                key={idx}
                className="border-border overflow-x-auto rounded-xl border"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60">
                      {block.headKeys.map((hk, i) => (
                        <th
                          key={i}
                          scope="col"
                          className="text-foreground px-4 py-2.5 text-start font-semibold"
                          dir="auto"
                        >
                          {resolveText(hk)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {block.rowKeys.map((row, ri) => (
                      <tr
                        key={ri}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {row.map((ck, ci) => (
                          <td
                            key={ci}
                            className="text-foreground/80 px-4 py-3 leading-6"
                            dir="auto"
                          >
                            {resolveText(ck)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          // ── Inline image ──────────────────────────────────────────────────
          case "image":
            return (
              <div
                key={idx}
                className="relative aspect-532/209 w-full overflow-hidden rounded-xl"
              >
                <DirectionalImage
                  src={{
                    ltr: block.src.ltr,
                    rtl: block.src.rtl,
                  }}
                  alt={block.alt ?? ""}
                  fill
                  sizes="(min-width: 1280px) 768px, (min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            );

          // ── Key takeaways (explanatory / reference articles) ──────────────
          case "keyTakeaways":
            return (
              <aside
                key={idx}
                className="border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-xl border px-5 py-4"
              >
                <h2
                  className="text-primary dark:text-primary-foreground mb-3 text-start text-sm font-semibold"
                  dir="auto"
                >
                  {keyTakeawaysLabel}
                </h2>
                <ul className="text-foreground/90 space-y-2 text-sm leading-6">
                  {block.itemKeys.map((key, i) => (
                    <li key={i} className="flex gap-2" dir="auto">
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-primary dark:text-link mt-0.5 size-4 shrink-0"
                        strokeWidth={2}
                      />
                      {resolveText(key)}
                    </li>
                  ))}
                </ul>
              </aside>
            );

          // ── Expected outcome (procedural articles) ────────────────────────
          case "outcome":
            return (
              <aside
                key={idx}
                className="border-border bg-muted/40 rounded-xl border px-5 py-4"
              >
                <h2
                  className="text-foreground mb-3 text-start text-sm font-semibold"
                  dir="auto"
                >
                  {expectedOutcomeLabel}
                </h2>
                <ul className="text-foreground/90 space-y-2 text-sm leading-6">
                  {block.itemKeys.map((key, i) => (
                    <li key={i} className="flex gap-2" dir="auto">
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-muted-foreground mt-0.5 size-4 shrink-0"
                        strokeWidth={2}
                      />
                      {resolveText(key)}
                    </li>
                  ))}
                </ul>
              </aside>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
