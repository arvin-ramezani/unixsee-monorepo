# Output: Edge Cases, Reviews and Analytics

## Contents

- Edge-case register
  - Edge case: EC-[number]
- Required edge-case categories
  - Identity and session
  - Data and validation
  - State and concurrency
  - Connectivity and dependencies
  - Permissions
  - Time
  - User control
  - Accessibility and assisted use
- Edge-case prioritisation
- Accessibility review summary
- Required interaction checks
  - Keyboard access
  - Status and progress
  - Errors
  - Labels and instructions
  - Authentication
  - Timing
  - Target operation
  - Alternative and assisted channels
- Accessibility issue record
  - Accessibility issue: AX-[number]
- Accessibility conclusion
- Heuristic summary
- Heuristic issue record
  - Heuristic issue: HX-[number]
- Severity scale
- Heuristic conclusion
- Measurement questions
- Analytics event register
  - Event: EV-[number]
- Recommended event categories
- Event schema table
- Required metrics
- Analytics rules

## Edge-case register

### Edge case: EC-[number]

- **Scenario:** [Scenario]
- **Affected users:** [Users]
- **Trigger:** [Trigger]
- **Current state:** [State]
- **Expected behaviour:** [Behaviour]
- **Business rules:** BR-[number]
- **Failure risk:** [Risk]
- **Recovery:** [Recovery]
- **Analytics:** EV-[number]
- **Acceptance criteria:** AC-[number]
- **Status:** Covered / Unresolved / Out of scope

## Required edge-case categories

Evaluate at least:

### Identity and session

- session expires during work
- user authenticates through a deep link
- account becomes disabled
- role changes during the flow
- user switches organisation
- shared device or interrupted login

### Data and validation

- missing required data
- invalid combinations
- maximum and minimum values
- duplicate data
- stale data
- unexpected external data
- unsupported file or evidence
- changed validation rules after draft creation

### State and concurrency

- action already completed
- another actor edits the entity
- duplicate submission
- repeated approval
- cancellation during processing
- status changes between view and submit
- partial downstream completion

### Connectivity and dependencies

- offline or unstable connection
- API timeout
- external provider unavailable
- notification fails
- delayed background job
- service maintenance
- unknown submission result

### Permissions

- insufficient role
- out-of-scope entity
- delegated access expires
- approver is also requester
- entity ownership changes
- privileged user loses access

### Time

- deadline passes during the flow
- draft expires
- invitation expires
- timezone differences
- daylight-saving transition
- scheduled action changes

### User control

- user goes back
- user closes the application
- user cancels
- user wants to undo
- user resumes on another device
- user restarts an existing flow

### Accessibility and assisted use

- keyboard-only use
- screen-reader status updates
- magnification or zoom
- cognitive load
- limited dexterity
- users requiring assisted support
- users unable to use the primary channel

## Edge-case prioritisation

Score each edge case by:

- likelihood
- impact
- detectability
- recoverability
- number of users affected

Critical edge cases must have explicit acceptance criteria.

---

# 15. Accessibility review

This section reviews interaction and flow accessibility. It does not replace a full WCAG audit.

## Accessibility review summary

| ID | Requirement | Flow location | Status | Evidence | Severity | Required change |
|---|---|---|---|---|---|---|
| AX-001 | Keyboard completion | [State] | Pass / Fail / Unknown | [Evidence] | Critical / High / Medium / Low | [Change] |

## Required interaction checks

### Keyboard access

- Can every task be completed without a pointer?
- Is keyboard focus order logical?
- Is focus visible and not obscured?
- Can users leave modal or constrained states?
- Are custom interactions keyboard operable?

### Status and progress

- Are loading, success, failure and processing changes communicated programmatically?
- Can assistive-technology users know when content changed?
- Are long-running processes understandable?
- Does status communication avoid unnecessary focus changes?

### Errors

- Is the error identified in text?
- Is the affected item identified?
- Is correction guidance provided?
- Is valid data preserved?
- Does focus or navigation support finding errors?

### Labels and instructions

- Are required controls identified?
- Are constraints explained before submission?
- Are examples and formats understandable?
- Are instructions available when needed?

### Authentication

- Can users paste credentials?
- Are unnecessary memory tests avoided?
- Is re-authentication context preserved?
- Are alternatives available where required?

### Timing

- Are time limits necessary?
- Can users extend or resume?
- Are expiry warnings provided?
- Is work preserved where possible?

### Target operation

- Can actions be completed without precise pointer movement?
- Are destructive and adjacent actions protected from accidental activation?

### Alternative and assisted channels

- Is an alternative route available for users unable to use the primary flow?
- Does channel transition preserve context?
- Are support staff given enough information to continue the task?

## Accessibility issue record

### Accessibility issue: AX-[number]

- **Requirement:** [Requirement]
- **Affected users:** [Users]
- **Flow state:** [State]
- **Problem:** [Problem]
- **Impact:** [Impact]
- **Relevant criterion:** [WCAG criterion, when known]
- **Required behaviour:** [Behaviour]
- **Acceptance criteria:** AC-[number]
- **Validation method:** Keyboard test / screen reader / zoom / user research / expert review
- **Severity:** Critical / High / Medium / Low

## Accessibility conclusion

State:

- blockers
- high-priority risks
- untested requirements
- required specialist review
- required testing with disabled users
- release recommendation

---

# 16. Heuristic review

Review the flow using all ten Nielsen heuristics.

## Heuristic summary

| ID | Heuristic | Question | Status | Issue count | Highest severity |
|---|---|---|---|---|---|
| H1 | Visibility of system status | Does the user always know what is happening? | Pass / Fail / Unknown | [Count] | [Severity] |
| H2 | Match with real world | Does terminology match the user’s domain? | Pass / Fail / Unknown | [Count] | [Severity] |
| H3 | User control and freedom | Can the user cancel, return or undo? | Pass / Fail / Unknown | [Count] | [Severity] |
| H4 | Consistency and standards | Are similar actions consistent? | Pass / Fail / Unknown | [Count] | [Severity] |
| H5 | Error prevention | Are preventable errors blocked before submission? | Pass / Fail / Unknown | [Count] | [Severity] |
| H6 | Recognition rather than recall | Is required information visible rather than memorised? | Pass / Fail / Unknown | [Count] | [Severity] |
| H7 | Flexibility and efficiency | Are frequent users given efficient paths? | Pass / Fail / Unknown | [Count] | [Severity] |
| H8 | Minimal and relevant flow | Are unnecessary steps and information removed? | Pass / Fail / Unknown | [Count] | [Severity] |
| H9 | Error recognition and recovery | Do errors explain the problem and recovery action? | Pass / Fail / Unknown | [Count] | [Severity] |
| H10 | Help and documentation | Is help available where users become blocked? | Pass / Fail / Unknown | [Count] | [Severity] |

## Heuristic issue record

### Heuristic issue: HX-[number]

- **Heuristic:** H[number]
- **Flow location:** [State or transition]
- **Affected users:** [Users]
- **Observed problem:** [Problem]
- **Evidence:** [Evidence or expert finding]
- **User impact:** [Impact]
- **Frequency:** Frequent / Occasional / Rare / Unknown
- **Persistence:** One-time / Repeated / Continuous
- **Severity:** 0 / 1 / 2 / 3 / 4
- **Recommendation:** [Behavioural change]
- **Related change:** CH-[number]
- **Acceptance criteria:** AC-[number]

## Severity scale

- **0 — Not a usability problem**
- **1 — Cosmetic or very minor**
- **2 — Minor usability problem**
- **3 — Major usability problem**
- **4 — Usability catastrophe or release blocker**

Consider:

- frequency
- user impact
- persistence
- task criticality
- recoverability
- accessibility exclusion

## Heuristic conclusion

State:

- release blockers
- major issues
- repeated patterns
- issues requiring user testing
- issues requiring business-rule changes
- issues requiring operational changes

---

# 17. Analytics events

Analytics must answer product and research questions.

## Measurement questions

Examples:

- Can eligible users start the flow?
- Where do users abandon?
- Which validation rules block completion?
- How often do system failures occur?
- Do retries succeed?
- Do users resume saved work?
- Which roles face permission denial?
- How long does completion take?
- Which alternative outcomes are common?
- Does the proposed change reduce support contact?

## Analytics event register

### Event: EV-[number]

- **Name:** [Stable event name]
- **Purpose:** [Question answered]
- **Trigger:** [Exact event]
- **Actor:** [User or system]
- **Current state:** [State]
- **Resulting state:** [State]
- **Required properties:** [Properties]
- **Sensitive data restrictions:** [Restrictions]
- **Expected frequency:** [Frequency]
- **Related hypothesis:** [Hypothesis]
- **Related acceptance criteria:** AC-[number]
- **Validation method:** [How event implementation is tested]

## Recommended event categories

- `flow_started`
- `precondition_failed`
- `step_completed`
- `validation_failed`
- `draft_saved`
- `flow_resumed`
- `permission_denied`
- `submission_started`
- `submission_accepted`
- `processing_started`
- `processing_failed`
- `retry_started`
- `retry_succeeded`
- `flow_cancelled`
- `flow_completed`
- `alternative_outcome_reached`
- `support_requested`

## Event schema table

| Event | Trigger | Required properties | Prohibited properties | Question answered |
|---|---|---|---|---|
| flow_started | [Trigger] | flow_id, version, role, entry_point | PII unless essential | Can users begin? |

## Required metrics

- number of flow starts
- completion rate
- abandonment rate
- time to completion
- validation-failure rate
- system-failure rate
- retry-success rate
- save-and-resume rate
- permission-denial rate
- alternative-outcome rate
- support-contact rate
- completion by entry point
- completion by relevant user type
- accessibility-related failure indicators where ethically and legally appropriate

## Analytics rules

- define events before implementation
- distinguish submission from completion
- distinguish user validation from system failure
- track states rather than arbitrary screen views
- version events when logic changes
- avoid unnecessary personal data
- validate analytics in QA
- combine analytics with user research and operational evidence
- define a baseline and expected change when possible

---