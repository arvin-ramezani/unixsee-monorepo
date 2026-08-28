"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

import { Button } from "@/components/ui/button";
import { DirectionProvider } from "@/components/ui/direction";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  findPhoneCountryOption,
  formatDialCode,
  getCountryFlag,
  getPhoneCountryOptions,
  type PhoneCountryLocale,
  type PhoneCountryOption,
} from "@/lib/phone/country-dial-codes";
import {
  DEFAULT_PHONE_COUNTRY,
  preparePhoneInput,
  toEnglishDigits,
} from "@/lib/phone/international-phone";
import { cn } from "@/lib/utils";
import { Popover as PopoverPrimitive } from "radix-ui";

export type PhoneInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value: string;
  onChange: (value: string) => void;
  country?: CountryCode;
  defaultCountry?: CountryCode;
  onCountryChange?: (country: CountryCode) => void;
  /**
   * `international` emits `+{dial}{national}` (default).
   * `national` emits national digits only (auth-style).
   */
  output?: "international" | "national";
  inputClassName?: string;
  triggerClassName?: string;
};

const ROW_HEIGHT = 40;
const OVERSCAN = 10;

function digitsOnly(raw: string): string {
  return toEnglishDigits(raw).replace(/\D/g, "");
}

/**
 * Strip a leading country-calling-code from digit strings.
 * `mode: "always"` — used when value is already international (`+…`).
 * `mode: "paste"` — only when remaining digits look like a full national number.
 */
function stripCallingCodePrefix(
  digits: string,
  country: CountryCode,
  mode: "always" | "paste" = "paste",
): string {
  const dial = String(getCountryCallingCode(country));
  if (!dial || !digits.startsWith(dial)) return digits;
  const rest = digits.slice(dial.length);
  if (mode === "paste" && rest.length < 8) return digits;
  return rest;
}

/**
 * Resolve display country + national digits for the text field.
 * The national field must never include the selected dial code (e.g. show
 * `9361599686`, not `989361599686`, when IR / +98 is selected).
 */
function nationalFromValue(
  value: string,
  country: CountryCode,
): { country: CountryCode; national: string } {
  const prepared = preparePhoneInput(value);
  if (!prepared) {
    return { country, national: "" };
  }

  const attempts = [
    parsePhoneNumberFromString(prepared, country),
    prepared.startsWith("+")
      ? parsePhoneNumberFromString(prepared)
      : parsePhoneNumberFromString(`+${digitsOnly(prepared)}`),
  ];

  for (let i = 0; i < attempts.length; i++) {
    const parsed = attempts[i];
    if (!parsed?.nationalNumber) continue;
    if (!parsed.isPossible() && !parsed.isValid()) continue;
    const parsedCountry =
      (parsed.country as CountryCode | undefined) ?? country;
    // Guard against polluted nationals that still start with the dial code
    // (e.g. incomplete +989 re-parsed / compounded to +989893…).
    const national = stripCallingCodePrefix(
      parsed.nationalNumber,
      parsedCountry,
      "always",
    );
    return {
      country: parsedCountry,
      national,
    };
  }

  const digits = digitsOnly(prepared).replace(/^0+/, "");
  // Incomplete international values like +989 must always drop the dial code
  // for display; otherwise typing "9" shows "989".
  const national = stripCallingCodePrefix(
    digits,
    country,
    prepared.startsWith("+") ? "always" : "paste",
  );

  return { country, national };
}

function composeValue(
  country: CountryCode,
  national: string,
  output: "international" | "national",
): string {
  const digits = stripCallingCodePrefix(
    digitsOnly(national).replace(/^0+/, ""),
    country,
    "always",
  );
  if (!digits) return "";
  if (output === "national") return digits;
  return `+${getCountryCallingCode(country)}${digits}`;
}

function matchesQuery(option: PhoneCountryOption, query: string): boolean {
  const normalized = toEnglishDigits(query).trim().toLowerCase();
  if (!normalized) return true;
  const dial = option.dialCode;
  const dialWithPlus = formatDialCode(dial);
  return (
    option.name.toLowerCase().includes(normalized) ||
    option.code.toLowerCase().includes(normalized) ||
    dial.includes(normalized.replace(/^\+/, "")) ||
    dialWithPlus.includes(normalized)
  );
}

type CountryPickerListProps = {
  options: PhoneCountryOption[];
  country: CountryCode;
  disabled?: boolean;
  listId: string;
  listLabel: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (code: CountryCode) => void;
  emptyLabel: string;
  optionId: (code: CountryCode) => string;
};

function CountryPickerList({
  options,
  country,
  disabled,
  listId,
  listLabel,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  emptyLabel,
  optionId,
}: CountryPickerListProps) {
  const prefersReducedMotion = useReducedMotion();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  useEffect(() => {
    if (options.length === 0) return;
    const selectedIndex = options.findIndex(
      (option) => option.code === country,
    );
    const target = selectedIndex >= 0 ? selectedIndex : 0;
    onActiveIndexChange(target);
    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(target, { align: "center" });
    });
    // Only when the option set identity changes (open / filter), not every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/filter sync
  }, [options]);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= options.length) return;
    virtualizer.scrollToIndex(activeIndex, { align: "auto" });
  }, [activeIndex, options.length, virtualizer]);

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 460, damping: 34, mass: 0.55 };

  if (options.length === 0) {
    return (
      <AnimatePresence initial={false}>
        <motion.div
          key="empty"
          role="status"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -2 }}
          transition={spring}
          className="text-muted-foreground flex h-56 items-center justify-center px-3 text-center text-sm"
        >
          {emptyLabel}
        </motion.div>
      </AnimatePresence>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const firstIndex = virtualItems[0]?.index ?? 0;

  return (
    <div
      ref={parentRef}
      id={listId}
      data-lenis-prevent
      dir="ltr"
      className="app-scrollbar h-56 overflow-y-auto overscroll-contain pr-1"
      role="listbox"
      aria-label={listLabel}
      tabIndex={-1}
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualRow) => {
          const option = options[virtualRow.index];
          if (!option) return null;
          const isSelected = option.code === country;
          const isActive = virtualRow.index === activeIndex;
          const stagger = Math.min(virtualRow.index - firstIndex, 8);

          return (
            <div
              key={option.code}
              role="option"
              id={optionId(option.code)}
              aria-selected={isSelected}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full"
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...spring,
                  delay: prefersReducedMotion ? 0 : stagger * 0.018,
                }}
                className="h-full"
              >
                <button
                  type="button"
                  disabled={disabled}
                  tabIndex={-1}
                  className={cn(
                    "flex h-full w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-[background-color,transform] duration-150 outline-none",
                    "hover:bg-muted/80 focus-visible:ring-ring/50 focus-visible:ring-2",
                    !prefersReducedMotion &&
                      "hover:scale-[1.01] active:scale-[0.985]",
                    isActive && "bg-muted/90",
                    isSelected && "bg-muted",
                  )}
                  onMouseEnter={() => onActiveIndexChange(virtualRow.index)}
                  onClick={() => onSelect(option.code)}
                >
                  <motion.span
                    aria-hidden
                    className="text-base leading-none"
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : { scale: isSelected ? 1.08 : 1 }
                    }
                    transition={spring}
                  >
                    {getCountryFlag(option.code)}
                  </motion.span>
                  <span className="text-muted-foreground w-12 shrink-0 tabular-nums">
                    {formatDialCode(option.dialCode)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left" dir="ltr">
                    {option.name}
                  </span>
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.span
                        key="check"
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0, scale: 0.6 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: 0, scale: 0.6 }
                        }
                        transition={spring}
                        className="text-primary flex shrink-0"
                      >
                        <CheckIcon className="size-3.5" aria-hidden />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PhoneInput({
  value,
  onChange,
  country: countryProp,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  onCountryChange,
  output = "international",
  disabled,
  className,
  inputClassName,
  triggerClassName,
  id: idProp,
  placeholder,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
  autoComplete = "tel-national",
  onBlur,
  name,
  ...inputProps
}: PhoneInputProps) {
  const t = useTranslations("Common.phoneInput");
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listId = `${id}-country-list`;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [uncontrolledCountry, setUncontrolledCountry] =
    useState<CountryCode>(defaultCountry);
  const [nationalDraft, setNationalDraft] = useState(
    () => nationalFromValue(value, defaultCountry).national,
  );
  const lastEmittedValueRef = useRef(value);

  const country = countryProp ?? uncontrolledCountry;

  const options = useMemo(
    () =>
      getPhoneCountryOptions(
        (locale === "fa" ? "fa" : "en") as PhoneCountryLocale,
      ),
    [locale],
  );

  const selected =
    findPhoneCountryOption(options, country) ??
    findPhoneCountryOption(options, defaultCountry);

  useEffect(() => {
    if (value === lastEmittedValueRef.current) return;
    lastEmittedValueRef.current = value;
    const next = nationalFromValue(value, country);
    setNationalDraft(next.national);
    if (!countryProp && next.country !== uncontrolledCountry) {
      setUncontrolledCountry(next.country);
      onCountryChange?.(next.country);
    }
  }, [value, country, countryProp, uncontrolledCountry, onCountryChange]);

  const filtered = useMemo(
    () => options.filter((option) => matchesQuery(option, query)),
    [options, query],
  );

  function optionDomId(code: CountryCode) {
    return `${listId}-option-${code}`;
  }

  function setCountry(next: CountryCode) {
    if (!countryProp) {
      setUncontrolledCountry(next);
    }
    onCountryChange?.(next);
    const composed = composeValue(next, nationalDraft, output);
    lastEmittedValueRef.current = composed;
    onChange(composed);
    setOpen(false);
    setQuery("");
  }

  function handleNationalChange(raw: string) {
    const prepared = preparePhoneInput(raw);
    let nextCountry = country;
    let nextNational: string;

    if (prepared.startsWith("+") || prepared.startsWith("00")) {
      const parsed = nationalFromValue(raw, country);
      nextCountry = parsed.country;
      nextNational = parsed.national;
    } else {
      // Keep national typing local — strip dial only when it prefixes the digits
      // (recovers from polluted "989…" and full pastes like "989361599686").
      nextNational = stripCallingCodePrefix(
        digitsOnly(raw).replace(/^0+/, ""),
        country,
        "always",
      );
    }

    const composed = composeValue(nextCountry, nextNational, output);

    setNationalDraft(nextNational);
    if (!countryProp && nextCountry !== country) {
      setUncontrolledCountry(nextCountry);
    }
    if (nextCountry !== country) {
      onCountryChange?.(nextCountry);
    }
    lastEmittedValueRef.current = composed;
    onChange(composed);
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) setCountry(option.code);
    }
  }

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, bounce: 0.18, visualDuration: 0.28 };

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 660, damping: 34, mass: 0.55 };

  const activeOption = filtered[activeIndex];

  return (
    <DirectionProvider dir="ltr">
      <div className={cn("flex gap-2", className)} dir="ltr">
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setQuery("");
              return;
            }
            setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={t("countryLabel")}
              aria-controls={listId}
              aria-expanded={open}
              aria-haspopup="listbox"
              className={cn(
                "h-12 w-20 shrink-0 justify-between gap-1 px-2.5 font-normal transition-transform active:scale-[0.98]",
                triggerClassName,
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {!!selected && (
                    <motion.span
                      key={selected.code}
                      aria-hidden
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, y: 4, scale: 0.9 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        prefersReducedMotion
                          ? undefined
                          : { opacity: 0, y: -4, scale: 0.9 }
                      }
                      transition={spring}
                      className="text-base leading-none"
                    >
                      {getCountryFlag(selected.code)}
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={selected?.dialCode ?? defaultCountry}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 3 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReducedMotion ? undefined : { opacity: 0, y: -3 }
                    }
                    transition={spring}
                    className="truncate tabular-nums"
                  >
                    {selected
                      ? formatDialCode(selected.dialCode)
                      : formatDialCode(getCountryCallingCode(defaultCountry))}
                  </motion.span>
                </AnimatePresence>
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverPrimitive.Portal forceMount>
            <DirectionProvider dir="ltr">
              <AnimatePresence>
                {open && (
                  <PopoverPrimitive.Content
                    forceMount
                    asChild
                    dir="ltr"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    onOpenAutoFocus={(event) => {
                      event.preventDefault();
                      searchInputRef.current?.focus();
                    }}
                  >
                    {/*
                      Outer motion node receives Radix position `transform`.
                      Only animate opacity here — y/scale on this node would
                      overwrite placement (broken under RTL pages).
                    */}
                    <motion.div
                      key="country-picker-panel"
                      dir="ltr"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                      transition={panelTransition}
                      style={{ direction: "ltr" }}
                      className="z-50"
                    >
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0.9, scale: 0.96, y: -8 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: 0.9, scale: 0.98, y: -6 }
                        }
                        transition={panelTransition}
                        className={cn(
                          "bg-popover text-popover-foreground ring-foreground/10 flex w-80 flex-col gap-2 rounded-lg p-2 text-left text-sm shadow-md ring-1 outline-hidden will-change-transform",
                        )}
                      >
                        <div className="relative" dir="ltr">
                          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                          <Input
                            ref={searchInputRef}
                            role="combobox"
                            dir="ltr"
                            aria-expanded={open}
                            aria-controls={listId}
                            aria-autocomplete="list"
                            aria-activedescendant={
                              activeOption
                                ? optionDomId(activeOption.code)
                                : undefined
                            }
                            value={query}
                            onChange={(event) => {
                              setQuery(event.target.value);
                              setActiveIndex(0);
                            }}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={t("searchPlaceholder")}
                            aria-label={t("searchPlaceholder")}
                            className="h-9 pr-3 pl-8 text-left text-sm placeholder:text-left"
                          />
                        </div>
                        <Separator />
                        <CountryPickerList
                          options={filtered}
                          country={country}
                          disabled={disabled}
                          listId={listId}
                          listLabel={t("countryLabel")}
                          activeIndex={activeIndex}
                          onActiveIndexChange={setActiveIndex}
                          onSelect={setCountry}
                          emptyLabel={t("noResults")}
                          optionId={optionDomId}
                        />
                      </motion.div>
                    </motion.div>
                  </PopoverPrimitive.Content>
                )}
              </AnimatePresence>
            </DirectionProvider>
          </PopoverPrimitive.Portal>
        </Popover>

        <Input
          {...inputProps}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={placeholder}
          value={nationalDraft}
          dir="ltr"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired}
          onBlur={onBlur}
          onChange={(event) => handleNationalChange(event.target.value)}
          className={cn("h-12 min-h-12 flex-1", inputClassName)}
        />
      </div>
    </DirectionProvider>
  );
}
