# گزارش جامع Technical Audit و Production Readiness پروژه UnixSee.com

**پروژه:** UnixSee Monorepo  
**دامنه هدف:** `unixsee.com` + Customer Dashboard + Admin Panel + Control Plane + Server Agent  
**مبنای بررسی:** سورس موجود در `unixsee-monorepo.zip`  
**تاریخ بررسی:** 22 August 2026  
**نوع بررسی:** Static Source / Architecture / Security / SEO / Performance / Deployment Audit

> **نکته مهم:** شماره خطوط ذکرشده بر اساس ZIP بررسی‌شده هستند و بعد از تغییر سورس ممکن است جابه‌جا شوند. مسیر فایل Source of Truth است.

---

# 1. نتیجه مدیریتی

معماری کلی پروژه مناسب است و **بازنویسی از صفر توصیه نمی‌شود**.

ساختار فعلی به‌درستی از چند بخش مستقل تشکیل شده است:

```text
unixsee-monorepo/
├── client/               Public Website + Customer Dashboard
├── admin-panel/          Internal Operations Panel
├── backend/              NestJS Control Plane
├── agent/                Production/Phase-1 Server Agent
├── monitoring-agent/     Separate/Later Monitoring Agent
└── docs/                 Architecture / ADR / Product Docs
```

در بخش‌هایی مانند:

- NestJS modular architecture
- Prisma data layer
- Global DTO validation
- HTTP CORS allowlist
- Tenant architecture
- Agent enrollment
- HMAC signing
- `timingSafeEqual`
- Raw-body signing
- Credential revocation
- RTL / FA / EN foundations
- Accessibility primitives

پایه مهندسی مناسبی وجود دارد.

اما نسخه فعلی **برای Production Final آماده نیست**.

مهم‌ترین دلیل، وجود چند Release Blocker امنیتی و عملیاتی است؛ از جمله:

1. Credential واقعی در Repository.
2. OTP در Response API به Client برگردانده می‌شود.
3. OTP توسط Frontend نمایش داده می‌شود.
4. OTP با `Math.random()` تولید می‌شود.
5. OTP به‌صورت Plaintext ذخیره می‌شود.
6. محدودیت تعداد تلاش Verify وجود ندارد.
7. احتمال Reflected XSS در OTP UI وجود دارد.
8. Authenticationهای مهم هنوز Mock هستند.
9. Contact Form واقعی نیست.
10. Dashboard و Admin هنوز Fixture/Demo Data دارند.
11. Docker Client با `next.config.ts` ناسازگار است.
12. Health Check مربوط به Client وجود ندارد.
13. GitHub Actions فعلی در مسیر نادرست قرار گرفته است.
14. SEO Technical هنوز کامل نیست.
15. Public Media حدود `266MB` است و Hero ویدیوی حدود `40MB` دارد.

### تصمیم Release

```text
Current source
    ↓
NO-GO for Production Final
    ↓
GO for Production Hardening / Release Candidate
```

---

# 2. تعریف Severity

| سطح | معنی |
|---|---|
| **P0 — Critical** | باید فوراً اصلاح شود؛ انتشار Production با این مورد مجاز نیست |
| **P1 — High** | Release Blocker یا ریسک جدی Production |
| **P2 — Medium** | مشکل مهم فنی/کیفی که باید قبل یا بلافاصله بعد از Launch بسته شود |
| **P3 — Cleanup** | Technical Debt / Maintainability / Polish |
| **VERIFY** | در Source دیده نشده و باید روی CDN/Proxy/Infrastructure واقعی نیز بررسی شود |

---

# 3. Security & Authentication

## SEC-01 — Credential واقعی Hard-code شده در Repository

**Severity:** `P0 — Critical`  
**Status:** `Confirmed`

### مسیر

```text
client/src/lib/api/wp.api.ts
client/TODO.md
```

در `wp.api.ts` یک API Key واقعی/واقعی‌نما به‌صورت Hard-coded در Header زیر وجود دارد:

```text
X-Unixsee-Api-Key: [REDACTED]
```

خود `client/TODO.md` نیز این موضوع را به‌عنوان P0 ثبت کرده است:

```text
Rotate and revoke exposed Unixsee and provider credentials found in tracked files.
```

### ریسک

حتی اگر فایل دیگر Import نشود، Secret:

- وارد Git history شده است.
- ممکن است داخل ZIPهای قبلی باشد.
- ممکن است در Backup، CI Log، Shared copy یا Developer workstation وجود داشته باشد.

حذف فایل به‌تنهایی مشکل را حل نمی‌کند.

### اقدام اجباری

1. Credential فعلی **فوراً Revoke/Rotate شود**.
2. Repository history بررسی شود.
3. تمام Release ZIPهای قبلی بررسی شوند.
4. CI Logs بررسی شوند.
5. فایل Legacy حذف شود.
6. Secret فقط از Secret Manager/Environment دریافت شود.
7. Secret Scanner به CI اضافه شود.

### Definition of Done

```text
✓ old credential revoked
✓ new credential generated
✓ no credential in tracked source
✓ git history audited
✓ release archives audited
✓ secret scanning enabled in CI
```

---

## SEC-02 — احتمال Reflected XSS در صفحه OTP

**Severity:** `P0 — Critical`  
**Status:** `Confirmed by source flow`

### مسیر

```text
client/src/app/[locale]/(auth)/otp/page.tsx
client/src/components/auth/otp-form.tsx
```

پارامتر `display` از URL/Search Params دریافت می‌شود و سپس برای ساخت HTML استفاده می‌شود.

در `otp-form.tsx` ساختاری شبیه این وجود دارد:

```tsx
`<span dir="ltr">${display}</span>`
```

و خروجی با:

```tsx
dangerouslySetInnerHTML
```

Render می‌شود.

### ریسک

اگر `display` توسط Query String قابل‌کنترل باشد، مهاجم می‌تواند Payload HTML/JavaScript وارد کند.

### اصلاح

اصلاً HTML String از Input کاربر ساخته نشود.

به‌جای:

```tsx
dangerouslySetInnerHTML
```

از React Node استفاده شود:

```tsx
<span dir="ltr">{display}</span>
```

### Definition of Done

```text
✓ no user-controlled value reaches dangerouslySetInnerHTML
✓ malicious query payload E2E test added
✓ CSP added
✓ XSS regression test passes
```

---

## SEC-03 — OTP در Response API برگردانده می‌شود

**Severity:** `P0 — Critical`  
**Status:** `Confirmed`

### مسیر

```text
backend/src/modules/auth/services/authentication.service.ts
```

Backend بعد از تولید OTP، مقدار OTP را در Response برمی‌گرداند:

```ts
return {
  delivered: true,
  otp: otp.otp,
};
```

### ریسک

این رفتار عملاً Possession Verification را بی‌اثر می‌کند.

مهاجم:

```text
Request OTP
→ Receive OTP in API response
→ Verify OTP
→ Authentication successful
```

بدون دسترسی به موبایل یا ایمیل.

### اصلاح

Response فقط:

```json
{
  "delivered": true
}
```

یا Challenge metadata امن برگرداند.

### Definition of Done

هیچ Endpoint مربوط به Production نباید OTP را در:

```text
JSON Response
HTTP Header
Cookie
URL
Log
Exception
```

برگرداند.

---

## SEC-04 — Frontend خود OTP را به کاربر نمایش می‌دهد

**Severity:** `P0 — Critical`  
**Status:** `Confirmed`

موارد مشاهده‌شده شامل:

```text
client/src/components/auth/sign-in-form.tsx
client/src/components/auth/otp-form.tsx
client/src/components/auth/auth-entry-form.tsx
client/src/components/plans/guest-plan-request-form.tsx
client/src/app/[locale]/(website)/_components/others/request-assessment-contact-tabs.tsx
```

الگوی فعلی:

```ts
toast.success(`OTP: ${result.otp}`);
```

### اصلاح

فیلد `otp` باید از تمام Typeها، Actions و UIها حذف شود.

### Definition of Done

Search نهایی:

```bash
rg "result\.otp|OTP:" client/src
```

نباید هیچ نمایش Production OTP پیدا کند.

---

## SEC-05 — ارسال واقعی OTP هنوز پیاده‌سازی نشده

**Severity:** `P0 — Critical`

### مسیر

```text
backend/src/modules/mail/mail.service.ts
backend/src/utils/config/env.schema.ts
```

در Source صریحاً آمده:

```text
Temporary SMS stand-in
Mock SMS delivery
Mock email delivery
```

OTP موبایل به یک Inbox ثابت ارسال می‌شود و OTP ایمیل نیز به Recipient واقعی ارسال نمی‌شود.

همچنین Configuration دارای Email ثابت Mock است.

### اقدام

برای Production:

```text
Phone OTP
→ Real Iranian SMS provider / approved provider

Email OTP
→ Actual recipient email
```

Mock Delivery باید فقط در:

```text
NODE_ENV=test
```

یا Development Environment صریح فعال باشد.

### Definition of Done

Production باید در صورت فعال بودن Mock OTP **Fail Startup** کند.

---

## SEC-06 — OTP با `Math.random()` تولید می‌شود

**Severity:** `P0 — Critical`

### مسیر

```text
backend/src/modules/auth/services/otp-service.ts
```

الگوی فعلی:

```ts
Math.floor(Math.random() * 10)
```

### مشکل

`Math.random()` یک CSPRNG نیست.

### اصلاح

برای مثال:

```ts
crypto.randomInt()
```

استفاده شود.

---

## SEC-07 — OTP به‌صورت Plaintext در Database ذخیره می‌شود

**Severity:** `P0 — Critical`

### مسیر

```text
backend/prisma/schema.prisma
backend/src/modules/auth/services/otp-service.ts
```

Schema فعلی دارای:

```text
otp String
```

است و Validation مستقیماً مقدار واردشده را با OTP ذخیره‌شده مقایسه می‌کند.

### ریسک

در صورت DB Leak، تمام OTPهای فعال فوراً قابل استفاده خواهند بود.

### اصلاح پیشنهادی

```text
codeDigest
expiresAt
attemptCount
consumedAt
challengeId
context
identifier
```

ذخیره شود.

برای OTP کوتاه بهتر است از HMAC keyed digest یا طراحی Challenge-based مناسب استفاده شود.

---

## SEC-08 — Schema فعلی OTP برای Contextهای متعدد مشکل دارد

**Severity:** `P1 — High`

### مسیر

```text
backend/prisma/schema.prisma
```

مدل فعلی تقریباً:

```text
otp         @unique
phoneNumber @unique
identifier  @unique
context
```

است.

این مدل برای Contextهای مختلف مانند:

```text
LOGIN
PHONE_VERIFY
EMAIL_VERIFY
MONITORING_ACCESS
```

مناسب نیست.

### Bug محتمل/واقعی

اگر یک Phone برای Context اول OTP داشته باشد و سپس برای Context دیگری OTP ساخته شود، به‌دلیل Unique بودن `phoneNumber` می‌تواند Conflict ایجاد شود.

### اصلاح

Compound uniqueness متناسب با Challenge:

```text
(identifierNormalized, context)
```

یا مدل Challenge مستقل.

همچنین خود 6-digit OTP نباید Global Unique باشد.

---

## SEC-09 — محدودیت تعداد تلاش Verify OTP وجود ندارد

**Severity:** `P0 — Critical`

### مسیر

```text
backend/src/modules/auth/services/otp-service.ts
```

در:

```text
validateOtp()
validateOtpByIdentifier()
```

هیچ:

```text
attemptCount
maxAttempts
lockedAt
progressive delay
```

وجود ندارد.

Cooldown فعلی فقط برای **درخواست OTP جدید** است، نه Guess کردن OTP.

### اصلاح

حداقل:

```text
max 5 attempts / challenge
IP rate limit
identifier rate limit
device/session limit
progressive delay
lockout
```

---

## SEC-10 — Global Rate Limiting برای Public API وجود ندارد

**Severity:** `P0/P1`

### مسیرهای مهم

```text
backend/src/modules/auth/controllers/authentication.controller.ts
backend/src/modules/plan-requests/controllers/public-plan-requests.controller.ts
backend/src/modules/complementary-services/controllers/public-complementary-services.controller.ts
```

Endpointهای Public متعددی وجود دارند اما `Throttler` یا Global Rate Limit در Backend پیدا نشد.

### باید پوشش داده شوند

```text
login
register
OTP request
OTP verify
refresh
password recovery
plan request
account check
complementary service request
public form APIs
agent enrollment
```

Rate limit بهتر است چندلایه باشد:

```text
CDN/WAF
+
Reverse Proxy
+
Application
```

---

## SEC-11 — Account Enumeration از Endpoint عمومی

**Severity:** `P1 — High`

### مسیر

```text
POST /api/v1/public/plan-requests/account-check
```

Service صریحاً برمی‌گرداند:

```json
{
  "exists": true,
  "matchedBy": "phone"
}
```

یا:

```text
email
website
```

### ریسک

مهاجم می‌تواند بررسی کند:

- شماره تلفن خاص مشتری UnixSee است یا خیر.
- Email خاص ثبت شده یا خیر.
- Domain خاص متعلق به Customer است یا خیر.

### اصلاح

Public Endpoint نباید این اطلاعات را افشا کند.

پاسخ Generic باشد یا ابتدا Possession Verification انجام شود.

---

## SEC-12 — Refresh Controller Exception را Return می‌کند، Throw نمی‌کند

**Severity:** `P1 — High`

### مسیر

```text
backend/src/modules/auth/controllers/authentication.controller.ts
```

الگوی فعلی:

```ts
return new UnauthorizedException(...)
```

صحیح:

```ts
throw new UnauthorizedException(...)
```

### ریسک

ممکن است Exception به‌عنوان Normal Response برگردد یا HTTP Status اشتباه شود.

---

## SEC-13 — مصرف OTP Atomic نیست

**Severity:** `P1 — High`

Flow فعلی:

```text
validate OTP
↓
create/fetch user
↓
mint tokens/session
↓
delete OTP
```

### ریسک

دو Request Concurrent ممکن است هر دو قبل از Delete، OTP را Valid ببینند.

### اصلاح

Consume باید Atomic باشد:

```text
UPDATE / DELETE
WHERE
  consumedAt IS NULL
  expiresAt > now
  digest matches
RETURNING challenge
```

و Token فقط پس از Consume موفق ساخته شود.

---

## SEC-14 — Public Registration مالکیت Phone را اثبات نمی‌کند

**Severity:** `P1 — High`

### مسیر

```text
backend/src/modules/auth/services/authentication.service.ts
```

Register می‌تواند User/Tenant/Token را بدون اثبات مالکیت Phone ایجاد کند.

### ریسک

- Account spam
- Phone squatting
- Fake registration
- Data pollution

### اصلاح

Contact Verification باید قبل از Binding شماره تلفن انجام شود.

---

## SEC-15 — Login API Contract ناسازگار است

**Severity:** `P2`

`LoginDto` شامل:

```text
email
username
phoneNumber
```

است، ولی Service عملاً Login Password را با `username` انجام می‌دهد.

### اقدام

یکی از دو حالت:

```text
support all identifiers consistently
```

یا:

```text
remove unused fields from API contract
```

---

## SEC-16 — Access Token با وجود HttpOnly Cookie دوباره به JavaScript داده می‌شود

**Severity:** `P1 — High`

### Client

```text
client/src/app/api/auth/refresh/route.ts
client/src/lib/auth/client-auth.ts
client/src/stores/auth-store.ts
client/src/actions/auth/verify-login-otp.ts
```

### Admin

```text
admin-panel/src/app/api/auth/refresh/route.ts
admin-panel/src/stores/auth-store.ts
admin-panel/src/actions/auth/login.ts
```

اگرچه Cookieها `HttpOnly` هستند، Access Token مجدداً در JSON Response و JS Memory قرار می‌گیرد.

### ریسک

در صورت XSS، Bearer Token قابل سرقت می‌شود.

این موضوع در Admin Panel اهمیت بیشتری دارد.

### پیشنهاد

معماری BFF/Server-side API Access در اولویت باشد.

اگر Token مرورگر برای WebSocket ضروری است:

```text
short-lived
scoped
single-purpose
```

باشد، نه General API Token.

---

## SEC-17 — MFA برای Staff/Admin مشاهده نشد

**Severity:** `P1 — High`

### مسیر

```text
admin-panel/src/actions/auth/login.ts
admin-panel/src/components/...
```

ورود Staff مبتنی بر:

```text
username
password
```

است.

### توصیه اجباری Production

حداقل یکی:

```text
TOTP
WebAuthn / Passkey
SSO + MFA
Verified OTP as second factor
```

برای تمام حساب‌های Staff/Admin.

---

## SEC-18 — Security Headers در Repository تعریف نشده‌اند

**Severity:** `P1`  
**Status:** `VERIFY at CDN/Reverse Proxy`

در سورس Client/Admin/Backend تنظیم صریح زیر پیدا نشد:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
frame-ancestors
Referrer-Policy
Permissions-Policy
```

ممکن است این موارد در Nginx/CDN تعریف شده باشند؛ باید Production Verify شود.

### حداقل

```text
HSTS
nosniff
strict CSP
frame-ancestors
referrer policy
permissions policy
```

باید وجود داشته باشد.

---

## SEC-19 — WebSocket CORS با HTTP CORS یکسان نیست

**Severity:** `P1`

### مسیر

```text
backend/src/modules/realtime/gateways/realtime.gateway.ts
```

Fallback فعلی:

```ts
origin: ... ?? "*",
credentials: true
```

در حالی که HTTP CORS در `main.ts` از Allowlist معتبر استفاده می‌کند.

### اصلاح

WebSocket نیز دقیقاً از همان Validated Allowlist استفاده کند.

در Production هیچ Wildcard وجود نداشته باشد.

---

## SEC-20 — `trust proxy = true` بدون محدودیت

**Severity:** `P2 / Deployment-dependent`

### مسیر

```text
backend/src/main.ts
```

```ts
set("trust proxy", true)
```

اگر Backend مستقیم از Internet قابل دسترس باشد، Forwarded Headers ممکن است Spoof شوند.

### اصلاح

Trusted proxy hop/CIDR دقیق تعریف شود و Origin Backend توسط Firewall محدود شود.

---

## SEC-21 — Uptime Probe دارای SSRF/Internal Scanning Risk است

**Severity:** `P1 — High`

### مسیر

```text
backend/src/modules/uptime/services/website-uptime-probe.service.ts
```

نکته مثبت:

- DNS Resolve انجام می‌شود.
- Request تا حدی به IP Resolve‌شده Pin می‌شود.

اما Blocking کامل برای IPهای غیرعمومی مشاهده نشد.

### باید Reject شوند

```text
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
169.254.0.0/16
localhost
link-local
private IPv6
loopback IPv6
multicast
reserved ranges
cloud metadata addresses
```

همچنین DNS Rebinding باید کنترل شود.

---

## SEC-22 — Agent Request در بازه 5 دقیقه قابل Replay است

**Severity:** `P1 Hardening`

### مسیر

```text
backend/src/modules/agent/guards/agent-signature.guard.ts
```

طراحی فعلی از نظر HMAC خوب است:

```text
timestamp
+
raw body
+
HMAC SHA-256
+
timingSafeEqual
```

اما Nonce/Sequence مشاهده نشد.

در نتیجه یک Request معتبر Captured شده، در محدوده Timestamp می‌تواند Replay شود.

### اصلاح

اضافه شود:

```text
requestId / nonce
یا
monotonic sequence
```

و Backend مصرف‌شدن آن را ثبت کند.

---

## SEC-23 — Agent Bundle قبل از نصب Verify Cryptographic نمی‌شود

**Severity:** `P1 — High`

### مسیر

```text
agent/install.sh
admin-panel/public/agents/install.sh
agent/scripts/pack-for-panel.sh
```

Installer:

```bash
curl ...
tar -xzf ...
```

را اجرا می‌کند ولی SHA-256/Signature را Verify نمی‌کند.

از آنجا که Installer با Privilege بالا اجرا می‌شود، Compromise در:

```text
panel
CDN
release pipeline
DNS/TLS ecosystem
```

می‌تواند به Root RCE روی سرورهای مشتری منجر شود.

### اصلاح

Package Release شامل:

```text
SHA-256 manifest
version
build id
Ed25519/minisign/cosign signature
expected public key
```

باشد.

Installer قبل از Extract باید Signature را Verify کند.

---

## SEC-24 — Agent Secret در Database به‌صورت Plaintext نگهداری می‌شود

**Severity:** `P1 Hardening`

### مسیر

```text
backend/prisma/schema.prisma
```

```prisma
secretKey String
```

Backend برای HMAC نیازمند Secret است، ولی در Source لایه Encryption at Rest مشاهده نشد.

### پیشنهاد

یکی از:

```text
KMS/envelope encryption
Vault/HSM-backed encryption
```

یا در نسل بعدی طراحی Asymmetric Signing که Backend فقط Public Key را نگه دارد.

---

## SEC-25 — Uploadها به MIME اعلام‌شده مرورگر اعتماد می‌کنند

**Severity:** `P1`

### حوزه‌ها

```text
Tickets
Unixsee Messages
Contact attachments
```

Backend نوع فایل را عمدتاً از:

```text
file.mimetype
```

می‌سنجد.

MIME مرورگر قابل جعل است.

### اصلاح

حداقل:

```text
Magic-byte detection
strict allowlist
size limit
file count limit
malware scan where necessary
safe object storage
Content-Disposition: attachment
```

برای ZIP/PDF سیاست سخت‌گیرانه لازم است.

---

## SEC-26 — Memory Storage برای Upload می‌تواند DoS ایجاد کند

**Severity:** `P1/P2`

Ticketها تا حدود `10MB` و Messageها تا حدود `5MB` در Memory نگهداری می‌شوند.

در نبود Rate Limiting، چند Upload هم‌زمان می‌تواند RAM Backend را تحت فشار بگذارد.

### پیشنهاد

```text
streaming
direct-to-object-storage
concurrency limit
request body limit
rate limit
```

---

## SEC-27 — PII بیش از حد در Auth Logs ثبت می‌شود

**Severity:** `P2`

در Auth/OTP Logger مواردی مانند:

```text
phone number
email
identifier
username
```

ثبت می‌شوند.

### اصلاح

Logging Policy:

```text
maskedPhone
hashedIdentifier
requestId
userId where available
```

به‌جای PII خام.

Retention و دسترسی Log نیز محدود شود.

---

# 4. Authentication & Functional Production Readiness

## FUNC-01 — Sign-up هنوز Production Implementation نیست

**Severity:** `P0`

### مسیر

```text
client/src/components/auth/sign-up-form.tsx
client/src/components/auth/auth-utils.ts
client/src/lib/zod-schemas/auth-schemas.ts
```

در Source صریحاً وجود دارد:

```text
Shared mock latency for UI-only auth submits.
```

Phone signup نیز اطلاعات کامل Registration را به Backend ارسال نمی‌کند و عملاً وارد Login OTP Flow می‌شود.

Email signup نیز Mock است.

### اقدام

Signup Flow واقعی باید طراحی و End-to-End شود:

```text
registration intent
→ identity verification
→ user creation
→ tenant creation
→ session issuance
```

---

## FUNC-02 — Forgot Password کاملاً Mock است

**Severity:** `P0`

### مسیر

```text
client/src/components/auth/forgot-password-form.tsx
```

Submit فعلی فقط:

```ts
await wait(AUTH_MOCK_DELAY_MS);
setSent(true);
```

است.

هیچ Recovery Token یا Backend Request وجود ندارد.

---

## FUNC-03 — Reset Password کاملاً Mock است

**Severity:** `P0`

### مسیر

```text
client/src/components/auth/reset-password-form.tsx
```

Password واقعاً تغییر نمی‌کند.

بعد از Delay، UI موفقیت نشان می‌دهد و Redirect می‌کند.

---

## FUNC-04 — Verify Email کاملاً Mock است

**Severity:** `P0`

### مسیر

```text
client/src/components/auth/verify-email-form.tsx
```

Resend و Continue فقط Delay/UI هستند.

کاربر می‌تواند از Flow ظاهراً Verified عبور کند بدون Verification واقعی.

---

## FUNC-05 — Mock Account Detection در Auth وجود دارد

**Severity:** `P1`

### مسیر

```text
client/src/lib/zod-schemas/auth-schemas.ts
```

Constants مخصوص:

```text
MOCK_EXISTING_EMAIL
MOCK_EXISTING_PHONE
MOCK_OTP_FAIL_CODE
```

در Production Source باقی مانده‌اند.

باید از Build Production حذف شوند.

---

## FUNC-06 — Contact Us Form هیچ داده‌ای ارسال نمی‌کند

**Severity:** `P0 — Release Blocker`

### مسیر

```text
client/src/app/[locale]/(website)/contact-us/_components/contact-form-section.tsx
```

Submit فعلی فقط داده Form را در Toast نمایش می‌دهد.

Attachmentها نیز فقط:

```ts
console.log(...)
```

می‌شوند.

### مشکل

کاربر تصور می‌کند پیام خود را برای UnixSee ارسال کرده، در حالی که:

```text
no API
no DB
no email
no CRM
no ticket
```

ایجاد نمی‌شود.

### Definition of Done

```text
form
→ backend
→ persist request
→ enqueue notification
→ request ID
→ admin visibility
→ confirmation to user
```

---

## FUNC-07 — Newsletter واقعاً Subscriber ایجاد نمی‌کند

**Severity:** `P1`

### مسیر

```text
client/src/actions/newsletter-actions.ts
```

Source نیز تصریح می‌کند Persistence باید بعداً در NestJS انجام شود.

فعلاً فقط Email Notification انجام می‌شود.

### مشکل

ممکن است UI بگوید «عضویت انجام شد»، ولی هیچ Subscriber Record وجود ندارد.

### لازم

```text
subscriber persistence
consent timestamp
deduplication
unsubscribe
verification/double-opt-in policy
audit trail
```

---

## FUNC-08 — Request Assessment فقط Email است و Persistence ندارد

**Severity:** `P1`

### مسیر

```text
client/src/actions/request-assessment-action.ts
```

UUID تولید می‌شود و Email ارسال می‌شود، ولی Request در Database ثبت نمی‌شود.

### ریسک

در صورت Mail Failure یک Lead تجاری مهم کاملاً گم می‌شود.

### معماری صحیح

```text
Persist first
→ queue notification
→ retry
→ request status
→ admin visibility
```

---

## FUNC-09 — Public Forms فاقد Anti-Bot کامل هستند

**Severity:** `P1`

شامل:

```text
Newsletter
Request Assessment
Contact
Public Plan Requests
```

Validation با Zod خوب است ولی Anti-abuse کافی مشاهده نشد.

### پیشنهاد

```text
IP/device rate limit
honeypot
submission fingerprint
Turnstile on suspicious traffic
idempotency
mail queue quotas
```

---

## FUNC-10 — Contact Attachment Policy هنوز Production-ready نیست

**Severity:** `P1`

Contact UI نوع‌های نسبتاً گسترده‌ای از فایل را می‌پذیرد:

```text
images
MP4
PDF
text
Word
Excel
...
```

در حالی که Backend واقعی هنوز وجود ندارد.

هنگام پیاده‌سازی باید صریحاً تعیین شود:

```text
max file size
max file count
content-type sniffing
malware scanning
storage policy
retention
```

---

## FUNC-11 — Help Center Search هنوز Dummy است

**Severity:** `P2`

### مسیر

```text
client/src/lib/data/help-center/help-search-data.ts
client/src/components/help-center/help-search.tsx
```

TODO موجود:

```text
Replace dummy search with Help Center search API
```

برای Help Center نهایی باید Search Index واقعی یا حداقل Static Search Engine استاندارد ایجاد شود.

---

# 5. Customer Dashboard

## DASH-01 — Dashboard مشتری داده Fake نمایش می‌دهد

**Severity:** `P0 — Production Integrity Blocker`

### مسیر مهم

```text
client/src/lib/dashboard-data.ts
client/src/app/[locale]/(dashboard)/dashboard/page.tsx
```

داده‌های Fixture شامل سایت‌هایی مانند:

```text
Greenario Store
Luna Studio
Orbit Labs
Nova Agency
Pixel Nest
```

است.

Dashboard این اطلاعات را مستقیم Render می‌کند.

### مشکل

مشتری Production نباید هیچ‌وقت Sample Operational Data را با اطلاعات واقعی اشتباه بگیرد.

### قانون

```text
API unavailable
≠ show fake data

API unavailable
= explicit degraded/error state
```

---

## DASH-02 — Activities و Notifications نیز Fixture دارند

**Severity:** `P1`

بخش‌های:

```text
Activities
Notifications
Websites
Website Details
Complementary Services
Profile overlays
```

هنوز در قسمت‌هایی از Local Fixture استفاده می‌کنند.

تمام Fixture Data باید پشت Flag صریح Development باشد:

```text
ENABLE_FIXTURES=false
```

در Production حتی نباید Bundle شوند.

---

## DASH-03 — Website Details هنوز Fixture UX Spec دارد

**Severity:** `P1`

بخشی از Website Details دارای:

```text
fixtureKind: "website-details-ux-spec"
```

است.

Production باید تنها از Backend Contract استفاده کند.

---

# 6. Admin Panel

## ADMIN-01 — Admin اطلاعات واقعی و Fixture را با هم Merge می‌کند

**Severity:** `P0 — Critical Operational Integrity`

### مسیر

```text
admin-panel/src/app/(app)/users/page.tsx
admin-panel/src/lib/users/merge-nest-over-fixture...
```

منطق فعلی:

```text
Nest rows
+
Fixture rows
```

و حتی Total شامل Fixture می‌شود.

### ریسک

Operator می‌تواند:

- مشتری نمونه را واقعی تصور کند.
- KPI اشتباه ببیند.
- وضعیت API Down را تشخیص ندهد.
- بر اساس Dataset غیرواقعی تصمیم بگیرد.

### اصلاح

در Production:

```text
Fixtures = impossible
```

---

## ADMIN-02 — هنگام خطای Nest، Fixture جایگزین اطلاعات واقعی می‌شود

**Severity:** `P0`

در User Detail و برخی Authorization Screenها اگر Nest Data پیدا نشود، Fixture نمایش داده می‌شود.

این رفتار برای Development مناسب ولی برای Production خطرناک است.

### رفتار صحیح

```text
Backend unavailable
→ "Service unavailable"
```

نه:

```text
Backend unavailable
→ Demo customer
```

---

## ADMIN-03 — Authorization Cases نیز Live + Fixture را ترکیب می‌کند

**Severity:** `P1`

### مسیر

```text
admin-panel/src/app/(app)/users/authorization/page.tsx
admin-panel/src/lib/data/authorization-data.ts
```

Fixture Cases باید کاملاً از Production حذف شوند.

---

## ADMIN-04 — Website Plan Actions هنوز Prototype هستند

**Severity:** `P1`

### مسیر

```text
admin-panel/src/actions/websites/website-plan-actions.ts
```

Source آن را Fixture Prototype معرفی می‌کند.

این قابلیت قبل از Operational Use باید به API واقعی متصل شود.

---

## ADMIN-05 — Staff Role فقط به Login Flow متکی نباشد

**Severity:** `P1 Hardening`

Login Action Role Staff را بررسی می‌کند و Backend Admin Endpoints نیز باید Role Guard داشته باشند، که جهت درستی است.

اما Admin Application باید در:

```text
server layout
route protection
session claims
backend API authorization
```

نیز Staff Role را enforce کند.

صرف Valid بودن Session کافی نباشد.

---

# 7. SEO و Content Architecture

## SEO-01 — صفحه Home فاقد H1 واقعی است

**Severity:** `P1`

### مسیر

```text
client/src/app/[locale]/(website)/page.tsx
```

Hero فعلی Video محور است و H1 واقعی در Home مشاهده نشد.

Sectionهای بعدی از `h2` شروع می‌شوند.

### اصلاح

Home باید یک H1 واقعی، Visible و Semantic داشته باشد.

مثلاً ساختار:

```text
H1
UnixSee — زیرساخت مدیریت‌شده برای WooCommerce

Supporting copy
...

Primary CTA
...
```

متن نهایی باید توسط Content/SEO نهایی شود.

---

## SEO-02 — چهار Service Landing Page محتوای یک Service را Reuse می‌کنند

**Severity:** `P0/P1`

صفحات:

```text
/services/managed-woocommerce-server
/services/migration-optimization
/services/woocommerce-design
/services/woocommerce-seo-content
```

همگی از Componentهای مشترک مشابه استفاده می‌کنند:

```text
HeroSection
VideoSection
ManageSection
ConnectSection
PerformanceSection
ProtectionSection
FaqSection
```

اما Componentهای مشترک عمدتاً Translation Namespace زیر را Hard-code کرده‌اند:

```ts
ManagedServerPage.*
```

برای مثال Hero:

```ts
useTranslations("ManagedServerPage.HeroSection")
```

### نتیجه

صفحه Design، SEO و Migration ممکن است محتوای Managed Server را Render کنند.

این یک مشکل همزمان:

```text
Content
UX
Conversion
SEO
Brand
```

است.

### اصلاح

Component باید Content/Namespace را از Page دریافت کند یا برای هر Service Content Model جدا ایجاد شود.

---

## SEO-03 — CTA Hero سرویس‌ها به `/` می‌رود

**Severity:** `P1`

### مسیر

```text
services/_components/sections/hero-section.tsx
```

```tsx
href="/"
```

برای CTA اصلی Service Landing Page معمولاً رفتار صحیح نیست.

باید بر اساس Service به:

```text
request
contact
assessment
pricing
consultation
```

هدایت شود.

---

## SEO-04 — Alt Hero Service عمومی و غیرتوصیفی است

**Severity:** `P2`

```text
alt="Hero section image"
```

باید Localized و مرتبط با محتوای واقعی باشد یا اگر تصویر صرفاً Decorative است `alt=""` استفاده شود.

---

## SEO-05 — Metadata اختصاصی برای صفحات اصلی وجود ندارد

**Severity:** `P1`

Metadata اختصاصی در این صفحات مشاهده نشد:

```text
Home
Contact Us
Register
Managed WooCommerce Server
Migration & Optimization
WooCommerce Design
WooCommerce SEO & Content
```

این صفحات Metadata والد را Inherit می‌کنند.

---

## SEO-06 — Canonical فعلی Route-aware نیست

**Severity:** `P0/P1 SEO`

### مسیر

```text
client/src/app/[locale]/layout.tsx
```

فعلاً:

```ts
canonical: isFa ? "/fa" : "/"
```

برای تمام Child Pageهایی که Metadata خودشان را ندارند، این می‌تواند Canonical اشتباه ایجاد کند.

مثلاً:

```text
/services/woocommerce-design
```

نباید Canonical آن Home باشد.

### اصلاح

Canonical باید بر اساس Path جاری تولید شود.

---

## SEO-07 — Canonical فارسی با Routing Strategy ناسازگار است

**Severity:** `P1`

Routing:

```ts
defaultLocale: "fa"
localePrefix: "as-needed"
```

است.

بنابراین نسخه فارسی Default معمولاً:

```text
/
```

است، ولی Metadata:

```text
/fa
```

را Canonical می‌کند.

URL Strategy باید یکپارچه شود.

---

## SEO-08 — hreflang برای Child Route اشتباه است

**Severity:** `P1`

در Layout:

```text
en → /en
fa → /fa
```

برای همه Routeها تعریف شده است.

اما مثلاً برای:

```text
/services/migration-optimization
```

باید Alternate همان Path در زبان مقابل باشد، نه Home.

---

## SEO-09 — sitemap وجود ندارد

**Severity:** `P1`

در App Router فایل:

```text
sitemap.ts
```

پیدا نشد.

برای سایت رسمی باید Sitemap مدیریت‌شده وجود داشته باشد.

---

## SEO-10 — robots.ts وجود ندارد

**Severity:** `P1`

`robots.ts` در Repository مشاهده نشد.

Robots باید:

- Sitemap location
- Allowed public paths
- Private path policy

را تعریف کند.

---

## SEO-11 — Auth و Dashboard صریحاً `noindex` نشده‌اند

**Severity:** `P1`

Route Groupهای:

```text
(auth)
(dashboard)
```

باید Group-level Metadata داشته باشند:

```ts
robots: {
  index: false,
  follow: false,
}
```

خصوصاً:

```text
otp
forgot-password
reset-password
dashboard
private account URLs
```

نباید وارد Search Index شوند.

---

## SEO-12 — Structured Data وجود ندارد

**Severity:** `P2`

هیچ استفاده مشخصی از:

```text
application/ld+json
schema.org
```

پیدا نشد.

پیشنهاد:

```text
Organization
WebSite
Service
BreadcrumbList
Article
FAQPage
```

فقط مطابق محتوای واقعاً Visible و Guidelines موتورهای جستجو.

---

## SEO-13 — OpenGraph/Twitter Metadata ناقص است

**Severity:** `P2`

OG فعلی فقط بخش محدودی مثل:

```text
title
description
locale
siteName
```

دارد.

نیاز است:

```text
url
images
type
Twitter card
page-specific share images
```

نیز کامل شود.

---

## SEO-14 — Help Center Translation Data دچار Schema Drift شده

**Severity:** `P2`

مقایسه Static پیام‌ها نشان داد تقریباً:

```text
FA leaf keys: 3027
EN leaf keys: 3259
```

و حدود 233 Key فقط در EN هستند که عمدتاً به:

```text
HelpCenter.articleBodies.*.blocks
```

مربوط‌اند.

در عین حال Article Structure در TypeScript نیز نگهداری می‌شود.

### مشکل

دو Source of Truth برای Content Structure ایجاد شده است.

### اصلاح

```text
structure → one typed source
translations → messages
```

و CI باید Parity زبان‌ها را Verify کند.

---

# 8. Performance و Core Web Vitals

## PERF-01 — حجم `client/public` تقریباً 266MB است

**Severity:** `P1 — High`

تقریباً کل وزن Client از Media Assets می‌آید.

نمونه فایل‌ها:

```text
~44MB  unixsee-team/new/2.mp4
~40MB  hero-section-improved.mp4
~39MB  unixsee-team/new/3.MP4
~20MB  image.mov
~13MB  FAQ RTL PNG
~13MB  FAQ PNG
~12MB  Help Center Hero
~11MB  Help Center Hero
~6MB   Notification image
~6MB   Migration video
~5MB   Hero background
```

### اقدام

Media Pipeline واقعی ایجاد شود:

```text
original/master
↓
encoding pipeline
↓
AVIF/WebP
WebM/AV1
H.264 fallback
responsive variants
↓
CDN/Object Storage
```

---

## PERF-02 — Hero ویدیوی حدود 40MB مستقیماً Autoplay می‌شود

**Severity:** `P0/P1 Performance`

### مسیر

```text
hero-section/video-background.tsx
```

فعلاً:

```tsx
<video
  src="/videos/hero-section/hero-section-improved.mp4"
  playsInline
  loop
  muted
  autoPlay
/>
```

بدون:

```text
poster
preload policy
responsive source
mobile version
reduced-data handling
visibility loading
```

### معماری پیشنهادی

```text
Poster first
Desktop AV1/WebM
Desktop H264 fallback
Mobile low-bitrate
prefers-reduced-motion fallback
Save-Data fallback
CDN range support
```

---

## PERF-03 — Video Proxy دارای `no-store` است

**Severity:** `P2`

### مسیر

```text
client/src/app/api/video/[...src]/route.ts
```

Proxy ویدیو:

```text
Cache-Control: no-store
```

ارسال می‌کند.

اگر این Route استفاده شود، Caching را از بین می‌برد و Server Egress ایجاد می‌کند.

در Source فعلی Usage مشخصی پیدا نشد؛ اگر Legacy است حذف شود.

---

## PERF-04 — Frontend بسیار Client/Animation-heavy است

**Severity:** `P2 / Needs Measurement`

Static count تقریبی:

```text
493 TS/TSX
173 "use client"
64 framer-motion imports
```

در Website نیز تعداد زیادی Client Component و Motion Component وجود دارد.

این به‌تنهایی Bug نیست ولی Bundle Risk است.

### اصل پیشنهادی

```text
Server Component by default
Client Component only for interaction
Dynamic import for heavy visual features
Motion only where it creates real UX value
```

---

## PERF-05 — Performance Budget و Lighthouse Gate وجود ندارد

**Severity:** `P1`

Release Pipeline باید Budget داشته باشد، مثلاً:

```text
LCP
INP
CLS
TTFB
JS per route
CSS per route
Image/video transfer
Total blocking time
```

و Regression باعث Fail شدن CI شود.

---

# 9. Deployment / Docker / CI

## DEP-01 — Client Dockerfile با Next Config ناسازگار است

**Severity:** `P0 — Release Blocker`

### Dockerfile

انتظار دارد:

```text
.next/standalone
```

وجود داشته باشد.

حتی Comment می‌گوید:

```text
next.config.ts must have output: 'standalone'
```

ولی:

```text
client/next.config.ts
```

دارای:

```ts
output: "standalone"
```

نیست.

### نتیجه

Docker Build می‌تواند در مرحله COPY شکست بخورد.

---

## DEP-02 — Client Health Check به Endpoint غیرموجود اشاره می‌کند

**Severity:** `P0`

Docker Healthcheck:

```text
/api/health
```

را Call می‌کند.

ولی Route مربوط به:

```text
client/src/app/api/health
```

وجود ندارد.

### اقدام

Endpoint صریح:

```text
/api/health/live
/api/health/ready
```

پیاده‌سازی شود یا Healthcheck اصلاح شود.

---

## DEP-03 — GitHub Actions Workflow در مسیر اشتباه است

**Severity:** `P0/P1`

Workflow در:

```text
client/.github/workflows/deploy-staging.yaml
```

قرار دارد.

GitHub Actions در Monorepo معمولاً فقط:

```text
/.github/workflows/
```

در Root را Discover می‌کند.

در نتیجه Workflow فعلی عملاً قابل کشف نیست.

---

## DEP-04 — حتی بعد از Move کردن Workflow، Docker Build Context غلط است

**Severity:** `P1`

Workflow:

```yaml
context: .
```

دارد.

اما Root Dockerfile ندارد و Client Dockerfile در:

```text
client/dockerfile
```

است.

باید چیزی شبیه:

```yaml
context: ./client
file: ./client/dockerfile
```

تعریف شود یا ساختار Docker استاندارد شود.

---

## DEP-05 — Deploy Staging با SSH Password انجام می‌شود

**Severity:** `P1`

Workflow از:

```text
STAGING_SSH_PASSWORD
```

استفاده می‌کند.

### پیشنهاد

```text
restricted SSH deploy key
short-lived credentials
host key verification
non-root deployment user
```

---

## DEP-06 — Deployment فاقد Health Gate و Rollback است

**Severity:** `P1`

Flow فعلی تقریباً:

```text
pull
stop old
remove old
run new
```

است.

اگر Container جدید خراب باشد، نسخه قبلی قبلاً حذف شده است.

### لازم

```text
immutable image digest
start new
readiness check
smoke test
switch traffic
rollback automatically on failure
```

---

## DEP-07 — PostgreSQL روی Host Port منتشر شده است

**Severity:** `P1 / VERIFY Firewall`

### مسیر

```text
backend/docker-compose.yaml
```

```yaml
ports:
  - "5432:5432"
```

در صورت نبود Firewall، Database می‌تواند از بیرون قابل دسترس شود.

Production ترجیحاً:

```text
internal docker network only
```

یا حداقل Bind به Interface خصوصی/localhost باشد.

---

## DEP-08 — Prisma Studio داخل Production Compose تعریف شده است

**Severity:** `P1/P2`

در Compose:

```text
prisma-studio
restart: unless-stopped
```

وجود دارد.

هرچند Port روی `127.0.0.1` Bind شده، Prisma Studio معمولاً نباید به‌عنوان سرویس دائمی Production اجرا شود.

### پیشنهاد

از Production Compose حذف و فقط Profile دستی:

```text
tools
debug
maintenance
```

داشته باشد.

---

## DEP-09 — Node Version بین Build و Runtime متفاوت است

**Severity:** `P2`

Backend:

```text
build → Node 20 Alpine
runtime → Node 22 Bookworm
```

علاوه بر Major Version، libc نیز:

```text
musl → glibc
```

تغییر می‌کند.

برای Build قابل‌تکرار بهتر است Base Family و Node Major هماهنگ باشند.

---

## DEP-10 — Backend Container Healthcheck ندارد

**Severity:** `P1`

Health Services در Backend وجود دارند ولی Docker/Compose API Healthcheck مشاهده نشد.

Liveness و Readiness باید به Orchestrator متصل شوند.

---

## DEP-11 — Monorepo Root فاقد Build/Test/Lint Orchestration است

**Severity:** `P1`

Root `package.json` فقط تقریباً:

```text
dev
```

دارد.

نیاز است:

```text
build
lint
typecheck
test
test:e2e
ci
security
```

از Root تمام Packageها را اجرا کنند.

---

## DEP-12 — Package Managerها مخلوط هستند

**Severity:** `P2`

فعلاً:

```text
root            npm
client          npm
admin-panel     npm
agent           npm
monitoring      npm
backend         pnpm
```

و چند Lockfile وجود دارد.

این وضعیت Reproducibility و Dependency Governance را پیچیده می‌کند.

پیشنهاد: Workspace استاندارد با یک Package Manager.

---

## DEP-13 — Automated Secret Scanning وجود ندارد

**Severity:** `P0/P1`

با توجه به SEC-01 این مورد دیگر Optional نیست.

CI باید حداقل یکی از:

```text
gitleaks
trufflehog
GitHub push protection
```

را داشته باشد.

---

## DEP-14 — SCA / Dependency / Container Security Gate مشاهده نشد

**Severity:** `P1`

Pipeline باید حداقل شامل:

```text
dependency vulnerability scan
CodeQL/Semgrep
container scan
SBOM
license scan
```

باشد.

برای مثال:

```text
Trivy / Grype
CycloneDX
Dependabot/Renovate
```

---

## DEP-15 — Env File Loading Strategy مستعد اشتباه است

**Severity:** `P1/P2`

### مسیر

```text
backend/src/app.module.ts
```

همزمان:

```ts
[
  ".env.development",
  ".env.staging",
  ".env.production",
  ".env"
]
```

Load می‌شود.

هرچند Environment Variableهای Process می‌توانند Override کنند، این طراحی Production را مستعد Misconfiguration می‌کند.

### اصلاح

Environment باید صریح انتخاب شود:

```text
APP_ENV=production
→ production schema/provider only
```

ترجیحاً Production Container اصلاً `.env.*` Source File نداشته باشد و Secrets Inject شوند.

---

## DEP-16 — Graceful Shutdown به‌صورت صریح فعال نشده

**Severity:** `P2`

در `main.ts`:

```ts
app.enableShutdownHooks()
```

مشاهده نشد.

برای Deployment، DB Connection، Queue، Cron و Requests در حال اجرا باید Shutdown Graceful داشته باشند.

---

## DEP-17 — Observability کامل در Repository دیده نشد

**Severity:** `P2 / VERIFY Infrastructure`

Structured Logging وجود دارد، اما Integration واضحی برای:

```text
Sentry
OpenTelemetry
APM
distributed tracing
error aggregation
```

پیدا نشد.

ممکن است بیرون Repository باشد؛ باید Verify شود.

حداقل Production باید Metrics برای:

```text
authentication
OTP
mail
database
uptime probes
agent ingest
job failures
5xx
latency
```

داشته باشد.

---

# 10. Agent Architecture

## AGENT-01 — معماری Agent فعلی نباید بازنویسی شود

این مورد Bug نیست؛ جهت‌گیری برای تیم است.

Agent فعلی موارد مثبت زیر را دارد:

```text
✓ one-time enrollment token
✓ random secret generation
✓ raw-body HMAC
✓ HMAC-SHA256
✓ timingSafeEqual
✓ timestamp validation
✓ credential revocation
✓ outbound-only communication
```

بنابراین کار موردنیاز:

```text
Replay protection
Package signing
Secret-at-rest protection
Release/upgrade verification
```

است، نه بازنویسی Agent.

---

## AGENT-02 — `monitoring-agent` یک Agent دوم/Later است و باید مرزبندی آن روشن بماند

**Severity:** `P2`

README صراحتاً می‌گوید:

```text
Delivery: Later
Phase 1 agent: ../agent/
```

در `monitoring-agent` نیز Development Mock networking و Console Logs متعدد وجود دارد.

### اقدام

Production Pipeline باید روشن کند:

```text
agent/ = production phase-1
monitoring-agent/ = not deployed unless explicitly enabled
```

تا اشتباهاً Agent قدیمی/آزمایشی Deploy نشود.

---

# 11. Repository Hygiene و Maintainability

## CODE-01 — Archive/Build/Backup File داخل Source وجود دارد

**Severity:** `P2/P3`

نمونه‌ها:

```text
agent/agent.zip
backend/src/modules/auth/guards.zip
backend/src/modules/auth/strategies.zip
admin-panel/tsconfig.tsbuildinfo
backend/tsconfig.build.tsbuildinfo
backend/tsconfig.tsbuildinfo
client/tsconfig.tsbuildinfo
client/src/app/[locale]/globals.back.css
portfolio-logos copy 2.tsx
disabled.* files
```

### مشکل

- Repository Noise
- احتمال استفاده اشتباه از Source قدیمی
- افزایش Build Context
- احتمال باقی‌ماندن Secret در Archive
- Code Review دشوارتر

Git باید Version History باشد؛ Backup File داخل Source نباشد.

---

## CODE-02 — فایل‌های بسیار بزرگ با نسخه‌های Comment شده

**Severity:** `P2`

نمونه:

```text
sticky-scroll-cards.tsx        ~2500+ LOC
request-assessment-dialog.tsx  ~2900+ LOC
globals.css                    ~1000+ LOC
```

بخش‌هایی نیز شامل Implementationهای قدیمی Comment شده هستند.

### اصلاح

```text
split components
extract hooks
extract schemas
extract view-models
delete dead commented code
use Git history instead
```

---

## CODE-03 — Design Tokenها به‌طور کامل enforce نشده‌اند

**Severity:** `P2`

با وجود Design System و OKLCH Tokenها، تعداد زیادی Color Literal مستقیم در Client وجود دارد.

Static Scan حدود صدها:

```text
#hex
rgb(...)
hsl(...)
```

پیدا کرده است.

### ریسک

Design Drift در:

```text
light/dark
status colors
borders
cards
buttons
alerts
```

### اقدام

Semantic Tokens:

```text
surface
surfaceElevated
textPrimary
textMuted
border
success
warning
danger
brand
accent
```

مرجع اصلی باشند.

---

## CODE-04 — `suppressHydrationWarning` روی کل HTML و BODY قرار گرفته

**Severity:** `P2`

### مسیر

```text
client/src/app/[locale]/layout.tsx
```

هم:

```tsx
<html suppressHydrationWarning>
```

و هم:

```tsx
<body suppressHydrationWarning>
```

دارند.

این کار می‌تواند Hydration Bugهای واقعی را پنهان کند.

### اصلاح

Suppression فقط روی Node دقیقی که اختلاف آگاهانه دارد استفاده شود.

---

## CODE-05 — Debug/Console Statements در Production Source باقی مانده‌اند

**Severity:** `P2`

نمونه:

```text
Contact form file console.log
Motion dialog console.log
Legacy WordPress API response logging
Monitoring agent console logs
```

### اقدام

تمام Runtime Logها:

```text
structured logger
log level
redaction
```

داشته باشند.

Response Body حساس هرگز Log نشود.

---

## CODE-06 — Legacy WordPress Client هنوز در Repository است

**Severity:** `P1`

### مسیر

```text
client/src/lib/api/wp.api.ts
```

TODO خود پروژه نیز آن را Obsolete معرفی کرده است.

هرچند Import فعال آن در Home Comment شده، وجود Credential و Logging باعث می‌شود باید حذف شود.

Integration جدید:

```text
client/src/lib/api-clients/wordpress/
```

باید Source of Truth باشد.

---

## CODE-07 — Home Page شامل مقدار زیادی Dead/Commented Integration Code است

**Severity:** `P3`

در `page.tsx` موارد زیادی Comment شده‌اند:

```text
WordPress adapter
draft mode
old sections
old home registry
```

Source فعال باید از Experiments قدیمی جدا شود.

---

## CODE-08 — Help Center دو Source of Truth دارد

**Severity:** `P2`

Content Structure بخشی در:

```text
messages/en.json
```

و بخشی در:

```text
article-content.ts
```

وجود دارد.

Structure باید فقط در یک مدل Typed نگهداری شود.

---

## CODE-09 — Generated Prisma Client Governance واضح نیست

**Severity:** `P3`

Generated Prisma Client داخل:

```text
backend/src/generated/prisma
```

وجود دارد.

اگر قرار است Generated Code Commit شود باید صریحاً Policy داشته باشد.

اگر نه:

```text
generate in CI/build
correct .gitignore
stale generation check
```

پیاده شود.

---

## CODE-10 — خود TODO پروژه می‌گوید ESLint Baseline حل نشده است

**Severity:** `P1`

### مسیر

```text
client/TODO.md
```

موارد ثبت‌شده:

```text
Resolve the current ESLint baseline.
Review deprecated packages and APIs.
Add a test runner and focused regression tests.
```

بنابراین قبل از Release باید این TODOها به Issueهای واقعی تبدیل و بسته شوند.

---

# 12. Testing Gaps

## QA-01 — Client تست Regression تعریف‌شده ندارد

**Severity:** `P1`

Client Scripts:

```text
build
lint
typecheck
docs:check
```

دارد، ولی Test Runner واقعی در Scriptهای اصلی مشاهده نشد.

### حداقل

```text
Vitest/Jest unit
React component tests
Playwright E2E
```

برای Critical Flows.

---

## QA-02 — Admin Panel فاقد Test/Typecheck Script جامع است

**Severity:** `P1`

Admin Scripts عمدتاً:

```text
dev
build
start
lint
```

هستند.

لازم:

```text
typecheck
unit
integration
e2e
```

---

## QA-03 — monitoring-agent Test Gate ندارد

**Severity:** `P2`

Package فعلی Build/Run دارد ولی Scriptهای رسمی Test/Typecheck مشابه Agent اصلی ندارد.

---

## QA-04 — Security Regression Tests باید اضافه شوند

**Severity:** `P0`

حداقل Test Cases:

```text
OTP never returned
OTP max attempts
OTP replay
OTP concurrent consume
OTP expiry
rate limiting
reflected XSS payload
account enumeration
nonstaff admin access
private-IP uptime probe
malicious MIME upload
agent replay
agent signature invalid
revoked agent credentials
```

---

## QA-05 — Authentication E2E کامل لازم است

قبل از Production این Flowها باید E2E Pass شوند:

```text
Phone registration
Email registration
Login
OTP request
OTP resend
Wrong OTP
Expired OTP
Too many attempts
Forgot password
Reset password
Email verification
Refresh
Logout
Concurrent refresh
Revoked session
Admin login
Admin MFA
```

---

## QA-06 — SEO Regression Tests لازم است

برای تمام Public Routes:

```text
exactly one H1
unique title
unique description
correct canonical
correct hreflang
indexability
OG URL
OG image
JSON-LD validity
noindex private routes
sitemap coverage
```

به‌صورت Automated بررسی شود.

---

## QA-07 — Performance QA باید روی Device واقعی/شبیه‌سازی موبایل انجام شود

حداقل:

```text
Chrome Android
Safari iPhone
Desktop Chrome
Slow 4G
Fast 4G
Save-Data
prefers-reduced-motion
FA RTL
EN LTR
```

و Metrics واقعی ثبت شوند.

---

# 13. ترتیب پیشنهادی اجرای اصلاحات

## Phase 0 — Emergency Security Cleanup

قبل از هر Release دارای Data واقعی:

```text
SEC-01  Rotate exposed credentials
SEC-02  XSS fix
SEC-03  Remove OTP from API
SEC-04  Remove OTP from UI
SEC-05  Replace mock delivery
SEC-06  CSPRNG
SEC-07  OTP digest
SEC-08  OTP schema
SEC-09  Attempt limiting
SEC-10  Rate limiting
SEC-12  Refresh exception fix
SEC-13  Atomic OTP consume
```

---

## Phase 1 — Authentication Productionization

```text
Real Signup
Real Forgot Password
Real Reset Password
Real Email Verification
Admin MFA
Account Enumeration fix
Contact ownership verification
Session/token architecture review
Security headers
```

---

## Phase 2 — Operational Integrity

```text
Remove Customer fixtures
Remove Admin fixtures
Remove fallback-to-demo
Wire Contact Form
Persist Newsletter
Persist Request Assessment
Production Help Center search
```

---

## Phase 3 — Deployment Hardening

```text
Fix Docker standalone
Create health endpoints
Move GitHub Actions
Fix Docker context
Use SSH keys
Add health gate
Add rollback
Protect PostgreSQL
Remove Prisma Studio from production
Normalize Node image
Graceful shutdown
```

---

## Phase 4 — SEO & Public Site

```text
Home H1
Service content separation
Metadata
Canonical
hreflang
Sitemap
Robots
noindex
JSON-LD
OpenGraph/Twitter
Help Center localization parity
```

---

## Phase 5 — Performance

```text
Media optimization
Hero video variants
CDN/object storage
mobile video
poster-first
bundle analysis
Server Component reduction
Lighthouse CI
performance budgets
```

---

## Phase 6 — Repository & Engineering Quality

```text
Remove archives/backups
Remove dead code
Normalize package manager
Root CI
Client/Admin tests
Design tokens
Secret scan
SCA
SBOM
Observability
```

---

# 14. Release Gate نهایی UnixSee.com

Production Deployment تنها زمانی مجاز باشد که این Gate کامل PASS شود:

### Security

- [ ] تمام Credentialهای Exposed Rotate شده‌اند
- [ ] Secret Scanner PASS
- [ ] هیچ OTP در Response وجود ندارد
- [ ] هیچ OTP در UI نمایش داده نمی‌شود
- [ ] OTP توسط CSPRNG تولید می‌شود
- [ ] OTP Plaintext ذخیره نمی‌شود
- [ ] Max Attempts وجود دارد
- [ ] Rate Limit فعال است
- [ ] OTP Consume Atomic است
- [ ] XSS Regression PASS
- [ ] Account Enumeration بسته شده
- [ ] Staff MFA فعال است
- [ ] Security Headers Verify شده‌اند
- [ ] Uptime SSRF Protection PASS
- [ ] Upload MIME/Magic-byte validation PASS
- [ ] Agent Package Signature Verify می‌شود

### Functional

- [ ] Signup واقعی
- [ ] Login واقعی
- [ ] Forgot Password واقعی
- [ ] Reset Password واقعی
- [ ] Email Verification واقعی
- [ ] Contact Form واقعی
- [ ] Newsletter Persistence واقعی
- [ ] Assessment Persistence واقعی
- [ ] هیچ Fixture در Customer Production وجود ندارد
- [ ] هیچ Fixture در Admin Production وجود ندارد

### SEO

- [ ] Home دارای H1
- [ ] تمام Service Pageها محتوای مستقل دارند
- [ ] تمام Public Pageها Metadata اختصاصی دارند
- [ ] Canonical صحیح
- [ ] hreflang صحیح
- [ ] Sitemap صحیح
- [ ] Robots صحیح
- [ ] Auth/Dashboard noindex
- [ ] Structured Data Validate شده
- [ ] OG/Twitter کامل

### Performance

- [ ] Hero Video optimized
- [ ] Mobile Hero variant
- [ ] Poster/fallback
- [ ] Media روی CDN/Object Storage
- [ ] Route Bundle Budget
- [ ] Mobile Lighthouse Gate
- [ ] Core Web Vitals Target Pass

### Infrastructure

- [ ] Client Docker build PASS
- [ ] Backend Docker build PASS
- [ ] Client Healthcheck PASS
- [ ] Backend Healthcheck PASS
- [ ] CI در Root Repository فعال
- [ ] Staging Deployment PASS
- [ ] Automatic Rollback تست شده
- [ ] PostgreSQL Public Exposure بسته
- [ ] Production Prisma Studio غیرفعال
- [ ] Graceful Shutdown تست شده
- [ ] Backup/Restore Drill انجام شده

### QA

- [ ] Client lint PASS
- [ ] Client typecheck PASS
- [ ] Client build PASS
- [ ] Client tests PASS
- [ ] Admin lint PASS
- [ ] Admin typecheck PASS
- [ ] Admin build PASS
- [ ] Admin tests PASS
- [ ] Backend lint PASS
- [ ] Backend build PASS
- [ ] Backend unit tests PASS
- [ ] Backend E2E PASS
- [ ] Agent build PASS
- [ ] Agent tests PASS
- [ ] Security Regression PASS
- [ ] RTL Regression PASS
- [ ] EN/LTR Regression PASS
- [ ] Mobile Safari PASS
- [ ] Mobile Chrome PASS

---

# 15. مواردی که نباید در جریان اصلاحات خراب شوند

تیم فنی در زمان Hardening نباید معماری‌های سالم فعلی را حذف یا ساده‌سازی کند.

مواردی که باید حفظ شوند:

```text
NestJS modular architecture
Prisma data model approach
Global DTO ValidationPipe
forbidNonWhitelisted
HTTP CORS allowlist
Tenant separation
Agent outbound-only architecture
one-time enrollment token
HMAC SHA-256
raw-body signing
timingSafeEqual
credential revocation
next-intl architecture
FA / EN routing
RTL/LTR support
reduced-motion accessibility
focus-visible / aria foundations
```

هدف:

```text
Hardening
≠ Rewrite

Hardening
= Remove development residue
  + close security gaps
  + productionize unfinished flows
  + improve deployment
  + improve SEO
  + improve performance
```

---

# 16. وضعیت فعلی Release

نتیجه Audit روی سورس تحویلی:

```text
Architecture              GOOD
Backend foundation        GOOD
Agent foundation          GOOD
RTL / i18n foundation     GOOD
Accessibility foundation  GOOD

Authentication            NOT PRODUCTION READY
Security hardening        NOT READY
Public forms              NOT READY
Customer dashboard data   NOT READY
Admin data integrity      NOT READY
SEO technical             INCOMPLETE
Performance/media         NOT READY
Docker deployment         BROKEN/INCOMPLETE
CI/CD                      INCOMPLETE
Production QA             NOT VERIFIED
```

### Release Decision

```text
NO-GO — Production Final
```

اما:

```text
GO — Production Hardening Release Candidate
```

است.

---

# 17. محدودیت این Audit

این گزارش بر مبنای **Static Source Audit** خود ZIP تهیه شده است.

در این مرحله ادعا نشده که موارد زیر واقعاً اجرا و PASS شده‌اند:

```text
npm/pnpm clean install
next build
nest build
lint
typecheck
unit tests
E2E
database migrations
Docker build
Lighthouse
WebPageTest
penetration test
dependency CVE scan
live CDN/proxy header test
live production configuration test
```

بنابراین پس از اصلاح موارد فوق، یک **Strict Release QA واقعی** باید روی Build نهایی انجام شود.

---

# 18. Definition of Production-Ready برای UnixSee

نسخه نهایی فقط زمانی Production-ready تلقی شود که:

```text
No exposed secrets
No mock authentication
No OTP disclosure
No fake production data
No unresolved P0
No unresolved P1 security issue
Reproducible build
Working Docker images
Working healthchecks
Working rollback
Complete SEO
Mobile performance validated
All critical E2E flows pass
Security regression passes
Production configuration verified
```

تا قبل از رسیدن به این وضعیت، Build باید با برچسبی مانند:

```text
development
alpha
staging
release-candidate
```

نگهداری شود و **Production Final** نام‌گذاری نشود.