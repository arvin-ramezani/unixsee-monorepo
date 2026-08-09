# Output Principles and Document Header

## Contents

- Purpose
- 1.1 Evidence before recommendation
  - Confirmed evidence
  - Inference
  - Assumption
  - Unknown
- 1.2 Traceability is mandatory
- 1.3 Describe behaviour, not presentation
- 1.4 Do not invent missing business logic
- 1.5 Cover the complete service
- Document control
- Confidence summary
- Executive flow summary
- Required output
  - Problem statement
  - Desired user outcome
  - Desired service outcome
  - Why this matters now
  - Scope
  - Success definition

## Purpose

This document defines the mandatory output format for every UX-flow analysis.

Its purpose is to make every analysis:

- evidence-based
- complete enough for implementation
- traceable to validated user needs
- explicit about assumptions and unknowns
- clear about roles, permissions, states and business rules
- complete across happy, alternative, failure and recovery paths
- reviewable for accessibility and usability
- measurable after implementation
- testable through acceptance criteria
- suitable for handoff to product, design, engineering, QA, support and operations

This is an output contract, not an optional template.

The UX agent must return every required section unless the section is explicitly marked:

- `Not applicable — [reason]`
- `Unknown — research required`
- `Blocked — missing project evidence`

The agent must never silently omit a section.

---

# 1. Operating principles

## 1.1 Evidence before recommendation

The agent must distinguish between:

### Confirmed evidence

Information supported by:

- user interviews
- direct observation
- usability testing
- support tickets
- customer complaints
- product analytics
- search logs
- funnel data
- session recordings
- operational data
- documented business rules
- legal requirements
- security requirements
- verified technical constraints

### Inference

A conclusion logically derived from available evidence but not directly observed.

Every inference must be labelled:

> Inference: [statement]

### Assumption

An unverified belief required to continue the analysis.

Every assumption must include:

- source or origin
- risk if wrong
- validation method
- affected flow decisions

### Unknown

Information that is unavailable and cannot safely be inferred.

Unknowns must become research questions or product decisions.

---

## 1.2 Traceability is mandatory

Every proposed flow change must connect to:

1. a user need
2. current-journey evidence or a documented new requirement
3. a problem, risk or opportunity
4. a proposed state or behaviour
5. a business rule
6. an analytics or validation method
7. acceptance criteria

Use identifiers consistently:

- User needs: `UN-001`
- Evidence: `E-001`
- Assumptions: `A-001`
- Unknowns: `U-001`
- Journey problems: `JP-001`
- Flow changes: `CH-001`
- Business rules: `BR-001`
- Validation rules: `VR-001`
- System failures: `SF-001`
- Edge cases: `EC-001`
- Accessibility issues: `AX-001`
- Heuristic issues: `HX-001`
- Analytics events: `EV-001`
- Acceptance criteria: `AC-001`
- Research questions: `RQ-001`

---

## 1.3 Describe behaviour, not presentation

The analysis must focus on:

- user intent
- sequence
- states
- transitions
- decisions
- business logic
- information requirements
- role behaviour
- permissions
- system responses
- failure handling
- recovery
- completion
- measurement

Do not include visual design unless explicitly requested.

Do not prescribe:

- colours
- typography
- spacing
- component styling
- visual trends
- illustration style
- decorative motion
- layout polish

When a screen or component name is useful, use it only as a reference to a functional state.

---

## 1.4 Do not invent missing business logic

When rules are missing:

1. identify the missing decision
2. explain why it affects the flow
3. provide safe alternative models when useful
4. label any temporary choice as an assumption
5. add a research or stakeholder question

Do not select a rule merely because it is common in other products.

---

## 1.5 Cover the complete service

The output must include:

- user-facing actions
- application responses
- backend processing
- manual operational work
- external systems
- cross-channel transitions
- offline steps
- waiting periods
- post-completion actions

Do not stop at a form submission when the user’s outcome depends on later processing.

---

# 2. Required document header

Every output must begin with:

# UX Flow Specification

## Document control

| Field | Value |
|---|---|
| Project | [Project name] |
| Flow or service | [Flow name] |
| Version | [Version] |
| Status | Draft / Review / Validated / Approved |
| Date | YYYY-MM-DD |
| Prepared from | [Files, research, tickets, analytics or discussions] |
| Primary owner | [Role or team] |
| Reviewers required | [Product, engineering, QA, accessibility, operations or other] |

## Confidence summary

| Area | Confidence | Reason |
|---|---|---|
| User needs | High / Medium / Low | [Reason] |
| Current journey | High / Medium / Low | [Reason] |
| Business rules | High / Medium / Low | [Reason] |
| Proposed journey | High / Medium / Low | [Reason] |
| Accessibility | High / Medium / Low | [Reason] |
| Measurement plan | High / Medium / Low | [Reason] |

## Executive flow summary

Provide no more than 10 concise points covering:

- primary user
- primary goal
- current problem
- proposed change
- major decisions
- primary completion state
- highest-risk failure
- important accessibility risk
- main evidence gap
- recommended next validation step

---

# 3. Problem and desired outcome

## Required output

### Problem statement

Describe the user problem without naming a predetermined solution.

Format:

> [User type] currently struggles to [complete goal] when [context or trigger] because [evidence-backed barriers]. This causes [user and service impact].

### Desired user outcome

Describe the complete result users need.

> Users can [complete meaningful outcome] with [necessary certainty, control or support], including when [important exception or constraint].

### Desired service outcome

Describe the legitimate organisational outcome.

Examples:

- reduce avoidable support contact
- reduce failed submissions
- increase successful task completion
- reduce manual reconciliation
- improve auditability
- prevent unauthorised actions
- shorten time to resolution

### Why this matters now

State:

- triggering business or user event
- current impact
- affected users
- urgency
- consequences of no change

### Scope

#### In scope

- [User goals]
- [Journey stages]
- [Roles]
- [Channels]
- [States]

#### Out of scope

- [Excluded item]
- [Reason]
- [How the wider journey handles it]

### Success definition

The problem is considered meaningfully improved when:

- [Observable user outcome]
- [Operational outcome]
- [Quality or accessibility outcome]
- [Measurement threshold, if known]

---