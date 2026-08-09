---
name: clean-code
description: Write, review, refactor, and improve code for readability, maintainability, correctness, and safe changeability. Apply pragmatic clean-code and SOLID principles without unnecessary abstraction, unrelated refactors, premature DRY, or behavior changes. Use across languages and frameworks while following the repository's existing conventions first. For refactoring tasks, read `references/refactoring-guide.md` before proposing or applying changes.
---

# Clean Code

Write code that another developer can understand, verify, and safely change.

## Priority order

Apply these priorities in order:

1. Preserve correct behavior.
2. Follow repository conventions.
3. Prefer clarity over cleverness.
4. Prefer simple code over unnecessary abstraction.
5. Keep changes focused on the requested task.
6. Improve readability, safety, testability, and changeability.
7. Apply SOLID principles only where they solve a real design problem.

If a clean-code rule conflicts with established project conventions, project conventions win.

## Workflow

Before changing code:

1. Read the relevant files and nearby conventions.
2. Identify the requested behavior and current behavior.
3. Determine the smallest coherent change.
4. Identify important failure paths and invariants.
5. Avoid unrelated cleanup unless it is required for the requested change.

While changing code:

1. Keep the main flow easy to scan.
2. Use names that explain intent.
3. Keep responsibilities separated.
4. Make side effects explicit.
5. Handle errors deliberately.
6. Preserve public contracts unless the task requires changing them.
7. Add or update focused tests when behavior is important or easy to break.

Before finishing:

1. Run the relevant formatter, type checker, linter, and focused tests when available.
2. Review the change using `references/review-checklist.md`.
3. Report commands that were not run.
4. Do not claim behavior or performance improvements without verification.

## Naming

- Use names that explain intent rather than implementation details.
- Avoid vague names such as `data`, `item`, `object`, `temp`, `helper`, `manager`, or `processor` unless the scope is tiny and obvious.
- Follow the language and framework's standard casing.
- Name booleans as questions:
  - `isLoading`
  - `hasErrors`
  - `canRetry`
  - `shouldReconnect`
- Name functions with clear verbs:
  - `fetch`
  - `create`
  - `update`
  - `delete`
  - `normalize`
  - `format`
  - `calculate`
  - `validate`
- Reserve `handle*` for UI or event handlers.
- Use plural names for collections.
- Do not use misleading names.
- A function named `get*` should not perform network or disk I/O. Use `fetch*`, `load*`, or another side-effect-revealing name.

## Files and structure

- Give each file one clear main purpose.
- Keep related code close together.
- Split files when they contain unrelated responsibilities.
- Order code so the primary flow reads naturally from top to bottom.
- Use blank lines to separate concepts, not individual statements.
- Avoid long lines that require horizontal scrolling.
- Use the repository formatter.
- Do not introduce personal formatting rules.
- Do not move code between files unless the move improves the requested change.

## Comments

- Prefer clear code over explanatory comments.
- Write comments only when they explain why.
- Useful comments document:
  - Constraints
  - Tradeoffs
  - Compatibility requirements
  - Non-obvious business rules
  - Security implications
  - Legal or license requirements
  - Temporary workarounds with a removal condition
- Do not comment what the code already says.
- Remove outdated, redundant, or misleading comments.

## Functions and methods

- Give each function one clear responsibility at one level of abstraction.
- Keep function parameters low.
- When three or more related parameters appear, consider a named options object or type.
- Avoid boolean control parameters that hide multiple behaviors.
- Prefer separate functions or named options.
- Prefer returning values over mutating output parameters.
- Prefer pure functions for:
  - Calculations
  - Formatting
  - Mapping
  - Parsing
  - Validation
  - Normalization
- Make side effects obvious in the name.
- Separate queries from commands when it improves clarity.
- Define predictable error behavior:
  - Throw
  - Return `null`
  - Return a result object
  - Handle internally
- Be consistent within the module and codebase.
- Split a function when it:
  - Is hard to name
  - Is hard to test
  - Has deep nesting
  - Mixes unrelated responsibilities
  - Mixes orchestration with low-level detail
- Do not extract wrappers that only rename one obvious operation.
- Avoid premature DRY.
- Prefer small duplication over a wrong abstraction.

## Control flow

- Prefer flat control flow.
- Use guard clauses for invalid, missing, forbidden, empty, or unsupported cases.
- Keep the happy path visible.
- Prefer positive conditions.
- Avoid double negatives.
- Extract complex conditions into clearly named variables or functions.
- Avoid `else` after `return`, `throw`, `break`, or `continue`.
- Keep loop bodies small.
- Extract loop processing only when it improves readability.
- Validate inputs before the main operation.
- Do not fake success for invalid states.
- If repeated branching selects behavior, consider a map, factory, strategy, or polymorphism only when it simplifies the design.

## Error handling

- Never swallow errors silently.
- Make expected and unexpected failures distinguishable.
- Error messages should explain:
  - What failed
  - Which operation failed
  - Which relevant value or condition caused the failure
- Preserve useful original error context when wrapping errors.
- Do not use exceptions for ordinary control flow.
- Do not expose secrets or sensitive internal details in user-facing errors.
- Keep recovery behavior explicit.

## Data, objects, and classes

Use plain data structures for values that are:

- Passed between layers
- Stored
- Serialized
- Displayed
- Received from APIs

Use objects or classes when:

- Behavior belongs with the data
- Invariants must be protected
- State transitions need controlled access
- A real domain concept benefits from encapsulation

Do not create classes that only hold public data without behavior.

Keep internals private when callers should not mutate them directly.

Prefer telling an object to perform behavior over reading its internals and reimplementing that behavior elsewhere.

## SOLID principles

Apply SOLID pragmatically.

### Single Responsibility Principle

A function, class, or module should have one main reason to change.

Use it when responsibilities are genuinely independent.

Do not split code into many tiny files or classes that make the flow harder to follow.

### Open/Closed Principle

Prefer extension points when new variants are likely and stable behavior should not be repeatedly modified.

Do not introduce factories, registries, or strategies for one simple branch.

### Liskov Substitution Principle

Subtypes must preserve the expectations of the abstraction they implement.

Do not use inheritance when implementations require different contracts, exceptions, or preconditions.

### Interface Segregation Principle

Keep interfaces focused.

Do not force callers or implementations to depend on methods they do not use.

### Dependency Inversion Principle

Depend on abstractions when it improves testability, replaceability, or architectural boundaries.

Do not create interfaces for every concrete class.

Prefer composition before inheritance.

## Refactoring discipline

Refactor only to improve:

- Readability
- Safety
- Testability
- Changeability
- Separation of concerns

Do not refactor merely to make code look more advanced.

Rules:

- Preserve behavior unless the task explicitly changes it.
- Keep changes small and reviewable.
- Prefer incremental improvement over rewrites.
- Avoid unrelated cleanup during feature or bug-fix work.
- Add or update tests for risky, complex, or important behavior.
- Do not rename public APIs without a clear requirement and migration plan.
- Do not replace working code with a pattern unless the pattern clearly improves the design.

## Review behavior

When reviewing code:

1. Report correctness, security, and data-loss risks first.
2. Identify unclear naming and hidden side effects.
3. Identify mixed responsibilities and excessive coupling.
4. Identify deep nesting and difficult control flow.
5. Identify inconsistent error behavior.
6. Identify premature abstraction and unnecessary patterns.
7. Identify duplication only when a shared abstraction is stable and clearer.
8. Suggest the smallest practical correction.
9. Separate required fixes from optional improvements.
10. Do not request style-only changes already handled by formatter or linter.

## Output expectations

When writing code:

- Return production-usable code.
- Follow the repository's existing style.
- Keep comments minimal and focused on why.
- Avoid abbreviations unless they are established domain terms.
- Use precise names.
- Do not introduce unrelated dependencies.
- Do not add abstraction without a demonstrated need.
- Mention the SOLID principle used only when it materially influenced the design.

When refactoring:

- State the behavior being preserved.
- Make the smallest coherent change.
- Explain only important design decisions.
- Include verification steps.

When reviewing:

- Lead with findings, ordered by severity.
- Point to specific files, symbols, or lines when available.
- Explain impact and a concrete fix.
- Avoid vague advice.
