# Accessibility Review Model

## Contents

- 14.1 Initial states
- 14.2 Input states
- 14.3 Focus states
- 14.4 Processing states
- 14.5 Error states
- 14.6 Recovery states
- 14.7 Completion states
- 15.1 Keyboard completion
- 15.2 Focus sequence
- 15.3 Focus visibility
- 15.4 Inputs and instructions
- 15.5 Error handling
- 15.6 Critical actions
- 15.7 Authentication
- 15.8 Status communication
- 15.9 Timing
- 15.10 Pointer precision
- Accessibility issue: AX-[number]
  - Requirement
  - WCAG criterion
  - Level
  - Flow location
  - Affected users
  - Problem
  - Evidence
  - User impact
  - Severity
  - Required behaviour
  - Related flow change
  - Acceptance criteria
  - Validation method
  - Status

Every flow must consider these accessibility-relevant states.

## 14.1 Initial states

- task available
- task unavailable
- permission denied
- authentication required
- no accessible channel available
- assisted-support route available

## 14.2 Input states

- empty
- valid
- invalid
- required
- conditionally required
- read-only
- disabled with explanation
- loading options
- external data unavailable

## 14.3 Focus states

- focus established
- focus visible
- focus obscured
- focus lost
- focus trapped
- focus restored
- focus moved to error
- focus moved to confirmation

## 14.4 Processing states

- submitting
- waiting
- progress known
- progress unknown
- background process continuing
- retrying
- external dependency waiting

## 14.5 Error states

- single-field error
- multiple errors
- business-rule rejection
- permission failure
- system failure
- uncertain submission
- expired session
- expired action
- inaccessible authentication path

## 14.6 Recovery states

- correction
- safe retry
- resume saved work
- re-authenticate
- request new code
- undo
- alternative channel
- assisted support
- escalation

## 14.7 Completion states

- completed
- submitted
- scheduled
- awaiting another actor
- partially completed
- rejected
- cancelled
- permanently failed

Each state must define:

- keyboard behaviour
- focus behaviour
- status communication
- available actions
- error or recovery path
- data retention
- accessibility acceptance criteria

---

# 15. Flow-level accessibility review

Use this review for every flow.

## 15.1 Keyboard completion

- Can the complete task be performed with keyboard only?
- Are all actions reachable and operable?
- Is there a keyboard alternative to drag, hover or gesture interactions?
- Can users enter and leave every component?
- Can users close dialogs and overlays?

## 15.2 Focus sequence

- Does focus follow the task order?
- Is focus placed meaningfully after route changes?
- Is focus restored after dialogs?
- Is focus preserved during dynamic updates?
- Does validation move or expose focus appropriately?
- Can deleted or removed controls leave focus in an invalid location?

## 15.3 Focus visibility

- Is the focus indicator visible?
- Can sticky content obscure focus?
- Can overlays cover focused controls?
- Does zoom or a virtual keyboard hide focus?
- Is programmatically moved focus scrolled into view?

## 15.4 Inputs and instructions

- Does every input have a clear label?
- Are formats and constraints explained before submission?
- Are required and optional inputs understandable?
- Are conditional requirements communicated?
- Does the user need to remember information from another step?

## 15.5 Error handling

- Is the affected item identified?
- Is the problem described in text?
- Is a correction suggested?
- Is valid data retained?
- Is the error announced?
- Can the user navigate efficiently among multiple errors?

## 15.6 Critical actions

- Can users review consequential information?
- Can users correct it before submission?
- Can the action be reversed?
- Is duplicate execution prevented?
- Is the final status truthful?

## 15.7 Authentication

- Can users paste credentials and codes?
- Can password managers and autofill work?
- Is a cognitive test required?
- Is an alternative or assistance available?
- Is flow context restored after authentication?
- Is progress retained after session expiry?

## 15.8 Status communication

- Are save, loading, progress, result and error states announced?
- Does status communication avoid unnecessary focus changes?
- Does each message have enough context?
- Are urgent announcements reserved for urgent events?

## 15.9 Timing

- Is the time limit necessary?
- Can it be disabled, adjusted or extended?
- Is expiry warned in advance?
- Is work preserved?
- Can users resume?
- Is countdown information accessible?

## 15.10 Pointer precision

- Are targets at least 24 by 24 CSS pixels or otherwise conforming?
- Are small targets sufficiently separated?
- Are critical actions easy to activate?
- Are drag and complex gestures replaceable?
- Are layout shifts prevented during interaction?

---

# 16. Accessibility issue record

## Accessibility issue: AX-[number]

### Requirement

[Requirement]

### WCAG criterion

[Criterion]

### Level

A / AA / AAA

### Flow location

[Flow, state and transition]

### Affected users

- [User group]

### Problem

[Observed or predicted barrier]

### Evidence

- [Test, research, code review or expert review]

### User impact

- cannot start
- cannot understand
- cannot operate
- cannot correct
- cannot recover
- cannot complete
- may complete incorrectly
- may lose data
- may trigger unintended action
- receives unequal outcome

### Severity

- **Critical:** task cannot be completed or serious harm may occur
- **High:** major path is blocked or requires external help
- **Medium:** substantial friction or repeated failure
- **Low:** limited friction with a viable accessible path

### Required behaviour

[Implementation-independent behaviour]

### Related flow change

CH-[number]

### Acceptance criteria

AC-[number]

### Validation method

- keyboard
- screen reader
- browser zoom
- touch
- switch or voice input
- automated test
- code inspection
- usability testing with disabled users

### Status

Open / Planned / Fixed / Verified / Accepted risk

---

# 17. Accessibility decision table

| Condition | Case 1 | Case 2 | Case 3 | Case 4 |
|---|---:|---:|---:|---:|
| Task operable by keyboard | Yes | No | Yes | Yes |
| Focus order logical | Yes | — | No | Yes |
| Status announced | Yes | — | — | No |
| Result | Continue review | Blocker | Major issue | Major issue |

Use decision tables when accessibility behaviour varies by:

- role
- device
- input method
- authentication method
- state
- timeout condition
- error category
- external dependency
- channel transition

---