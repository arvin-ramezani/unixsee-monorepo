# Compiler-aware performance

## Default policy

React Compiler automatically memoizes component rendering work and values where safe. Therefore:

- Do not add `React.memo` by default.
- Do not add `useMemo` by default.
- Do not add `useCallback` by default.
- Do not rewrite ordinary code around reference identity without evidence.
- Do not remove existing manual memoization blindly.

Optimize the data flow and component boundaries before adding manual caches.

## Manual memoization decision

Add manual memoization only when all are true:

1. A measurable performance problem exists or an external API explicitly requires stable identity.
2. React DevTools or profiling identifies the relevant work.
3. The compiler does not already produce the required result.
4. The memoization does not hide incorrect dependencies or mutation.
5. The code remains clearer than the unoptimized version.
6. Verification covers behavior and performance.

Memoization is not a semantic guarantee. Do not rely on it for correctness.

## Preserve existing memoization

The compiler-aware lint rules check that existing memoization remains valid. Incomplete dependencies may cause the compiler to skip optimization.

When editing existing `useMemo` or `useCallback`:

- Preserve complete dependencies.
- Verify that the callback returns a value.
- Never put side effects inside `useMemo`.
- Do not silence lint warnings.
- Remove memoization only in a focused cleanup backed by tests or profiling.

## Compiler-compatible React code

Keep components and Hooks:

- Pure
- Immutable
- Static
- Deterministic
- Free of render-time ref access
- Free of synchronous state writes during render
- Free of unnecessary synchronous derived-state Effects

Compiler-aware lint categories include:

- `rules-of-hooks`
- `exhaustive-deps`
- `component-hook-factories`
- `config`
- `error-boundaries`
- `gating`
- `globals`
- `immutability`
- `incompatible-library`
- `preserve-manual-memoization`
- `purity`
- `refs`
- `set-state-in-effect`
- `set-state-in-render`
- `static-components`
- `unsupported-syntax`
- `use-memo`

Do not fix a compiler diagnostic only by opting the function out. Fix the design when practical.

## Directives

### `"use memo"`

Do not add it in normal infer mode.

Use it only when:

- `compilationMode` is `annotation`.
- The repository explicitly uses opt-in compilation.
- A compiler migration task requires it.

### `"use no memo"`

Use only to isolate a suspected compiler issue or temporarily shield incompatible code.

Requirements:

- Put it first in the function body.
- Record why it exists.
- Add a removal condition.
- Do not treat it as a permanent performance solution.

## Verification

When performance matters:

1. Confirm the component has the compiler optimization badge in React DevTools.
2. Compare production builds, not only development behavior.
3. Profile the actual interaction.
4. Check render counts and expensive computations.
5. Verify that reduced renders improve user-visible latency.
6. Keep optimizations only when the result is meaningful.

## Libraries

If a compiler lint identifies an incompatible library API:

- Check for a compiler-compatible API from the same library.
- Keep the component correct even if the compiler skips it.
- Do not replace a mature library solely to remove a skip without measuring impact.
- Isolate incompatible usage when that improves maintainability.
