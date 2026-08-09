# Implementation-Ready Flow Specification

## Contents

- FL-[number]: [Flow name]
  - User need
  - User and goal
  - Preconditions
  - Entry points
  - Happy path
  - Alternative paths
  - Validation failures
  - System failures
  - Recovery and retry
  - Cancel, back and undo
  - Save and resume
  - Roles and permissions
  - Completion confirmation
  - Notifications
  - Post-completion state
  - Analytics events
  - State-transition table
  - Business rules
  - Assumptions
  - Unresolved decisions
  - Acceptance criteria
- User and goal
- Logic
- Preconditions and entry
- Failures
- User control
- Permissions
- Completion
- Notifications and measurement

Use this compact format for each final flow.

## FL-[number]: [Flow name]

### User need

UN-[number]

### User and goal

[Definition]

### Preconditions

- [Condition]

### Entry points

- [Entry]

### Happy path

1. [Step]
2. [Step]
3. [Step]

### Alternative paths

- AP-001:
- AP-002:

### Validation failures

- VR-001:
- VR-002:

### System failures

- SF-001:
- SF-002:

### Recovery and retry

[Rules]

### Cancel, back and undo

[Rules]

### Save and resume

[Rules]

### Roles and permissions

[Rules]

### Completion confirmation

[Outcome]

### Notifications

[Triggers and channels]

### Post-completion state

[State and available actions]

### Analytics events

- [Event]
- [Event]

### State-transition table

[Table]

### Business rules

- BR-[number]

### Assumptions

- [Assumption]

### Unresolved decisions

- [Decision]

### Acceptance criteria

- Given [context], when [action], then [outcome].
- Given [failure], when [recovery action], then [outcome].

---

# 11. Flow review checklist

## User and goal

- Is the primary user specific?
- Is the goal connected to a validated user need?
- Is success observable?
- Is the flow limited to one primary outcome?

## Logic

- Are all states defined?
- Does every transition have a trigger?
- Are business rules explicit?
- Are valid alternative outcomes represented?
- Are terminal states clear?

## Preconditions and entry

- Are prerequisites checked early?
- Are all entry points supported?
- Is context preserved through authentication?
- Are expired and repeated entry handled?

## Failures

- Are validation and system failures separated?
- Is valid information preserved?
- Is retry safe?
- Is uncertain submission handled?
- Is escalation defined?

## User control

- Are back, cancel and undo distinct?
- Are irreversible actions confirmed?
- Can long tasks be saved and resumed?
- Are expiry and abandonment handled?

## Permissions

- Are permissions defined by action and state?
- Are server-side checks required?
- Are role changes during a flow handled?
- Is sensitive information protected?

## Completion

- Does confirmation reflect the true status?
- Is the next action clear?
- Is the completed record available later?
- Are post-completion transitions defined?

## Notifications and measurement

- Does each notification serve a need?
- Are duplicate notifications controlled?
- Are meaningful analytics events specified?
- Can completion, failure and recovery be measured?
- Are analytics connected to research questions?

---

# 12. Required output from the UX agent

For every flow-design task, produce:

1. Flow identity
2. User and goal
3. Preconditions
4. Entry-point table
5. Happy-path sequence
6. Alternative paths
7. Validation rules
8. System-failure matrix
9. Recovery and retry rules
10. Cancel, back and undo behaviour
11. Save-and-resume behaviour
12. Role and permission matrix
13. Completion outcomes
14. Notification triggers
15. Post-completion state
16. Analytics event specification
17. State catalogue
18. State-transition table
19. Business-rule register
20. Decision tables
21. Mermaid state diagram
22. Edge cases
23. Assumptions
24. Unresolved decisions
25. Implementation-ready acceptance criteria

---

# 13. Agent operating rules

When using this document:

- describe application behaviour, not visual design
- do not discuss colours, spacing, typography or appearance
- do not prescribe components unless explicitly requested
- connect every flow to a validated user need
- connect every flow to a future journey stage
- identify the actor for every action
- identify the trigger for every transition
- distinguish user actions from system events
- distinguish validation failures from system failures
- distinguish submission from completion
- define all alternative and terminal states
- preserve user progress wherever safe
- prevent duplicate consequential actions
- specify cancellation, recovery and retry
- define role and permission behaviour
- expose background processing through explicit states
- define what users know while waiting
- define durable post-completion behaviour
- avoid inventing business rules
- label assumptions and unresolved decisions
- produce testable acceptance criteria
- define analytics around user outcomes
- treat the flow as incomplete until failure and recovery paths are specified

---

# 14. Source basis

This operating document incorporates GOV.UK guidance that structured transactional flows should support branching, loops, automatic saving, recovery from errors and analytics at meaningful stages.

Its validation rules follow GOV.UK and WCAG guidance that users should be allowed to complete input before validation, and detected errors must identify the affected item, describe the issue and provide a correction suggestion where possible.

Its irreversible-action rules follow GOV.UK guidance to pause a journey only where evidence shows a need, particularly for unusual, conflicting or non-reversible actions.

Its completion rules follow GOV.UK guidance that confirmation must communicate that the transaction is complete, explain what happens next, provide relevant references and allow users to retain or revisit a record where possible.

Its failure and save-state rules follow GOV.UK guidance that unavailable-service states must explain when service will resume, what happened to entered answers and which alternative route remains available.

Its notification-state rules reflect WCAG guidance that users must be informed programmatically about success, results, progress, waiting and errors without unnecessary interruption.

Its analytics rules follow GOV.UK guidance to define measurable hypotheses early and evaluate transactional performance using analytics together with user research, support data and other evidence rather than digital analytics alone.