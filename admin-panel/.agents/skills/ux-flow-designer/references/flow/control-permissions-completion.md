# User Control, Permissions and Completion

## Contents

- Save model
- Save-and-resume record
  - Draft state
  - Saved data
  - Data not saved
  - Save trigger
  - Save confirmation
  - Resume entry points
  - Draft retention
  - Draft expiry
  - Version conflicts
  - Authentication expiry
  - Device transition
- Save-and-resume rules
- Role record
- Permission decision
- Permission outcomes
- Rules
- Completion types
  - Completed immediately
  - Submitted
  - Scheduled
  - Awaiting another actor
  - Partially completed
  - Rejected or ineligible
- Completion record
  - Outcome
  - Resulting state
  - Reference
  - Effective time
  - What happens next
  - User action required
  - Expected timing
  - Record available
  - Support route
  - Related next tasks
- Completion rules
- Notification trigger record
- Notification categories
- Notification rules

Specify whether incomplete work can be continued later.

## Save model

Choose one:

- automatic save after each meaningful change
- automatic save at defined checkpoints
- explicit save
- local temporary save
- server-side draft
- no save

## Save-and-resume record

### Draft state

[State name]

### Saved data

- [Data]
- [Data]

### Data not saved

- [Data and reason]

### Save trigger

[Action or event]

### Save confirmation

[How the user knows saving occurred]

### Resume entry points

- [Dashboard]
- [Direct link]
- [Notification]
- [Recent task]

### Draft retention

[Duration or rule]

### Draft expiry

[What happens and how the user is warned]

### Version conflicts

[What happens when another actor edits the same task]

### Authentication expiry

[How progress is preserved and restored]

### Device transition

[Whether the user can resume on another device]

## Save-and-resume rules

- Use save and resume for long, evidence-heavy or interruption-prone flows.
- Define save success and save failure states.
- Do not claim work is saved before persistence succeeds.
- Communicate retention and expiry rules.
- Preserve the intended destination through re-authentication.
- Define ownership of shared drafts.
- Prevent users from resuming obsolete or already-completed drafts without explanation.
- Explain when security or privacy rules prevent saving.

---

# 11. Roles and permissions

Permissions must be defined by action and entity state, not only by navigation visibility.

## Role record

| Role   | Scope   | Can view | Can create | Can edit | Can submit | Can approve | Can cancel | Can administer |
| ------ | ------- | -------- | ---------- | -------- | ---------- | ----------- | ---------- | -------------- |
| [Role] | [Scope] | [Rules]  | [Rules]    | [Rules]  | [Rules]    | [Rules]     | [Rules]    | [Rules]        |

## Permission decision

For every protected action, evaluate:

1. Is the user authenticated?
2. Is the account active?
3. Does the role allow the action?
4. Is the entity within the user’s scope?
5. Is the entity in a state that allows the action?
6. Are separation-of-duty rules satisfied?
7. Has permission changed since the flow began?
8. Is additional approval required?

## Permission outcomes

- allowed
- allowed with limitations
- approval required
- temporarily unavailable
- denied
- entity hidden
- read-only
- session expired

## Rules

- Enforce permissions on the server.
- Do not rely on hidden actions for security.
- Define permissions for every transition.
- Define what users can see when they cannot act.
- Explain recoverable permission problems.
- Avoid revealing protected information through denial messages.
- Revalidate permission at consequential submission points.
- Define ownership transfer and delegated access.
- Record privileged actions in an audit history.
- Define what happens to active tasks when a role is removed.

---

# 12. Completion confirmation

Completion must state the true status of the task.

## Completion types

### Completed immediately

The requested outcome is finished.

### Submitted

The request was accepted but further processing remains.

### Scheduled

The action will happen later.

### Awaiting another actor

Another user, approver or system must act.

### Partially completed

Some operations succeeded and others require action.

### Rejected or ineligible

The flow reached a valid non-success outcome.

## Completion record

### Outcome

[What happened]

### Resulting state

[State]

### Reference

[Identifier, if applicable]

### Effective time

[When the change occurred or will occur]

### What happens next

[Next system or human action]

### User action required

[Action or none]

### Expected timing

[Known time or explanation]

### Record available

[Where the user can find the completed task]

### Support route

[When and how support can help]

### Related next tasks

- [Task]
- [Task]

## Completion rules

- Never report “completed” for merely accepted or queued work.
- Provide a stable reference when useful.
- Explain what happens next and when.
- State whether the user needs to do anything else.
- Make the resulting record discoverable later.
- Support valid alternative outcomes, not only success.
- Define what happens when the user revisits a completion link.

---

# 13. Notifications

Notifications must support a user need or required operational action.

Do not notify users merely because an event exists.

## Notification trigger record

| ID     | Trigger | Recipient | Purpose | Channel   | Timing   | Action required | Duplicate policy |
| ------ | ------- | --------- | ------- | --------- | -------- | --------------- | ---------------- |
| NT-001 | [Event] | [Role]    | [Need]  | [Channel] | [Timing] | [Action]        | [Policy]         |

## Notification categories

- action required
- task completed
- task failed
- status changed
- deadline approaching
- approval requested
- evidence requested
- security-related event
- service interruption
- informational update

## Notification rules

For each notification, define:

- event that triggers it
- recipient
- reason the recipient needs it
- delivery channel
- urgency
- expiry
- direct destination
- information safe to expose
- action required
- reminder policy
- duplicate suppression
- failure handling
- user preference rules
- audit requirement

## Channel rules

### In-application

Use for information available when the user returns.

### Email

Use for durable, asynchronous information that is safe for email.

### SMS or push

Use only when timing justifies interruption and the message is safe for the channel.

### Operational alert

Route technical or business failures to the responsible team, not ordinary users.

Important status changes must remain available in the application even when external notification delivery fails.

---

# 14. Post-completion state

A flow does not end only because a confirmation was shown.

Define the durable state after completion.

## Post-completion specification

### Final entity state

[State]

### Available user actions

- view
- download
- share
- amend
- cancel
- repeat
- archive
- appeal
- contact support

### Actions no longer available

- [Action and reason]

### Other actors affected

- [Actor and resulting task]

### Background processes

- [Process]
- [Scheduled activity]

### Data retention

[Retention and deletion rules]

### Audit history

[What must be recorded]

### Future status changes

[Possible transitions after initial completion]

### Re-entry behaviour

[What users see when they reopen the task]

### Related workflows

- [Flow]
- [Flow]

## Rules

- Completed records must have an explicit durable state.
- Define whether completed actions can later fail or be reversed.
- Show pending downstream work as pending.
- Keep status consistent across channels.
- Define post-completion ownership.
- Define amendments separately from restarting the original flow.
- Avoid routing users to a generic home page when a relevant completed record exists.

---