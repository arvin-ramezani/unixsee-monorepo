# Accessibility Acceptance, Testing and Release Gating

## Contents

- 18.1 Keyboard
  - AC-AX-KB-001
- 18.2 Focus order
  - AC-AX-FO-001
- 18.3 Focus restoration
  - AC-AX-FO-002
- 18.4 Focus obstruction
  - AC-AX-FO-003
- 18.5 Labels
  - AC-AX-IN-001
- 18.6 Error identification
  - AC-AX-ER-001
- 18.7 Critical action
  - AC-AX-CR-001
- 18.8 Authentication
  - AC-AX-AU-001
- 18.9 Status messages
  - AC-AX-SM-001
- 18.10 Timing
  - AC-AX-TM-001
- 18.11 Session recovery
  - AC-AX-TM-002
- 18.12 Target size
  - AC-AX-TG-001
- 19.1 Manual keyboard test
- 19.2 Screen-reader test
- 19.3 Zoom and viewport test
- 19.4 Pointer and touch test
- 19.5 Timing and interruption test
- 19.6 User testing
- Critical release blockers
- High-severity issues
- Medium-severity issues
- Low-severity issues

Use Given–When–Then format.

## 18.1 Keyboard

### AC-AX-KB-001

**Given** a user operates the flow using only a keyboard

**When** the user starts, completes, corrects and submits the task

**Then** every required action is reachable and operable without pointer input

**And** the user is not trapped in any component.

---

## 18.2 Focus order

### AC-AX-FO-001

**Given** the user navigates sequentially through a flow state

**When** focus moves between interactive elements

**Then** the order preserves the meaning and operation of the task.

---

## 18.3 Focus restoration

### AC-AX-FO-002

**Given** a user opens a blocking dialog from an initiating control

**When** the dialog is closed

**Then** focus returns to the initiating control

**Or** to the next logical control if the initiator no longer exists.

---

## 18.4 Focus obstruction

### AC-AX-FO-003

**Given** sticky or overlay content is present

**When** a control receives keyboard focus

**Then** the focused control is not entirely hidden by author-created content.

---

## 18.5 Labels

### AC-AX-IN-001

**Given** an input requires user information

**When** the input is presented

**Then** an understandable label or instruction identifies the expected information and any unusual constraints.

---

## 18.6 Error identification

### AC-AX-ER-001

**Given** the system detects invalid input

**When** validation fails

**Then** the affected item and problem are identified in text

**And** a known correction is provided where possible

**And** valid information remains available.

---

## 18.7 Critical action

### AC-AX-CR-001

**Given** a user is about to perform a legal, financial or destructive action

**When** the action is finalised

**Then** the user can reverse it, correct detected errors, or review and confirm the information before commitment.

---

## 18.8 Authentication

### AC-AX-AU-001

**Given** an existing user must authenticate

**When** credentials or verification information are required

**Then** the flow does not require an unaided cognitive-function test

**And** password managers, paste or another conforming assistance mechanism can be used.

---

## 18.9 Status messages

### AC-AX-SM-001

**Given** the application updates a save, result, progress, waiting or error status without moving focus

**When** the status changes

**Then** assistive technology can programmatically determine and announce the status without forcing a context change.

---

## 18.10 Timing

### AC-AX-TM-001

**Given** a user-controlled task has a time limit

**When** the limit approaches

**Then** the user can disable, adjust or extend the limit unless a documented exception applies

**And** the user is told what happens to entered information.

---

## 18.11 Session recovery

### AC-AX-TM-002

**Given** a session expires during an incomplete task

**When** the user re-authenticates

**Then** safely retained progress and intended destination are restored

**Or** the service clearly explains what was not retained and how to continue.

---

## 18.12 Target size

### AC-AX-TG-001

**Given** a user activates controls with a pointer

**When** actionable targets are presented

**Then** each target is at least 24 by 24 CSS pixels or meets a documented WCAG exception

**And** the task does not depend on precision movement.

---

# 19. Testing protocol

## 19.1 Manual keyboard test

Test the complete flow using:

- Tab
- Shift+Tab
- Enter
- Space
- arrow keys where appropriate
- Escape where appropriate
- platform-standard keyboard commands

Verify:

- reachability
- operability
- logical sequence
- no traps
- visible focus
- focus restoration
- dynamic state behaviour
- error recovery
- completion

---

## 19.2 Screen-reader test

Test with at least one supported browser and screen-reader combination.

Verify:

- labels
- instructions
- control names
- state changes
- errors
- error summaries
- status messages
- progress
- authentication
- completion
- dynamic content updates

Do not rely only on automated checks.

---

## 19.3 Zoom and viewport test

Test:

- browser zoom
- text enlargement
- responsive states
- sticky content
- dialogs
- virtual keyboard conditions
- scroll containers

Verify that focus and required actions remain visible and operable.

---

## 19.4 Pointer and touch test

Verify:

- target size or spacing
- accidental activation risk
- drag alternatives
- target movement during loading
- destructive-action placement
- touch operation at responsive sizes

---

## 19.5 Timing and interruption test

Test:

- inactivity warning
- extension
- session expiry
- re-authentication
- saved progress
- verification-code expiry
- task deadline expiry
- timeout during submission
- resume on another device where supported

---

## 19.6 User testing

Where possible, test critical flows with users who:

- navigate by keyboard
- use screen readers
- use magnification
- have reduced dexterity
- need more time
- use password managers
- use assisted support

Expert review does not replace testing with disabled users.

---

# 20. Release severity and gating

## Critical release blockers

- primary task cannot be completed by keyboard
- keyboard focus becomes trapped
- focus is lost during a critical step
- critical status or error is unavailable to assistive technology
- authentication has no accessible method
- critical submission cannot be reviewed, corrected or reversed
- timeout silently discards important work
- destructive action is easily triggered accidentally with no safeguard
- users cannot identify or correct required errors

## High-severity issues

- illogical focus order creates repeated confusion
- focus is obscured in major flow states
- labels do not communicate required information
- dynamic status is not announced
- re-authentication loses safe progress
- pointer targets cause frequent accidental activation
- recovery exists but is not accessible

## Medium-severity issues

- avoidable extra navigation
- incomplete correction guidance
- non-critical status has weak announcement
- a valid but inefficient accessible alternative exists
- target spacing causes occasional difficulty

## Low-severity issues

- minor friction without affecting task completion
- best-practice improvement above the required conformance level

---

# 21. Required output from the UX agent

For every accessibility interaction review, produce:

1. flow and task reviewed
2. applicable WCAG criteria
3. keyboard completion path
4. keyboard-trap assessment
5. focus-order sequence
6. focus entry and restoration rules
7. focus-obstruction risks
8. input labels and instructions
9. validation and correction behaviour
10. critical-submission safeguards
11. authentication review
12. status-message register
13. timing and timeout review
14. target-size and precision review
15. accessibility state catalogue
16. accessibility edge cases
17. issue register
18. severity and release blockers
19. acceptance criteria
20. test plan
21. unresolved questions
22. recommendation: pass, conditional or block

---

# 22. Agent operating rules

When using this document:

- focus only on accessibility that affects interaction and task completion
- test the complete task, not isolated controls only
- require keyboard equivalence for every pointer action
- prevent keyboard traps
- define logical focus order
- define focus entry, movement and restoration
- ensure focus remains visible and unobscured
- require clear labels and instructions
- identify errors in text
- provide correction guidance where known
- preserve valid information after errors
- protect consequential submissions
- avoid inaccessible cognitive-function tests in authentication
- preserve context through authentication and session expiry
- communicate status programmatically
- minimise time limits
- support extension and recovery
- avoid silent data loss
- require pointer targets that do not depend on precision
- separate WCAG requirements from optional best practices
- label Level AAA safeguards clearly
- produce testable acceptance criteria
- identify release blockers
- never claim accessibility based only on visual inspection
- never claim compliance from automated testing alone
- never treat this review as a substitute for a full WCAG audit
- never treat expert review as a substitute for testing with disabled users

---

# 23. Source basis

This document is based on the official W3C Web Accessibility Initiative materials for WCAG 2.2:

- 2.1.1 Keyboard
- 2.1.2 No Keyboard Trap
- 2.4.3 Focus Order
- 2.4.7 Focus Visible
- 2.4.11 Focus Not Obscured (Minimum)
- 2.2.1 Timing Adjustable
- 2.2.6 Timeouts
- 2.5.8 Target Size (Minimum)
- 3.3.1 Error Identification
- 3.3.2 Labels or Instructions
- 3.3.3 Error Suggestion
- 3.3.4 Error Prevention (Legal, Financial, Data)
- 3.3.8 Accessible Authentication (Minimum)
- 4.1.3 Status Messages

The WCAG Quick Reference should be used to filter requirements by:

- version: WCAG 2.2
- conformance: A and AA
- responsibility: interaction, forms, keyboard and dynamic content

Level AAA safeguards may be retained when they materially improve completion and recovery, but they must be labelled separately from the required project conformance target.