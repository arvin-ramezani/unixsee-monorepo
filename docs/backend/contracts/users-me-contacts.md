# Users me — contact verification

> **Status:** Accepted  
> **Audience:** Customer JWT (`/api/v1/users/me/contacts/*`)  
> **Last verified:** 2026-08-13

OTP-based phone and email verification for the signed-in customer profile.
Does **not** issue session tokens (unlike `/auth/otp/verify` LOGIN).

## Persistence

Prisma `User`:

- `phoneVerifiedAt` (`phone_verified_at`) — null until phone OTP succeeds
- `emailVerifiedAt` (`email_verified_at`) — null until email OTP succeeds

`OtpContext` additions: `PHONE_VERIFY`, `EMAIL_VERIFY`.

Dev delivery: both phone and email OTPs are emailed to
`PHONE_OTP_MOCK_DELIVERY_EMAIL` (SMS / real recipient later). Never return OTP
codes in API responses.

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

Response `data`: `{ delivered: true }`.

Errors: `429` retry window; `503` delivery unavailable; `409 ACCOUNT_EXISTS` if
another account owns the number.

### `POST /api/v1/users/me/contacts/phone/otp/verify`

Body: `{ phoneNumber, otp }`.

On success: sets `phoneNumber` (if changed), sets `phoneVerifiedAt`, returns
updated public user. Removes consumed OTP.

## Email

### `POST /api/v1/users/me/contacts/email/otp/request`

Body: `{ email }`.

OTP stored on `Otp.identifier` with context `EMAIL_VERIFY`.

Response `data`: `{ delivered: true }`.

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
