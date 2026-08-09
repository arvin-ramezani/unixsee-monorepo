# Refactoring Guide

## Refactor when

Refactor when the current design makes a required change:

- Hard to understand
- Risky to modify
- Difficult to test
- Repetitive in a stable way
- Coupled across unrelated responsibilities
- Inconsistent in error behavior
- Prone to invalid states

## Do not refactor when

Avoid refactoring when:

- The code is unrelated to the requested task.
- The abstraction is speculative.
- The behavior is not understood.
- Tests are missing and the rewrite would be risky.
- The improvement is style-only.
- The new pattern adds more concepts than it removes.
- Duplication is small and the shared concept is not stable.

## Incremental sequence

1. Characterize current behavior.
2. Add focused tests if needed.
3. Rename unclear symbols.
4. Flatten control flow.
5. Extract pure logic.
6. Separate side effects.
7. Group related parameters.
8. Split responsibilities only when clear.
9. Introduce abstractions only after repeated stable patterns appear.
10. Re-run verification after each meaningful step.

## Safe extraction

Extract a function when the extracted block has:

- A clear name
- A coherent responsibility
- A stable input and output
- Improved readability
- Independent test value

Do not extract code only to reduce line count.

## Duplication decision

Before removing duplication, ask:

1. Do the duplicated blocks represent the same concept?
2. Will they change for the same reason?
3. Is the shared abstraction easier to understand?
4. Does the abstraction avoid configuration flags and branching?
5. Will future variants fit naturally?

If not, keep the duplication.

## Class extraction

Extract a class only when behavior and invariants belong together.

Do not create a class merely to:

- Rename a function group
- Hold public fields
- Satisfy a pattern
- Wrap one dependency
- Avoid a module with clear functions

## Dependency extraction

Introduce an interface or port when:

- Multiple implementations already exist or are expected.
- Tests need a stable replaceable boundary.
- An external service must be isolated.
- A domain layer should not depend on infrastructure.

Do not create one-to-one interfaces for every implementation by default.
