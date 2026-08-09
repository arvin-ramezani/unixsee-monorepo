# Heuristic Review Method

## Contents

- Purpose
- Review identity
  - Review ID
  - Flow
  - Primary user
  - Goal
  - Scenario
  - Entry point
  - Expected completion
  - Included states
  - Included channels
  - Evidence reviewed
  - Known assumptions
- Step 1: Define the task scenario
- Step 2: Walk through every path
- Step 3: Review each path against all ten heuristics
- Step 4: Evaluate independently when possible
- Step 5: Consolidate findings
- Step 6: Assign severity
- Step 7: Prioritise and validate

## Purpose

Use this document to evaluate whether an application flow helps users complete their goals clearly, safely and efficiently.

The review applies Nielsen Norman Group’s ten usability heuristics to:

- user journeys
- application flows
- task states
- business-rule decisions
- permissions
- validation
- system failures
- recovery paths
- notifications
- post-completion behaviour

This is not a visual-design review.

Do not evaluate:

- colours
- typography
- spacing
- visual trends
- decorative styling
- component aesthetics
- animation quality

Only mention a presentation detail when it directly affects task understanding, feedback, error recovery or successful completion.

---

# 1. Required inputs

Before reviewing a flow, collect:

- validated user needs from `01-user-needs-and-scope.md`
- current and future journeys from `02-journey-mapping.md`
- flow specification from `03-flow-design-rules.md`
- user roles and permission rules
- business rules and decision tables
- known validation failures
- known system failures
- support tickets and user complaints
- analytics showing abandonment, errors or retries
- usability-testing findings, when available
- technical, legal, security and operational constraints

If the flow is incomplete, review the available material but record the missing evidence and specification gaps.

---

# 2. What heuristic evaluation can and cannot establish

A heuristic review identifies likely usability problems by comparing a flow with established interaction principles.

It can:

- expose missing states and feedback
- identify confusing language or ordering
- reveal weak cancellation and recovery behaviour
- find inconsistent rules
- identify preventable errors
- expose unnecessary memory demands
- reveal inefficiency in frequent tasks
- identify unnecessary steps and information
- improve error handling
- identify missing contextual help

It cannot prove that users will succeed.

Heuristic findings must be validated with real users, behavioural evidence or production data when the affected decision is important.

Do not present an expert or AI review as user research.

---

# 3. Review unit

Review one complete user goal at a time.

## Review identity

### Review ID

HR-[number]

### Flow

FL-[number]: [flow name]

### Primary user

[user type]

### Goal

[outcome the user is trying to achieve]

### Scenario

[realistic situation in which the user performs the task]

### Entry point

[how the user begins]

### Expected completion

[successful or legitimate alternative outcome]

### Included states

- [state]
- [state]

### Included channels

- [channel]
- [channel]

### Evidence reviewed

- [evidence reference]
- [evidence reference]

### Known assumptions

- [assumption]

---

# 4. Evaluation procedure

## Step 1: Define the task scenario

Specify:

- the user
- the trigger
- the intended outcome
- the user’s knowledge and permissions
- the starting state
- relevant constraints
- the expected end state

Do not review an application generically when the actual task is unknown.

---

## Step 2: Walk through every path

Review:

- happy path
- alternative valid paths
- validation failures
- permission failures
- system failures
- recovery and retry
- cancel, back and undo
- save and resume
- completion
- post-completion re-entry

Do not stop after the happy path.

---

## Step 3: Review each path against all ten heuristics

For each heuristic:

1. Ask every mandatory question.
2. Record the exact state or transition affected.
3. Describe the user consequence.
4. Reference supporting evidence when available.
5. Create one issue per distinct problem.
6. Recommend the required behaviour, not a visual component.

---

## Step 4: Evaluate independently when possible

When a team is available, each evaluator should review the same task independently before findings are discussed.

Recommended evaluator perspectives:

- user-domain perspective
- product or UX perspective
- engineering perspective
- support or operations perspective
- accessibility perspective

For AI-assisted review, run separate passes for relevant user roles and contexts. Do not claim these passes are equivalent to independent human evaluators.

---

## Step 5: Consolidate findings

After individual reviews:

- merge duplicate findings
- keep distinct root causes separate
- resolve disagreements through evidence
- preserve minority findings when risk is credible
- assign one primary heuristic to each issue
- add secondary heuristics only when they materially help understanding

---

## Step 6: Assign severity

Rate each confirmed problem using:

- frequency
- impact
- persistence

Assign severity only after the issue is clearly described.

---

## Step 7: Prioritise and validate

For each issue, decide whether it must be:

- fixed before implementation
- fixed before release
- scheduled after release
- investigated through user research
- measured in production
- accepted because of a documented constraint

A heuristic recommendation is not automatically the final solution. Validate high-risk changes with relevant users and operational stakeholders.

---