# Output: Risks, Readiness and Recommendations

## Contents

- Risk register
- Dependency register
- Readiness checklist
  - User evidence
  - Scope
  - Flow logic
  - Rules and permissions
  - Completion and operations
  - Quality
- Readiness decision
  - Ready for prototyping
  - Ready for technical design
  - Ready for implementation
  - Conditionally ready
  - Not ready
- Blocking issues
- Recommendation: REC-[number]
  - Must resolve before implementation
  - Must validate during prototyping
  - Can iterate after release
  - Explicitly rejected or deferred
- Document control
- Executive flow summary
- Problem and desired outcome
- Available evidence
- Assumptions and unknowns
- Users, roles and permissions
- User needs
- Current journey
- Proposed journey
- Mermaid flow diagram
- Screen/state sequence
- Business-rule decision table
- Loading, empty, error and recovery states
- Edge cases
- Accessibility review
- Heuristic review
- Analytics events
- Acceptance criteria
- Questions requiring user research

## Risk register

| ID | Risk | Source | Likelihood | Impact | Mitigation | Owner | Release effect |
|---|---|---|---|---|---|---|---|
| R-001 | [Risk] | [Evidence or assumption] | High / Medium / Low | High / Medium / Low | [Mitigation] | [Owner] | Block / Conditional / Monitor |

## Dependency register

| ID | Dependency | Type | Owner | Required by | Failure effect | Fallback |
|---|---|---|---|---|---|---|
| D-001 | [Dependency] | System / team / policy / vendor | [Owner] | [Stage] | [Effect] | [Fallback] |

Include:

- external systems
- internal APIs
- operational teams
- support teams
- approval bodies
- notification providers
- data quality
- policy decisions
- security review
- accessibility review
- analytics implementation

---

# 21. Implementation readiness

## Readiness checklist

### User evidence

- [ ] Primary user needs are validated.
- [ ] Current behaviour is understood.
- [ ] Critical user groups are represented.
- [ ] Evidence limitations are documented.

### Scope

- [ ] Start and end points are explicit.
- [ ] In-scope and out-of-scope areas are explicit.
- [ ] Wider-journey dependencies are known.

### Flow logic

- [ ] Happy path is complete.
- [ ] Alternative paths are complete.
- [ ] Validation failures are defined.
- [ ] System failures are defined.
- [ ] Recovery and retry are defined.
- [ ] Cancel, back and undo are defined.
- [ ] Save and resume are defined where necessary.
- [ ] Terminal states are explicit.

### Rules and permissions

- [ ] Business rules are confirmed or labelled.
- [ ] Decision tables are complete.
- [ ] Role permissions are explicit.
- [ ] Server-side enforcement is required.
- [ ] Concurrent changes are handled.

### Completion and operations

- [ ] Completion status is truthful.
- [ ] Post-completion state is defined.
- [ ] Notification behaviour is defined.
- [ ] Backend and staff processes are feasible.
- [ ] Failure ownership is explicit.

### Quality

- [ ] Accessibility review is complete.
- [ ] Heuristic review is complete.
- [ ] Edge cases are covered.
- [ ] Analytics events are specified.
- [ ] Acceptance criteria are testable.
- [ ] Research questions are prioritised.

## Readiness decision

Choose one:

### Ready for prototyping

Core user needs and flow hypotheses are clear enough to test.

### Ready for technical design

Flow logic, states, rules and dependencies are sufficiently defined.

### Ready for implementation

Critical rules are confirmed, acceptance criteria are complete, and blockers are resolved.

### Conditionally ready

Implementation may proceed only with listed assumptions or constraints.

### Not ready

Critical evidence, business rules, accessibility requirements or failure logic are missing.

## Blocking issues

- [Issue]
- [Owner]
- [Required resolution]

---

# 22. Final recommendations

Provide recommendations in priority order.

## Recommendation: REC-[number]

- **Priority:** Critical / High / Medium / Low
- **Problem:** [Problem]
- **Evidence:** E-[number]
- **User need:** UN-[number]
- **Recommended behaviour:** [Behaviour]
- **Expected outcome:** [Outcome]
- **Dependencies:** [Dependencies]
- **Risks:** [Risks]
- **Validation:** [Method]
- **Acceptance criteria:** AC-[number]

Do not mix confirmed requirements and optional ideas.

Separate:

### Must resolve before implementation

- [Item]

### Must validate during prototyping

- [Item]

### Can iterate after release

- [Item]

### Explicitly rejected or deferred

- [Item and reason]

---

# 23. Compact final output structure

Every completed analysis must use this top-level order:

# UX Flow Specification

## Document control
## Executive flow summary
## Problem and desired outcome
## Available evidence
## Assumptions and unknowns
## Users, roles and permissions
## User needs
## Current journey
## Proposed journey
## Mermaid flow diagram
## Screen/state sequence
## Business-rule decision table
## Loading, empty, error and recovery states
## Edge cases
## Accessibility review
## Heuristic review
## Analytics events
## Acceptance criteria
## Questions requiring user research
## Risks and dependencies
## Implementation readiness
## Final recommendations

Do not reorder sections unless the user explicitly requests another delivery format.

---

# 24. Completeness rules

A section may be marked `Not applicable` only when the agent explains why.

A section may be marked `Unknown` only when it includes:

- what is missing
- why it matters
- risk of proceeding
- method to resolve it

An output is incomplete when it:

- proposes a flow without evidence
- omits roles or permissions
- contains only a happy path
- lacks failure and recovery states
- confuses submission with completion
- has no decision table for complex rules
- lacks accessibility review
- lacks usability review
- defines analytics without product questions
- uses vague acceptance criteria
- hides assumptions
- ignores the wider service and backend process
- describes layouts instead of behaviour
- omits post-completion state

---

# 25. Agent operating rules

When producing the UX Flow Specification:

- use the exact required section order
- retain identifiers consistently
- separate evidence, inference, assumption and unknown
- connect recommendations to user needs
- map the current journey before proposing the future journey
- describe states and transitions instead of visual layouts
- include backend, offline and cross-channel activity
- identify the actor for every meaningful action
- identify the trigger for every meaningful transition
- define preconditions and entry points
- include valid alternative outcomes
- separate validation failures from system failures
- define recovery, retry and escalation
- define cancel, back, undo, save and resume
- define roles and permissions by action and entity state
- distinguish queued, submitted, processing and completed
- define durable post-completion state
- include loading and empty states where applicable
- evaluate edge cases systematically
- perform accessibility and heuristic reviews
- define analytics around user outcomes
- write testable Given–When–Then acceptance criteria
- record questions requiring user research
- provide an explicit implementation-readiness decision
- never invent evidence
- never invent business rules without labelling assumptions
- never claim validation without user or operational evidence
- never treat a heuristic review as a substitute for user research
- never treat analytics alone as proof of user motivation

---

# 26. Source basis

This output contract is based on the following principles:

- GOV.UK Service Manual guidance that services should begin with user needs and solve the user’s whole problem.
- GOV.UK journey and experience mapping guidance that teams should understand what users do, think and experience across the complete service.
- GOV.UK service-blueprint guidance that service delivery must be understood end-to-end, front-to-back and across channels.
- GOV.UK confirmation guidance that completed transactions must communicate what happened and what occurs next.
- GOV.UK failure-state guidance that users must understand service failure, the status of their entered information and available alternatives.
- GOV.UK measurement guidance that performance metrics should be combined with user research, feedback and operational evidence.
- WCAG 2.2 guidance on logical focus order, visible focus, error identification, labels and instructions, status messages, target operation and accessible authentication.
- Nielsen Norman Group’s ten usability heuristics for systematic expert review.
- Nielsen Norman Group’s severity-rating approach for prioritising usability issues.
- Nielsen Norman Group guidance that heuristic evaluation complements rather than replaces testing with real users.

## Authoritative references

- GOV.UK Service Manual — Learning about users and their needs
- GOV.UK Service Manual — Map and understand a user’s whole problem
- GOV.UK Service Manual — Creating an experience map
- GOV.UK Service Manual — Measuring the success of your service
- GOV.UK Design System — Confirmation pages
- GOV.UK Design System — Service unavailable pages
- GOV.UK Design System — Error summary and error message guidance
- W3C WAI — WCAG 2.2 Quick Reference and Understanding documents
- Nielsen Norman Group — 10 Usability Heuristics
- Nielsen Norman Group — How to Conduct a Heuristic Evaluation
- Nielsen Norman Group — Severity Ratings for Usability Problems