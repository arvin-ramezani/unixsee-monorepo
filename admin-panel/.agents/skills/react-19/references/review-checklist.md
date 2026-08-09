# React 19 review checklist

## Boundaries

- [ ] The client, server, and shared module boundaries are clear.
- [ ] Framework-specific behavior is not presented as a React guarantee.
- [ ] Values crossing server-to-client boundaries are serializable.
- [ ] Secrets, authorization, and mutations remain on the server.

## Rendering

- [ ] Components and Hooks are pure.
- [ ] Render output is deterministic.
- [ ] Props and state are not mutated.
- [ ] Components are not declared inside components.
- [ ] Keys come from stable data.
- [ ] Positive-only JSX branches use `&&` instead of `condition ? <Component /> : null`.
- [ ] String and number operands are converted to booleans with `!!value` or an explicit predicate before `&&`; raw `0` cannot leak into the rendered output.

## State and Effects

- [ ] State is minimal.
- [ ] Derived values are calculated during render.
- [ ] Effects synchronize with external systems only.
- [ ] Effect dependencies are complete.
- [ ] Cleanup mirrors setup.
- [ ] `useEffectEvent` is used only for Effect-fired non-reactive logic.

## Compiler

- [ ] No new manual memoization was added without evidence.
- [ ] Existing manual memoization remains valid.
- [ ] Compiler-aware lint diagnostics are addressed or documented.
- [ ] No permanent `"use no memo"` escape hatch was introduced.
- [ ] `"use memo"` matches the repository’s compilation mode.

## Async and Suspense

- [ ] Promises passed to `use` are cached.
- [ ] No Promise is created during Client Component render.
- [ ] Suspense boundaries match meaningful loading regions.
- [ ] Rejected resources have an Error Boundary.
- [ ] `use` is not wrapped in `try/catch`.

## Actions and forms

- [ ] The Action model is appropriate for the interaction.
- [ ] Pending, validation, error, and success states are visible.
- [ ] Optimistic updates have rollback or recovery behavior.
- [ ] Server mutations validate and authorize inputs.
- [ ] Form labels, errors, focus, and button types are correct.

## Refs and context

- [ ] New React 19-only components receive `ref` as a prop.
- [ ] Ref values are not read or written during render.
- [ ] Ref callbacks do not accidentally return assigned nodes.
- [ ] New providers use `<Context value={value}>`.
- [ ] Context is not broader than necessary.

## Testing

- [ ] Tests cover user-visible behavior.
- [ ] Async and recovery states are covered.
- [ ] No new legacy React testing APIs were introduced.
- [ ] Types, lint, and focused tests pass.
