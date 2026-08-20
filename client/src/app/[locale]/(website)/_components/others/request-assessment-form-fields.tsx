"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormErrorKey } from "@/lib/form-errors";
import { cn } from "@/lib/utils";

type TranslateError = (message?: string) => string | undefined;

type BaseFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  translateError: TranslateError;
};

export function TextFormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  translateError,
  placeholder,
  type = "text",
  dir,
  id,
}: BaseFieldProps<T> & {
  placeholder?: string;
  type?: string;
  dir?: "ltr" | "rtl" | "auto";
  id?: string;
}) {
  const fieldId = id ?? String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId} className="gap-1">
            {label}
            {required && <RequiredInputIcon />}
          </FieldLabel>
          <Input
            {...field}
            id={fieldId}
            type={type}
            dir={dir}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error?.message && (
            <FieldError
              errors={[
                { message: translateError(fieldState.error.message) },
              ]}
            />
          )}
        </Field>
      )}
    />
  );
}

export function TextareaFormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  translateError,
  placeholder,
  rows = 4,
  id,
}: BaseFieldProps<T> & {
  placeholder?: string;
  rows?: number;
  id?: string;
}) {
  const fieldId = id ?? String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId} className="gap-1">
            {label}
            {required && <RequiredInputIcon />}
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              {...field}
              id={fieldId}
              rows={rows}
              disabled={disabled}
              placeholder={placeholder}
              className="min-h-24 resize-none px-4 py-4"
              aria-invalid={fieldState.invalid}
            />
          </InputGroup>
          {fieldState.error?.message && (
            <FieldError
              errors={[
                { message: translateError(fieldState.error.message) },
              ]}
            />
          )}
        </Field>
      )}
    />
  );
}

export function SelectFormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  translateError,
  placeholder,
  options,
  optionLabel,
}: BaseFieldProps<T> & {
  placeholder: string;
  options: readonly string[];
  optionLabel: (value: string) => string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel className="gap-1">
            {label}
            {required && <RequiredInputIcon />}
          </FieldLabel>
          <Select
            value={field.value || undefined}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className="h-auto w-full min-h-12 px-4 py-3"
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {optionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error?.message && (
            <FieldError
              errors={[
                { message: translateError(fieldState.error.message) },
              ]}
            />
          )}
        </Field>
      )}
    />
  );
}

export function YesNoFormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  translateError,
}: BaseFieldProps<T>) {
  const tCommon = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.common",
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel className="gap-1">
            {label}
            {required && <RequiredInputIcon />}
          </FieldLabel>
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            className="flex flex-row flex-wrap gap-4"
          >
            <FieldLabel className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="yes" />
              {tCommon("yes")}
            </FieldLabel>
            <FieldLabel className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="no" />
              {tCommon("no")}
            </FieldLabel>
          </RadioGroup>
          {fieldState.error?.message && (
            <FieldError
              errors={[
                { message: translateError(fieldState.error.message) },
              ]}
            />
          )}
        </Field>
      )}
    />
  );
}

export function MultiSelectFormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  translateError,
  options,
  optionLabel,
}: BaseFieldProps<T> & {
  options: readonly string[];
  optionLabel: (value: string) => string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected: string[] = field.value ?? [];

        return (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend className="gap-1">
              {label}
              {required && <RequiredInputIcon className="inline" />}
            </FieldLegend>
            <FieldGroup className="gap-3">
              {options.map((option) => {
                const checked = selected.includes(option);
                const checkboxId = `${String(name)}-${option}`;

                return (
                  <Field
                    key={option}
                    orientation="horizontal"
                    className="items-center"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(next) => {
                        if (next === true) {
                          field.onChange([...selected, option]);
                          return;
                        }
                        field.onChange(
                          selected.filter((value) => value !== option),
                        );
                      }}
                    />
                    <FieldLabel
                      htmlFor={checkboxId}
                      className="font-normal"
                    >
                      {optionLabel(option)}
                    </FieldLabel>
                  </Field>
                );
              })}
            </FieldGroup>
            {fieldState.error?.message && (
              <FieldError
                errors={[
                  { message: translateError(fieldState.error.message) },
                ]}
              />
            )}
          </FieldSet>
        );
      }}
    />
  );
}

export function UrlListFormField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  translateError,
  placeholder,
  addLabel,
  removeLabel,
}: BaseFieldProps<T> & {
  placeholder?: string;
  addLabel: string;
  removeLabel: string;
}) {
  const { formState } = useFormContext<T>();

  function getIndexError(index: number): string | undefined {
    const pathParts = String(name).split(".");
    let current: unknown = formState.errors;

    for (const part of pathParts) {
      if (!current || typeof current !== "object" || !(part in current)) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    if (!current || typeof current !== "object") {
      return undefined;
    }

    const indexError = (current as Record<number, { message?: string }>)[index];
    return indexError?.message;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const links: string[] = Array.isArray(field.value)
          ? (field.value as string[])
          : [];

        function updateLink(index: number, value: string) {
          const next = [...links];
          next[index] = value;
          field.onChange(next);
        }

        function addLink() {
          field.onChange([...links, ""]);
        }

        function removeLink(index: number) {
          field.onChange(links.filter((_, itemIndex) => itemIndex !== index));
        }

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="gap-1">{label}</FieldLabel>
            <div className="flex flex-col gap-2">
              {links.map((link, index) => {
                const indexError = getIndexError(index);

                return (
                  <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        dir="ltr"
                        value={link}
                        disabled={disabled}
                        placeholder={placeholder}
                        aria-invalid={!!indexError}
                        onChange={(event) =>
                          updateLink(index, event.target.value)
                        }
                        onBlur={field.onBlur}
                        className="min-w-0 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                        aria-label={removeLabel}
                        onClick={() => removeLink(index)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                    {indexError && (
                      <FieldError
                        errors={[
                          { message: translateError(indexError) },
                        ]}
                      />
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit!"
                disabled={disabled}
                onClick={addLink}
              >
                <Plus className="size-4" aria-hidden />
                {addLabel}
              </Button>
            </div>
            {fieldState.error?.message && (
              <FieldError
                errors={[
                  { message: translateError(fieldState.error.message) },
                ]}
              />
            )}
          </Field>
        );
      }}
    />
  );
}

export function ServiceSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 border-t pt-6", className)}>
      <p className="text-base font-medium">{title}</p>
      <FieldGroup>{children}</FieldGroup>
    </div>
  );
}

export type { FormErrorKey, TranslateError };
