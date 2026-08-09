# Alternative Paths, Failures and Recovery

## Contents

- Alternative-path record
  - Alternative path: AP-[number]
- Validation levels
  - Field-level validation
  - Cross-field validation
  - Entity validation
  - Business validation
- Validation rule record
- Validation rules
- Validation outcome
- Failure categories
  - Connectivity failure
  - Application failure
  - External-system failure
  - Concurrency failure
  - Capacity or maintenance failure
- System-failure record
- System-failure rules
- Recovery types
  - Automatic retry
  - Manual retry
  - Resume processing
  - Alternative route
  - Human escalation
- Retry specification
- Recovery rules
- Back
- Cancel
- Undo
- Action-risk table
- Rules

Alternative paths are valid routes that differ from the main happy path.

Examples:

- user chooses a different eligible option
- another role completes part of the flow
- user skips an optional step
- existing data removes a required step
- user delegates the task
- manual review is required
- request produces a legitimate non-success outcome
- external system handles part of the process

## Alternative-path record

### Alternative path: AP-[number]

- **Starts from step:** [Step]
- **Condition:** [Condition]
- **Actor:** [Actor]
- **Action:** [Action]
- **Business rule:** BR-[number]
- **Resulting state:** [State]
- **Returns to happy path:** [Step or no]
- **Completion outcome:** [Outcome]
- **User communication:** [What must be understood]
- **Analytics event:** [Event]

Alternative paths must not be incorrectly presented as errors when they are valid outcomes.

---

# 6. Validation failures

Validation failures occur when supplied information does not satisfy known requirements.

## Validation levels

### Field-level validation

Checks one piece of information.

Examples:

- missing required value
- invalid format
- unsupported value
- value outside allowed limits

### Cross-field validation

Checks relationships between values.

Examples:

- end date precedes start date
- selected option conflicts with another answer
- totals do not match

### Entity validation

Checks the task against stored information.

Examples:

- duplicate request
- record already changed
- item no longer available
- identifier does not match account

### Business validation

Checks policy or workflow rules.

Examples:

- approval threshold exceeded
- deadline passed
- required predecessor incomplete
- status does not permit action

## Validation rule record

| Rule ID | Input or entity | Condition | Failure message meaning | Correction | Data retained |
| ------- | --------------- | --------- | ----------------------- | ---------- | ------------- |
| VR-001  | [Input]         | [Rule]    | [Problem]               | [Action]   | Yes           |

## Validation rules

- Prevent errors when reasonably possible.
- Validate at a meaningful progression or submission point.
- Identify the exact problem.
- Explain how to correct it.
- Preserve all valid information.
- Do not delete unrelated answers.
- Return the user to the relevant task context.
- Do not blame the user.
- Do not expose internal field names, codes or stack traces.
- Do not use one generic message for unrelated failures.
- Make server-side validation authoritative.
- Define whether validation rules can change during a saved draft.

## Validation outcome

```text
Input received
→ validation running
→ valid: continue
→ invalid: preserve data, explain issue, allow correction
```

---

# 7. System failures

System failures occur when the service cannot complete an otherwise valid action.

## Failure categories

### Connectivity failure

- user loses connection
- request times out
- connection is unstable

### Application failure

- unexpected application error
- background job fails
- database operation fails
- internal dependency unavailable

### External-system failure

- payment provider unavailable
- identity provider unavailable
- external API rejects or times out
- notification provider fails

### Concurrency failure

- another actor changed the entity
- stale data is submitted
- duplicate action arrives
- lock or version conflict occurs

### Capacity or maintenance failure

- service intentionally unavailable
- rate limit reached
- queue overloaded
- scheduled outage

## System-failure record

| ID     | Failure   | Detection   | User-visible state | Data impact | Automatic action | User action | Escalation |
| ------ | --------- | ----------- | ------------------ | ----------- | ---------------- | ----------- | ---------- |
| SF-001 | [Failure] | [Detection] | [State]            | [Impact]    | [Action]         | [Action]    | [Owner]    |

## System-failure rules

For every failure, define:

- whether the action may have succeeded
- whether retry is safe
- whether submitted data was saved
- whether work remains available
- whether processing continues in the background
- expected recovery time, when known
- alternative completion channel
- support or escalation route
- failure owner
- logging and alerting requirements

Never tell the user simply to retry when duplicate execution could create harm.

---

# 8. Recovery and retry

Recovery returns the user to a safe and understandable state.

## Recovery types

### Automatic retry

Use only when:

- the operation is safe to repeat
- retries are limited
- duplicate effects are prevented
- the user does not need to change information

### Manual retry

Require user action when:

- the user must review updated information
- the previous result is uncertain
- repeated execution has consequences
- the blocking condition may still exist

### Resume processing

Use when the task was accepted but background processing was interrupted.

### Alternative route

Use when the primary channel cannot complete the goal.

### Human escalation

Use when automated recovery is unavailable or inappropriate.

## Retry specification

| Operation   | Idempotent | Automatic retries | Manual retry | Backoff  | Duplicate protection | Final failure state |
| ----------- | ---------- | ----------------- | ------------ | -------- | -------------------- | ------------------- |
| [Operation] | Yes/No     | [Number]          | Yes/No       | [Policy] | [Method]             | [State]             |

## Recovery rules

- Preserve user input wherever safe.
- Return users to the last valid state.
- Explain whether previous actions were recorded.
- Prevent duplicate submissions.
- Make retry progress visible.
- Define what happens after maximum retries.
- Record recovery attempts for support and analytics.
- Do not create endless retry loops.
- Provide escalation for critical blocked tasks.

---

# 9. Cancel, back and undo

These actions are different and must be specified separately.

## Back

Returns to a previous step without ending the flow.

Define:

- whether data is retained
- whether prior decisions are recalculated
- whether returning changes entity state
- whether external side effects already occurred

## Cancel

Stops the current flow.

Define:

- whether a draft remains
- whether reserved resources are released
- whether pending actions are withdrawn
- whether other actors are notified
- final cancellation state
- whether the flow can be restarted

## Undo

Reverses a completed action.

Define:

- which actions are reversible
- who can reverse them
- allowed time window
- dependent actions that must also be reversed
- audit requirements
- resulting state
- notification requirements

## Action-risk table

| Action   | Consequence | Reversible | Confirmation required | Undo window | Result  |
| -------- | ----------- | ---------- | --------------------- | ----------- | ------- |
| [Action] | [Impact]    | Yes/No     | Yes/No                | [Duration]  | [State] |

## Rules

- Allow back navigation when it does not create invalid state.
- Do not use “cancel” when the action merely navigates away.
- Prefer undo over unnecessary confirmation when reversal is safe.
- Require explicit confirmation for irreversible or high-impact actions.
- Explain exactly what will be affected.
- Do not use interruption steps for routine low-risk actions.
- Define what happens when the user closes the application without cancelling.

---