# User Needs

## Contents

- Purpose
- 1.1 Start with the user’s problem
- 1.2 Understand current behaviour
- 1.3 Include all relevant user types
- 1.4 Separate evidence from assumptions
  - Evidence
  - Assumptions
- User type record
  - Name
  - Description
  - Primary goal
  - Main tasks
  - Trigger
  - Current method
  - Pain points
  - Context
  - Dependencies
  - Evidence
  - Confidence
- User need: UN-[number]
  - Statement
  - Current method
  - Current problems
  - Evidence
  - Assumptions
  - Constraints
  - Success outcome
  - Priority
  - Validation status

## Purpose

Use this document to identify:

- who the actual users are
- what each user is trying to accomplish
- what triggers their need
- how they currently complete the task
- what prevents or complicates task completion
- which findings are supported by evidence
- which statements remain assumptions
- what the service should and should not solve
- which validated user need justifies each proposed flow or feature

Do not design screens, components or technical solutions during this stage.

---

# 1. Core principles

## 1.1 Start with the user’s problem

Define the problem before proposing a solution.

Bad:

> Users need an automated notification system.

Good:

> Users need to know when the status of their request changes so they can take the next required action.

A user need must remain valid even if the implementation changes.

---

## 1.2 Understand current behaviour

Do not ask only what users want.

Determine:

- what they are trying to achieve
- what triggers the task
- how they complete it today
- which channels, tools or workarounds they use
- what information they need
- what decisions they make
- where they become confused or blocked
- what happens when the task fails
- what they do after completing the task

Observed behaviour is stronger evidence than feature requests.

---

## 1.3 Include all relevant user types

Do not research only the primary customer.

Consider:

- primary users completing the main task
- secondary users affected by the result
- administrators
- operators
- support staff
- reviewers or approvers
- users with limited permissions
- new and inexperienced users
- frequent or expert users
- users with accessibility needs
- users with limited digital skills or unreliable internet access
- external people or systems involved in completing the task

A role is relevant when its actions, information or decisions affect the user journey.

---

## 1.4 Separate evidence from assumptions

Evidence and assumptions must never be presented together as confirmed facts.

### Evidence

Accepted evidence can include:

- user interviews
- direct observation
- usability testing
- support tickets
- customer complaints
- call-centre or support-team reports
- product analytics
- funnel and abandonment data
- search logs
- session recordings
- surveys with relevant participants
- previous research
- operational data
- documented legal or contractual requirements

### Assumptions

Treat these as assumptions until validated:

- stakeholder opinions
- developer expectations
- competitor behaviour
- feature requests without an underlying problem
- internal business preferences
- inferred user motivation
- statements beginning with “users probably”
- claims based on one unusual case
- AI-generated conclusions without project evidence

---

# 2. User type discovery

For every potential user type, complete this record.

## User type record

### Name

[Clear role or behaviour-based name]

### Description

[Who this user is and their relationship with the service]

### Primary goal

[The outcome they are trying to achieve]

### Main tasks

- [Task]
- [Task]

### Trigger

[The situation that causes them to begin]

### Current method

[How they complete the task today]

### Pain points

- [Problem or frustration]
- [Problem or frustration]

### Context

- Device or channel:
- Frequency of use:
- Experience level:
- Time pressure:
- Environment:
- Accessibility considerations:
- Internet or technical limitations:

### Dependencies

[People, departments, systems or information required]

### Evidence

- [Evidence source]
- [Evidence source]

### Confidence

Choose one:

- **Validated:** supported by multiple relevant evidence sources
- **Partially validated:** supported by limited evidence
- **Assumed:** not yet supported by direct user evidence

---

# 3. User need format

Record each need separately.

## User need: UN-[number]

### Statement

**As a:** [specific user type]

**When:** [trigger, context or situation]

**I need to:** [complete a task or resolve a problem]

**So that:** [achieve a meaningful outcome]

**Because:** [important constraint, when relevant]

### Current method

[How the user currently attempts to meet this need]

### Current problems

- [Barrier, delay or frustration]
- [Error or failure]
- [Workaround]
- [Unnecessary dependency]

### Evidence

- **Source:** [interview, analytics, support ticket, observation or research]
- **Finding:** [what the evidence shows]
- **Reference:** [file, report, ticket or dashboard]
- **Date:** [when the evidence was collected]

### Assumptions

- [Unverified statement]
- [Unverified statement]

### Constraints

#### Hard constraints

Constraints that currently cannot easily change:

- legal requirements
- security requirements
- contractual obligations
- external system limitations
- mandatory business rules

#### Soft constraints

Constraints that may be changed or challenged:

- existing internal processes
- organisational habits
- legacy workflows
- team ownership boundaries
- current interface structure
- historical technical decisions

### Success outcome

The need is met when:

- [Observable user outcome]
- [Observable user outcome]

### Priority

Choose one:

- **Critical:** the service cannot fulfil its purpose without this need
- **Important:** significantly affects successful completion
- **Supporting:** improves the journey but is not essential

### Validation status

Choose one:

- Validated
- Partially validated
- Unvalidated
- Rejected by evidence

---

# 4. Rules for writing user needs

A valid user need must:

- describe one recognisable user type
- use language the user would understand
- include a specific trigger or context when relevant
- describe what the user needs to accomplish
- explain why the outcome matters
- be supported by evidence or clearly labelled as an assumption
- describe a problem or outcome rather than a feature
- remain valid across different technical solutions
- be specific enough to guide flow decisions
- be broad enough to represent the complete user outcome

Reject a user need when it:

- names a UI component
- requires a specific technology
- describes an internal implementation task
- exists only because a stakeholder requested a feature
- combines several unrelated goals
- has no meaningful outcome
- cannot be connected to user evidence
- describes what the business wants without user value

---

# 5. User need quality test

For each need, answer:

1. Does this sound like something a real user might say?
2. Is the user type specific and relevant?
3. Is the trigger clear?
4. Is the desired outcome clear?
5. Does it describe a problem rather than a solution?
6. Is it supported by evidence?
7. Are assumptions clearly separated?
8. Does it account for relevant constraints?
9. Can successful completion be observed or measured?
10. Does the need belong inside the service’s scope?

If any answer is “no”, revise or investigate the need.

---