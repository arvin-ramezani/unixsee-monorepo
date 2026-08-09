# Heuristics 6 to 10

## Contents

- Core question
- Review questions
  - Task context
  - Requirements
  - Existing information
  - Progress and history
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - New or occasional users
  - Frequent or expert users
  - Role-specific efficiency
  - System efficiency affecting users
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Steps
  - Information
  - Decisions
  - Help and safeguards
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Recognition
  - Diagnosis
  - Recovery
  - Recurrence
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Necessity
  - Contextual help
  - Reactive help
  - Proactive help
  - Maintenance
- Typical violations

## Core question

**Is required information visible or retrievable instead of being memorised?**

## Review questions

### Task context

- Can the user see the task, entity and current state they are acting on?
- Are relevant previous decisions visible when making a new decision?
- Is context preserved across steps and channels?
- Can the user compare options without remembering information from earlier stages?

### Requirements

- Are required information, evidence, formats and deadlines available when needed?
- Can users see which requirements are complete or missing?
- Are policy consequences explained at the decision point?
- Are examples available for unfamiliar domain inputs?

### Existing information

- Is known reliable information shown or prefilled appropriately?
- Can the user select from existing records rather than retype identifiers?
- Does the flow avoid asking users to remember codes sent through another channel when a safer transfer is possible?

### Progress and history

- Can the user see completed and remaining steps?
- Is relevant audit or change history available?
- Can returning users recognise where they stopped?
- Are previous failures and required corrections visible when resuming?

## Typical violations

- user must remember information from an earlier screen
- requirements are hidden until validation fails
- user re-enters information already held by the service
- option comparison requires switching repeatedly between states
- status history is unavailable
- resumed draft provides no explanation of remaining work

## Required recommendation form

Define:

- information that must be visible or retrievable
- point in the flow where it is needed
- authoritative source
- privacy or security limits
- fallback when the information is unavailable

---

# 11. Heuristic 7 — Flexibility and efficiency of use

## Core question

**Can both inexperienced and frequent users complete the task efficiently without bypassing safety?**

## Review questions

### New or occasional users

- Can a user complete the flow without prior training?
- Are uncommon decisions explained in context?
- Are safe defaults available?
- Does the flow reveal complexity only when relevant?

### Frequent or expert users

- Can repeated tasks reuse previous valid information?
- Are direct entry points available for known tasks?
- Can users perform bulk actions when the domain supports them safely?
- Can repeated approvals or reviews be processed efficiently?
- Can users filter or prioritise pending work by meaningful criteria?
- Are keyboard or automation paths possible where appropriate?
- Can users customise recurring workflows without weakening controls?

### Role-specific efficiency

- Does each role see only the decisions and work relevant to it?
- Are support and operational users given sufficient context to resolve issues without switching systems repeatedly?
- Can delegated or shared work be completed without duplicate effort?

### System efficiency affecting users

- Are avoidable waits, duplicate validations or repeated authentication removed?
- Can independent work proceed in parallel?
- Are long-running tasks processed asynchronously where appropriate?

## Typical violations

- frequent users repeat identical setup every time
- expert users must follow introductory steps on every task
- one-by-one operations are required for safe bulk-capable work
- all users receive the same path despite role or context differences
- direct links lose context
- operational users manually reconcile information already available to the system

## Required recommendation form

Specify:

- user group benefiting
- repeated cost being reduced
- accelerated path
- safety and permission constraints
- fallback for inexperienced users
- metric that should improve

---

# 12. Heuristic 8 — Relevant and minimal flow

## Core question

**Are unnecessary steps, decisions and information removed while all essential support remains?**

This heuristic is not a demand for a visually minimalist style. It requires the experience to emphasise what supports the user’s task and avoid competing, irrelevant material.

## Review questions

### Steps

- Does every step support a user need, business rule or required safeguard?
- Can any steps be removed, combined or reordered?
- Are users asked to confirm information that has not changed?
- Are repeated approvals or handoffs genuinely necessary?
- Does the flow expose internal process steps that users do not need to manage?

### Information

- Is every requested field necessary for the current outcome?
- Is information requested at the point it becomes relevant?
- Are secondary details deferred without becoming undiscoverable?
- Are rare exceptions shown only when applicable?
- Is the user protected from irrelevant technical or operational detail?

### Decisions

- Are users asked to make decisions the system can safely determine?
- Are options meaningful and distinct?
- Are unavailable options removed or explained?
- Are users forced to choose between options that have no effect on the outcome?

### Help and safeguards

- Has simplification removed information needed for safe decisions?
- Are essential instructions, warnings, recovery routes and status details still available?
- Does the flow remain usable for edge cases and less-experienced users?

## Typical violations

- optional internal data is required from users
- every user sees every exception branch
- multiple confirmation steps repeat the same decision
- internal handoffs become user tasks
- irrelevant information competes with the next required action
- simplification removes requirements users need to succeed

## Required recommendation form

For each proposed removal or reduction, state:

- element, decision or step being changed
- user need or rule it currently serves
- evidence that it is unnecessary or mistimed
- risk created by removal
- replacement path for exceptional cases

---

# 13. Heuristic 9 — Help users recognise, diagnose and recover from errors

## Core question

**Does every error explain the problem, its effect and the available recovery action?**

## Review questions

### Recognition

- Is it clear that an error occurred?
- Is the affected task, field or operation identified?
- Can the user distinguish validation failure, permission denial and system failure?
- Is partial success identified accurately?

### Diagnosis

- Is the error explained in the user’s language?
- Does the explanation avoid internal codes and implementation details?
- Does it state what was and was not completed?
- Does it explain whether entered information was saved?
- Does it identify temporary versus permanent failure?
- Does it explain when another actor or external system caused the block, without exposing sensitive information?

### Recovery

- Is the corrective action explicit?
- Is valid information preserved?
- Is retry safe and available only when appropriate?
- Can the user edit the specific invalid information?
- Is a resume path available after interruption?
- Is an alternative channel or escalation path provided when automated recovery is unavailable?
- Does the user know what to do when the result of submission is uncertain?

### Recurrence

- Does the system prevent the same error after it has been corrected?
- Are repeated failures escalated or diagnosed differently?
- Are support teams given enough diagnostic context?

## Typical violations

- generic “something went wrong” response
- raw error code with no user action
- error clears all valid data
- user is told to retry an action that may already have succeeded
- permission denial provides no legitimate next route
- failed external dependency leaves no resume path
- message identifies the problem but not the correction

## Required recommendation form

Every error recommendation must define:

1. what happened
2. what was affected
3. whether work was saved
4. what the user can do now
5. whether retry is safe
6. when escalation is required
7. resulting state after recovery

---

# 14. Heuristic 10 — Help and documentation

## Core question

**Is task-focused help available where users become blocked?**

## Review questions

### Necessity

- Can the task be completed without documentation under normal conditions?
- Does the need for help reveal a flow, terminology or error problem that should be fixed directly?
- Is documentation being used to compensate for missing system behaviour?

### Contextual help

- Is help available at the decision or problem where it is needed?
- Does it explain the user’s current task rather than the whole product?
- Are evidence requirements, policies and unfamiliar terms explained in context?
- Can users access help without losing progress?

### Reactive help

- Can users search for a specific problem?
- Does help provide concrete steps?
- Does it distinguish different roles, permissions and states?
- Does it cover failure, recovery and escalation?
- Is support information available when self-service cannot resolve the issue?

### Proactive help

- Is onboarding limited to information needed for the immediate task?
- Can users skip or dismiss nonessential guidance?
- Is guidance shown when a new or changed behaviour creates real risk?
- Is repeated guidance suppressed after the user demonstrates understanding?

### Maintenance

- Is every help item owned and reviewable?
- Does documentation reflect current terminology and business rules?
- Can outdated help be detected when flows change?
- Are support findings fed back into flow improvement rather than only expanding documentation?

## Typical violations

- help is generic and disconnected from the current task
- documentation explains outdated rules
- users must leave the flow and lose progress to seek help
- support contact is hidden when automated recovery is impossible
- mandatory onboarding explains obvious actions but omits difficult decisions
- help describes interface mechanics rather than task outcomes

## Required recommendation form

Define:

- user problem requiring help
- point in the flow
- proactive or reactive help
- minimum task-focused content
- escalation route
- owner and update trigger

---