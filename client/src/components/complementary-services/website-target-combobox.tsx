"use client";

import { type KeyboardEvent, useId, useState } from "react";
import { Check, ChevronsUpDown, Globe2, Server } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import type {
  ComplementaryWebsiteOption,
  WebsiteManagementCoverage,
} from "@/lib/complementary-services/types";
import { cn } from "@/lib/utils";

export type WebsiteTarget = {
  websiteId?: string;
  websiteDomain?: string;
  displayDomain: string;
  coverage: WebsiteManagementCoverage;
};

type WebsiteOption =
  | { kind: "website"; website: ComplementaryWebsiteOption }
  | { kind: "typed"; domain: string };

function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed,
    );
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isValidDomain(domain: string) {
  return (
    domain.includes(".") &&
    domain.length <= 253 &&
    !/^\d{1,3}(\.\d{1,3}){3}$/.test(domain) &&
    domain
      .split(".")
      .every(
        (label) =>
          label.length > 0 &&
          label.length <= 63 &&
          /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
      )
  );
}

export function WebsiteTargetCombobox({
  websites,
  value,
  onChange,
  error,
}: {
  websites: ComplementaryWebsiteOption[];
  value: WebsiteTarget | null;
  onChange: (value: WebsiteTarget | null) => void;
  error?: string;
}) {
  const t = useTranslations("ComplementaryServices");
  const listId = useId();
  const inputId = useId();
  const [query, setQuery] = useState(value?.displayDomain ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalized = normalizeDomain(query);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? websites.filter(
        (website) =>
          website.domain.toLowerCase().includes(needle) ||
          website.name.toLowerCase().includes(needle),
      )
    : websites;

  const exact = websites.find((website) => website.domain === normalized);
  const canUseTyped = isValidDomain(normalized) && !exact;
  const options: WebsiteOption[] = [
    ...filtered.map((website) => ({ kind: "website" as const, website })),
    ...(canUseTyped ? [{ kind: "typed" as const, domain: normalized }] : []),
  ];

  function chooseWebsite(website: ComplementaryWebsiteOption) {
    setQuery(website.domain);
    onChange({
      websiteId: website.id,
      displayDomain: website.domain,
      coverage: website.managementCoverage,
    });
    setOpen(false);
  }

  function chooseTyped(domain: string) {
    setQuery(domain);
    onChange({
      websiteDomain: domain,
      displayDomain: domain,
      coverage: "EXTERNAL_INFRASTRUCTURE",
    });
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        options.length ? (current + 1) % options.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        options.length ? (current - 1 + options.length) % options.length : 0,
      );
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option.kind === "website") chooseWebsite(option.website);
      else chooseTyped(option.domain);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const managed = options.filter(
    (option) =>
      option.kind === "website" &&
      option.website.managementCoverage === "UNIXSEE_MANAGED",
  );
  const external = options.filter(
    (option) =>
      option.kind === "typed" ||
      (option.kind === "website" &&
        option.website.managementCoverage !== "UNIXSEE_MANAGED"),
  );

  return (
    <div className="relative">
      <div className="relative">
        <Input
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={
            open && options[activeIndex]
              ? listId + "-option-" + activeIndex
              : undefined
          }
          aria-invalid={Boolean(error)}
          aria-describedby={error ? inputId + "-error" : inputId + "-hint"}
          dir="ltr"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            setActiveIndex(0);
            const domain = normalizeDomain(next);
            const existing = websites.find(
              (website) => website.domain === domain,
            );
            if (existing) {
              onChange({
                websiteId: existing.id,
                displayDomain: existing.domain,
                coverage: existing.managementCoverage,
              });
            } else {
              onChange(
                isValidDomain(domain)
                  ? {
                      websiteDomain: domain,
                      displayDomain: domain,
                      coverage: "EXTERNAL_INFRASTRUCTURE",
                    }
                  : null,
              );
            }
          }}
          placeholder={t("target.placeholder")}
          className="h-11 pe-10 text-left"
        />
        <ChevronsUpDown
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2"
        />
      </div>

      <p
        id={inputId + "-hint"}
        className="text-muted-foreground mt-1.5 text-xs leading-5"
      >
        {t("target.hint")}
      </p>
      {!!error && (
        <p
          id={inputId + "-error"}
          className="text-destructive mt-1 text-xs"
          role="alert"
        >
          {error}
        </p>
      )}

      {open && options.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="border-border bg-popover text-popover-foreground absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border p-1 shadow-md"
          onMouseDown={(event) => event.preventDefault()}
        >
          {managed.length > 0 && (
            <OptionGroup
              label={t("coverageDescriptive.UNIXSEE_MANAGED")}
              options={managed}
              allOptions={options}
              listId={listId}
              activeIndex={activeIndex}
              value={value}
              onActive={setActiveIndex}
              onWebsite={chooseWebsite}
              onTyped={chooseTyped}
            />
          )}
          {external.length > 0 && (
            <OptionGroup
              label={t("target.groupExternal")}
              options={external}
              allOptions={options}
              listId={listId}
              activeIndex={activeIndex}
              value={value}
              onActive={setActiveIndex}
              onWebsite={chooseWebsite}
              onTyped={chooseTyped}
            />
          )}
        </div>
      )}

      {!!value?.websiteDomain && (
        <div className="border-border bg-muted/30 mt-3 rounded-xl border p-3 text-xs leading-5">
          <p className="font-medium" dir="ltr">
            {t("target.useForRequest", { domain: value.displayDomain })}
          </p>
          <p className="text-muted-foreground mt-1">
            {t("target.externalNote")}
          </p>
        </div>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  options,
  allOptions,
  listId,
  activeIndex,
  value,
  onActive,
  onWebsite,
  onTyped,
}: {
  label: string;
  options: WebsiteOption[];
  allOptions: WebsiteOption[];
  listId: string;
  activeIndex: number;
  value: WebsiteTarget | null;
  onActive: (index: number) => void;
  onWebsite: (website: ComplementaryWebsiteOption) => void;
  onTyped: (domain: string) => void;
}) {
  const t = useTranslations("ComplementaryServices");
  return (
    <div role="group" aria-label={label}>
      <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
        {label}
      </p>
      {options.map((option) => {
        const index = allOptions.indexOf(option);
        const selected =
          option.kind === "website"
            ? value?.websiteId === option.website.id
            : value?.websiteDomain === option.domain;
        const domain =
          option.kind === "website" ? option.website.domain : option.domain;
        const coverage: WebsiteManagementCoverage =
          option.kind === "website"
            ? option.website.managementCoverage
            : "EXTERNAL_INFRASTRUCTURE";
        return (
          <button
            key={option.kind === "website" ? option.website.id : option.domain}
            id={listId + "-option-" + index}
            type="button"
            role="option"
            aria-selected={selected}
            className={cn(
              "hover:bg-accent focus-visible:bg-accent flex w-full items-start gap-2 rounded-lg px-2 py-2 text-start text-sm outline-none",
              activeIndex === index && "bg-accent",
            )}
            onMouseEnter={() => onActive(index)}
            onClick={() =>
              option.kind === "website"
                ? onWebsite(option.website)
                : onTyped(option.domain)
            }
          >
            {coverage === "UNIXSEE_MANAGED" ? (
              <Server aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Globe2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-medium" dir="ltr">
                {option.kind === "typed"
                  ? t("target.useForRequest", { domain })
                  : option.website.name}
              </span>
              <span className="text-muted-foreground block text-xs">
                <span dir="ltr">{domain}</span> ·{" "}
                {t(`coverageDescriptive.${coverage}`)}
              </span>
            </span>
            {selected && (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
