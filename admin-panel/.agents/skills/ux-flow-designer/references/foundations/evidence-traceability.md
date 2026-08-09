# Evidence, Assumptions and Traceability

## Contents

- 1.1 Evidence before recommendation
  - Confirmed evidence
  - Inference
  - Assumption
  - Unknown
- 1.2 Traceability is mandatory
- 1.3 Describe behaviour, not presentation
- 1.4 Do not invent missing business logic
- 1.5 Cover the complete service
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