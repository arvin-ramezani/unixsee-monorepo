# Client auth UI specification

> **Status:** Draft  
> **Owner:** Frontend / design  
> **Last verified:** 2026-08-11  
> **Applies to:** `client/` public authentication surfaces  
> **Flow source:** [`../product/ux-flows/client-auth.md`](../product/ux-flows/client-auth.md)

This document turns the customer auth UX flow into a Unixsee UI specification.
It does **not** implement pages, Nest wiring, or data fetching (ADR 0003).

## Method

1. Consumed [`client-auth.md`](../product/ux-flows/client-auth.md) journeys and states.
2. Ran `ui-ux-pro-max` searches for auth/forms UX (`authentication login signup form OTP password reset`, `form input focus error mobile keyboard`).
3. **Accepted:** visible labels, password visibility toggle, submit feedback, focus rings, `inputMode` / correct input types, announced errors, keyboard order, reduced motion.
4. **Rejected:** generic teal glassmorphism palette and Plus Jakarta recommendation from the design-system helper — Unixsee already owns blue/gold tokens and typography in `client/`.

## Design goals

- Easy, short, one job per screen.
- Brand-first auth shell (logo as primary identity signal).
- OTP-first Sign in with **phone default**; email secondary; Google secondary.
- Shared shell reusable for verification and password recovery.
- FA RTL-first and EN LTR parity via logical CSS.

## Auth shell (layout)

### Concept

Use a dedicated `(auth)` route-group concept (paths conceptual until implementation):

- **Include:** logo (home link), locale switch, theme toggle, single centered column.
- **Exclude:** marketing `Header` / `Footer`, dashboard shell, multi-column marketing sections.

### Composition (first viewport)

One composition only:

1. Brand / logo (hero-level signal for this focused surface)
2. One headline
3. One short supporting sentence
4. Primary form region
5. One primary CTA
6. Secondary: Google (if shown), divider, cross-links (Sign in ↔ Sign up, Forgot)

Do **not** put stats, promo chips, or card grids in the first viewport.

### Structure

```text
┌─────────────────────────────────────────┐
│  [Logo]              [Locale] [Theme]   │
│                                         │
│           Headline                      │
│           Support line                  │
│                                         │
│           Form / OTP / status           │
│           [ Primary CTA ]               │
│           —— or ——                      │
│           [ Continue with Google ]      │
│           Cross-links                   │
└─────────────────────────────────────────┘
```

### Spacing (Tailwind mapping)

| Region | Guidance |
|---|---|
| Page padding | `px-4` / `sm:px-6`; vertical `py-8`–`py-12` |
| Column max width | `max-w-md` (≈28rem) centered |
| Headline → support | `mt-2` / `gap-2` |
| Support → form | `mt-8` |
| Field stack | `gap-4` |
| Field → helper/error | `mt-1.5` |
| Form → primary CTA | `mt-6` |
| Primary → divider / Google | `mt-6` |
| Footer cross-links | `mt-8` with `gap-2` |

Touch targets: minimum **44×44 CSS px** for primary button, icon toggles, OTP cells.

## Color tokens

Prefer existing tokens in [`client/src/app/[locale]/globals.css`](../../client/src/app/[locale]/globals.css). Do **not** adopt the ui-ux-pro-max teal sample palette.

| Role | Token | Usage |
|---|---|---|
| Page | `--background`, `--foreground` | Auth canvas and text |
| Atmosphere | `--blue-light`, `--glow-blue-soft`, `--glow-blue-faint` | Soft depth behind panel (not purple gradients) |
| Panel | see derived tokens below | Form surface |
| Primary CTA | `--primary`, `--primary-foreground` | Continue / Verify / Reset |
| Secondary accent | `--secondary` | Sparingly (trust cue or divider accent)—not a second primary |
| Links | `--link` | Sign up / Forgot / Edit identifier |
| Borders | `--border`, `--input` | Fields |
| Focus | `--ring` | Visible focus rings |
| Muted | `--muted`, `--muted-foreground` | Helpers, dividers |
| Error | `--destructive` | Field/form errors |
| Success | `--success`, `--success-foreground` | Brief success / verified states |

### Derived auth tokens (optional, max two)

Only if panel contrast needs a named surface; derive from existing blues:

```css
--auth-panel: color-mix(in oklch, var(--background) 88%, var(--blue-light) 12%);
--auth-panel-border: color-mix(in oklch, var(--border) 70%, var(--ring) 30%);
```

Provide light and dark pairs in `globals.css` when implemented. Do not invent a second brand palette.

## Typography

Use the app’s existing font stack (do not switch to Plus Jakarta).

| Role | Guidance |
|---|---|
| Headline | One line preferred; `text-2xl`–`text-3xl`, semibold/bold |
| Support | `text-sm`–`text-base`, `--muted-foreground` |
| Label | `text-sm`, medium; always visible |
| Helper | `text-xs`–`text-sm`, muted |
| Error | `text-sm`, `--destructive` |
| Cross-links | `text-sm`, `--link` |

Test Persian line-height and English wrapping independently.

## Button hierarchy

| Level | Use | Visual |
|---|---|---|
| Primary | Continue, Send code, Verify, Set password, Request new link | `RadialRevealButton` `default` |
| Secondary | Continue with Google | `RadialRevealButton` `outline` (or `secondary` when needed); full width under divider; never stronger than primary |
| Tertiary | Sign up, Sign in, Forgot password, Edit identifier, Resend (when enabled) | Text `Link` / shadcn `Button` `link` or `ghost` using `--link` — **no** radial-reveal |
| Destructive | Rare auth recoveries that need destructive emphasis | `RadialRevealButton` `destructive` only |

Pending: show spinner (`LoadingSpinner`) inside primary; keep label (“Continuing…”, “Sending…”).

Use radial-reveal only for `default`, `outline`, `secondary`, and `destructive`. Do not apply it to tertiary text links, `ghost`, `link`, or `plain` controls.

Google: until OAuth is approved, render as **disabled** or honest **coming soon**—do not fake success.

## Input states

Applies to phone, email, password, and OTP.

| State | Behaviour |
|---|---|
| Default | Border `--input` / `--border`; readable placeholder optional but **never** replaces label |
| Hover | Slightly stronger border (desktop only; not required for touch) |
| Focus | `ring` via `--ring`; do not remove outline without replacement |
| Filled | Keep label; do not shrink label into inaccessible placeholder-only UI |
| Error | Destructive border + message below field (`aria-describedby`); `role="alert"` or live region for form-level errors |
| Disabled / submitting | Reduced opacity; not editable; primary pending |

### Phone mode (default on Sign in / Sign up)

- Visible label (e.g. “Phone number”).
- Country code control default `+98` (Proposed; see flow A-001).
- National number field: `type="tel"`, `inputMode="numeric"` (or `tel`), `autoComplete="tel"`.
- **Always LTR for the phone value** (inputs and display): wrap with
  `dir="ltr"` (or `<bdi dir="ltr">`) in both FA and EN so `+98…` never reverses
  inside RTL copy. Same rule as email inputs below.

### Email mode

- Toggle from phone without leaving the shell.
- `type="email"`, `inputMode="email"`, `autoComplete="email"` (sign-in) / `username` as product decides.
- Force `dir="ltr"` on the email input in both FA and EN so addresses stay left-to-right.

### Password (Sign up + Reset only; not primary Sign-in)

- Visible label; show/hide toggle (accepted ui-ux-pro-max rule).
- Toggle: Lucide `Eye` / `EyeOff`; accessible name “Show password” / “Hide password”.
- `autoComplete="new-password"` on sign-up/reset; never log values.
- Confirm field on reset; match validation inline.

### OTP

- Group label (“Verification code”) + individual cells or a single segmented control.
- `inputMode="numeric"`, `autoComplete="one-time-code"`.
- Fixed length (value TBD with Nest; UI assumes a short fixed digit count).
- Paste fills all cells; focus moves forward; Backspace moves back.
- Error clears or highlights the group without trapping focus.
- **Masked-phone confirmation line** (e.g. FA
  `کد به {identifier} ارسال شد`): keep surrounding sentence RTL, but render
  `{identifier}` inside an LTR isolate (`dir="ltr"` / `<bdi>`). Do **not**
  interpolate the raw E.164 string as plain text into RTL markup—browsers
  reorder `+98 936***86` and produce broken reading order.

**Note:** No `InputOTP` primitive exists in `client` yet—add shadcn OTP or compose from `Input` + `Field` when implementing.

## Error placement

| Kind | Placement |
|---|---|
| Field validation | Directly under the field |
| Auth failure (wrong OTP, generic failure) | Form-level alert above primary CTA; non-enumerating copy |
| Rate limit | Form-level; disable resend; show wait guidance |
| Account already exists | Form-level or dedicated short state; primary CTA → Sign in |
| Expired reset / email link | Full-panel dead-end: headline, one sentence, primary recover CTA |

Never rely on color alone; include text. Announce errors to assistive tech.

## Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| Mobile first | Full-width column; comfortable keyboard clearance; scroll page, do not trap in a tiny panel |
| `sm` and up | Centered `max-w-md` panel; optional soft glow atmosphere |
| `lg` and up | Same column (do not stretch to a marketing split layout for v1) |

Verify 375 / 768 / 1024 widths. Prefer CSS over JS media queries.

## FA RTL / EN LTR

- `dir` from locale layout; logical padding/margins (`ps`/`pe`, `ms`/`me`).
- Positioning: Tailwind v4 `inset-s-*` / `inset-e-*` (not `start-*` / `end-*`);
  see [`styling.md`](./styling.md#tailwind-css-v4-logical-utilities).
- Do not mirror brand mark incorrectly; flip only directional chevrons that mean “back”.
- Phone and email **values** are always LTR isolates in FA and EN (inputs and
  inline display). Surrounding Persian/English sentence stays locale direction.
- OTP digit entry: visual left-to-right order for codes (document in
  implementation notes and test with users).

## Open UI todos

| ID | Surface | Issue | Required fix |
|---|---|---|---|
| UI-OTP-001 | `/(auth)/otp` masked-phone line (`OtpForm`) | In FA, copy like `کد به +98 936***86 ارسال شد` shows the phone with wrong bidirectional order when `{identifier}` is plain text | Wrap the phone/email identifier in `dir="ltr"` (prefer `<bdi dir="ltr">`) inside the message; keep the FA sentence RTL. Same for `maskedEmail` if shown in FA. |

**Evidence:** Observed in live FA OTP verify UI; implementation today interpolates
`maskedPhone` as a single string in
[`client/src/components/auth/otp-form.tsx`](../../client/src/components/auth/otp-form.tsx).

## Mobile keyboard behaviour

| Field | Attributes |
|---|---|
| Phone | `inputMode` numeric/tel; `enterKeyHint="next"` or `done` |
| Email | `inputMode="email"`; `enterKeyHint="next"` |
| OTP | `inputMode="numeric"`; `autoComplete="one-time-code"`; prefer SMS autofill |
| Password | Default text keyboard; avoid zoom by keeping font-size ≥ 16px on inputs |

Primary submit should be reachable without the keyboard covering the CTA (scroll into view on focus if needed).

## Focus states

- All interactive elements show a visible focus ring using `--ring`.
- Tab order: logo/locale/theme → mode toggle → fields → primary → Google → tertiary links.
- After step change (Sign in → OTP), move focus to the OTP group heading or first cell.
- After error, move focus to the alert or first invalid field.
- No keyboard traps.

## Disabled / submitting states

- On submit: primary `disabled` + pending spinner; prevent Enter from double-firing.
- Resend OTP: disabled until Nest-driven cooldown; show remaining seconds in
  accessible text. Seed from `retryAfterSeconds` on OTP request success / 429
  (client stores absolute end time in an HTTP-only cookie so refresh keeps the
  remaining wait — never hardcode a local 30s timer).
- Google button: disabled while primary submit pending or when feature is coming-soon.
- Entire form `aria-busy="true"` during consequential submits when helpful.

## Surface-specific UI notes

| Surface | UI emphasis |
|---|---|
| Sign in | Phone default; mode switch; Forgot link; Sign up link; Google secondary |
| Sign up | Minimal fields (name if required, phone/email, password); Sign in link; Google secondary |
| OTP | Masked/short identifier display; Edit; Resend cooldown; Verify primary |
| Email pending | Inbox guidance; Resend; optional change email |
| Email result | Success → continue; Expired → resend CTA |
| Forgot | Single identifier (email Proposed); generic sent copy after submit |
| Reset sent | Prefer simple success text; link back to Sign in |
| Reset password | New + confirm; visibility toggles; submit |
| Expired reset | Dead-end + Request new link |
| Already exists | Calm explanation + Sign in primary |
| Auth failure | Retry + alternate path (OTP vs Google) |
| Success / redirect | Brief confirmation or immediate redirect; no marketing upsell |

## Motion language

Source: Motion for React best practices + [`client/docs/engineering/ui.md`](../../client/docs/engineering/ui.md). Prefer `motion/react` for new work when migrating; existing `framer-motion` may remain until an upgrade pass.

Ship **three** intentional motions (presence/hierarchy, not noise):

| ID | Where | Behaviour |
|---|---|---|
| M-001 | Auth panel enter | Whole bordered panel (surface + content) opacity 0→1 + slight `y` rise; low/no bounce |
| M-002 | Step change (e.g. Sign in → OTP) | Animate the **entire** panel as one unit (exit then enter); do not leave an empty bordered shell while nested content crossfades |
| M-003 | Primary success micro-feedback | Brief success check or button confirm before redirect (≤400ms perceived) |

Rules:

- Prefer animating `opacity` and `transform` (compositor-friendly).
- Match Framer `initial` with CSS (`opacity-0` / translate) so the panel is not painted fully before hydration.
- Respect `prefers-reduced-motion: reduce` → instant swap or opacity-only ≤150ms; no travel.
- Do not animate layout width/height of the form on every keystroke.
- Do not run endless ambient loops on the auth page.
- Keep the auth shell in `h-dvh` with internal scroll only when content exceeds the viewport (avoid empty page scroll on large screens).

## Implementation mapping (later UI work)

| Need | Reuse / add |
|---|---|
| Filled / outline CTAs | `components/common/radial-reveal/radial-reveal-button.tsx` (`default`, `outline`, `secondary`, `destructive`) |
| Button-styled nav CTAs | `components/common/radial-reveal/radial-reveal-link.tsx` (same variants only) |
| Tertiary text actions | Localized `Link` or shadcn `Button` `link` / `ghost` / `plain` |
| Text fields | `input.tsx`, `field.tsx`, `label.tsx`, `input-group.tsx` |
| Alerts | `alert.tsx` |
| Spinner | `loading-spinner.tsx` |
| Toasts (optional) | `sonner.tsx` — prefer inline form errors for auth |
| Logo / links | `components/common` logo + localized `Link` |
| OTP | Compose from `Input` + `Field` (`components/auth/otp-input.tsx`) |
| Password toggle | shadcn `Button` `ghost` + `AnimatedEyeIcon` |
| Schemas (later) | `lib/zod-schemas/` — UI-only mocks first |
| Copy | `messages/en.json` + `fa.json` under an `Auth` namespace |

Conceptual routes (not created by this doc):

```text
/[locale]/(auth)/sign-in
/[locale]/(auth)/sign-up
/[locale]/(auth)/otp
/[locale]/(auth)/verify-email
/[locale]/(auth)/forgot-password
/[locale]/(auth)/reset-password
```

Replace stub `(website)/register` when implementing.

## Pre-delivery checklist (from accepted research)

- [ ] No emoji icons; Lucide only
- [ ] Visible labels on every input
- [ ] Visible focus rings
- [ ] Password show/hide where password exists
- [ ] Submit pending → success/error feedback
- [ ] Errors announced, not color-only
- [ ] `inputMode` / types correct on mobile
- [ ] FA RTL and EN LTR checked
- [ ] OTP / auth messages: phone and email identifiers render LTR in FA (UI-OTP-001)
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive 375 / 768 / 1024
- [ ] Google not faking live OAuth
- [ ] No Nest/data fetching in the UI-only prototype phase

## Related

- Flow: [`../product/ux-flows/client-auth.md`](../product/ux-flows/client-auth.md)
- Planned Nest session + data fetching:
  [`client-data-fetching.md`](./client-data-fetching.md) and ADRs
  [`../architecture/decisions/0010-client-hybrid-auth-data-fetching.md`](../architecture/decisions/0010-client-hybrid-auth-data-fetching.md) /
  [`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md)
- Styling: [`styling.md`](./styling.md)
- Next.js: [`nextjs.md`](./nextjs.md)
- Client UI engineering: [`../../client/docs/engineering/ui.md`](../../client/docs/engineering/ui.md)
