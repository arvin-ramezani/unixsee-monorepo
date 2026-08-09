# Clean Code Review Checklist

## Scope and behavior

- [ ] The requested behavior is clear.
- [ ] Existing behavior is preserved unless intentionally changed.
- [ ] The change avoids unrelated refactors.
- [ ] Public contracts remain compatible or have an explicit migration plan.
- [ ] The change is small enough to review confidently.

## Naming

- [ ] Names communicate intent.
- [ ] Boolean names read like questions.
- [ ] Function names reveal side effects.
- [ ] Collection names are plural.
- [ ] Vague names are avoided.
- [ ] `get*` functions do not hide I/O.

## Structure

- [ ] Each file has one clear main purpose.
- [ ] Related code is colocated.
- [ ] The main flow is easy to read top to bottom.
- [ ] Unrelated responsibilities are separated.
- [ ] The formatter controls presentation.
- [ ] Comments explain why, not what.

## Functions

- [ ] Each function has one clear responsibility.
- [ ] Parameter count is reasonable.
- [ ] Boolean control parameters are avoided.
- [ ] Pure logic is separated from side effects where useful.
- [ ] Error behavior is predictable.
- [ ] Tiny wrappers without value are avoided.
- [ ] Duplication was not removed through a wrong abstraction.

## Control flow

- [ ] Guard clauses keep nesting shallow.
- [ ] The happy path is visible.
- [ ] Complex conditions have meaningful names.
- [ ] Double negatives are avoided.
- [ ] Unnecessary `else` branches are removed.
- [ ] Loop bodies remain easy to scan.
- [ ] Inputs are validated early.

## Errors

- [ ] Errors are not swallowed.
- [ ] Expected and unexpected failures are separated.
- [ ] Messages explain the failed operation.
- [ ] Sensitive details are not exposed.
- [ ] Recovery behavior is explicit.
- [ ] Original error context is preserved when useful.

## Data and design

- [ ] Plain data remains plain data.
- [ ] Classes protect meaningful behavior or invariants.
- [ ] Composition is preferred over inheritance.
- [ ] Interfaces remain focused.
- [ ] Dependencies are abstracted only where useful.
- [ ] SOLID principles improve the design rather than increase ceremony.
- [ ] No unnecessary factory, strategy, repository, service, or manager abstraction was added.

## Verification

- [ ] Relevant tests were added or updated.
- [ ] Formatter was run.
- [ ] Type checker was run.
- [ ] Linter was run.
- [ ] Focused tests were run.
- [ ] Unrun checks are reported honestly.
