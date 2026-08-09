# Output: Acceptance Criteria and Research

## Contents

- Acceptance-criteria register
  - Acceptance criterion: AC-[number]
  - Priority
  - Test type
  - Evidence required for sign-off
- Required acceptance-criteria groups
  - Happy path
  - Preconditions
  - Alternative paths
  - Validation
  - System failures
  - Recovery
  - User control
  - Permissions
  - Completion
  - Notifications
  - Accessibility
  - Analytics
- Acceptance-criteria quality rules
- Research-question register
  - Research question: RQ-[number]
- Good research questions
- Poor research questions
- Research-priority rules

Acceptance criteria must describe observable behaviour.

Use Given–When–Then format.

## Acceptance-criteria register

### Acceptance criterion: AC-[number]

**Related to:** UN-[number], CH-[number], BR-[number], AX-[number] or HX-[number]

**Given** [context and preconditions]

**When** [user action or system event]

**Then** [observable result]

**And** [additional required result]

### Priority

Critical / High / Medium / Low

### Test type

- unit
- integration
- end-to-end
- usability
- accessibility
- operational
- analytics
- security

### Evidence required for sign-off

[Evidence]

## Required acceptance-criteria groups

### Happy path

- successful completion
- correct final state
- correct confirmation
- correct side effects

### Preconditions

- eligibility
- authentication
- permissions
- required dependencies

### Alternative paths

- valid non-primary outcomes
- optional paths
- manual review
- delegated actions

### Validation

- specific errors
- data retention
- correction
- cross-field rules
- server-side enforcement

### System failures

- known failure
- uncertain result
- dependency outage
- retry safety
- escalation

### Recovery

- automatic retry
- manual retry
- resume
- duplicate prevention
- maximum retry outcome

### User control

- back
- cancel
- undo
- save and resume
- expiry

### Permissions

- allowed action
- denied action
- scope restrictions
- state restrictions
- permission change during flow

### Completion

- completed
- submitted
- processing
- rejected
- partial completion
- post-completion re-entry

### Notifications

- correct recipient
- correct trigger
- duplicate suppression
- delivery failure
- durable in-application status

### Accessibility

- keyboard completion
- focus order
- visible focus
- status announcements
- error identification
- labels and instructions
- timing and resume

### Analytics

- event firing
- correct state
- correct properties
- no prohibited data
- duplicate-event prevention

## Acceptance-criteria quality rules

Criteria must be:

- specific
- observable
- testable
- implementation-independent where possible
- linked to a requirement
- complete across failure and recovery paths

Reject criteria such as:

> The experience should be user-friendly.

Use:

> Given the external provider times out after submission, when the result is unknown, then the service must not create a second request automatically and must show a recoverable “checking status” state.

---

# 19. Questions requiring user research

## Research-question register

### Research question: RQ-[number]

- **Question:** [Behaviour-focused question]
- **Why it matters:** [Decision affected]
- **Target users:** [Users]
- **Current evidence:** [Evidence]
- **Risk if unanswered:** Critical / High / Medium / Low
- **Recommended method:** Interview / observation / usability test / diary study / analytics review
- **Prototype or scenario needed:** [Details]
- **Decision after research:** [Decision]
- **Owner:** [Role]
- **Status:** Open / Planned / Answered

## Good research questions

- What do store managers do when an order cannot be fulfilled?
- Which information do reviewers need before approving a refund?
- How do users decide whether a failed payment should be retried?
- What do users expect after a request is submitted for manual review?
- Which channel do users use when they cannot provide required evidence online?

## Poor research questions

- Do users like the new flow?
- Should we add a dashboard?
- Would users prefer blue or green?
- Is this design intuitive?
- Do users want automation?

## Research-priority rules

Prioritise questions that affect:

- core task completion
- high-risk assumptions
- permissions
- irreversible actions
- accessibility
- security
- large implementation cost
- high-volume support problems
- major channel transitions

---