# Migration and testing

## React 19 migration priorities

Confirm the project uses the modern JSX transform.

For TypeScript projects, keep React and React DOM types aligned with the installed runtime.

Use the official React 19 codemods when a broad migration is explicitly requested. Review every generated change.

## Removed or legacy APIs

Replace:

- `ReactDOM.render` with `createRoot`
- `ReactDOM.hydrate` with `hydrateRoot`
- `ReactDOM.unmountComponentAtNode` with `root.unmount`
- `react-dom/test-utils` `act` with `act` from `react`
- String refs with ref objects or callbacks
- Module-pattern factories with function components
- `React.createFactory` with JSX
- Legacy Context with `createContext` and Hooks
- Function component `defaultProps` with parameter defaults
- Function component `propTypes` with TypeScript or another explicit validation boundary

Do not introduce `findDOMNode` or dependencies on React internals.

## `forwardRef`

Do not mass-remove `forwardRef`.

Migrate it only when:

- The project is React 19-only.
- Public compatibility is understood.
- Ref types and behavior are verified.
- The resulting API is simpler.

## Testing strategy

Prefer tests that interact through accessible user behavior.

Cover relevant states:

- Initial
- Loading or Suspense fallback
- Empty
- Validation error
- Pending Action
- Success
- Optimistic state
- Optimistic rollback
- Unexpected error
- Retry
- Cancellation or cleanup
- Hidden and restored Activity state

Use:

- Testing Library-style queries and interactions
- `act` from `react` only when the testing utility does not already wrap updates
- Realistic async timing and cleanup
- Focus and accessibility assertions where the workflow depends on them

Avoid:

- New `react-test-renderer` tests
- New `react-dom/test-utils` usage
- Assertions against private Hook or component internals
- Snapshot-only coverage for interactive behavior

## Migration review

After migration:

1. Run type checking.
2. Run compiler-aware linting.
3. Run focused tests.
4. Inspect hydration and console warnings.
5. Verify forms and refs.
6. Verify server/client serialization.
7. Profile only the interactions whose performance changed.
