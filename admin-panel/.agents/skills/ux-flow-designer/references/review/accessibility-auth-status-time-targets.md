# Accessibility: Authentication, Status, Timing and Targets

## Contents

- Requirement
- 10.1 Authentication-flow record
- 10.2 Authentication rules
- 10.3 Cognitive-function examples to review
- Requirement
- 11.1 Status-message record
  - Status message: SM-[number]
- 11.2 Status-message rules
- 11.3 Status versus focus movement
- Requirement
- 12.1 Time-limit record
  - Time limit: TL-[number]
- 12.2 Timing rules
- 12.3 Expiry-state sequence
- 12.4 Timeout failure examples
- Requirement
- 13.1 Target review record
- 13.2 Precision rules

## Requirement

Authentication must not require a cognitive-function test unless:

- another authentication method is available, or
- a mechanism assists the user in completing the test, or
- a permitted exception applies.

The flow must support common memory and transcription aids.

---

## 10.1 Authentication-flow record

| Stage | Cognitive demand | Assistance available | Alternative | Context preserved | Status |
|---|---|---|---|---|---|
| Sign-in | [Demand] | Password manager / paste / autofill | [Alternative] | Yes / No | [Status] |

---

## 10.2 Authentication rules

- Allow password managers.
- Allow pasting into username, password and verification-code inputs.
- Support browser and platform autofill where appropriate.
- Do not require users to memorise information unnecessarily.
- Do not block assistive authentication tools.
- Do not require users to transcribe a one-time code when an accessible alternative or automated assistance is feasible.
- Avoid puzzle-based authentication as the only method.
- Preserve the intended destination through sign-in.
- Preserve safe user progress during re-authentication.
- Explain why re-authentication is required.
- Provide understandable recovery when authentication fails.
- Do not reveal whether protected accounts or data exist through unsafe error details.
- Ensure authentication errors identify the problem category without exposing security-sensitive information.
- Allow users adequate time to retrieve or enter verification information.
- Define code expiry and resend behaviour.
- Do not invalidate earlier codes without explaining the result.
- Prevent resend loops and duplicate messages.
- Provide an alternative support path when users cannot use the primary authentication method.
- Ensure logout and session-expiry states do not silently discard work.

---

## 10.3 Cognitive-function examples to review

- remembering a password
- transcribing a one-time code
- solving a puzzle
- identifying objects
- recalling personal-history answers
- performing calculations
- reproducing characters from an image
- remembering information from a previous step

For each, document:

- whether it is required
- assistance available
- alternative method
- security justification
- recovery route

---

# 11. Programmatic status communication

## Requirement

Status messages that do not receive focus must be programmatically determinable so assistive technologies can announce them.

Status messages include information about:

- success
- results
- waiting
- progress
- errors

---

## 11.1 Status-message record

### Status message: SM-[number]

- **Trigger:** [Action or system event]
- **Meaning:** Success / result / waiting / progress / error
- **Visible text or equivalent:** [Message]
- **Urgency:** Routine / Important / Critical
- **Focus moved:** Yes / No
- **Programmatic announcement:** [Required behaviour]
- **Persistence:** [Duration]
- **Replacement or completion message:** [Message]
- **Duplicate suppression:** [Rule]
- **Related state transition:** [Transition]
- **WCAG criterion:** 4.1.3

---

## 11.2 Status-message rules

- Announce successful saves when the state changes without navigation.
- Announce search or filter result counts when updated dynamically.
- Announce waiting and busy states.
- Announce meaningful progress for long operations.
- Announce validation summaries and dynamic inline errors where appropriate.
- Announce completion of background actions.
- Announce when a waiting state ends if that change is otherwise only visual.
- Do not move focus solely to communicate routine status.
- Do not overuse urgent alerts.
- Do not create excessively chatty announcements.
- Include enough context for the message to make sense.
- Announce the complete meaningful phrase, not only a changed number.
- Status must remain available visually where sighted users need it.
- Important persistent status must be available when users return.
- External notification failure must not erase the authoritative in-application status.
- State changes that affect available actions must also update programmatic control state.

---

## 11.3 Status versus focus movement

| Situation | Focus behaviour | Status behaviour |
|---|---|---|
| Routine save succeeds | Keep focus | Announce saved state |
| Search results update | Keep focus | Announce result count |
| Background process starts | Keep focus | Announce busy or processing |
| Blocking dialog opens | Move focus into dialog | Dialog semantics communicate context |
| Validation fails on submit | Move to summary or first error according to pattern | Announce error summary |
| Completion route loads | Move to confirmation start | Normal navigation communicates context |
| Non-blocking notification appears | Keep focus | Announce only if meaningful |
| Critical session expiry | Move to expiry/re-authentication state | Explain retained work and next action |

---

# 12. Time limits, expiry and recovery

## Requirement

When a flow includes a time limit, provide at least one of the following unless a defined WCAG exception applies:

- turn off the time limit
- adjust the time limit
- warn before expiry and allow extension

Where inactivity may cause data loss, users should know:

- the inactivity duration
- what will be lost
- whether progress is saved
- how to extend or resume
- what happens after expiry

---

## 12.1 Time-limit record

### Time limit: TL-[number]

- **Flow state:** [State]
- **Reason:** [Security, operational, real-time or other]
- **Duration:** [Duration]
- **User-controlled:** Yes / No
- **Can disable:** Yes / No
- **Can adjust:** Yes / No
- **Warning provided:** [Timing]
- **Extension action:** [Action]
- **Number of extensions:** [Number]
- **Data preserved:** [Data and duration]
- **Recovery after expiry:** [Recovery]
- **Exception claimed:** [Exception and authority]
- **WCAG criteria:** 2.2.1 and, where targeted, 2.2.6

---

## 12.2 Timing rules

- Avoid time limits unless necessary.
- Document why a time limit exists.
- Warn users before expiry.
- Give users a simple way to extend time.
- Do not require precise or rapid action to extend.
- Preserve entered information where security and privacy allow.
- Explain at the beginning of long flows when inactivity can cause loss.
- Allow users to save and resume interruption-prone work.
- Preserve the intended step through re-authentication.
- Do not silently log users out and discard work.
- Explain whether reservations, locks or temporary resources expire.
- Make countdown information available programmatically.
- Ensure countdowns do not update so frequently that assistive technologies become unusable.
- Provide recovery after timeout.
- Distinguish session expiry from task deadline expiry.
- Distinguish user inactivity timeout from external process expiry.
- Define behaviour when time expires during submission.
- Define behaviour when a code or invitation expires.
- Provide accessible alternatives when real-time limits are essential.

---

## 12.3 Expiry-state sequence

```text
Active task
→ expiry approaching
→ warning communicated
→ user extends: return to active task
→ user does not extend
→ progress preserved where possible
→ session or action expires
→ explain what happened
→ authenticate or restart safely
→ restore retained context
```

---

## 12.4 Timeout failure examples

- session expires without warning
- entered data is silently discarded
- extension action is unavailable by keyboard
- countdown is only visual
- users must restart after re-authentication despite safely retained data
- verification code expires without explaining how to request another
- reservation expires while submission is processing
- modal timeout warning traps focus
- timeout warning appears behind an overlay
- users are not told whether submission succeeded before expiry

---

# 13. Pointer target and precision requirements

## Requirement

Pointer targets must be at least **24 by 24 CSS pixels**, or satisfy a WCAG 2.2 exception such as sufficient spacing or an equivalent compliant control.

The flow must not depend on precise pointer movement.

---

## 13.1 Target review record

| ID | Action | Target | Size or spacing | Equivalent control | Consequence of error | Status |
|---|---|---|---|---|---|---|
| TG-001 | [Action] | [Target] | [Assessment] | [Control] | [Consequence] | Pass / Fail |

---

## 13.2 Precision rules

- Primary actions must be easy to activate without precision.
- Destructive actions must not be placed where accidental activation is likely.
- Small targets must have sufficient spacing or an equivalent compliant control.
- Inline text links may use the WCAG inline exception, but critical actions should not rely on tiny inline targets.
- Pointer gestures must have simple alternatives where possible.
- Dragging must not be the only method for completing a task.
- Reordering must provide discrete movement controls or another accessible method.
- Dense tables must provide usable action targets.
- Icon-only actions must have adequate target size and accessible names.
- Mobile and touch interactions must tolerate reduced dexterity.
- Target requirements apply at zoomed and responsive states.
- Loading or layout shifts must not move targets during activation.
- Repeated actions must not require rapid precise selection.
- Confirmation and undo should mitigate high-impact accidental activation.

---