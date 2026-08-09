# Heuristic Findings, Severity and Reporting

## Contents

- Status continuity
- Terminology continuity
- Control continuity
- Error continuity
- Efficiency continuity
- Help continuity
- Heuristic issue: HI-[number]
  - Title
  - Primary heuristic
  - Secondary heuristics
  - Flow location
  - Affected users
  - Scenario
  - Observed or specified behaviour
  - Expected usable behaviour
  - User consequence
  - Evidence
  - Assumptions
  - Frequency
  - Impact
  - Persistence
  - Severity
  - Recommendation
  - Business or technical constraints
  - Validation method
  - Owner
  - Status
- Severity factors
  - Frequency
  - Impact
  - Persistence
- Flow-specific severity guidance
  - Severity 4 examples
  - Severity 3 examples
  - Severity 2 examples
  - Severity 1 examples
- Rating rules
- Priority decision table
- Executive summary
- Heuristic coverage

After reviewing individual states, inspect the flow as a whole.

## Status continuity

- Is state consistent from entry to completion?
- Do notifications and external channels reflect the same state?
- Can users understand ownership during waiting periods?

## Terminology continuity

- Are entities, actions and outcomes named consistently?
- Does terminology match the user’s domain across all roles?

## Control continuity

- Are cancel, back, undo, save and resume available under predictable rules?
- Do users lose control during channel or role transitions?

## Error continuity

- Are similar failures prevented and recovered consistently?
- Can users move from failure to a valid state without restarting unnecessarily?

## Efficiency continuity

- Does the full journey contain repeated data entry, duplicate approvals or avoidable handoffs?
- Are users forced through irrelevant stages because of organisational structure?

## Help continuity

- Is support available at the actual point of blockage?
- Is context transferred to support so the user does not repeat the whole problem?

---

# 16. Issue record

Create one record for each distinct problem.

## Heuristic issue: HI-[number]

### Title

[Short description of the user problem]

### Primary heuristic

H[1–10]: [name]

### Secondary heuristics

- H[number], when materially relevant

### Flow location

- Flow:
- State:
- Transition:
- Entry point or channel:

### Affected users

- [role or user type]

### Scenario

[Condition under which the problem occurs]

### Observed or specified behaviour

[What currently happens]

### Expected usable behaviour

[What the flow must allow the user to understand or do]

### User consequence

- task blocked
- incorrect action
- duplicate action
- delayed completion
- repeated work
- loss of data
- inability to recover
- avoidable support contact
- reduced trust
- other: [describe]

### Evidence

- [research, support, analytics or specification reference]

### Assumptions

- [unverified conclusion]

### Frequency

- Frequent
- Occasional
- Rare
- Unknown

### Impact

- Blocks completion
- Causes serious risk or incorrect outcome
- Requires difficult recovery
- Causes delay or repeated work
- Creates minor friction

### Persistence

- One-time learning problem
- Repeats until fixed
- Repeats for every task
- Affects only a specific condition
- Unknown

### Severity

0, 1, 2, 3 or 4

### Recommendation

Describe required state, logic, information or recovery behaviour.

Do not prescribe colours, layout or a specific UI component unless the implementation detail is essential to the interaction requirement.

### Business or technical constraints

- [constraint]

### Validation method

- usability test
- prototype walkthrough
- production analytics
- support-data review
- accessibility test
- technical test
- operational review

### Owner

[team or role]

### Status

- Open
- Accepted
- Planned
- Implemented
- Validated
- Rejected with reason

---

# 17. Severity rating

Use Nielsen’s 0–4 scale.

| Score | Meaning                                | Required action                                                          |
| ----: | -------------------------------------- | ------------------------------------------------------------------------ |
|     0 | Not a usability problem                | Close or record as nonissue                                              |
|     1 | Cosmetic or negligible usability issue | Fix only when convenient; outside this flow-focused review in most cases |
|     2 | Minor usability problem                | Schedule a lower-priority correction                                     |
|     3 | Major usability problem                | Fix with high priority before release unless risk is formally accepted   |
|     4 | Usability catastrophe                  | Block release or affected flow until corrected                           |

## Severity factors

### Frequency

How often will relevant users encounter the issue?

### Impact

How difficult, risky or costly is the issue when encountered?

### Persistence

Will users overcome it once, or will it continue affecting repeated tasks?

## Flow-specific severity guidance

### Severity 4 examples

- critical user cannot complete the primary goal
- flow causes irreversible harm or serious incorrect outcome
- users cannot determine whether a consequential action succeeded
- recovery is unavailable for a common critical failure
- permission failure exposes protected actions or information

### Severity 3 examples

- important task frequently requires support or workaround
- valid progress is lost
- users commonly repeat consequential submissions
- major role cannot understand or recover from a state
- inconsistent rules produce conflicting outcomes

### Severity 2 examples

- extra steps or repeated information cause measurable inefficiency
- recoverable errors are poorly explained
- occasional users struggle but can complete without outside help
- frequent users lack an efficient path

### Severity 1 examples

- wording or minor feedback can be improved without affecting understanding or completion

## Rating rules

- Rate the user consequence, not implementation effort.
- Do not lower severity because a fix is difficult.
- Do not raise severity merely because a stakeholder dislikes the behaviour.
- Use evidence where available.
- Mark severity as provisional when frequency or impact is unknown.
- Re-rate after findings from multiple evaluators are consolidated.

---

# 18. Prioritisation

Severity is not the only prioritisation input.

Also record:

- number and importance of affected users
- connection to a critical user need
- legal, financial, security or accessibility risk
- frequency of the flow
- support and operational cost
- evidence confidence
- dependency on planned architecture
- cost of delaying correction

## Priority decision table

| Severity | Evidence confidence | Flow criticality      | Default priority        |
| -------: | ------------------- | --------------------- | ----------------------- |
|        4 | Any                 | Any                   | Blocker                 |
|        3 | Medium or high      | Critical or important | High                    |
|        3 | Low                 | Any                   | Investigate immediately |
|        2 | Medium or high      | Frequent              | Medium                  |
|        2 | Low                 | Any                   | Research or measure     |
|        1 | Any                 | Any                   | Low                     |

Do not use implementation cost to deny that a usability problem exists. Cost affects scheduling and solution choice, not the finding itself.

---

# 19. Evaluation report

## Executive summary

- Flow reviewed:
- Primary user:
- Review date:
- Evaluators:
- Evidence available:
- Total issues:
- Severity 4:
- Severity 3:
- Severity 2:
- Severity 1:
- Release recommendation:

## Heuristic coverage

| Heuristic                         | Pass | Issues | Highest severity | Evidence gaps |
| --------------------------------- | ---: | -----: | ---------------: | ------------- |
| H1 Visibility of system status    |      |        |                  |               |
| H2 Match with user domain         |      |        |                  |               |
| H3 User control and freedom       |      |        |                  |               |
| H4 Consistency and standards      |      |        |                  |               |
| H5 Error prevention               |      |        |                  |               |
| H6 Recognition rather than recall |      |        |                  |               |
| H7 Flexibility and efficiency     |      |        |                  |               |
| H8 Relevant and minimal flow      |      |        |                  |               |
| H9 Error diagnosis and recovery   |      |        |                  |               |
| H10 Help and documentation        |      |        |                  |               |

## Highest-priority findings

| Issue  | Heuristic | Severity | User consequence | Required behaviour | Owner   |
| ------ | --------- | -------: | ---------------- | ------------------ | ------- |
| HI-001 | H[number] |    [0–4] | [Consequence]    | [Requirement]      | [Owner] |

## Research-required findings

| Issue   | Unknown   | Why evidence is needed | Validation method |
| ------- | --------- | ---------------------- | ----------------- |
| HI-[ID] | [Unknown] | [Reason]               | [Method]          |

## Accepted constraints

| Issue   | Constraint   | Evidence or authority | Residual risk | Approval owner |
| ------- | ------------ | --------------------- | ------------- | -------------- |
| HI-[ID] | [Constraint] | [Reference]           | [Risk]        | [Owner]        |

---

# 20. Release rules

A reviewed flow must not be marked ready when:

- a severity-4 issue remains open
- a common severity-3 issue blocks task completion or safe recovery
- the true completion state is unclear
- consequential duplicate actions are possible
- critical validation or permission logic is missing
- users can lose substantial work without warning or recovery
- a common system failure has no safe retry or escalation path
- assumptions control a high-risk transition without validation

A flow may proceed with lower-severity findings only when:

- the residual risk is documented
- an owner and target date exist
- measurement or research is planned
- the issue does not undermine a critical user need

---

# 21. Required output from the UX agent

For every heuristic-review task, produce:

1. Review identity and task scenario
2. Evidence and assumptions
3. Paths and states reviewed
4. Findings for each of the ten heuristics
5. Cross-flow findings
6. One issue record per distinct problem
7. Frequency, impact and persistence assessment
8. Severity rating
9. Required behaviour for correction
10. Constraints and residual risks
11. Validation method
12. Prioritised findings table
13. Research-required findings
14. Release recommendation
15. Updated acceptance criteria for affected flows

---

# 22. Agent operating rules

When using this document:

- evaluate one realistic user goal at a time
- review all valid, failure and recovery paths
- evaluate states and business logic, not visual style
- ask all ten heuristic questions
- identify the exact state or transition affected
- record one distinct problem per issue
- distinguish observed evidence from expert inference
- do not invent user evidence
- do not treat heuristic review as usability testing
- assign a primary heuristic to each issue
- rate severity by frequency, impact and persistence
- rate user harm, not engineering difficulty
- describe required behaviour rather than prescribing components
- connect recommendations to validated user needs
- preserve necessary safeguards when simplifying flows
- challenge documentation that compensates for a broken flow
- include role, permission, channel and post-completion behaviour
- identify missing research before making high-confidence claims
- re-run the review after significant flow changes

---

# 23. Source basis

This operating document is based on:

- Nielsen Norman Group, “10 Usability Heuristics for User Interface Design”
- Nielsen Norman Group, “How to Conduct a Heuristic Evaluation”
- Nielsen Norman Group, “Severity Ratings for Usability Problems”
- Nielsen Norman Group, “10 Usability Heuristics Applied to Complex Applications”
- Nielsen Norman Group, “Aesthetic and Minimalist Design”
- Nielsen Norman Group, “Help and Documentation”
- Nielsen Norman Group, “Heuristic Evaluation Workbook”

The heuristics are broad interaction principles rather than detailed interface rules. For complex applications, they remain applicable to domain-specific workflows, state feedback, efficiency, errors and recovery. Heuristic evaluation should complement—not replace—research with actual users.