# Core Flow Design

## Contents

- Purpose
- 2.1 One flow must serve one primary goal
- 2.2 Describe states, not pages
- 2.3 Every state transition needs a cause
- 2.4 Design beyond the happy path
- 2.5 Preserve user progress
- 2.6 Make outcomes explicit
- Flow: FL-[number]
  - Name
  - Related user need
  - Related journey
  - Primary user
  - Secondary actors
  - Primary goal
  - Business outcome
  - Start state
  - End states
  - Flow owner
  - Confidence
- Required fields
  - Primary user
  - User goal
  - Trigger
  - Motivation
  - Frequency
  - Context
  - Related evidence
  - Success from the user’s perspective
  - Success from the service’s perspective
- Preconditions may include
- Preconditions table
- Rules
- Entry-point table
- Entry-point rules
- Happy-path table
- Every step must include
- Happy-path rules

## Purpose

Use this document to convert validated user needs and future journey maps into implementation-ready application flows.

A flow specification must describe:

- user intent
- application states
- state transitions
- business rules
- decisions
- permissions
- success paths
- alternative paths
- validation failures
- system failures
- recovery behaviour
- completion outcomes
- measurable events

Do not describe:

- visual styling
- colours
- typography
- spacing
- page composition
- component appearance
- animation
- design trends
- frontend framework choices

A flow describes **what must happen and why**, not how the interface should look.

---

# 1. Required inputs

Before designing a flow, collect:

- validated user needs from `01-user-needs-and-scope.md`
- future journey stages from `02-journey-mapping.md`
- relevant user roles
- permissions and ownership rules
- business rules
- legal, security and contractual constraints
- required data
- external system dependencies
- current failure cases
- support and operational processes
- analytics requirements
- existing technical constraints

If critical information is missing, label it as an assumption or unresolved decision.

Do not invent business rules.

---

# 2. Core flow principles

## 2.1 One flow must serve one primary goal

Each flow must have one clear primary outcome.

Good:

> Enable an authorised store manager to approve a pending refund.

Bad:

> Manage refunds, users, settings and reports.

Related secondary actions may appear in the flow, but they must not obscure the primary goal.

---

## 2.2 Describe states, not pages

A page is an implementation detail.

A state describes the condition of the task or entity.

Examples:

- not started
- draft
- awaiting information
- ready to submit
- validating
- submitted
- processing
- awaiting approval
- approved
- rejected
- failed
- cancelled
- expired
- completed

Several states may appear on one page.

One state may appear across several channels.

---

## 2.3 Every state transition needs a cause

A transition must identify:

- current state
- triggering actor
- triggering action or event
- required conditions
- business rules evaluated
- resulting state
- data changed
- side effects
- failure outcome

Do not use unexplained transitions such as:

```text
Pending → Complete
```

Use:

```text
Pending
→ authorised reviewer approves request
→ approval rules pass
→ Approved
→ requester notified
```

---

## 2.4 Design beyond the happy path

A complete flow includes:

- successful completion
- optional paths
- alternative valid outcomes
- invalid input
- permission denial
- duplicated actions
- expired actions
- dependency failure
- network interruption
- partial completion
- cancellation
- retry
- escalation
- abandonment
- resumed sessions

A happy path without recovery logic is not implementation-ready.

---

## 2.5 Preserve user progress

When technically and legally possible:

- retain valid information after validation errors
- save long or interruption-prone work
- prevent duplicate submissions
- preserve progress during authentication
- make retry behaviour safe
- explain when data cannot be retained
- define how long drafts remain available

---

## 2.6 Make outcomes explicit

After every meaningful action, the user must be able to determine:

- whether the action succeeded
- whether it failed
- whether it is still processing
- what changed
- what happens next
- whether another person must act
- whether the user must do anything else
- where the task can be found later

---

# 3. Flow identity

Every flow must start with this record.

## Flow: FL-[number]

### Name

[Verb and outcome, such as “Approve a refund request”]

### Related user need

UN-[number]

### Related journey

[Journey name and stage]

### Primary user

[User type]

### Secondary actors

- [Role]
- [System]
- [External party]

### Primary goal

[Outcome the user is trying to achieve]

### Business outcome

[Legitimate organisational outcome supported]

### Start state

[State before the flow begins]

### End states

- Successful:
- Alternative:
- Cancelled:
- Failed:
- Expired:

### Flow owner

[Team, role or service responsible]

### Confidence

- Validated
- Partially validated
- Proposed
- Assumed

---

# 4. Mandatory flow structure

Every flow specification must contain all 15 sections below.

---

# 1. User and goal

Define who initiates the flow and what they are trying to achieve.

## Required fields

### Primary user

[Specific user type]

### User goal

[Task or outcome]

### Trigger

[Situation causing the user to act]

### Motivation

[Why completing the goal matters]

### Frequency

- One-time
- Occasional
- Frequent
- Continuous operational task

### Context

- device or channel
- time pressure
- experience level
- accessibility needs
- connectivity conditions
- operational environment

### Related evidence

- E-[number]
- UN-[number]

### Success from the user’s perspective

[Observable result]

### Success from the service’s perspective

[Observable and measurable result]

---

# 2. Preconditions

Record everything that must already be true before the flow can begin.

## Preconditions may include

- user is authenticated
- user account is active
- user has the required role
- required entity exists
- entity is in an eligible state
- prerequisite tasks are complete
- required data is available
- external system is reachable
- deadline has not passed
- legal consent has been obtained
- organisation or subscription is active
- another person has completed an earlier action

## Preconditions table

| ID     | Precondition | How verified      | If not met | Recovery or next action |
| ------ | ------------ | ----------------- | ---------- | ----------------------- |
| PC-001 | [Condition]  | [System or actor] | [Outcome]  | [Action]                |

## Rules

- Verify preconditions as early as practical.
- Do not allow users to complete substantial work before revealing a known blocking condition.
- Explain unmet conditions in user language.
- Provide a next action when recovery is possible.
- Distinguish permanent ineligibility from temporary unavailability.

---

# 3. Entry points

Document every supported way the user can enter the flow.

## Entry-point table

| ID     | Entry point         | User state | Context retained | Authentication required | Destination  |
| ------ | ------------------- | ---------- | ---------------- | ----------------------- | ------------ |
| EP-001 | [Dashboard action]  | [State]    | [Context]        | Yes                     | [Flow state] |
| EP-002 | [Email link]        | [State]    | [Context]        | Yes                     | [Flow state] |
| EP-003 | [External referral] | [State]    | [Context]        | No                      | [Flow state] |

## Entry-point rules

For each entry point, define:

- who can use it
- which object or task it refers to
- whether the link can expire
- whether authentication interrupts the route
- where the user returns after authentication
- what happens when the referenced entity no longer exists
- what happens when the action has already been completed
- what happens when the user lacks permission
- whether deep links preserve context
- whether repeated entry is safe

Do not send all entry points to a generic dashboard if the user’s intended task is known.

---

# 4. Happy path

The happy path is the shortest valid sequence that completes the primary goal under normal conditions.

## Happy-path table

| Step | Current state | Actor | Action   | Rules evaluated | System response | Resulting state |
| ---- | ------------- | ----- | -------- | --------------- | --------------- | --------------- |
| 1    | [State]       | User  | [Action] | BR-[ID]         | [Response]      | [State]         |

## Every step must include

- actor
- user or system intent
- required input
- action
- business-rule evaluation
- state change
- persisted data
- system response
- next available actions

## Happy-path rules

- Include only necessary steps.
- Request information when it becomes relevant.
- Reuse reliable information already available.
- Avoid repeated confirmation for reversible low-risk actions.
- Require review before consequential submissions where errors could cause harm.
- Prevent duplicate effects from repeated requests.
- Make background processing visible as a state.
- Do not present an action as complete while processing is still unresolved.

---