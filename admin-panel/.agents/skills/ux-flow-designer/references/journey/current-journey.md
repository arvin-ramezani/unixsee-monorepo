# Current Journey Mapping

## Contents

- Purpose
- 2.1 Map the whole user goal
- 2.2 Map from the user’s perspective
- 2.3 Include every relevant channel
- 2.4 Include frontstage and backstage activity
  - Frontstage
  - Backstage
- 2.5 Separate evidence from assumptions
- Journey name
- Primary user
- Related users
- Trigger
- Intended outcome
- Start point
- End point
- Related user needs
- Included channels
- Excluded areas
- Step [number]: [User-oriented step name]
  - Journey stage
  - Trigger
  - User goal
  - User action
  - Entry point
  - Channel
  - Device or environment
  - Information the user needs
  - Information the user provides
  - Required evidence
  - System response
  - Other people involved
  - Systems involved
  - Frontstage touchpoint
  - Backstage process
  - Business rules
  - Decision
  - Decision branches
  - Waiting time
  - User visibility during waiting
  - Current pain points

## Purpose

Use this document to understand and improve the complete journey users follow to achieve an outcome.

Every project must create two separate maps:

1. **Current journey — As-is**
   - What actually happens today
   - Based on research and operational evidence
   - Includes existing problems, workarounds and service constraints

2. **Future journey — To-be**
   - The proposed improved experience
   - Based on validated user needs and current-journey evidence
   - Treated as a hypothesis until tested with users

Do not create the future journey before documenting the current journey.

Do not limit the journey to application screens.

---

# 1. Required inputs

Before creating a journey map, collect:

- validated user needs from `01-user-needs-and-scope.md`
- relevant user types and roles
- trigger and intended outcome
- current business processes
- roles and permissions
- known system dependencies
- support tickets and complaints
- product analytics
- user research findings
- technical constraints
- legal, security or contractual constraints
- existing forms, messages, emails and notifications
- existing online and offline touchpoints

If evidence is missing, clearly label the map as incomplete.

---

# 2. Core journey-mapping principles

## 2.1 Map the whole user goal

Start when the user first recognises a need.

End when:

- the need is met
- the user receives and understands the outcome
- required follow-up actions are complete
- responsibility clearly transfers to another service

Do not start at login simply because that is where the application begins.

Do not stop at form submission if the user still needs approval, delivery, payment, confirmation or another action.

---

## 2.2 Map from the user’s perspective

Journey stages must describe tasks and outcomes that users recognise.

Bad:

> Enter module B and execute workflow 4.

Good:

> Submit the store for approval.

Organise stages around the user’s mental model, not:

- application modules
- database entities
- organisational departments
- internal team ownership
- API boundaries
- existing page structure

---

## 2.3 Include every relevant channel

A journey may include:

- web application
- mobile application
- email
- SMS
- telephone
- live chat
- support ticket
- paper form
- printed letter
- face-to-face interaction
- social messaging
- external website
- third-party application
- internal staff interface
- manual operational work

A channel change must be shown explicitly.

---

## 2.4 Include frontstage and backstage activity

### Frontstage

Anything visible to or directly experienced by the user:

- screens
- forms
- messages
- emails
- calls
- conversations
- documents
- confirmations
- errors
- waiting periods

### Backstage

Activities required to deliver the experience but usually invisible to users:

- validations
- API calls
- database operations
- manual reviews
- approvals
- staff actions
- scheduled jobs
- fraud checks
- fulfilment
- reconciliation
- notification delivery
- escalation processes
- policy decisions

Every important frontstage result should connect to the backstage process that enables it.

---

## 2.5 Separate evidence from assumptions

For the current journey:

- only present supported behaviour as fact
- label uncertain behaviour as an assumption
- attach evidence references to important findings

For the future journey:

- label all proposed changes as hypotheses
- identify which user need each change supports
- define how the change will be tested

---

# 3. Journey boundaries

Before mapping, define:

## Journey name

[Outcome-oriented journey name]

## Primary user

[User type from `01-user-needs-and-scope.md`]

## Related users

- [Secondary user]
- [Administrator]
- [Support or operational user]
- [Approver or external participant]

## Trigger

[Event or situation that starts the journey]

## Intended outcome

[The complete result the user is trying to achieve]

## Start point

[First relevant action, thought or event]

## End point

[Moment when the outcome is complete and understood]

## Related user needs

- UN-[number]
- UN-[number]

## Included channels

- [Channel]
- [Channel]

## Excluded areas

- [Area outside this journey]
- [Reason for exclusion]

---

# 4. Journey stages

Break the journey into meaningful stages.

Example:

```text
Recognise need
→ Understand options
→ Check eligibility
→ Prepare information
→ Start task
→ Submit
→ Wait for processing
→ Respond to issues
→ Receive outcome
→ Complete follow-up actions
```

A journey stage is broader than an individual screen.

Each stage may include several actions, systems and touchpoints.

---

# 5. Required journey elements

Every current and future journey must show:

1. Trigger
2. Entry point
3. User actions
4. System responses
5. Decisions
6. Other people involved
7. External systems involved
8. Channel and device
9. Information required
10. Evidence or documents required
11. Frontstage touchpoints
12. Backstage processes
13. Business rules
14. Waiting periods
15. Pain points
16. Workarounds
17. Errors and failures
18. Dead ends
19. Channel transitions
20. Completion
21. Post-completion actions

---

# 6. Journey-step record

Use one record for every meaningful step.

## Step [number]: [User-oriented step name]

### Journey stage

[Stage containing this step]

### Trigger

[What causes this step to begin]

### User goal

[What the user is trying to accomplish at this step]

### User action

[What the user does]

### Entry point

How the user reaches this step:

- direct URL
- application navigation
- search engine
- notification
- email link
- support referral
- external service
- previous journey step
- offline instruction
- other: [describe]

### Channel

- Web
- Mobile application
- Email
- SMS
- Telephone
- Face-to-face
- Paper
- External service
- Internal staff system
- Other: [describe]

### Device or environment

[Desktop, mobile, workplace, public location, low connectivity or other relevant context]

### Information the user needs

- [Information]
- [Information]

### Information the user provides

- [Data]
- [Data]

### Required evidence

- [Document, identifier or proof]
- [Who requires it]
- [Why it is required]
- [How it is supplied]

### System response

[What the system displays, sends, records or changes]

### Other people involved

| Role   | Action   | Why involved |
| ------ | -------- | ------------ |
| [Role] | [Action] | [Reason]     |

### Systems involved

| System   | Responsibility   | Data exchanged |
| -------- | ---------------- | -------------- |
| [System] | [Responsibility] | [Data]         |

### Frontstage touchpoint

[What the user directly experiences]

### Backstage process

[Invisible processing, staff activity or system behaviour]

### Business rules

- [Rule]
- [Rule]

### Decision

[Decision made by the user, system or staff member]

### Decision branches

- **If [condition]:** [next step]
- **If [condition]:** [alternative step]
- **If [condition]:** [cannot continue or escalation]

### Waiting time

[Immediate, estimated duration or unknown]

### User visibility during waiting

- what the user knows
- what status is shown
- whether an estimate is provided
- whether the user can leave and return
- whether the user is notified of changes

### Current pain points

- [Confusion]
- [Delay]
- [Duplicate work]
- [Missing information]
- [Accessibility issue]
- [Unclear responsibility]

### Current workaround

[What users or staff do to overcome the problem]

### Failure states

- [System failure]
- [Validation failure]
- [External dependency failure]
- [Human or operational failure]

### Recovery path

[How the user continues, retries, receives help or returns later]

### Dead-end risk

[Explain how the user might become unable to continue]

### Exit condition

[What must happen before this step is complete]

### Next step

[Step number or destination]

### Evidence

- Evidence ID:
- Evidence source:
- Finding:
- Confidence:
- Date:

### Assumptions

- [Unverified assumption]

---