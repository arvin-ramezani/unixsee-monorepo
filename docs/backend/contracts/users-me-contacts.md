# Users me — contact verification

> **Status:** Accepted  
> **Audience:** Customer JWT (`/api/v1/users/me/contacts/*`)  
> **Last verified:** 2026-08-25

OTP-based phone and email verification for the signed-in customer profile.
Does **not** issue session tokens (unlike `/auth/otp/verify` LOGIN).

## Persistence

Prisma `User`:

- `phoneVerifiedAt` (`phone_verified_at`) — null until phone OTP succeeds
- `emailVerifiedAt` (`email_verified_at`) — null until email OTP succeeds

`OtpContext` additions: `PHONE_VERIFY`, `EMAIL_VERIFY`.

Prisma `Otp` stores only a digest of the code:

- `otpHash` (`otp_hash`) — bcrypt digest; the plaintext code is never persisted
- `attemptCount` (`attempt_count`) — failed verifications against this challenge
- `consumedAt` (`consumed_at`) — set on success; a consumed code cannot be reused
- `requestCount` / `requestWindowStartedAt` — durable per-target issue window

Dev delivery: both phone and email OTPs are emailed to
`PHONE_OTP_MOCK_DELIVERY_EMAIL` (SMS / real recipient later). Never return OTP
codes in API responses.

## Verification failures

Every verify route answers a failure identically, whatever the cause — unknown
target, wrong code, expired, already consumed, or attempts exhausted:

```json
{ "code": "OTP_VERIFICATION_FAILED", "message": "Verification failed." }
```

Status `401`. Clients must not branch on the reason, because the response does not
carry one. After `OTP_MAX_VERIFY_ATTEMPTS` (default 5) failures the challenge is
dead even for the correct code; the caller's only path forward is a new request.

## Rate limits

Request and verify routes answer `429` with `Retry-After` and

```json
{ "code": "RATE_LIMITED", "message": "Too many requests. Please try again later." }
```

Request routes limit per caller address; verify routes limit per caller address
and per targeted phone/email. Per-target issue limits are additionally enforced in
the database, so they survive restarts. Defaults live in
[`../../../backend/.env.example`](../../../backend/.env.example) under
`OTP_IP_*`, `OTP_TARGET_*`, and `OTP_MAX_REQUESTS_PER_WINDOW`.

## `GET /api/v1/users/me`

Includes contact fields and verification timestamps (ISO strings or null):

| Field | Type |
|---|---|
| `phoneNumber` | string |
| `email` | string \| null |
| `phoneVerifiedAt` | string \| null |
| `emailVerifiedAt` | string \| null |
| `fullName` | string \| null |
| `locale` | string |
| … | other public user fields (no password / hashedRt) |

## Phone

### `POST /api/v1/users/me/contacts/phone/otp/request`

Body:

| Field | Rules |
|---|---|
| `phoneNumber` | E.164 (`+` + country + national) |

Response `data`: `{ delivered: true, retryAfterSeconds }` where
`retryAfterSeconds` is `OTP_RETRY_TIME` minutes × 60.

Errors: `429` retry window (`error.details.retryAfterSeconds` + `Retry-After`);
`503` delivery unavailable; `409 ACCOUNT_EXISTS` if
another account owns the number.

### `POST /api/v1/users/me/contacts/phone/otp/verify`

Body: `{ phoneNumber, otp }`.

On success: sets `phoneNumber` (if changed), sets `phoneVerifiedAt`, returns
updated public user. The consumed OTP row is retained with `consumedAt` set so it
cannot be replayed.

## Email

### `POST /api/v1/users/me/contacts/email/otp/request`

Body: `{ email }`.

OTP stored on `Otp.identifier` with context `EMAIL_VERIFY`.

Response `data`: `{ delivered: true, retryAfterSeconds }` (same cooldown field as
phone OTP request).

### `POST /api/v1/users/me/contacts/email/otp/verify`

Body: `{ email, otp }`.

On success: sets `email`, sets `emailVerifiedAt`, returns updated public user.

## Notes

- Verifying the same current contact only stamps `*VerifiedAt`.
- `PATCH /users/me` that changes `email` clears `emailVerifiedAt` until OTP
  succeeds again.
- Profile UI requires **at least one verified contact**: verified phone makes
  email optional, and verified email makes phone optional (format checks still
  apply when a field is filled). Nest still stores `phoneNumber` as required on
  `User` for login OTP; clearing phone in the DB is out of scope here.
- Product: contact verification ≠ احراز هویت / tenant authorization.
