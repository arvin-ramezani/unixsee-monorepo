# Accessibility: Keyboard and Focus

## Contents

- Purpose
- 1.1 Accessibility is part of flow logic
- 1.2 Every user must be able to complete the same goal
- 1.3 Describe required behaviour, not implementation decoration
- 1.4 Accessibility requirements must be testable
- Requirement
- 4.1 Keyboard-flow record
  - Keyboard flow: KB-[number]
- 4.2 Keyboard rules
- 4.3 Keyboard trap prevention
- 4.4 Keyboard failure examples
- Requirement
- 5.1 Focus-sequence record
- 5.2 Focus-order rules
- 5.3 Focus-management decision table
- Requirement
- 6.1 Focus-visibility rules
- 6.2 Focus obstruction record

## Purpose

Use this document to review and specify accessibility requirements that affect:

- task completion
- application flows
- state transitions
- input and validation
- authentication
- timing
- confirmations
- status communication
- error recovery
- pointer and keyboard operation

This document intentionally excludes general visual-design guidance unless it directly affects interaction or task completion.

It does not replace a full WCAG 2.2 audit.

The default target is **WCAG 2.2 Level AA** unless a project explicitly requires another level.

---

# 1. Core operating principles

## 1.1 Accessibility is part of flow logic

Accessibility must be designed into:

- entry points
- step sequence
- input requirements
- state changes
- validation
- errors
- confirmations
- waiting states
- authentication
- cancellation
- retry
- save and resume
- post-completion actions

Do not treat accessibility as a final visual review.

---

## 1.2 Every user must be able to complete the same goal

A flow is incomplete when users relying on:

- keyboard input
- switch devices
- voice input
- screen readers
- magnification
- reduced dexterity
- additional processing time
- memory aids
- password managers
- assisted support

cannot reach an equivalent outcome.

Equivalent does not require identical presentation.

It requires equivalent:

- information
- actions
- decisions
- status
- error recovery
- completion
- evidence of completion

---

## 1.3 Describe required behaviour, not implementation decoration

Specify:

- what must be operable
- what receives focus
- where focus moves
- what status is announced
- how users identify and correct errors
- how progress is retained
- how timeouts are handled
- how critical actions are reviewed or reversed

Do not prescribe colours, spacing or component styling unless required to meet an interaction criterion.

---

## 1.4 Accessibility requirements must be testable

Every accessibility requirement must include:

- affected users
- relevant flow state
- expected behaviour
- WCAG criterion
- validation method
- acceptance criteria
- severity if unmet

---

# 2. WCAG interaction criteria used by this document

| Rule area | WCAG 2.2 criterion | Level |
|---|---|---:|
| Keyboard operation | 2.1.1 Keyboard | A |
| No keyboard trap | 2.1.2 No Keyboard Trap | A |
| Logical focus order | 2.4.3 Focus Order | A |
| Visible keyboard focus | 2.4.7 Focus Visible | AA |
| Focus not hidden | 2.4.11 Focus Not Obscured (Minimum) | AA |
| Labels and instructions | 3.3.2 Labels or Instructions | A |
| Error identification | 3.3.1 Error Identification | A |
| Error correction guidance | 3.3.3 Error Suggestion | AA |
| Critical submission safeguards | 3.3.4 Error Prevention (Legal, Financial, Data) | AA |
| Accessible authentication | 3.3.8 Accessible Authentication (Minimum) | AA |
| Programmatic status communication | 4.1.3 Status Messages | AA |
| Adjustable time limits | 2.2.1 Timing Adjustable | A |
| Timeout warning and retained work | 2.2.6 Timeouts | AAA, recommended flow safeguard |
| Minimum pointer target | 2.5.8 Target Size (Minimum) | AA |

Use Level AAA criteria in this document as recommended safeguards unless they conflict with a confirmed legal, security or operational requirement.

---

# 3. Required accessibility-flow output

Every flow analysis must produce:

1. keyboard completion path
2. focus sequence
3. focus entry and return rules
4. label and instruction requirements
5. validation and error-recovery behaviour
6. critical-submission protection
7. authentication accessibility
8. status-message specification
9. time-limit and session-expiry behaviour
10. target-size and precision review
11. accessibility edge cases
12. test plan
13. acceptance criteria
14. unresolved accessibility risks

---

# 4. Keyboard operation

## Requirement

Every function required to complete the task must be operable through a keyboard interface.

This includes:

- opening the flow
- navigating between steps
- selecting options
- entering information
- opening and closing disclosures
- operating dialogs
- uploading or selecting files
- reviewing information
- submitting
- correcting errors
- cancelling
- saving
- resuming
- retrying
- accessing help
- viewing completion details

Pointer-only completion is not acceptable.

---

## 4.1 Keyboard-flow record

### Keyboard flow: KB-[number]

- **Flow:** FL-[number]
- **User goal:** [Goal]
- **Entry method:** [Keyboard entry]
- **Required keys:** [Standard keys or documented interaction]
- **Completion path:** [Sequence]
- **Alternative path:** [Sequence]
- **Exit method:** [Method]
- **Known exceptions:** [Exceptions]
- **Validation method:** Manual keyboard test
- **Status:** Pass / Fail / Unknown

---

## 4.2 Keyboard rules

- All actionable controls must be reachable.
- All reachable interactive controls must be operable.
- Keyboard operation must not require precise timing for individual keystrokes.
- Standard keyboard behaviour must be preserved where possible.
- Custom interactions must define complete keyboard behaviour.
- Keyboard users must be able to perform equivalent actions to pointer users.
- Hover-only actions must have keyboard-operable equivalents.
- Drag-and-drop actions must have a non-drag alternative.
- Reordering must have keyboard-accessible controls or commands.
- Context menus must be keyboard accessible.
- Inline editing must support entry, completion and cancellation by keyboard.
- Keyboard shortcuts must not replace normal operable controls.
- The flow must remain usable when browser zoom or text enlargement changes the viewport.

---

## 4.3 Keyboard trap prevention

Users must be able to move focus away from every component using the keyboard.

A temporary focus boundary is acceptable for a modal dialog when:

- focus enters the dialog intentionally
- focus remains within the active dialog
- a keyboard-operable close or cancel action exists
- a standard exit method such as Escape is supported when appropriate
- focus returns to a meaningful location after closure

If a non-standard exit method is required, instructions must be available before or within the component.

---

## 4.4 Keyboard failure examples

- a control is clickable but cannot receive keyboard focus
- a drag gesture has no keyboard alternative
- focus enters a widget and cannot leave
- closing a dialog requires a pointer
- an action appears only on hover
- a custom dropdown cannot be opened or selected by keyboard
- keyboard submission bypasses required review
- keyboard users cannot access an error or recovery action
- focus disappears after dynamic content changes
- browser Back is the only way to escape a step

---

# 5. Focus order and task sequence

## Requirement

Focus order must preserve the meaning and operability of the task.

The sequence must follow the logical user task, not merely visual placement.

---

## 5.1 Focus-sequence record

| Order | State | Element or region | Purpose | Entry condition | Exit action | Next focus |
|---:|---|---|---|---|---|---|
| 1 | ST-001 | [Control] | [Purpose] | [Condition] | [Action] | [Destination] |

---

## 5.2 Focus-order rules

- Focus order must follow the task and reading sequence.
- Repeated navigation should not interrupt the primary task unnecessarily.
- Hidden, disabled or irrelevant elements must not receive focus.
- Static content should not receive focus unless doing so supports meaningful navigation or announcement.
- Dynamically added controls must appear at a logical point in the sequence.
- Expanded content must not cause unpredictable focus jumps.
- Validation must not reset focus to the beginning without reason.
- Multi-step flows must establish a meaningful focus starting point after navigation.
- Focus must not move merely because a value changed unless the user initiated a context change that requires it.
- When content updates without navigation, focus should usually remain where the user is working while status is communicated separately.
- When a blocking dialog opens, focus must move into it.
- When a dialog closes, focus should return to the initiating control or the next logical state.
- When an initiating control no longer exists, focus must move to a meaningful nearby destination.
- When a flow step is removed based on an answer, focus must not land in removed content.
- Browser Back or application Back must return focus to a meaningful task location where feasible.

---

## 5.3 Focus-management decision table

| Situation | Required focus behaviour |
|---|---|
| New page or route | Move to a meaningful page or task start |
| Modal opens | Move inside the modal |
| Modal closes | Return to initiator or logical successor |
| Validation fails | Move to error summary or first invalid item according to flow pattern |
| Inline error appears | Retain task context and make error discoverable |
| Item is added | Keep focus on action unless next task requires movement |
| Item is deleted | Move to logical adjacent item or section heading |
| Background status changes | Do not move focus; announce status programmatically |
| Authentication interrupts flow | Restore focus and destination after authentication |
| Session expires | Move to expiry/re-authentication state and preserve context |
| Retry succeeds | Move or retain focus according to the resulting task state |
| Completion route opens | Move to confirmation heading or meaningful start |

---

# 6. Focus visibility and obstruction

## Requirement

Keyboard focus must be visible, and author-created content must not entirely hide the focused component.

Flow specifications must account for:

- sticky headers
- sticky footers
- cookie notices
- banners
- drawers
- floating actions
- virtual keyboards
- dialogs
- popovers
- scroll containers
- nested panels
- mobile viewport changes

---

## 6.1 Focus-visibility rules

- The focused item must have a visible focus indicator.
- Focus must not be removed programmatically.
- Sticky content must not fully cover focused controls.
- Opening banners or notices must not conceal the current focus.
- Focused validation errors must be scrolled into an unobscured location.
- Focus inside scrollable regions must remain visible as users navigate.
- Focus indicators must not be clipped by containers.
- When focus is moved programmatically, the destination must be visible.
- A user-opened overlay may temporarily obscure previous content only when focus and operation remain understandable.
- Closing an overlay must restore visible focus.

---

## 6.2 Focus obstruction record

| ID | Flow state | Obscuring element | Focused target | Risk | Required behaviour | Status |
|---|---|---|---|---|---|---|
| FO-001 | [State] | [Header or overlay] | [Target] | [Risk] | [Behaviour] | Open |

---