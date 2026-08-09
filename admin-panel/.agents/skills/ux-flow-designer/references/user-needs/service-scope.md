# Service Scope and Traceability

## Contents

- Service problem
- User outcome
- Wider journey
  - Before this service
  - During this service
  - After this service
- Evidence strength
  - Strong
  - Medium
  - Weak

## Service problem

[Describe the user problem the service exists to solve.]

Do not describe the product, interface or technology.

## User outcome

[Describe the complete outcome users should reach.]

## Wider journey

### Before this service

- What triggers the wider journey?
- What has the user already done?
- What information or evidence do they already have?
- Which other services or people are involved?

### During this service

- Which part of the wider goal does this service solve?
- What decisions must the user make?
- What information must the service provide or collect?
- Which dependencies can block completion?

### After this service

- What must the user do next?
- What confirmation or evidence do they receive?
- Which other service, person or process continues the journey?
- What happens if the user is ineligible or cannot proceed?

---

# 7. In-scope responsibilities

The service must:

- [Solve user need UN-001]
- [Solve user need UN-002]
- [Provide a clear outcome for unsupported or ineligible users]
- [Connect users to the next part of their wider journey]
- [Prevent avoidable dead ends]
- [Support relevant user roles and constraints]

---

# 8. Out-of-scope responsibilities

The service will not:

- [Responsibility outside the validated user problem]
- [Task owned by another service]
- [Unvalidated feature request]
- [Internal business process that does not require user interaction]

For every excluded responsibility, state:

- why it is excluded
- who or what handles it
- how users continue their journey
- whether exclusion creates a dead end

---

# 9. Scope quality test

The scope is appropriate when:

- it solves a recognisable user problem
- it contributes to the user’s complete outcome
- it is not so broad that several unrelated tasks are combined
- it is not so narrow that users remain unable to finish their goal
- it follows the user’s mental model
- it does not mirror organisational departments unnecessarily
- it is not shaped around existing screens or technologies
- it connects coherently with preceding and following journey stages
- unsupported users are given a clear next action
- all included work connects to a validated user need

---

# 10. Need-to-feature traceability

Every proposed feature, screen, workflow or system behaviour must connect to at least one validated user need.

| ID      | Proposed capability | User need | Supporting evidence  | Priority  | Status   |
| ------- | ------------------- | --------- | -------------------- | --------- | -------- |
| CAP-001 | [Capability]        | UN-001    | [Evidence reference] | Critical  | Proposed |
| CAP-002 | [Capability]        | UN-002    | [Evidence reference] | Important | Proposed |

Reject or postpone a capability when:

- it has no associated user need
- its associated need is unvalidated
- it addresses an internal preference rather than a user problem
- a simpler capability can meet the same need
- it duplicates an existing solution
- it creates complexity disproportionate to its user value

---

# 11. Assumption register

| ID    | Assumption   | Origin                   | Risk if wrong | Validation method | Status      |
| ----- | ------------ | ------------------------ | ------------- | ----------------- | ----------- |
| A-001 | [Assumption] | Stakeholder              | High          | User interviews   | Unvalidated |
| A-002 | [Assumption] | Analytics interpretation | Medium        | Usability test    | Unvalidated |

Prioritise validation when an assumption:

- controls a critical flow
- affects many users
- changes permissions or security
- creates significant development cost
- could prevent task completion
- could exclude a user group

---

# 12. Evidence register

| ID    | Evidence type   | User type | Finding   | Related needs | Strength | Date       |
| ----- | --------------- | --------- | --------- | ------------- | -------- | ---------- |
| E-001 | User interview  | [Role]    | [Finding] | UN-001        | Strong   | YYYY-MM-DD |
| E-002 | Support tickets | [Role]    | [Finding] | UN-002        | Medium   | YYYY-MM-DD |

## Evidence strength

### Strong

- repeated observation across relevant users
- consistent findings from several evidence sources
- behavioural analytics supported by qualitative research

### Medium

- repeated support reports
- limited user interviews
- analytics showing behaviour without explaining motivation

### Weak

- one isolated report
- stakeholder interpretation
- competitor behaviour
- unverified survey response
- AI-generated inference

Weak evidence must not be presented as validated truth.

---

# 13. Research gaps

Record what is still unknown.

| Question   | Why it matters           | Target users | Research method          | Priority |
| ---------- | ------------------------ | ------------ | ------------------------ | -------- |
| [Question] | [Flow decision affected] | [User type]  | Interview or observation | High     |

Research questions should investigate behaviour and problems.

Good:

> What happens when store managers discover that an order cannot be fulfilled?

Bad:

> Would store managers like an automatic cancellation button?

---

# 14. Final output required from the UX agent

When analysing a project, produce:

1. identified user types
2. excluded or overlooked user types
3. user goals and triggers
4. current methods and workarounds
5. validated user needs
6. partially validated needs
7. assumptions requiring research
8. hard and soft constraints
9. the wider user journey
10. proposed service boundaries
11. in-scope and out-of-scope responsibilities
12. need-to-feature traceability
13. conflicting user or business needs
14. research gaps
15. evidence confidence assessment

Do not propose detailed flows until the critical user needs and service scope have been established.

---

# 15. Agent operating rules

When using this document:

- never invent research evidence
- never convert assumptions into facts
- label all inferred findings
- ask whether requested features solve a validated need
- challenge solution-first requirements
- distinguish user needs from business requirements
- include operational and support users where relevant
- inspect the wider journey before defining scope
- challenge soft constraints instead of automatically preserving them
- preserve genuine legal, security and contractual constraints
- prefer observable behaviour over stated preferences
- connect every proposed flow to a user need
- report missing evidence before making high-confidence recommendations