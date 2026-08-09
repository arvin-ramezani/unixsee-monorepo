---
name: ux-flow-designer
description: Design, analyse, document or review end-to-end application UX flows. Use for user needs, service scope, current and future journeys, states and transitions, business rules, roles and permissions, validation, system failures, recovery, save and resume, accessibility interactions, heuristic review, analytics and implementation-ready acceptance criteria. Do not use for visual styling, colours, typography, spacing, decorative motion or UI polish.
---

# UX Flow Designer

## Contents

- Purpose
- Non-goals
- Evidence hierarchy
- Required distinctions
- Full workflow
- Reference routing
- Template routing
- Minimum information before future design
- User-needs rule
- Journey rule
- Detailed-flow rule
- State rule
- Failure rule
- User-control rule
- Accessibility rule
- Heuristic rule
- Analytics rule
- Acceptance-criteria rule
- Complete output
- Readiness
- Response discipline

## Purpose

Create evidence-based UX flows that engineering, product, QA, support and operations can implement and test.

Focus on:

- user goals and complete outcomes
- triggers and entry points
- current and future journeys
- user, staff and system actions
- states and state transitions
- business rules and decision logic
- roles and permissions
- validation, failures and recovery
- cancellation, undo, save and resume
- accessibility interactions
- heuristic quality
- analytics and acceptance criteria

Do not focus on visual UI unless explicitly requested.

## Non-goals

Do not add unsolicited:

- colours
- typography
- spacing
- component styling
- visual trends
- decorative animation
- layout polish
- design-system tokens

A screen or component may be named only to identify functional behaviour.

## Evidence hierarchy

Prefer:

1. direct user research and observed behaviour
2. repeated support and operational evidence
3. analytics interpreted with qualitative evidence
4. confirmed legal, security, business and technical rules
5. documented stakeholder decisions
6. labelled inference
7. labelled assumption

Never invent evidence or business rules.

## Required distinctions

Always distinguish:

- evidence vs assumption
- current behaviour vs intended process
- user need vs feature
- screen vs state
- user action vs system event
- validation failure vs system failure
- submission vs completion
- alternative outcome vs error
- hard constraint vs soft process constraint
- frontstage experience vs backstage delivery

## Full workflow

1. Frame the problem and desired outcome.
2. Inventory available evidence.
3. Identify users, roles and user needs.
4. Define service scope and journey boundaries.
5. Map the current journey.
6. Identify pain points, dead ends and channel breaks.
7. Design the proposed journey.
8. Define detailed states and transitions.
9. Define business rules and decision tables.
10. Add alternative, validation, failure and recovery paths.
11. Define user control, permissions and completion.
12. Review accessibility interactions.
13. Run heuristic review.
14. Define analytics and acceptance criteria.
15. State assumptions, risks, research questions and readiness.

Do not force the full workflow when the user asks for one focused artifact.

## Reference routing

Load only what the task needs.

| Task | References |
|---|---|
| Evidence, assumptions or confidence | `references/foundations/evidence-traceability.md` |
| Users and user needs | `references/user-needs/user-needs.md` |
| Service scope | `references/user-needs/service-scope.md` |
| Current journey | `references/journey/current-journey.md` |
| Pain points, dead ends or service blueprint | `references/journey/current-analysis-blueprint.md` |
| Future journey | `references/journey/future-journey.md` |
| Core detailed flow | `references/flow/core-flow.md` |
| Alternative paths, validation, failures or retry | `references/flow/paths-failures-recovery.md` |
| Back, cancel, undo, save, roles, permissions or completion | `references/flow/control-permissions-completion.md` |
| States, business rules, decision tables or analytics | `references/flow/states-rules-analytics.md` |
| Implementation-ready flow | `references/flow/implementation-spec.md` |
| Heuristic method | `references/review/heuristic-method.md` |
| Heuristics 1–5 | `references/review/heuristics-1-5.md` |
| Heuristics 6–10 | `references/review/heuristics-6-10.md` |
| Heuristic severity/report | `references/review/heuristic-reporting.md` |
| Keyboard and focus | `references/review/accessibility-keyboard-focus.md` |
| Labels, errors and critical submissions | `references/review/accessibility-forms-errors.md` |
| Authentication, status, timing and target size | `references/review/accessibility-auth-status-time-targets.md` |
| Accessibility issue model | `references/review/accessibility-review-model.md` |
| Accessibility testing and release gating | `references/review/accessibility-testing-gating.md` |
| Final output principles | `references/output/output-principles.md` |
| Evidence, users and journey output | `references/output/evidence-journeys.md` |
| State, rule and failure output | `references/output/states-rules-failures.md` |
| Edge case, review and analytics output | `references/output/edge-accessibility-heuristics-analytics.md` |
| Acceptance criteria and research output | `references/output/acceptance-research.md` |
| Risks, readiness and recommendations | `references/output/readiness-recommendations.md` |

## Template routing

| Deliverable | Template |
|---|---|
| User-needs register | `templates/user-needs-register.md` |
| Journey map and service blueprint | `templates/journey-map.md` |
| State-transition model | `templates/state-transition-table.md` |
| Business-rule decision table | `templates/decision-table.md` |
| Acceptance criteria | `templates/acceptance-criteria.md` |
| Heuristic/accessibility review | `templates/review-report.md` |
| Complete specification | `templates/ux-flow-specification.md` |

## Minimum information before future design

Establish:

- primary user
- primary goal
- trigger
- complete desired outcome
- available evidence
- current method
- known pain points
- relevant roles
- confirmed business rules
- hard constraints
- important unknowns

When missing, label visible placeholders or research questions.
Do not silently invent generic product behaviour.

## User-needs rule

Write outcomes, not features.

Good:

> As a store manager, when an order cannot be fulfilled, I need to understand the available resolution paths so that I can resolve it without creating a financial mismatch.

Bad:

> The store manager needs a refund modal.

Every proposed change must trace to a user need or confirmed requirement.

## Journey rule

Start when the need arises, not at login.

End when:

- the user’s complete outcome is achieved and understood
- follow-up is complete
- or responsibility clearly transfers

Include:

- online and offline touchpoints
- channel transitions
- other people
- external systems
- backstage activity
- required evidence
- waiting
- dead ends
- recovery

## Detailed-flow rule

Every implementation-ready flow covers:

1. user and goal
2. preconditions
3. entry points
4. happy path
5. alternative paths
6. validation failures
7. system failures
8. recovery and retry
9. cancel, back and undo
10. save and resume
11. roles and permissions
12. completion confirmation
13. notifications
14. post-completion state
15. analytics events

Mark non-applicable sections with a reason.

## State rule

Describe states rather than pages.

Each transition identifies:

- current state
- trigger
- actor
- preconditions
- rules
- resulting state
- data change
- side effects
- failure outcome

Every non-terminal state needs an exit.
Every terminal state must be explicit.

## Failure rule

For every consequential operation answer:

- can it fail before acceptance?
- can the result be uncertain?
- can retry duplicate effects?
- is it idempotent?
- what was saved?
- can the user resume?
- what is the final failure state?
- who owns escalation?

Do not advise ordinary retry when duplication may cause harm.

## User-control rule

Define separately:

- Back: changes step
- Cancel: ends active flow
- Undo: reverses completed action

Prefer undo for low-risk reversible actions.
Require review or confirmation for high-impact or irreversible actions.

## Accessibility rule

Review task completion, not visual taste.

At minimum check:

- keyboard operation
- no keyboard trap
- logical focus
- visible and unobscured focus
- labels and instructions
- error identification and correction
- critical-submission safeguards
- accessible authentication
- programmatic status messages
- timing extension and recovery
- minimum target precision

## Heuristic rule

Review all ten Nielsen heuristics as flow questions:

1. Does the user know what is happening?
2. Does language match the user’s domain?
3. Can the user cancel, return or undo?
4. Are similar actions consistent?
5. Are preventable errors prevented?
6. Is required information visible rather than memorised?
7. Are frequent users given efficient paths?
8. Are unnecessary steps removed?
9. Do errors explain the problem and recovery?
10. Is help available where users become blocked?

Use severity 0–4 and state release impact.

## Analytics rule

Track meaningful states and outcomes, not arbitrary clicks.

Distinguish:

- flow started
- validation failed
- draft saved
- flow resumed
- permission denied
- submission accepted
- processing failed
- retry
- alternative outcome
- completion

Each event must answer a product or research question.

## Acceptance-criteria rule

Use Given–When–Then.

Cover:

- happy path
- preconditions
- alternatives
- validation
- system failures
- recovery
- user control
- permissions
- completion
- notifications
- accessibility
- analytics

Avoid vague phrases such as “easy to use”.

## Complete output

Use `templates/ux-flow-specification.md`.

A complete specification must include:

- evidence, assumptions and unknowns
- users, roles and permissions
- user needs
- current and proposed journeys
- Mermaid diagram
- state sequence
- decision table
- loading, empty, error and recovery states
- edge cases
- accessibility and heuristic reviews
- analytics
- acceptance criteria
- research questions
- risks, dependencies and readiness

## Readiness

Use one:

- Ready for prototyping
- Ready for technical design
- Ready for implementation
- Conditionally ready
- Not ready

Never claim implementation readiness while critical permissions, business rules, failure logic or accessibility remain undefined.

## Response discipline

Be direct and implementation-oriented.

For incomplete evidence:

- deliver the best supported result
- label assumptions
- state confidence
- identify the smallest blocking research questions
- do not fake certainty
