# Phase 1 delivery waves

## Note

Sequences Phase 1 work into a first implementation wave and later Phase 1
items. Behavioral detail remains in
`docs/product/phase-1-application-features.md`.

**Last verified:** 2026-08-16

## First-wave (first implementation)

| Area | Intent |
|---|---|
| Websites | Admin websites inventory and ownership assignment |
| Servers / agents | Enroll Phase 1 `agent/` from admin servers; discovery updates websites. `monitoring-agent/` develops later |
| Users | Created by public signup or admin create; admin-created accounts start unverified; OTP with the recorded phone/email marks verified |
| Tickets | Customer and staff support workflow |
| Complementary services | Request, review, activate, deliver |
| Plan requests | Customer request + staff enablement on a website |
| Unixsee messages | Tenant-targeted one-way پیام‌های یونیکسی (popup + inbox + unread indicator). Canonical: [`../unixsee-messages-prd.md`](../unixsee-messages-prd.md). Not News, not اعلان‌ها |

## Later Phase 1 (still in Phase 1)

| Area | Intent |
|---|---|
| Activities | Owner-dashboard timeline; include incidents resolved by the server team (for example high traffic detected and resolved). Needs richer ops/incident data before full delivery |
| Website notices (اعلان‌ها) | Admin popups/notices for a **specific website** (for example a harmful plugin). Not the News notifications feature |
| Notifications (News) | Unixsee news / platform announcements in the customer dashboard |
| Admin Settings | Administrator panel settings |
| Staff access / roles | Main ADMIN, sub-admins, specialty OPERATORs — see [`admin-staff-roles-and-capabilities.md`](./admin-staff-roles-and-capabilities.md). **Last Phase 1 step** after first-wave ops surfaces |

## Hard separation

Do not treat **اعلان‌ها**, **Notifications (News)**, and **Unixsee messages**
as the same product.

- Unixsee messages = one-tenant staff → customer inbox/popup (see PRD).
- News = platform-wide (or segment) announcements feed.
- اعلان‌ها = website-targeted operational popup/notice.

## Related

- Phase 1 feature spec: `../phase-1-application-features.md`
- Servers / discovery: `servers-agent-data-flow.md`
- Users / tenants: `../ux-flows/admin-users.md`
