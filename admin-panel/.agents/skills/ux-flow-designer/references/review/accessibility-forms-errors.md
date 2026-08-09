# Accessibility: Labels, Errors and Critical Submissions

## Contents

- Requirement
- 7.1 Input-requirement record
  - Input: IN-[number]
- 7.2 Label and instruction rules
- 7.3 Instruction-quality questions
- Requirement
- 8.1 Error record
  - Accessibility error: AE-[number]
- 8.2 Error rules
- 8.3 Error-state sequence
- 8.4 Validation versus system failure
- Requirement
- 9.1 Critical-action record
  - Critical action: CA-[number]
- 9.2 Safeguard decision table
- 9.3 Critical-submission rules

## Requirement

Inputs and controls must have understandable labels or instructions so users know:

- what information is required
- why it is required when necessary
- the expected format
- allowed values
- relevant constraints
- consequences of the choice
- whether information can be changed later

---

## 7.1 Input-requirement record

### Input: IN-[number]

- **Purpose:** [Purpose]
- **User-facing label meaning:** [Meaning]
- **Required:** Yes / No / Conditional
- **Required condition:** [Condition]
- **Expected format:** [Format]
- **Allowed values:** [Values]
- **Instruction:** [Instruction]
- **Example needed:** Yes / No
- **Error rules:** VR-[number]
- **Related business rules:** BR-[number]
- **Accessibility test:** [Test]

---

## 7.2 Label and instruction rules

- Every input must have a persistent, understandable label.
- Placeholder text must not be the only label.
- Required inputs must be identified before submission.
- Conditional requirements must be explained when they become relevant.
- Format constraints must be available before the user submits.
- Instructions should use domain language users understand.
- Labels must distinguish similar fields.
- Option labels must communicate the actual choice.
- Controls represented by icons must have an accessible name.
- Instructions must not depend only on position, shape, colour or sensory direction.
- Long instructions should be provided where needed without overwhelming unrelated steps.
- Help must be available at the point where the user needs it.
- Repeated information should not need to be memorised from previous steps.
- Data already provided should be reused or shown when users need to verify it.
- Security-sensitive instructions must remain understandable without exposing protected details.

---

## 7.3 Instruction-quality questions

- Does the user know what to enter?
- Does the user know which fields are required?
- Does the user know the accepted format?
- Does the user know why unusual information is needed?
- Does the user know whether they can change the answer later?
- Does the instruction appear before the error occurs?
- Does the instruction remain available while entering data?
- Is the wording understandable without internal terminology?
- Is the control’s accessible name consistent with its visible purpose?

---

# 8. Error identification and correction

## Requirement

When the system detects an input error:

1. identify the affected field or item
2. describe the problem in text
3. provide a known correction or valid example when possible
4. preserve valid information
5. provide a clear path back to successful completion

---

## 8.1 Error record

### Accessibility error: AE-[number]

- **Flow state:** ST-[number]
- **Input or action:** [Input]
- **Detection point:** [Point]
- **Error condition:** [Condition]
- **Affected item identified:** Yes / No
- **Problem description:** [Description]
- **Correction suggestion:** [Suggestion]
- **Valid data retained:** [Data]
- **Focus behaviour:** [Behaviour]
- **Status announcement:** [Announcement]
- **Recovery state:** [State]
- **WCAG criteria:** 3.3.1 / 3.3.3 / other
- **Acceptance criteria:** AC-[number]

---

## 8.2 Error rules

- Do not indicate errors by colour alone.
- Do not re-display a failed form without explaining that submission failed.
- Identify the exact item in error.
- Explain what is wrong rather than saying only “invalid”.
- Suggest how to fix the error when the correction is known.
- Preserve all valid information.
- Do not clear unrelated answers.
- Error summaries must link or move users to the affected item when applicable.
- Inline errors must be programmatically associated with the affected input.
- Errors created dynamically must be announced appropriately.
- Do not expose internal validation codes or stack traces as the primary explanation.
- Do not blame the user.
- Do not describe a system failure as a user input error.
- Do not force users to remember requirements from another step.
- Provide examples for unusual formats.
- If security prevents a precise suggestion, provide the safest useful guidance.
- When multiple errors exist, communicate the number and provide a usable correction sequence.
- After correction, remove or update stale error states programmatically.

---

## 8.3 Error-state sequence

```text
Input received
→ validation runs
→ error detected
→ affected item identified
→ problem described
→ correction suggested
→ valid information retained
→ user corrects
→ validation reruns
→ flow continues
```

---

## 8.4 Validation versus system failure

| Validation failure | System failure |
|---|---|
| User-supplied data does not meet a known requirement | Valid action cannot be completed because the service failed |
| Identify field or item | Identify action or service state |
| Explain correction | Explain result certainty and recovery |
| Preserve valid input | Explain whether data or submission was saved |
| User corrects input | System retries, user retries safely, or escalation occurs |

---

# 9. Critical submissions and error prevention

## Requirement

For actions that:

- create legal commitments
- perform financial transactions
- modify user-controlled stored data
- delete user-controlled data
- submit test responses

at least one safeguard must exist:

1. the action is reversible
2. input is checked and can be corrected
3. information can be reviewed, confirmed and corrected before final submission

---

## 9.1 Critical-action record

### Critical action: CA-[number]

- **Action:** [Action]
- **Consequence:** [Consequence]
- **Affected data or commitment:** [Data]
- **Reversible:** Yes / No / Partial
- **Review available:** Yes / No
- **Correction available:** Yes / No
- **Confirmation required:** Yes / No
- **Undo period:** [Period]
- **Authorised roles:** [Roles]
- **Resulting state:** [State]
- **Notification:** [Notification]
- **Audit requirement:** [Requirement]
- **WCAG criterion:** 3.3.4

---

## 9.2 Safeguard decision table

| Consequence | Reversible | Review needed | Confirmation needed | Undo needed |
|---|---:|---:|---:|---:|
| Low-risk and fully reversible | Yes | Usually no | Usually no | Preferred |
| High-impact but reversible | Yes | Context dependent | Context dependent | Required where feasible |
| Financial or legal commitment | Maybe | Yes | Yes | When supported |
| Permanent deletion | No | Yes | Yes | Alternative recovery if possible |
| Modification of important stored data | Maybe | Yes or checked | Often | Based on reversibility |

---

## 9.3 Critical-submission rules

- Explain the consequence before final commitment.
- Present the information that will be submitted.
- Allow correction before finalisation.
- Distinguish “review” from “completed”.
- Avoid ambiguous action names.
- Prevent accidental duplicate activation.
- Preserve context during confirmation.
- Do not add unnecessary confirmations to routine reversible actions.
- Prefer undo for low-risk reversible actions.
- Require stronger safeguards for irreversible or harmful actions.
- Communicate the true resulting state after submission.
- If processing continues, do not claim completion.
- Record privileged or consequential actions when auditability is required.
- Define what happens when the user leaves during review.
- Define what happens if information changes between review and submission.

---