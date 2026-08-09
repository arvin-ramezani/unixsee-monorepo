# Output: States, Rules, Failures and Recovery

## Contents

- State sequence table
- State specification
  - State: ST-[number]
- State-sequence rules
- Business-rule register
  - Business rule: BR-[number]
- Decision table
- Decision-table rules
- Rule-conflict register
- 13.1 Loading states
  - Loading-state record
  - Loading rules
- 13.2 Empty states
  - Empty-state record
  - Empty-state rules
- 13.3 Validation errors
  - Validation-error record
  - Validation-error rules
- 13.4 System errors
  - System-failure record
  - System-error rules
- 13.5 Recovery states
  - Recovery record
  - Recovery types
  - Recovery rules

The purpose of this section is to define functional states, not layouts.

## State sequence table

| Step | State ID | State name | User goal | Entry condition | Required information | Available actions | System behaviour | Exit conditions |
|---|---|---|---|---|---|---|---|---|
| 1 | ST-001 | Eligibility check | [Goal] | [Condition] | [Data] | [Actions] | [Behaviour] | [Conditions] |

## State specification

### State: ST-[number]

#### Purpose

[Why this state exists]

#### Entry conditions

- [Condition]

#### User context

- role
- permissions
- known task
- previous state
- retained data
- channel

#### Information required

- [Information]

#### Information provided by the service

- [Information]

#### User actions

- primary action
- alternative action
- back
- save
- cancel
- help
- retry

#### System behaviour

- validation
- data persistence
- business-rule evaluation
- side effects
- background processing
- status changes

#### Exit conditions

- [Condition → next state]

#### Validation failures

- VR-[number]

#### System failures

- SF-[number]

#### Accessibility requirements

- [Requirement]

#### Analytics events

- EV-[number]

## State-sequence rules

- Name states by task or status, not page layout.
- Distinguish editable, read-only and processing states.
- Distinguish submitted from completed.
- Define empty and unavailable states.
- Define re-entry behaviour.
- Define what happens when state changes elsewhere.
- Define behaviour on stale data.
- Define context retained between states.

---

# 12. Business-rule decision table

## Business-rule register

### Business rule: BR-[number]

- **Name:** [Name]
- **Purpose:** [Reason]
- **Source:** [Policy, law, security, operations, assumption]
- **Applies to:** [Roles, states or entities]
- **Condition:** [Testable condition]
- **Outcome when true:** [Outcome]
- **Outcome when false:** [Outcome]
- **Priority:** [Conflict order]
- **Exceptions:** [Exceptions]
- **User-facing consequence:** [Consequence]
- **Validation status:** Confirmed / Proposed / Assumed
- **Test cases:** [Cases]

## Decision table

| Condition or result | Case 1 | Case 2 | Case 3 | Case 4 |
|---|---:|---:|---:|---:|
| User authenticated | Yes | Yes | Yes | No |
| User authorised | Yes | Yes | No | — |
| Entity eligible | Yes | No | — | — |
| Deadline valid | Yes | Yes | — | — |
| Result | Continue | Ineligible | Permission denied | Authenticate |

## Decision-table rules

- Use one column per meaningful combination.
- Avoid impossible combinations.
- Include default or fallback behaviour.
- State precedence when rules conflict.
- Include legitimate non-success outcomes.
- Connect each outcome to a state.
- Connect each rule to acceptance criteria.
- Mark rules that still require confirmation.

## Rule-conflict register

| Rules | Conflict | Priority decision | Authority | User impact |
|---|---|---|---|---|
| BR-001 and BR-004 | [Conflict] | [Resolution] | [Owner] | [Impact] |

---

# 13. Loading, empty, error and recovery states

These states are mandatory where applicable.

## 13.1 Loading states

Define separately:

- initial loading
- action submission
- background processing
- data refresh
- pagination or incremental loading
- external dependency waiting

### Loading-state record

| ID | Trigger | Expected duration | User can act? | Status communicated | Timeout behaviour | Exit state |
|---|---|---|---|---|---|---|
| LD-001 | [Trigger] | [Duration] | Yes / No / Limited | [Message meaning] | [Behaviour] | [State] |

### Loading rules

- distinguish loading from empty
- distinguish accepted work from completed work
- communicate meaningful progress
- define long-running behaviour
- allow safe cancellation where possible
- do not erase existing content unnecessarily
- define timeout and uncertain-result handling
- communicate status programmatically

---

## 13.2 Empty states

Define:

- first-use empty
- filtered empty
- search empty
- permission-limited empty
- completed/archived empty
- loading failure incorrectly appearing empty

### Empty-state record

| ID | Cause | User meaning | Available action | Permission considerations | Analytics |
|---|---|---|---|---|---|
| EM-001 | [Cause] | [Meaning] | [Action] | [Rules] | EV-[ID] |

### Empty-state rules

- explain why nothing is present
- distinguish no data from inaccessible data
- provide a valid next action
- do not imply failure when the empty state is expected
- do not expose protected entity existence

---

## 13.3 Validation errors

### Validation-error record

| ID | State | Rule | Problem identified | Correction | Data retained | Focus or announcement requirement |
|---|---|---|---|---|---|---|
| VR-001 | ST-002 | BR-003 | [Problem] | [Correction] | Yes | [Requirement] |

### Validation-error rules

- identify the affected item
- explain the problem in text
- explain how to correct it
- retain valid information
- avoid internal error codes as the primary explanation
- keep server-side validation authoritative
- connect summary errors to affected input
- do not blame the user

---

## 13.4 System errors

### System-failure record

| ID | Failure | Result certainty | Data saved? | Retry safe? | User action | Automatic action | Escalation | Final state |
|---|---|---|---|---|---|---|---|---|
| SF-001 | [Failure] | Known / Unknown | Yes / No / Partial | Yes / No | [Action] | [Action] | [Route] | [State] |

### System-error rules

For each failure, answer:

- did the action succeed?
- was data saved?
- can the user retry safely?
- can duplicate execution occur?
- does background processing continue?
- is another channel available?
- who owns resolution?
- how does the user learn the final result?

---

## 13.5 Recovery states

### Recovery record

| Failure | Recovery method | Data retained | Return state | Retry limit | Escalation |
|---|---|---|---|---|---|
| SF-001 | [Method] | [Data] | [State] | [Limit] | [Owner] |

### Recovery types

- automatic retry
- manual retry
- resume from last valid state
- reconciliation or status check
- alternative channel
- human escalation
- undo or compensation
- restart with retained context

### Recovery rules

- preserve valid work
- prevent duplicate consequential actions
- explain result certainty
- return to a known state
- avoid endless retry loops
- define final failure behaviour
- define ownership
- log recovery attempts

---