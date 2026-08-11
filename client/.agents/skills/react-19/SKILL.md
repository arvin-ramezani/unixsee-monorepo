---
name: react-19
description: Build, refactor, review, or debug React 19.x TypeScript code in projects where React Compiler is enabled. Use for components, Hooks, Actions, forms, Suspense, the use API, refs, context, effects, Activity, state design, performance, testing, and React 19 migrations. Do not use as the sole authority for framework-specific routing, caching, data fetching, Server Component boundaries, or deployment; load the relevant framework skill too.
---

# React 19

Apply modern React 19.x patterns while assuming React Compiler is enabled and correctly configured.

## Operating assumptions

- The project uses React 19.x with the modern JSX transform.
- React Compiler is enabled.
- TypeScript is preferred.
- Existing project conventions and framework rules remain authoritative.
- Do not change React, compiler, lint, or framework versions unless the task explicitly requires it.
- For React Server Components, use the framework-supported React version and current security patches.

## Workflow

1. Inspect the relevant files, package versions, lint rules, compiler configuration, and framework boundary.
2. Identify whether each edited module runs on the client, server, or both.
3. Choose the smallest React API that directly models the requirement.
4. Preserve existing behavior before modernizing syntax.
5. Run the project’s formatter, type checker, lint command, and focused tests when available.
6. Report compiler skips, lint violations, unsupported APIs, or framework-specific uncertainty instead of hiding them.

## Core implementation rules

### Components and rendering

- Use function components for new code.
- Keep components and custom Hooks pure.
- Treat props, state, context values, and Hook arguments as immutable snapshots.
- Derive values during render when they can be calculated from existing props or state.
- Do not create component definitions inside other components.
- Keep render deterministic. Do not call impure APIs such as `Date.now()`, `Math.random()`, `crypto.randomUUID()`, or `performance.now()` during render.
- Use stable semantic keys from data. Never generate keys during render.
- For a positive-only JSX branch, replace `condition ? <Component /> : null` with `condition && <Component />` when `condition` is already boolean.
- When the left operand is a string or number, coerce it first with `!!value` or use an explicit boolean predicate: `!!label && <Component />` or `count > 0 && <Component />`. Never write `count && <Component />`, because React renders `0`.
- Keep a ternary when both branches render meaningful values. Use an `if` statement or extracted variable when short-circuit rendering would reduce clarity.
- Prefer composition and explicit props over `cloneElement`, `Children` transformations, or hidden coupling.
- Preserve controlled versus uncontrolled input behavior for the component’s full lifetime.

### State

- Store the minimum state required.
- Do not mirror props in state unless the component intentionally owns an editable snapshot.
- Use functional state updates when the next value depends on the previous value.
- Keep state close to the components that own it.
- Use a reducer when transitions form a meaningful state machine or several values must change atomically.
- Do not synchronously set derived state in an Effect.
- Do not mutate objects or arrays held in state.

### Effects

- Use Effects only to synchronize React with an external system.
- Do not use Effects for ordinary data transformation, event handling, or derived state.
- Include every reactive dependency required by the Effect.
- Fix dependency design instead of suppressing `exhaustive-deps`.
- Return cleanup functions for subscriptions, timers, observers, and other external resources.
- Use `useEffectEvent` only for non-reactive event logic invoked from an Effect.
- Never use `useEffectEvent` to hide a dependency that should re-synchronize the Effect.
- Do not pass Effect Events to children or unrelated Hooks.

Read `references/state-effects-and-events.md` for effect design, transitions, deferred values, and React 19.2 APIs.

### React Compiler and performance

- Do not add `memo`, `useMemo`, or `useCallback` by default.
- Write pure, compiler-compatible code first.
- Preserve existing manual memoization unless the task explicitly includes removing it and behavior is verified.
- Add manual memoization only when profiling or an external API contract demonstrates a real need that the compiler does not satisfy.
- Never use memoization for correctness, side effects, or dependency suppression.
- Keep dependency arrays complete even when the compiler is enabled.
- Do not add `"use memo"` unless the compiler uses annotation mode or the repository explicitly requires it.
- Treat `"use no memo"` as a temporary debugging escape hatch with a removal plan.
- Do not ignore compiler-aware `eslint-plugin-react-hooks` diagnostics. The compiler may safely skip a violating component, but the underlying design issue should still be evaluated.

Read `references/compiler-aware-performance.md` for compiler-specific decisions and review rules.

### Actions and forms

- Prefer function-based `<form action>` and `formAction` when the workflow is naturally a form submission and the framework supports the execution boundary.
- Use `useActionState` when an Action should produce renderable state and pending status.
- Use `useFormStatus` inside a component rendered within the relevant form.
- Use `useOptimistic` for reversible immediate feedback while an Action is pending.
- Keep authoritative validation and authorization at the mutation boundary.
- Preserve accessible labels, descriptions, field errors, focus behavior, and submission feedback.
- Remember that successful function Actions reset uncontrolled form fields.
- Use `requestFormReset` only when an explicit reset is required.
- Do not replace a simple synchronous event handler with an Action without a user-visible concurrency or mutation benefit.

Read `references/actions-and-forms.md` before implementing or reviewing Action-based workflows.

### `use`, Suspense, and asynchronous resources

- `use` is an API, not a Hook, and may be called conditionally or in loops.
- Call `use` only during component or Hook rendering.
- Pass only cached Promises whose identity is reused across retries and re-renders.
- Never call `use(fetch(...))`, an uncached async function, or `.then(...)` created during render.
- Prefer Promises created by the framework, a Server Component, a route loader, an event, or a Suspense-compatible cache.
- Place the reading subtree under an intentional Suspense boundary.
- Handle rejected Promises with an Error Boundary.
- Never wrap `use` in `try/catch`.
- When a Promise crosses from a Server Component to a Client Component, its resolved value must be serializable.
- Do not use `use` merely because it is new. Prefer ordinary values, `await` in supported server code, or event-driven fetching when they better match the flow.

Read `references/use-suspense-and-async.md` before introducing `use` or changing Suspense boundaries.

### Refs and imperative behavior

- In React 19, accept `ref` as a normal prop in new function components.
- Do not introduce `forwardRef` for new React 19-only components.
- Preserve `forwardRef` where compatibility with older React versions or public library consumers requires it.
- Use `useImperativeHandle` only when exposing a narrow imperative API is necessary.
- Do not read or write `ref.current` during render.
- Ref callback cleanup functions may return cleanup logic.
- Avoid implicit ref callback returns that accidentally return the assigned node.

Read `references/refs-context-and-component-apis.md` for typed patterns.

### Context

- Render `<SomeContext value={value}>` for new React 19 code.
- Use `useContext` for normal unconditional reads.
- Use `use(SomeContext)` only when conditional or loop-based context access is genuinely useful.
- Split contexts by change frequency and responsibility when broad context updates cause unnecessary coupling.
- Do not use context as a default replacement for explicit composition or local state.

### React 19.2 APIs

- Use `<Activity mode="hidden">` when UI must be hidden while preserving its state and allowing lower-priority background rendering.
- Do not use Activity as a generic CSS visibility wrapper.
- Expect Effects in hidden Activity trees to clean up and reconnect when visible again.
- Use the second `initialValue` argument of `useDeferredValue` when the initial render should use a deliberate placeholder value.
- Treat React Performance Tracks and server rendering APIs as diagnostics or framework-integration features, not ordinary component APIs.

### Server Components and Server Functions

- `"use server"` marks Server Functions; it does not mark Server Components.
- Do not add `"use server"` to a component to make it a Server Component.
- Do not assume a generic React package controls framework-specific server/client boundaries.
- Keep secrets, privileged data access, authorization, and mutations on the server boundary.
- Pass only serializable values across server-to-client boundaries.
- Defer routing, caching, revalidation, streaming policy, and directive placement to the framework skill and framework documentation.

Read `references/server-rendering-and-rsc.md` for the React-level contract.

### Error handling

- Use Error Boundaries for render failures and rejected resources read with `use`.
- Handle expected mutation failures as typed Action results or explicit UI state.
- Do not use Error Boundaries as validation or ordinary control flow.
- Preserve recovery actions, retry behavior, and accessible error messaging.
- Do not swallow errors only to keep the UI rendering.

### Testing

- Test user-visible behavior rather than component internals.
- Import `act` from `react` when direct use is required.
- Prefer Testing Library-style interaction tests for new component tests.
- Do not introduce `react-dom/test-utils` or `react-test-renderer` for new tests.
- Test pending, success, validation, optimistic rollback, Suspense fallback, error, and retry states when applicable.

### Deprecated and removed patterns

Do not introduce:

- Function component `propTypes`
- Function component `defaultProps`; use parameter defaults
- String refs
- Legacy Context APIs
- Module-pattern component factories
- `React.createFactory`
- `ReactDOM.render`
- `ReactDOM.hydrate`
- `ReactDOM.unmountComponentAtNode`
- `ReactDOM.findDOMNode`
- `react-dom/test-utils`
- New `forwardRef` wrappers for React 19-only components
- Reliance on React internals
- The old JSX transform

Read `references/migration-and-testing.md` for migrations and compatibility decisions.

## Reference loading map

Load only the references relevant to the task:

- Forms, mutations, pending states, optimistic UI: `references/actions-and-forms.md`
- `use`, Promises, Suspense, Error Boundaries: `references/use-suspense-and-async.md`
- Effects, state derivation, transitions, Activity: `references/state-effects-and-events.md`
- Ref props, context providers, ref cleanup, component APIs: `references/refs-context-and-component-apis.md`
- Compiler-aware performance and lint rules: `references/compiler-aware-performance.md`
- Server Components, Server Functions, serialization: `references/server-rendering-and-rsc.md`
- Legacy migration and testing: `references/migration-and-testing.md`
- Final review: `references/review-checklist.md`
- Source verification: `references/official-sources.md`

## Output expectations

When implementing:

- Make the smallest coherent change.
- Follow the repository’s naming, formatting, accessibility, testing, and file-boundary conventions.
- Explain only material React 19 or compiler decisions.
- Do not claim a performance improvement without profiling evidence.
- Do not present framework behavior as a React guarantee.

When reviewing:

1. List correctness issues first.
2. Identify React 19 opportunities only when they simplify or strengthen the code.
3. Identify compiler blockers and manual memoization that lacks evidence.
4. Separate React-level findings from framework-specific findings.
5. Provide concrete file-level changes and verification steps.
