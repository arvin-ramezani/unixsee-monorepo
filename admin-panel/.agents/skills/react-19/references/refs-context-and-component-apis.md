# Refs, context, and modern component APIs

## Ref as a prop

For React 19-only function components, accept `ref` directly.

```tsx
import type { ComponentPropsWithoutRef, Ref } from "react";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  ref?: Ref<HTMLInputElement>;
};

export function TextInput({ ref, ...inputProps }: TextInputProps) {
  return <input ref={ref} {...inputProps} />;
}
```

Do not add `forwardRef` to new React 19-only components.

Keep `forwardRef` when:

- The package supports React 18 or earlier.
- A public library’s compatibility contract requires it.
- Existing types or consumers cannot migrate in the current task.

## Imperative handles

Expose the smallest imperative API possible.

```tsx
import {
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";

type SearchInputHandle = {
  focus: () => void;
};

export function SearchInput({
  ref,
}: {
  ref?: Ref<SearchInputHandle>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
  }));

  return <input ref={inputRef} type="search" />;
}
```

Prefer exposing the DOM node directly when a custom imperative API adds no value.

## Ref callback cleanup

A ref callback may return cleanup logic.

```tsx
<div
  ref={(node) => {
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(handleResize);
    observer.observe(node);

    return () => observer.disconnect();
  }}
/>
```

Use braces for assignment callbacks so they do not accidentally return the node:

```tsx
<input
  ref={(node) => {
    inputNode = node;
  }}
/>
```

Do not read or write `ref.current` during render.

## Context provider syntax

Use the React 19 provider form:

```tsx
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}
```

`<ThemeContext.Provider>` remains compatible but is legacy syntax for new React 19 code.

## Context design

- Use a meaningful default only when it is safe outside a provider.
- Otherwise use `null` and fail clearly in a dedicated consumer Hook.
- Split read and dispatch contexts when it reduces avoidable coupling.
- Avoid recreating broad provider values through unnecessary wrapper objects.
- With React Compiler enabled, do not add `useMemo` to provider values by default.
- Prefer explicit props when only a small part of the tree needs the value.

## Component defaults and types

Use parameter defaults:

```tsx
type BadgeProps = {
  label?: string;
};

export function Badge({ label = "New" }: BadgeProps) {
  return <span>{label}</span>;
}
```

Do not use function component `defaultProps` or `propTypes` for new TypeScript code.
