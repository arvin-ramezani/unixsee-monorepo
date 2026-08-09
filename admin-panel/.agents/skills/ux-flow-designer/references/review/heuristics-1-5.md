# Heuristics 1 to 5

## Contents

- Core question
- Review questions
  - Current state
  - Action feedback
  - Waiting and processing
  - Saved progress
  - Completion
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Language
  - Mental model
  - Domain rules
  - Cross-channel consistency
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Back and correction
  - Cancel
  - Undo and reversal
  - Exit and interruption
  - Permission changes
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Internal consistency
  - External consistency
  - Business-rule consistency
  - Cross-role and cross-channel consistency
- Typical violations
- Required recommendation form
- Core question
- Review questions
  - Preconditions
  - Input and decisions
  - Consequential actions
  - Duplicate and concurrency protection

## Core question

**Does the user always know what is happening?**

## Review questions

### Current state

- Does the user know where they are in the flow?
- Is the current task state understandable?
- Can the user distinguish not started, draft, submitted, processing and completed states?
- Can the user tell whether another person or system must act?
- Is the entity’s current status consistent across entry points and channels?

### Action feedback

- Does every meaningful user action produce timely feedback?
- Can the user tell whether an action was accepted?
- Is repeated submission prevented while an action is being processed?
- Is there a clear difference between saving, submitting and completing?
- Does the system expose partial success when only part of an operation completed?

### Waiting and processing

- Does the user know when the system is processing?
- Is the expected wait explained when known?
- Can the user leave safely while processing continues?
- Is background progress discoverable later?
- Is the user informed when processing stalls or fails?

### Saved progress

- Does the user know whether their work was saved?
- Is save failure distinguishable from save success?
- Does the user know when a draft expires?
- Can the user tell which version is current after a conflict?

### Completion

- Is completion communicated only after the true outcome is known?
- Does the user know what changed?
- Does the user know what happens next?
- Can the user find the completed record later?

## Typical violations

- action produces no immediate acknowledgement
- queued work is labelled complete
- user cannot tell whether a draft was saved
- background process has no visible state
- status differs between application and notification
- user waits without timing, ownership or next-step information
- an external-system failure leaves the task apparently pending forever

## Required recommendation form

Describe:

- state that must be exposed
- event that changes the state
- information the user must receive
- timing of the feedback
- fallback when the status cannot be determined

---

# 6. Heuristic 2 — Match between the system and the real world

## Core question

**Does terminology and process order match the user’s domain?**

## Review questions

### Language

- Does the flow use terms users actually use?
- Are internal team, database, API or policy terms hidden or translated?
- Do status names communicate a meaningful real-world condition?
- Are actions named by their outcome rather than implementation?
- Are abbreviations understood by the relevant user type?
- Do different user roles understand the same term consistently?

### Mental model

- Does the sequence match how users understand the task?
- Are related decisions grouped logically?
- Are required documents or evidence requested at the stage users expect?
- Does the system distinguish concepts that users consider different?
- Does it avoid splitting one user goal according to internal department ownership?

### Domain rules

- Are calculations, dates, units, ownership and approval concepts expressed in domain terms?
- Are real-world consequences explained before consequential actions?
- Does the flow preserve familiar conventions from the user’s work?
- Are legitimate domain exceptions represented?

### Cross-channel consistency

- Do emails, support messages, external systems and application states use compatible terminology?
- Does a channel transition explain why the user is moving and what carries forward?

## Typical violations

- database status displayed directly to users
- same concept has different names across flows
- technical error code replaces a domain explanation
- task order follows internal departments rather than user logic
- user must translate between application terminology and real-world documents
- completion means something different to the user and the system

## Required recommendation form

Specify:

- user-recognised term or concept
- internal term being replaced
- affected roles
- required ordering or mapping
- evidence needed when terminology is uncertain

---

# 7. Heuristic 3 — User control and freedom

## Core question

**Can the user cancel, return, correct or undo without becoming trapped?**

## Review questions

### Back and correction

- Can the user return to an earlier decision when it remains safe?
- Is previously entered valid information retained?
- Are dependent decisions recalculated correctly?
- Can the user correct information before consequential submission?
- Does authentication preserve the intended return point?

### Cancel

- Can the user stop an in-progress task?
- Is the effect of cancellation clear?
- Does cancellation preserve or delete a draft according to an explicit rule?
- Are reservations, locks or pending side effects released?
- Can a cancelled task be restarted when appropriate?

### Undo and reversal

- Can reversible actions be undone?
- Is the allowed reversal window defined?
- Can users understand which downstream effects will also be reversed?
- Is a human escalation path available when automatic reversal is impossible?

### Exit and interruption

- Can users leave a long flow and return?
- What happens when the browser closes, the session expires or connectivity is lost?
- Can users escape an unwanted branch without completing unnecessary steps?
- Does the flow avoid trapping users in repeated validation or retry loops?

### Permission changes

- What happens if permission is removed while the task is active?
- Can ownership be transferred or delegated safely?

## Typical violations

- no way to leave an unwanted path
- back navigation destroys data
- cancel performs an irreversible deletion without explanation
- irreversible action has no review or reversal route
- session expiry loses substantial work
- failed retry loops indefinitely
- user is forced to contact support for a routine reversible action

## Required recommendation form

Define:

- available control: back, cancel, exit, edit or undo
- states in which it is available
- data and side effects affected
- resulting state
- exceptions and escalation path

---

# 8. Heuristic 4 — Consistency and standards

## Core question

**Do similar actions, states and rules behave consistently?**

## Review questions

### Internal consistency

- Does the same action have the same meaning throughout the product?
- Are status names used consistently?
- Do validation failures follow the same correction model?
- Do similar flows handle save, cancel, retry and completion consistently?
- Are permission outcomes consistent for equivalent roles and entities?
- Do notifications reflect the same state names as the application?

### External consistency

- Does the flow follow established platform and domain conventions?
- Does it avoid surprising changes to familiar action meanings?
- Does browser back, deep linking and authentication behave predictably?
- Do imports, exports and external integrations use expected domain formats?

### Business-rule consistency

- Are identical conditions evaluated by the same authoritative rule?
- Can users receive conflicting results from different entry points?
- Are duplicated rules likely to drift?
- Are exceptions explicitly documented rather than accidental?

### Cross-role and cross-channel consistency

- Do different roles see compatible representations of the same task?
- Is the same state communicated consistently by web, email, SMS and support staff?
- Does responsibility transfer consistently between actors?

## Typical violations

- “approve” has different consequences in two flows
- one flow autosaves while a similar flow silently discards work
- equivalent errors use incompatible recovery paths
- notification says complete while application says processing
- business rule differs between API and application
- a conventional action produces an unexpected result

## Required recommendation form

Specify:

- standard behaviour or terminology
- all affected flows, roles and channels
- authoritative source of the rule
- documented exception, if one is justified

---

# 9. Heuristic 5 — Error prevention

## Core question

**Are preventable errors blocked before the user commits to them?**

## Review questions

### Preconditions

- Are known eligibility and permission conditions checked early?
- Is the user prevented from doing substantial work before a known blocker is revealed?
- Are unavailable or expired actions prevented?
- Are prerequisites explained before the user begins?

### Input and decisions

- Are valid constraints applied before submission when practical?
- Are incompatible choices prevented or clearly explained?
- Are reliable existing values reused instead of re-entered?
- Are risky defaults avoided?
- Can the user review consequential information before commitment?

### Consequential actions

- Are irreversible, destructive, financial, legal or high-impact actions deliberately confirmed?
- Does confirmation explain the specific consequence?
- Are low-risk reversible actions protected through undo instead of repeated interruption?

### Duplicate and concurrency protection

- Are duplicate submissions prevented?
- Are repeated requests idempotent where required?
- Is stale data detected before overwriting newer work?
- Are concurrent actions reconciled safely?

### Operational and system risk

- Are external dependency requirements checked before commitment where possible?
- Can partial failure create an inconsistent state?
- Are compensation or reconciliation rules defined?
- Are automated actions prevented from exceeding permissions or limits?

## Typical violations

- deadline is checked only after a long form is completed
- destructive action is too easy to trigger accidentally
- same payment or request can be submitted twice
- stale information overwrites another actor’s changes
- contradictory options can be selected
- required evidence is disclosed only after submission
- default choice creates an unintended commitment

## Required recommendation form

Describe:

- error-prone condition
- prevention rule
- point at which the rule is checked
- user explanation
- safe exception path
- remaining recovery behaviour if prevention fails

---